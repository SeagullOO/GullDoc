# Code Modification Guide

常用修改位置索引。修改后运行 `npx vite build` 验证。

## config.ts 总览

所有可调参数集中在 `src/config.ts`，分为以下几个区块：

### Zoom — UI 缩放
| 常量 | 默认值 | 说明 |
|------|------|------|
| `ZOOM_DEFAULT` | 110 | 默认缩放值 |
| `ZOOM_MIN` | 110 | 最小缩放 |
| `ZOOM_MAX` | 150 | 最大缩放 |
| `ZOOM_STEP` | 10 | 缩放步进 |
| `ZOOM_REFERENCE` | 100 | CSS zoom 基准（1:1 无缩放） |

### Colors — 颜色变量
| 常量 | 值 | 说明 |
|------|------|------|
| `COLOR_BORDER` | `var(--border-subtle)` | 边框线颜色 |
| `COLOR_TEXT_SECONDARY` | `var(--text-secondary)` | 次要文字色 |
| `COLOR_ACCENT` | `var(--accent)` | 主题紫色 |
| `COLOR_BG_PANEL` | `var(--bg-panel)` | 面板底色 |
| `COLOR_BG_SELECTED` | `var(--bg-selected)` | 选中高亮底色 |

### Layout — 面板尺寸
| 常量 | 默认值 | 说明 |
|------|------|------|
| `PANEL_WIDTH` | 240 | 侧边面板默认宽度 |
| `PANEL_MIN_WIDTH` | 210 | 拖拽最小宽度 |
| `PANEL_MAX_WIDTH` | 480 | 拖拽最大宽度 |
| `ACTIVITY_BAR_WIDTH` | 48 | ActivityBar 宽度 |
| `TITLE_BAR_HEIGHT` | 38 | TitleBar 高度 |
| `EXPLORER_HEADER_HEIGHT` | 36 | FileExplorer 顶部栏高度 |

### Splitter — 分隔线
| 常量 | 默认值 | 说明 |
|------|------|------|
| `SPLITTER_WIDTH` | 1 | 分隔线视觉宽度（px） |
| `SPLITTER_HIT` | 20 | 分隔线判定范围（px，纯 JS，不影响布局） |

### Tree — 文件树
| 常量 | 默认值 | 说明 |
|------|------|------|
| `TREE_INDENT_BASE` | 8 | 基础缩进 |
| `TREE_INDENT_PER_DEPTH` | 10 | 每层深度增量 |
| `TREE_ICON_GAP` | 38 | 图标组到文字的间距 |
| `TREE_CHEVRON_OFFSET` | -8 | 折叠箭头在图标组内的左偏移 |
| `TREE_CHEVRON_WIDTH` | 4 | 箭头占位宽度（文件图标对齐用） |
| `TREE_GUIDE_OFFSET` | 10 | 引导竖线相对箭头的 X 偏移 |
| `TREE_GUIDE_HIGHLIGHT_WIDTH` | 1 | 选中引导线高亮宽度 |
| `TREE_GUIDE_HIGHLIGHT_COLOR` | `COLOR_TEXT_SECONDARY` | 选中引导线高亮颜色 |

### Window — 窗口
| 常量 | 默认值 | 说明 |
|------|------|------|
| `WINDOW_WIDTH` | 1400 | 默认窗口宽 |
| `WINDOW_HEIGHT` | 900 | 默认窗口高 |
| `WINDOW_MIN_WIDTH` | 600 | 最小窗口宽 |
| `WINDOW_MIN_HEIGHT` | 400 | 最小窗口高 |
| `MAX_FILE_READ_SIZE` | 10MB | 文件读取上限 |

> **注意**: `electron/main.js:89-90` 的窗口初始化参数需与 config 保持同步。

### Misc
| 常量 | 默认值 | 说明 |
|------|------|------|
| `RECENT_WORKSPACES_COUNT` | 7 | 最近工作区菜单显示数 |

## 文字 / 文案（i18n）

`src/i18n.ts` — 所有 UI 文字（中/英双语）

| Key | 用途 |
|------|------|
| `untitledFolder` | 新建工作区默认名 |
| `untitledDocument` | 新建 MD 文件名 |
| `untitledSheet` | 新建 Excel 文件名 |
| `newFolderDefault` | 新建文件夹默认名 |
| `stgStoragePathLabel` | 设置-存储位置标签 |
| `saveAsTemplate` | "保存为模版" |
| `manageTemplates` | "管理模版 →" |
| `moveWorkspace` | "更改工作区位置" |
| `statusLn / statusCol / statusSelected` | 状态栏文字 |

## 图标

`src/components/icons.tsx` — **所有 SVG 图标集中管理**，以 named export 函数组件形式导出。

## 主题 / 颜色（CSS 变量）

`src/index.css`:
- `:root` 块 — 暗色主题
- `:root.light` 块 — 亮色主题

核心变量：`--bg-root`, `--bg-panel`, `--bg-surface`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--accent`, `--border-subtle`

## 文件系统存储

`src/storage.ts` — Electron 模式下不再使用 `folders.json` 索引，改为直接扫描磁盘目录：

```
<dataPath>/
  工作区A/          ← 子目录 = 工作区
    doc.md
    sheet.xls
    subdir/
  工作区B/
    ...
```

- `storageLoadFolders()` — 扫描 dataPath 下所有子目录
- `storageSaveFolder()` — 创建目录
- `storageDeleteFolder()` — 删除目录
- `storageListWorkspaceFiles()` — 列出工作区内文件
- `storageWriteWorkspaceFile()` / `storageDeleteWorkspaceFile()` — 文件 CRUD
- `storageRenameWorkspaceEntry()` — 重命名/移动

## 打包

| 命令 | 说明 |
|------|------|
| `npm run electron:dev` | 开发预览（Vite + Electron） |
| `npm run electron:build` | 打包 .exe（已含国内镜像） |

## 关键文件

| 文件 | 说明 |
|------|------|
| `src/config.ts` | 集中配置 |
| `src/pages/FolderWorkspace.tsx` | 工作区主页面 |
| `src/pages/Settings.tsx` | 设置页面 |
| `src/components/FileExplorer.tsx` | 文件树 + 引导线 + 分隔线拖拽 |
| `src/components/Sidebar.tsx` | 主页侧边栏 |
| `src/components/TitleBar.tsx` | 自定义标题栏 |
| `src/components/ActivityBar.tsx` | 活动栏 |
| `src/components/Panel.tsx` | 通用面板骨架 |
| `src/components/icons.tsx` | 图标库 |
| `src/storage.ts` | 存储抽象层 |
| `electron/main.js` | Electron 主进程（IPC handlers） |
| `electron/preload.js` | 预加载脚本（API 桥接） |
