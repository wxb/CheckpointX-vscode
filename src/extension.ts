import * as vscode from 'vscode';
import { CheckpointManager } from './checkpointManager';
import { CheckpointCodeLensProvider } from './codeLensProvider';
import { CheckpointTreeProvider } from './checkpointTreeProvider';
import { Checkpoint } from './types';

export function activate(context: vscode.ExtensionContext) {
  const manager = CheckpointManager.getInstance();
  const codeLensProvider = new CheckpointCodeLensProvider();
  const treeProvider = new CheckpointTreeProvider();

  // 注册 CodeLens 提供器
  const codeLensDisposable = vscode.languages.registerCodeLensProvider(
    { pattern: '**/*' },
    codeLensProvider
  );

  // 注册 TreeView
  const treeView = vscode.window.createTreeView('checkpointTree', {
    treeDataProvider: treeProvider,
    showCollapseAll: true
  });

  // 设置上下文变量 - 控制侧边栏显示
  const updateContext = () => {
    const hasCheckpoints = manager.getAllCheckpoints().length > 0;
    vscode.commands.executeCommand('setContext', 'workspaceHasCheckpoint', hasCheckpoints);
  };
  updateContext();

  // 注册添加检查点命令
  const addCheckpointCommand = vscode.commands.registerCommand(
    'checkpoint.addCheckpoint',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('请先打开一个文件');
        return;
      }

      const position = editor.selection.active;
      const line = position.line;
      const filePath = editor.document.uri.fsPath;

      // 检查是否已存在检查点
      const existingCheckpoint = manager.getCheckpoint(filePath, line);
      if (existingCheckpoint) {
        const overwrite = await vscode.window.showWarningMessage(
          `该位置已存在检查点: "${existingCheckpoint.message}"`,
          '覆盖',
          '取消'
        );
        if (overwrite !== '覆盖') {
          return;
        }
      }

      // 输入检查点信息
      const inputBox = vscode.window.createInputBox();
      inputBox.prompt = '请输入检查点提示信息（例如：上线前检查字段是否已添加）';
      inputBox.placeholder = '检查点提示信息';
      inputBox.value = existingCheckpoint?.message || '';
      inputBox.ignoreFocusOut = true;
      
      // 设置验证
      inputBox.onDidChangeValue((value) => {
        if (!value || value.trim().length === 0) {
          inputBox.validationMessage = '检查点信息不能为空';
        } else {
          inputBox.validationMessage = undefined;
        }
      });
      
      // 等待用户输入
      const message = await new Promise<string | undefined>((resolve) => {
        inputBox.onDidAccept(() => {
          resolve(inputBox.value);
          inputBox.hide();
        });
        inputBox.onDidHide(() => {
          resolve(undefined);
        });
        inputBox.show();
      });

      if (!message) {
        return;
      }

      // 添加检查点
      const checkpoint = manager.addCheckpoint(filePath, line, message.trim());
      
      // 刷新 CodeLens 和 TreeView
      codeLensProvider.refresh();
      treeProvider.refresh();
      updateContext();

      vscode.window.showInformationMessage(
        `检查点已添加 [${checkpoint.branch}]: ${checkpoint.message}`
      );
    }
  );

  // 注册移除检查点命令
  const removeCheckpointCommand = vscode.commands.registerCommand(
    'checkpoint.removeCheckpoint',
    async (args?: { filePath: string; line: number } | Checkpoint) => {
      let filePath: string;
      let line: number;

      if (args && 'id' in args) {
        // 从 Checkpoint 对象获取
        const cp = args as Checkpoint;
        filePath = cp.filePath;
        line = cp.line;
      } else if (args && 'filePath' in args && 'line' in args) {
        // 从命令参数中获取
        const params = args as { filePath: string; line: number };
        filePath = params.filePath;
        line = params.line;
      } else {
        // 从当前编辑器获取
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage('请先打开一个文件');
          return;
        }
        filePath = editor.document.uri.fsPath;
        line = editor.selection.active.line;
      }

      const checkpoint = manager.getCheckpoint(filePath, line);
      if (!checkpoint) {
        vscode.window.showWarningMessage('该位置没有检查点');
        return;
      }

      const confirm = await vscode.window.showWarningMessage(
        `确定要移除检查点 "${checkpoint.message}" 吗？`,
        '确定',
        '取消'
      );

      if (confirm === '确定') {
        manager.removeCheckpoint(filePath, line);
        
        // 刷新 CodeLens 和 TreeView
        codeLensProvider.refresh();
        treeProvider.refresh();
        updateContext();

        vscode.window.showInformationMessage('检查点已移除');
      }
    }
  );

  // 注册查看所有检查点命令
  const viewCheckpointsCommand = vscode.commands.registerCommand(
    'checkpoint.viewCheckpoints',
    async () => {
      // 聚焦到 TreeView
      vscode.commands.executeCommand('checkpointTree.focus');
    }
  );

  // 注册刷新树命令
  const refreshTreeCommand = vscode.commands.registerCommand(
    'checkpoint.refreshTree',
    () => {
      manager.refresh();
      codeLensProvider.refresh();
      treeProvider.refresh();
      updateContext();
      vscode.window.showInformationMessage('检查点列表已刷新');
    }
  );

  // 注册跳转到检查点命令
  const jumpToCheckpointCommand = vscode.commands.registerCommand(
    'checkpoint.jumpToCheckpoint',
    async (checkpoint: Checkpoint) => {
      try {
        const document = await vscode.workspace.openTextDocument(checkpoint.filePath);
        const editor = await vscode.window.showTextDocument(document);
        
        const position = new vscode.Position(checkpoint.line, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(
          new vscode.Range(position, position),
          vscode.TextEditorRevealType.InCenter
        );
      } catch (error) {
        vscode.window.showErrorMessage(`无法打开文件: ${checkpoint.filePath}`);
      }
    }
  );

  // 注册清空所有检查点命令
  const clearAllCommand = vscode.commands.registerCommand(
    'checkpoint.clearAll',
    async () => {
      const checkpoints = manager.getAllCheckpoints();
      if (checkpoints.length === 0) {
        vscode.window.showInformationMessage('当前没有检查点');
        return;
      }

      const confirm = await vscode.window.showWarningMessage(
        `确定要清空所有 ${checkpoints.length} 个检查点吗？此操作不可恢复！`,
        '确定',
        '取消'
      );

      if (confirm === '确定') {
        // 逐个删除
        checkpoints.forEach(cp => {
          manager.removeCheckpoint(cp.filePath, cp.line);
        });
        
        // 刷新
        codeLensProvider.refresh();
        treeProvider.refresh();
        updateContext();

        vscode.window.showInformationMessage('所有检查点已清空');
      }
    }
  );

  // 注册文件保存监听器
  const onSaveDisposable = vscode.workspace.onDidSaveTextDocument(() => {
    codeLensProvider.refresh();
  });

  // 注册文件切换监听器
  const onChangeEditorDisposable = vscode.window.onDidChangeActiveTextEditor(() => {
    codeLensProvider.refresh();
  });

  // 注册 checkpoint.json 文件变化监听器
  const config = vscode.workspace.getConfiguration('checkpoint');
  const checkpointFilename = config.get<string>('filename', 'checkpoint.json');
  const checkpointFileWatcher = vscode.workspace.createFileSystemWatcher(`**/${checkpointFilename}`);
  
  checkpointFileWatcher.onDidChange(() => {
    manager.refresh();
    codeLensProvider.refresh();
    treeProvider.refresh();
    updateContext();
  });
  
  checkpointFileWatcher.onDidCreate(() => {
    manager.refresh();
    codeLensProvider.refresh();
    treeProvider.refresh();
    updateContext();
  });
  
  checkpointFileWatcher.onDidDelete(() => {
    manager.refresh();
    codeLensProvider.refresh();
    treeProvider.refresh();
    updateContext();
  });

  // 将所有命令和监听器添加到订阅
  context.subscriptions.push(
    codeLensDisposable,
    treeView,
    addCheckpointCommand,
    removeCheckpointCommand,
    viewCheckpointsCommand,
    refreshTreeCommand,
    jumpToCheckpointCommand,
    clearAllCommand,
    onSaveDisposable,
    onChangeEditorDisposable,
    checkpointFileWatcher
  );

  // 初始化
  codeLensProvider.refresh();
  treeProvider.refresh();

  console.log('Checkpoint 插件 2.0 已激活');
}

export function deactivate() {
  console.log('Checkpoint 插件已停用');
}
