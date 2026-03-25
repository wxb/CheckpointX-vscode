import * as vscode from 'vscode';
import { CheckpointManager } from './checkpointManager';
import { Checkpoint } from './types';

export class DecorationProvider {
  private static instance: DecorationProvider;
  private manager: CheckpointManager;

  // 为每个检查点创建装饰器
  private checkpointDecorations: Map<string, vscode.TextEditorDecorationType> = new Map();

  private constructor() {
    this.manager = CheckpointManager.getInstance();

    // 监听活动编辑器变化
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        this.updateDecorations(editor);
      }
    });

    // 监听文档变化
    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        this.updateDecorations(editor);
      }
    });

    // 初始化当前编辑器
    if (vscode.window.activeTextEditor) {
      this.updateDecorations(vscode.window.activeTextEditor);
    }
  }

  static getInstance(): DecorationProvider {
    if (!DecorationProvider.instance) {
      DecorationProvider.instance = new DecorationProvider();
    }
    return DecorationProvider.instance;
  }

  private createCheckpointDecoration(indent: string, checkpoint: Checkpoint): vscode.TextEditorDecorationType {
    // 构建完整的检查点文本
    const fullText = `🚀 CHKPT ${checkpoint.message} <${checkpoint.branch}> @${checkpoint.author}`;

    // 使用 after 装饰器在上一行末尾添加换行符和新内容
    return vscode.window.createTextEditorDecorationType({
      after: {
        contentText: '\n' + fullText,
        color: '#9CA3AF', // 默认灰色
        fontStyle: 'italic',
        fontWeight: 'normal',
        textDecoration: 'none;'
      },
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen
    });
  }

  updateDecorations(editor: vscode.TextEditor): void {
    const filePath = editor.document.uri.fsPath;
    const checkpoints = this.manager.getCheckpointsByFile(filePath);

    // 清除之前的装饰器
    this.clearDecorations(editor);

    // 为每个检查点创建装饰
    checkpoints.forEach((checkpoint) => {
      const line = checkpoint.line;

      // 获取目标行的缩进
      const lineText = editor.document.lineAt(line).text;
      const indentMatch = lineText.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '';

      // 创建装饰器类型
      const decorationType = this.createCheckpointDecoration(indent, checkpoint);
      const key = `${checkpoint.filePath}:${checkpoint.line}`;
      this.checkpointDecorations.set(key, decorationType);

      // 创建范围 - 在前一行的末尾
      let range: vscode.Range;
      if (line === 0) {
        // 如果是第一行，在行首显示
        range = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, 0)
        );
      } else {
        // 在前一行的末尾位置创建装饰
        const prevLine = line - 1;
        const prevLineLength = editor.document.lineAt(prevLine).text.length;
        range = new vscode.Range(
          new vscode.Position(prevLine, prevLineLength),
          new vscode.Position(prevLine, prevLineLength)
        );
      }

      // 应用装饰
      const decoration: vscode.DecorationOptions = {
        range,
        hoverMessage: this.createHoverMessage(checkpoint)
      };
      editor.setDecorations(decorationType, [decoration]);
    });
  }

  private clearDecorations(editor: vscode.TextEditor): void {
    // 清除所有现有的装饰器
    this.checkpointDecorations.forEach((decorationType) => {
      editor.setDecorations(decorationType, []);
      decorationType.dispose();
    });
    this.checkpointDecorations.clear();
  }

  private createHoverMessage(checkpoint: Checkpoint): vscode.MarkdownString {
    const markdown = new vscode.MarkdownString();
    markdown.appendMarkdown(`**检查点信息**\n\n`);
    markdown.appendMarkdown(`- **分支**: ${checkpoint.branch}\n`);
    markdown.appendMarkdown(`- **消息**: ${checkpoint.message}\n`);
    markdown.appendMarkdown(`- **标记人**: @${checkpoint.author}\n`);
    markdown.appendMarkdown(`- **创建时间**: ${new Date(checkpoint.createdAt).toLocaleString()}\n\n`);
    markdown.appendMarkdown(`[点击移除检查点](command:checkpointX.removeCheckpoint?${encodeURIComponent(JSON.stringify({ filePath: checkpoint.filePath, line: checkpoint.line }))})`);
    markdown.isTrusted = true;
    return markdown;
  }

  refresh(): void {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      this.updateDecorations(editor);
    }
  }

  refreshAll(): void {
    vscode.window.visibleTextEditors.forEach((editor) => {
      this.updateDecorations(editor);
    });
  }

  dispose(): void {
    this.checkpointDecorations.forEach((decorationType) => {
      decorationType.dispose();
    });
    this.checkpointDecorations.clear();
  }
}
