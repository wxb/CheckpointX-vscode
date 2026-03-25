import * as vscode from 'vscode';
import { CheckpointManager } from './checkpointManager';

export class CheckpointCodeLensProvider implements vscode.CodeLensProvider {
  private manager: CheckpointManager;
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

  constructor() {
    this.manager = CheckpointManager.getInstance();
  }

  refresh(): void {
    this._onDidChangeCodeLenses.fire();
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const filePath = document.uri.fsPath;
    const checkpoints = this.manager.getCheckpointsByFile(filePath);

    return checkpoints.map((checkpoint) => {
      const line = checkpoint.line;
      const range = new vscode.Range(
        new vscode.Position(line, 0),
        new vscode.Position(line, 0)
      );

      // 构建显示文本 
      const title = `🎯 ${checkpoint.message} <${checkpoint.branch}> @${checkpoint.author}`;
    
      const codeLens = new vscode.CodeLens(range, {
      title: title,
      tooltip: `检查点: ${checkpoint.message}\n分支: ${checkpoint.branch}\n作者: @${checkpoint.author}`,
      command: 'checkpoint.removeCheckpoint',
        arguments: [{ filePath: checkpoint.filePath, line: checkpoint.line }]
      });

      return codeLens;
    });
  }
}
