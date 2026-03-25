import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Checkpoint, CheckpointData } from './types';
import { execSync } from 'child_process';

export class CheckpointManager {
  private static instance: CheckpointManager;
  private checkpointFilePath: string | undefined;
  private workspaceRoot: string | undefined;
  private checkpoints: Map<string, Checkpoint> = new Map();
  private currentBranch: string = 'unknown';
  private currentAuthor: string = 'unknown';

  private constructor() {
    this.updateWorkspaceInfo();
    this.detectCurrentBranch();
    this.detectCurrentAuthor();
  }

  static getInstance(): CheckpointManager {
    if (!CheckpointManager.instance) {
      CheckpointManager.instance = new CheckpointManager();
    }
    return CheckpointManager.instance;
  }

  private updateWorkspaceInfo(): void {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      this.workspaceRoot = workspaceFolders[0].uri.fsPath;
      const config = vscode.workspace.getConfiguration('checkpointX');
      const filename = config.get<string>('filename', 'checkpoint.json');
      this.checkpointFilePath = path.join(this.workspaceRoot, filename);
      this.loadCheckpoints();
    }
  }

  private detectCurrentBranch(): void {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        const result = execSync('git branch --show-current', {
          cwd: workspaceFolders[0].uri.fsPath,
          encoding: 'utf-8'
        });
        this.currentBranch = result.trim() || 'unknown';
      }
    } catch (error) {
      this.currentBranch = 'unknown';
    }
  }

  private detectCurrentAuthor(): void {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        // 优先使用 user.name，如果不存在则使用 user.email 的前缀
        let result = execSync('git config user.name', {
          cwd: workspaceFolders[0].uri.fsPath,
          encoding: 'utf-8'
        }).trim();
        
        if (!result) {
          const email = execSync('git config user.email', {
            cwd: workspaceFolders[0].uri.fsPath,
            encoding: 'utf-8'
          }).trim();
          result = email.split('@')[0] || 'unknown';
        }
        
        this.currentAuthor = result || 'unknown';
      }
    } catch (error) {
      this.currentAuthor = 'unknown';
    }
  }

  getCurrentBranch(): string {
    this.detectCurrentBranch();
    return this.currentBranch;
  }

  getCurrentAuthor(): string {
    this.detectCurrentAuthor();
    return this.currentAuthor;
  }

  // 将绝对路径转换为相对路径
  private toRelativePath(absolutePath: string): string {
    if (!this.workspaceRoot) {
      return absolutePath;
    }
    return path.relative(this.workspaceRoot, absolutePath);
  }

  // 将相对路径转换为绝对路径
  private toAbsolutePath(relativePath: string): string {
    if (!this.workspaceRoot) {
      return relativePath;
    }
    return path.join(this.workspaceRoot, relativePath);
  }

  private loadCheckpoints(): void {
    if (!this.checkpointFilePath || !fs.existsSync(this.checkpointFilePath)) {
      return;
    }

    try {
      const data = fs.readFileSync(this.checkpointFilePath, 'utf-8');
      const parsed: CheckpointData = JSON.parse(data);
      this.checkpoints.clear();
      parsed.checkpoints.forEach((cp) => {
        // 加载时将相对路径转换为绝对路径用于内部处理
        const absolutePath = this.toAbsolutePath(cp.filePath);
        const checkpoint: Checkpoint = {
          ...cp,
          filePath: absolutePath
        };
        this.checkpoints.set(checkpoint.id, checkpoint);
      });
    } catch (error) {
      vscode.window.showErrorMessage('加载检查点文件失败');
    }
  }

  private saveCheckpoints(): void {
    if (!this.checkpointFilePath) {
      vscode.window.showErrorMessage('未找到工作区文件夹');
      return;
    }

    // 保存时将绝对路径转换为相对路径
    const data: CheckpointData = {
      checkpoints: Array.from(this.checkpoints.values()).map(cp => ({
        ...cp,
        filePath: this.toRelativePath(cp.filePath)
      }))
    };

    try {
      fs.writeFileSync(this.checkpointFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      vscode.window.showErrorMessage('保存检查点文件失败');
    }
  }

  addCheckpoint(filePath: string, line: number, message: string): Checkpoint {
    this.detectCurrentBranch();
    this.detectCurrentAuthor();

    // id 使用相对路径
    const relativePath = this.toRelativePath(filePath);
    const checkpoint: Checkpoint = {
      id: `${relativePath}:${line}:${Date.now()}`,
      filePath,
      line,
      message,
      branch: this.currentBranch,
      author: this.currentAuthor,
      createdAt: new Date().toISOString()
    };

    // 如果同一位置已存在检查点，先删除
    for (const [id, cp] of this.checkpoints) {
      if (cp.filePath === filePath && cp.line === line) {
        this.checkpoints.delete(id);
        break;
      }
    }

    this.checkpoints.set(checkpoint.id, checkpoint);
    this.saveCheckpoints();
    return checkpoint;
  }

  removeCheckpoint(filePath: string, line: number): boolean {
    for (const [id, cp] of this.checkpoints) {
      if (cp.filePath === filePath && cp.line === line) {
        this.checkpoints.delete(id);
        this.saveCheckpoints();
        return true;
      }
    }
    return false;
  }

  removeCheckpointById(id: string): boolean {
    if (this.checkpoints.has(id)) {
      this.checkpoints.delete(id);
      this.saveCheckpoints();
      return true;
    }
    return false;
  }

  getCheckpoint(filePath: string, line: number): Checkpoint | undefined {
    for (const cp of this.checkpoints.values()) {
      if (cp.filePath === filePath && cp.line === line) {
        return cp;
      }
    }
    return undefined;
  }

  getAllCheckpoints(): Checkpoint[] {
    return Array.from(this.checkpoints.values());
  }

  getCheckpointsByFile(filePath: string): Checkpoint[] {
    return Array.from(this.checkpoints.values()).filter(cp => cp.filePath === filePath);
  }

  getCheckpointsByBranch(branch: string): Checkpoint[] {
    return Array.from(this.checkpoints.values()).filter(cp => cp.branch === branch);
  }

  refresh(): void {
    this.updateWorkspaceInfo();
    this.detectCurrentBranch();
    this.detectCurrentAuthor();
    this.loadCheckpoints();
  }
}
