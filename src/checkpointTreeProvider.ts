import * as vscode from 'vscode';
import { CheckpointManager } from './checkpointManager';
import { Checkpoint } from './types';

// 树节点类型
export enum TreeItemType {
  Branch = 'branch',
  Checkpoint = 'checkpoint'
}

// 树节点数据
export class CheckpointTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly type: TreeItemType,
    public readonly checkpoint?: Checkpoint,
    public readonly children?: CheckpointTreeItem[]
  ) {
    super(
      label,
      type === TreeItemType.Branch 
        ? vscode.TreeItemCollapsibleState.Expanded 
        : vscode.TreeItemCollapsibleState.None
    );

    if (type === TreeItemType.Branch) {
      // 分支节点
      this.iconPath = new vscode.ThemeIcon('git-branch');
      this.contextValue = 'branch';
    } else if (checkpoint) {
      // 检查点节点
      this.iconPath = new vscode.ThemeIcon('debug-breakpoint');
      this.contextValue = 'checkpoint';
      
      // 显示文件路径和行号
      const fileName = checkpoint.filePath.split(/[\\/]/).pop() || checkpoint.filePath;
      this.description = `${fileName}:${checkpoint.line + 1}`;
      
      // 悬停提示
      this.tooltip = new vscode.MarkdownString(
        `**${checkpoint.message}**\n\n` +
        `📁 文件: ${checkpoint.filePath}\n` +
        `📍 行号: ${checkpoint.line + 1}\n` +
        `👤 作者: @${checkpoint.author}\n` +
        `🌿 分支: ${checkpoint.branch}\n` +
        `🕐 创建: ${new Date(checkpoint.createdAt).toLocaleString()}`
      );
      
      // 点击命令 - 跳转到文件位置
      this.command = {
        command: 'checkpoint.jumpToCheckpoint',
        title: '跳转到检查点',
        arguments: [checkpoint]
      };
    }
  }
}

// 树数据提供器
export class CheckpointTreeProvider implements vscode.TreeDataProvider<CheckpointTreeItem> {
  private manager: CheckpointManager;
  private _onDidChangeTreeData: vscode.EventEmitter<CheckpointTreeItem | undefined | null | void> = 
    new vscode.EventEmitter<CheckpointTreeItem | undefined | null | void>();
  public readonly onDidChangeTreeData: vscode.Event<CheckpointTreeItem | undefined | null | void> = 
    this._onDidChangeTreeData.event;

  constructor() {
    this.manager = CheckpointManager.getInstance();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CheckpointTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: CheckpointTreeItem): Thenable<CheckpointTreeItem[]> {
    if (!element) {
      // 根节点 - 按分支分组
      return Promise.resolve(this.getRootItems());
    } else if (element.type === TreeItemType.Branch && element.children) {
      // 分支节点 - 返回检查点列表
      return Promise.resolve(element.children);
    }
    return Promise.resolve([]);
  }

  private getRootItems(): CheckpointTreeItem[] {
    const checkpoints = this.manager.getAllCheckpoints();
    
    if (checkpoints.length === 0) {
      return [];
    }

    // 按分支分组
    const branchGroups = new Map<string, Checkpoint[]>();
    checkpoints.forEach(cp => {
      const group = branchGroups.get(cp.branch) || [];
      group.push(cp);
      branchGroups.set(cp.branch, group);
    });

    // 创建树节点
    const items: CheckpointTreeItem[] = [];
    
    // 按分支名排序
    const sortedBranches = Array.from(branchGroups.keys()).sort();
    
    sortedBranches.forEach(branch => {
      const group = branchGroups.get(branch)!;
      
      // 创建检查点子节点
      const children = group
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(cp => new CheckpointTreeItem(cp.message, TreeItemType.Checkpoint, cp));
      
      // 创建分支节点
      const branchItem = new CheckpointTreeItem(
        `${branch} (${group.length})`,
        TreeItemType.Branch,
        undefined,
        children
      );
      
      items.push(branchItem);
    });

    return items;
  }
}
