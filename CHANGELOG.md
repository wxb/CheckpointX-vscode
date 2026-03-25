# Changelog

All notable changes to the "checkpoint" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-24

### Added
- ✨ 初始版本发布
- 🎯 支持通过快捷键 `Ctrl+Alt+P` (Mac: `Cmd+Ctrl+P`) 快速添加检查点
- 📋 支持右键菜单添加检查点
- 🌿 自动识别 Git 分支并按分支组织检查点
- 👤 自动记录标记人（基于 Git 配置）
- 🎨 彩色标签显示：CHKPT（红底白字）、提示信息（灰色）、分支名（蓝色）、作者（金色）
- 📁 检查点数据存储在 `checkpoint.json` 文件中，支持 Git 共享
- 🔄 支持实时同步 `checkpoint.json` 变化
- 🔍 支持查看所有检查点并快速跳转
- ❌ 支持移除检查点

### Features
- 多色分段显示检查点信息，直观醒目
- 相对路径存储，支持团队协作
- 文件系统监听，实时更新显示
- 悬停提示显示完整检查点信息

### Technical
- 基于 VS Code Extension API 开发
- TypeScript 类型安全
- 模块化架构设计

## [2.0.0] - 2026-03-25

### Added
- 🌲 **树形视图面板**: 在资源管理器侧边栏新增 Checkpoint 树形视图，直观展示所有检查点
- 🔍 **快速跳转**: 点击树形视图中的检查点可直接跳转到对应代码位置
- 🗑️ **清空所有**: 新增清空所有检查点功能
- 🔄 **刷新功能**: 新增刷新按钮，手动同步检查点数据
- 📍 **行号显示**: 树形视图中显示检查点所在文件和行号
- 💬 **悬停提示**: 树形视图中悬停显示检查点详细信息

### Changed
- 🎨 优化命令图标，使用 VS Code 内置图标
- 📂 检查点按分支分组展示，支持展开/折叠
- ⚡ 改进树形视图的性能和响应速度

### Technical
- 新增 `CheckpointTreeProvider` 树形数据提供器
- 实现 `TreeDataProvider` 接口支持 VS Code 树形视图
- 添加 `activationEvents` 支持视图激活
- 新增配置项 `checkpoint.showInExplorer` 控制侧边栏显示
