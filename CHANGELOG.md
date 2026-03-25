# Changelog

All notable changes to the "checkpointX" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2026-03-25

### Added
- 📝 **智能输入**: 输入框支持实时验证，检查点信息不能为空
- 🚫 **重复检测**: 同一位置添加检查点时提示覆盖或取消，避免误操作
- 💬 **详细悬停提示**: 侧边栏中悬停显示检查点完整信息（文件、行号、作者、分支、创建时间）
- 📋 **命令列表文档**: README 中新增完整的命令列表说明
- 🎯 **使用提示**: 添加检查点时显示覆盖提示和确认对话框

### Changed
- 📚 **文档完善**: 全面更新 README.md，补充详细的使用说明和功能介绍
- 🎨 **功能描述优化**: 功能特性列表更加完整和清晰
- 🔍 **搜索关键词**: 优化 VS Code 市场搜索关键词，支持中英文

### Technical
- 🧹 **代码清理**: 移除冗余代码，优化文件结构
- 🔧 **类型安全**: 完善 TypeScript 类型定义
- ⚡ **性能优化**: 优化刷新机制，减少不必要的重渲染

## [3.0.0] - 2026-03-25

### Changed
- 🏷️ **全面重命名**: 所有代码和文档中的 `checkpoint` 已全面更名为 `checkpointX`
- 📦 **版本升级**: 版本号升级至 3.0.0，标志插件进入稳定阶段
- 📝 **文档统一**: README、CHANGELOG 等文档统一使用新名称

### Technical
- 统一代码中的命令前缀为 `checkpointX`
- 统一配置项命名空间为 `checkpointX`
- 统一视图 ID 为 `checkpointXTree`
- 确保所有文件引用一致性

## [2.0.0] - 2026-03-25

### Added
- 🌲 **独立侧边栏**: 在左侧活动栏新增 CheckpointX 独立面板，不再依附于资源管理器
- 🔍 **快速跳转**: 点击树形视图中的检查点可直接跳转到对应代码位置
- 🗑️ **清空所有**: 新增清空所有检查点功能
- 🔄 **刷新功能**: 新增刷新按钮，手动同步检查点数据
- 📍 **行号显示**: 树形视图中显示检查点所在文件和行号
- 💬 **悬停提示**: 树形视图中悬停显示检查点详细信息
- 📊 **活动栏图标**: 独立的活动栏图标，快速访问检查点列表
- 👤 **作者识别优化**: 优先使用 Git user.name，不存在时使用 user.email 前缀

### Changed
- 🎨 优化命令图标，使用 VS Code 内置图标
- 📂 检查点按分支分组展示，支持展开/折叠
- ⚡ 改进树形视图的性能和响应速度
- 🏷️ 插件名称从 `checkpoint` 更名为 `checkpointX`
- 🔧 配置项命名空间从 `checkpoint` 改为 `checkpointX`

### Technical
- 新增 `CheckpointTreeProvider` 树形数据提供器
- 实现 `TreeDataProvider` 接口支持 VS Code 树形视图
- 添加 `viewsContainers` 定义独立活动栏容器
- 添加 `activationEvents` 支持视图激活
- 新增配置项 `checkpointX.showInExplorer` 控制侧边栏显示
- 优化 Git 作者信息获取逻辑

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
