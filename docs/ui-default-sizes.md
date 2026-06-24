# Gull UI 默认尺寸速查表

> 所有 UI 元素的默认尺寸及其在源代码中的位置。

## 窗口

| 属性 | 默认值 | 来源 |
|------|--------|------|
| 默认宽度 | 1400px | `electron/main.js:58` |
| 默认高度 | 900px | `electron/main.js:58` |
| 最小宽度 | 900px | `electron/main.js:59` |
| 最小高度 | 600px | `electron/main.js:59` |

## 全局 UI 元素

| 元素 | 默认值 | 来源 |
|------|--------|------|
| 标题栏高度 | 30px | `src/components/TitleBar.tsx:61` |
| 活动栏宽度 | 44px | `src/components/ActivityBar.tsx:41` |
| 活动栏按钮大小 | 34×34px | `src/components/ActivityBar.tsx:43` |
| 侧边栏宽度（首页） | 240px | `src/components/Sidebar.tsx:137` (Tailwind `w-60`) |
| 文件浏览器宽度（工作区） | 240px | `src/components/FileExplorer.tsx:487` + `src/pages/FolderWorkspace.tsx:481` |

## 工作区顶部区域

| 元素 | 默认值 | 来源 |
|------|--------|------|
| 文件夹操作按钮 | 28×28px | `src/pages/FolderWorkspace.tsx:523` |
| 文件标签栏最小高度 | 32px | `src/index.css:784` (`.tab-bar`) |
| 面包屑高度 | 22px | `src/pages/FolderWorkspace.tsx:664` |
| 编辑器工具栏高度 | auto (px-3 py-1.5) | `src/components/EditorToolbar.tsx:150` |
| Excel 工具栏高度 | auto (px-3 py-1.5) | `src/components/ExcelToolbar.tsx:460` |
| 公式栏高度 | 28px | `src/index.css:857-866` (`.formula-bar`) |
| 公式栏单元格引用宽度 | 50px | `src/index.css:868` |
| 公式栏 fx 标签宽度 | 28px | `src/index.css:881` |

## 缩放系统

| 属性 | 默认值 | 范围 | 来源 |
|------|--------|------|------|
| UI 缩放 | 110 | 70-150 (步进 10) | `src/App.tsx:116` |
| 内容缩放 | 100 | 70-150 (步进 10) | `src/App.tsx:118` |
| UI 缩放 CSS 公式 | `zoom / 110` (110=无缩放) | — | `src/pages/FolderWorkspace.tsx:471` |
| 内容缩放 CSS 公式 | `zoom / 100` (100=无缩放) | — | `src/pages/FolderWorkspace.tsx:706` |

## 文件浏览器

| 元素 | 默认值 | 来源 |
|------|--------|------|
| 顶部栏高度 | 36px | `src/components/FileExplorer.tsx:491` |
| 底部栏按钮大小 | 24×24px | `src/components/FileExplorer.tsx:636` |
| 树节点缩进深度 | 8 + depth×14 px | `src/components/FileExplorer.tsx` — `renderNode` |
| 底部栏留白 | 41px | `src/components/FileExplorer.tsx:528` |

## 设置面板

| 元素 | 默认值 | 来源 |
|------|--------|------|
| 侧边栏宽度 | 200px | `src/pages/Settings.tsx:256` (`.stg-sidebar`) |
| 内容区最大宽度 | 600px | `src/pages/Settings.tsx:255` (`.stg-main`) |

## 全局搜索

| 元素 | 默认值 | 来源 |
|------|--------|------|
| 弹窗宽度 | 560px | `src/components/GlobalSearchModal.tsx:136` |

## 缩放交互

- **UI 缩放触发：** Ctrl+滚轮 在活动栏/侧边栏/文件浏览器上方
- **内容缩放触发：** Ctrl+滚轮 在编辑器区域上方
- **持久化：** `localStorage` key `gull_settings` → `zoom` / `contentZoom`
- **Electron 同步：** `webContents.setZoomFactor(zoom / 100)` → IPC `zoom:setFactor`
