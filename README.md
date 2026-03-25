# Checkpoint - VSCode 检查点插件

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/wxb/checkpoint-vscode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code](https://img.shields.io/badge/VS%20Code-Extension-blue.svg)](https://code.visualstudio.com/)
[![Built with Trae](https://img.shields.io/badge/Built%20with-Trae-FF6B6B.svg)](https://trae.ai)

Checkpoint 是一个 VSCode 插件，用于在代码开发中实时记录需要上线前检查的事项。这些检查点以分支作为分类进行整理，并记录到项目的 `checkpoint.json` 文件中，方便在 CD 流水线中展示和追踪。

> 💡 **Vibe Coding**: 本插件借助 [Trae](https://trae.ai) 以 Vibe Coding 的模式开发完成，展示了 AI 辅助编程的高效与便捷。

## 功能特性

- 🎯 **快速标记**: 通过快捷键或右键菜单快速添加检查点
- 🌿 **分支分类**: 自动识别 Git 分支，按分支组织检查点
- 👤 **标记人追踪**: 自动记录检查点创建者（基于 Git 配置）
- 🎨 **视觉提示**: 彩色标签显示在代码上方，直观醒目
- 📁 **团队协作**: 检查点数据存储在项目文件中，支持 Git 共享
- 🔄 **实时同步**: 自动检测 `checkpoint.json` 变化并更新显示
- 🌲 **树形视图**: 在资源管理器侧边栏展示检查点树形结构（2.0 新增）
- 🔍 **快速跳转**: 点击树形视图中的检查点直接跳转到代码位置（2.0 新增）
- 🗑️ **批量管理**: 支持清空所有检查点（2.0 新增）

## 安装

### 从 VS Code 市场安装

1. 打开 VS Code
2. 点击左侧活动栏的扩展图标（或按 `Ctrl+Shift+X`）
3. 搜索 "Checkpoint"
4. 点击安装

### 本地安装（.vsix 文件）

```bash
# 下载 .vsix 文件后，在 VS Code 中执行
# Ctrl+Shift+P → 输入 "Install from VSIX" → 选择下载的文件
```

### 从源码安装

```bash
# 克隆仓库
git clone https://github.com/wxb/checkpoint-vscode.git
cd checkpoint-vscode

# 安装依赖
npm install

# 编译
npm run compile

# 按 F5 启动调试模式
```

## 使用方法

### 添加检查点

- **快捷键**: `Ctrl+Alt+P` (Mac: `Cmd+Ctrl+P`)
- **右键菜单**: 在编辑器中右键选择 "添加Checkpoint检查点"
- **命令面板**: `Ctrl+Shift+P` → 输入 "Checkpoint: 添加Checkpoint检查点"

### 查看所有检查点

- **树形视图**: 在左侧资源管理器中找到 "Checkpoint 检查点" 面板，按分支分组展示所有检查点
- **命令面板**: `Ctrl+Shift+P` → 输入 "Checkpoint: 查看所有Checkpoint检查点"
- 点击检查点可直接跳转到对应的代码位置

### 树形视图操作

- **刷新**: 点击面板标题栏的刷新按钮同步最新数据
- **添加**: 点击面板标题栏的添加按钮快速创建检查点
- **清空**: 点击面板标题栏的清空按钮删除所有检查点
- **删除单个**: 右键点击检查点选择删除，或点击检查点右侧的删除图标

### 移除检查点

- 鼠标悬停在检查点上，点击提示中的 "点击移除检查点" 链接
- 或使用命令面板执行 "Checkpoint: 移除检查点"

## 显示样式

检查点会在标记行的上方显示为虚行，格式如下：

```
    [CHKPT] 上线前检查价格计算逻辑是否正确 <feature/order-module> @wangxb
     ↑红底白字   ↑灰色字                    ↑蓝色字           ↑金色字
```

| 元素 | 样式 |
|------|------|
| CHKPT | 红色背景 + 白色粗体 |
| 提示信息 | 灰色文字 |
| <分支名> | 蓝色文字 |
| @作者 | 金色粗体 |

## 数据存储

检查点数据存储在项目根目录的 `checkpoint.json` 文件中：

```json
{
  "checkpoints": [
    {
      "id": "src/utils/helper.js:5:1712345690000",
      "filePath": "src/utils/helper.js",
      "line": 5,
      "message": "确认工具函数返回值类型",
      "branch": "main",
      "author": "wangxb",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

所有路径均使用相对路径，方便团队协作和版本控制。

## 配置选项

在 VSCode 设置中搜索 "Checkpoint" 可配置：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `checkpoint.filename` | `checkpoint.json` | 检查点数据文件名 |
| `checkpoint.showInExplorer` | `true` | 在资源管理器中显示 Checkpoint 侧边栏 |

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Alt+P` / `Cmd+Ctrl+P` | 添加检查点 |

## 系统要求

- VS Code 版本 >= 1.74.0
- Git 已安装并配置

## 开发

```bash
# 安装依赖
npm install

# 编译
npm run compile

# 监视模式
npm run watch

# 打包
npm install -g @vscode/vsce
vsce package
```

## 更新日志

详见 [CHANGELOG.md](CHANGELOG.md)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

[MIT](LICENSE) © 2026 Checkpoint Contributors
