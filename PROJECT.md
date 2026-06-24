# Gull — 项目文档

> 版本 1.0.0 | 最后更新 2026-06-23

## 目录

- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [程序框架构建设计](#程序框架构建设计)
- [核心模块详解](#核心模块详解)
  - [入口层 (Entry)](#入口层-entry)
  - [应用核心 (App Core)](#应用核心-app-core)
  - [页面 (Pages)](#页面-pages)
  - [组件 (Components)](#组件-components)
  - [自定义 Hooks](#自定义-hooks)
  - [工具函数 (Utils)](#工具函数-utils)
  - [数据层 (Data Layer)](#数据层-data-layer)
  - [Electron 层](#electron-层)
- [CSS 设计令牌速查表](#css-设计令牌速查表)
- [数据流与存储层](#数据流与存储层)
- [缩放系统](#缩放系统)
- [构建与部署](#构建与部署)
- [常见维护场景](#常见维护场景)

---

## 技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | React | 18.3 | UI 组件框架 |
| 构建工具 | Vite | 5.4 | 开发服务器 & 生产构建 |
| 语言 | TypeScript | 5.5 | 严格模式类型检查 |
| CSS | Tailwind CSS | 3.4 | 工具类优先的样式系统 |
| 路由 | react-router-dom | 6.26 | 客户端路由 |
| 数据库 | Dexie.js | 4.0 | IndexedDB 封装 (浏览器模式) |
| 编辑器 | Monaco Editor | 0.55 | Markdown 源代码编辑器 |
| 表格 | Handsontable | 14.6.2 | Excel 风格电子表格 (CDN) |
| 公式引擎 | HyperFormula | 2.7.1 | 电子表格公式计算 (CDN) |
| Markdown | marked | 18.0 | Markdown → HTML 渲染 |
| XSS 防护 | DOMPurify | (bundled) | HTML 安全净化 |
| 桌面框架 | Electron | 42.4 | 桌面应用壳 |
| 打包工具 | electron-builder | 26.15 | Electron 打包 (portable) |

**不依赖外部服务**：所有功能离线可用。CDN 依赖 (Handsontable/HyperFormula) 已通过 `npm run vendor:update` 下载到 `public/vendor/`。

---

## 项目结构

```
Gull/
├── index.html                    # 入口 HTML，Handsontable CSS 覆盖
├── package.json                  # 依赖 & 构建脚本
├── vite.config.ts                # Vite 配置
├── tsconfig.json                 # TypeScript strict 模式
├── tailwind.config.js            # Tailwind 颜色/字体扩展
├── postcss.config.js             # PostCSS (Tailwind + Autoprefixer)
│
├── electron/                     # Electron 主进程
│   ├── main.js                   # 窗口管理、IPC handlers、自定义协议
│   └── preload.js                # contextBridge 暴露 electronAPI
│
├── public/vendor/                # 离线 CDN 资源
│   ├── handsontable.full.min.css
│   ├── handsontable.full.min.js
│   └── hyperformula.full.min.js
│
├── scripts/
│   └── download-vendor.mjs       # CDN 资源下载脚本
│
├── src/                          # 前端源码
│   ├── main.tsx                  # React 入口，挂载到 #root
│   ├── App.tsx                   # 应用根组件，路由，ErrorBoundary，缩放系统
│   ├── index.css                 # 全局 CSS 变量、组件类、Handsontable 覆盖
│   ├── types.ts                  # 核心类型定义 (Folder, FolderFile, Template)
│   ├── db.ts                     # Dexie.js IndexedDB 数据库定义 & 迁移
│   ├── storage.ts                # 存储抽象层 (IndexedDB / Electron fs)
│   ├── monaco-theme.ts           # Monaco Editor 暗色/亮色主题
│   ├── vite-env.d.ts             # Vite 客户端类型声明
│   │
│   ├── pages/                    # 页面组件
│   │   ├── FolderWorkspace.tsx   # 主工作区 (三栏布局 + 编辑器)
│   │   ├── FolderList.tsx        # 文件夹列表首页
│   │   └── Settings.tsx          # 设置面板
│   │
│   ├── components/               # UI 组件
│   │   ├── ActivityBar.tsx       # 左侧活动栏 (导航 + 工具按钮)
│   │   ├── Sidebar.tsx           # 文件夹列表侧栏
│   │   ├── FileExplorer.tsx      # 文件树 + 拖拽支持
│   │   ├── FileTree.tsx          # 纯文件树 (模版预览用)
│   │   ├── FilePicker.tsx        # 文件选择器弹窗
│   │   ├── EditorToolbar.tsx     # Markdown 编辑工具栏
│   │   ├── ExcelToolbar.tsx      # Excel 格式工具栏 + 颜色选择器
│   │   ├── FormulaBar.tsx        # Excel 公式栏
│   │   ├── MarkdownEditor.tsx    # Monaco 编辑器 + 预览面板
│   │   ├── ContextMenu.tsx       # Excel 右键菜单 (递归子菜单)
│   │   ├── TitleBar.tsx          # 自定义标题栏 (窗口控制)
│   │   ├── GlobalSearchModal.tsx # 全局文件搜索弹窗
│   │   ├── TemplateManager.tsx   # 模版管理页面
│   │   ├── TemplateModal.tsx     # 从模版新建弹窗
│   │   └── StatusBadge.tsx       # 保存状态指示器
│   │
│   ├── hooks/                    # 自定义 React Hooks
│   │   ├── useExcelEditor.ts     # Handsontable 初始化与生命周期
│   │   ├── useMarkdownEditor.ts  # Monaco 编辑器 + 自动保存
│   │   ├── useFileTabs.ts        # 文件 Tab 切换/关闭逻辑
│   │   ├── useKeyboardShortcuts.ts  # 全局键盘快捷键
│   │   ├── useScrollSync.ts      # 编辑器 ↔ 预览双向滚动同步
│   │   ├── useSplitterDrag.ts    # 分屏拖拽器
│   │   ├── useMetaUndo.ts        # 单元格样式撤销栈
│   │   └── markdown-converter.ts # TipTap JSON → Markdown 文本转换
│   │
│   └── utils/
│       ├── exportUtils.ts        # 文件夹导出 (Markdown/CSV/HTML)
│       └── colorUtils.ts         # 颜色空间转换 (Hex ↔ HSV)
```

---

## 程序框架构建设计

### 组件树

```
<BrowserRouter>
  <App>
    <ThemeProvider (localStorage + class)>
      <ErrorBoundary>
        <TitleBar />                   ← 固定顶部
        <GlobalSearchModal />          ← 叠加层，Ctrl+Shift+F
        <Routes>
          "/" → <FolderWorkspace>      ← 首页/工作区 复用
            <ActivityBar />           ← 左侧 44px 活动栏
            (sidebarOpen ? <Sidebar /> / <FileExplorer />)
            (主内容区)
              <EditorToolbar />       ← Markdown 工具栏
              或
              <ExcelToolbar /> + <FormulaBar />
              <MarkdownEditor />       ← Monaco + 预览
              或
              <div#hot> (Handsontable)
            </主内容>
            <ContextMenu />           ← Excel 右键菜单 (Portal)
          "/templates" → <TemplateManager />
        </Routes>
        (isSettings ? <Settings />)    ← 叠加设置面板
      </ErrorBoundary>
  </App>
</BrowserRouter>
```

### 数据流

```
用户操作
  ↓
组件状态 (useState / useReducer)
  ↓
storage.ts 抽象层 ───→ Electron: fs.readFile/writeFile (JSON 文件)
  │                   → Browser:  Dexie.js → IndexedDB
  ↓
storageGetFolder / storageUpdateFolder
  ↓
组件重新渲染 (setState)
```

### 路由设计

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | FolderWorkspace (home 模式) | 文件夹列表 + 欢迎页 |
| `/folder/:id` | FolderWorkspace (workspace 模式) | 打开指定文件夹编辑 |
| `/templates` | TemplateManager | 模版管理 |
| `/settings` | Settings (叠加层) | 设置面板，通过 `?` 参数显示在任意页面之上 |

`Settings` 不是独立路由 — 它在 `AppContent` 中通过 `location.pathname === "/settings"` 条件渲染为覆盖层。

---

## 核心模块详解

### 入口层 (Entry)

#### `src/main.tsx`
React 应用入口。使用 `React.StrictMode` 包裹 `<App />`，挂载到 `index.html` 的 `#root` 元素。

#### `index.html`
- 引入 Handsontable CDN CSS (`/vendor/handsontable.full.min.css`)
- `<style>` 块：覆盖 Handsontable 默认样式，使用 CSS 变量适配暗色/亮色主题
- `<script defer>`：延迟加载 Handsontable 和 HyperFormula JS，不阻塞首屏渲染
- `lang="zh-CN"`：声明中文语言

---

### 应用核心 (App Core)

#### `src/App.tsx`
**职责**：应用根组件，管理全局状态和路由。

**关键状态**：
- `sidebarOpen` — 侧栏展开/收起
- `globalSearchOpen` — 全局搜索弹窗
- `zoom` — UI 缩放 (70%-150%，默认 110%)
- `contentZoom` — 内容区缩放 (70%-150%，默认 100%)

**设计要点**：
- 主题初始化在 `useEffect` 中通过 `localStorage("gull_settings")` 读取
- 缩放系统提供两个独立层级：UI 缩放 (通过 CSS zoom 应用到 ActivityBar+侧栏容器) 和内容缩放 (应用到编辑器容器)
- `__applyZoom` 全局函数暴露给 Settings 组件调用
- 通过 `BrowserRouter` 的 `future` 标志启用 React Router v7 行为
- `ErrorBoundary` 类组件包裹整个应用，捕获未处理异常防止白屏

#### `src/types.ts`
**核心类型**：

```typescript
FolderFile {
  id: string;        // 唯一标识 (generateId())
  name: string;      // 文件名，支持路径分隔符 "/" (如 "子文件夹/文档.md")
  type: "md" | "excel";
  content: any;      // md: TipTap JSON 或纯文本字符串; excel: { data, colHeaders, cellMeta }
  createdAt: number;
  updatedAt: number;
}

Folder {
  id?: number;       // IndexedDB 自增主键
  name: string;
  files: FolderFile[];
  folders?: string[]; // 空文件夹路径列表
  createdAt: number;
  updatedAt: number;
}

Template {
  id?: number;
  name: string;
  files: FolderFile[];  // 模版保存时深拷贝文件列表
  createdAt: number;
}
```

#### `src/index.css`
**全局 CSS 架构**，详见 [CSS 设计令牌速查表](#css-设计令牌速查表)。

---

### 页面 (Pages)

#### `src/pages/FolderWorkspace.tsx`
**这是应用中最复杂的组件 (~650 行)，整合了三栏布局、文件管理、编辑器路由。**

**两种模式**：
1. **Home 模式** (`/`)：显示 Sidebar + 欢迎页 (新建/打开工作区按钮)
2. **Workspace 模式** (`/folder/:id`)：显示 FileExplorer + 编辑器

**三栏布局结构** (从左到右)：
```
[ActivityBar (44px)] [Sidebar/FileExplorer (240px)] [主内容区 (flex-1)]
```

**缩放系统实现**：
- 外层容器 `ref={uiZoomRef}` 应用 UI 缩放 (整体界面)
- 内层容器 `ref={wsZoomRef}` 应用内容缩放 (编辑器区域)
- Ctrl+滚轮 触发缩放，通过 `capture: true` 在容器级别拦截
- 缩放值持久化到 `localStorage("gull_settings")`

**关键交互**：
- 文件夹名称/文件名称内联编辑 (通过 IME composition 事件处理中文输入)
- 文件 tab 管理 (useFileTabs hook)
- 文件夹 dropdown 菜单 (Portal 渲染到 body)
- Excel 右键菜单 (ContextMenu 组件，捕获选区)

**暴露给外部的方法** (通过 `window.__xxx`)：
- `__openWorkspace`：标题栏 "打开工作区" 按钮
- `__saveFile`：标题栏 "保存" 按钮
- `__saveAs`：标题栏 "另存为" 按钮

#### `src/pages/FolderList.tsx`
独立的文件夹列表页（早期版本使用，现已被 FolderWorkspace 的 home 模式取代）。保留用于兼容性。

#### `src/pages/Settings.tsx`
**设置面板**，以模态浮层形式显示在任何页面之上。

**导航分区**：
- 通用 (语言切换：中文/English)
- 外观 (主题：暗色/亮色/系统，UI 缩放)
- 存储 (存储位置信息)
- 关于 (版本信息、开源许可)

**设计特点**：
- 自定义 CSS 类前缀 `stg-*`，与主应用样式隔离
- ZoomInput 组件：支持拖拽调整 + 点击输入两种交互
- 主题切换即时生效 (通过 `applyThemeClass` + `__applyZoom`)
- ESC 键关闭面板

---

### 组件 (Components)

#### `src/components/ActivityBar.tsx`
**左侧活动栏**，宽 44px，垂直排列图标按钮。

**按钮布局** (从上到下)：
1. 主页 (home 图标)
2. 工作区 (folder 图标)
3. ── 分隔线 ──
4. 新建 Markdown (文档+ 图标)
5. 新建 Excel (表格 图标)
6. ── 分隔线 ──
7. 保存为模版 (书签 图标)

**视觉设计**：
- 活动指示器：选中项左侧显示 2px 宽的 accent 色竖条
- 按钮 34×34px，圆角 6px
- hover 时 bg-hover 背景

#### `src/components/Sidebar.tsx`
**文件夹列表侧栏**，宽 240px。

**布局**：
- 顶部：标题 "Gull" + 副标题
- 搜索栏：搜索图标 + input
- 文件夹列表：scrollable，支持单击选择/双击进入/右键菜单
- 底部：模版管理链接

**右键菜单**：重命名、复制、删除（通过 Portal 渲染）
**内联重命名**：点击 "重命名" 后在原位显示 input，Enter 提交/Esc 取消

#### `src/components/FileExplorer.tsx`
**文件资源管理器**，结合了文件树、文件夹操作、搜索、拖拽。

**核心功能**：
- 树形结构：通过 `buildTree()` 将扁平文件列表转为嵌套树
- 拖拽移动：文件/文件夹可拖拽到其他文件夹
- 内联重命名：新建文件/文件夹后自动进入重命名模式
- 搜索过滤：输入关键词实时筛选
- 亮色/暗色切换按钮 (底部左侧)
- 工作区切换器 (底部右侧，显示最近工作区列表)

**状态管理**：
- `expandedPaths`：所有文件夹默认展开
- `selectedFolderPath`：当前选中的文件夹路径
- `renamingFolder` / `renamingId`：正在重命名的文件夹/文件

**树节点渲染**：
- 文件夹：展开/折叠箭头 (旋转 90deg 动画) + 文件夹图标 + 名称
- 文件：类型图标 (MD 文档 / Excel 表格) + 名称
- 选中项：bg-selected 背景 + 左侧 accent 色竖条

#### `src/components/FileTree.tsx`
精简版文件树组件，用于模版预览场景（不需要文件夹操作和拖拽）。

#### `src/components/MarkdownEditor.tsx`
**Monaco 编辑器 + Markdown 预览**。

**两种模式**：
- 纯编辑模式：Monaco 占满宽度
- 分屏预览模式：左侧 Monaco + 分隔线 + 右侧 HTML 预览

**分屏比例**：通过 `useSplitterDrag` hook 管理，持久化到 localStorage
**滚动同步**：通过 `useScrollSync` hook 实现双向同步
**主题切换**：MutationObserver 监听 `<html>` class 变化，动态切换 Monaco 主题
**XSS 防护**：预览 HTML 经过 `DOMPurify.sanitize()` 处理

#### `src/components/ExcelToolbar.tsx`
**Excel 格式工具栏**，提供丰富的单元格格式化功能。

**功能按钮**：
- 撤销/重做
- 字号下拉 (8-36px)
- 加粗/斜体/下划线
- 字体颜色选择器 (含主题色/标准色/最近使用/自定义)
- 背景颜色选择器 (含主题色/标准色/最近使用/自定义)

**自定义颜色面板**：
- 色谱条 (hue spectrum)：水平渐变色条，拖拽选择色相
- SV 面板：饱和度-明度矩阵，拖拽选择颜色深浅
- Hex 输入框：直接输入颜色代码
- 预览色块 + 应用按钮

#### `src/components/FormulaBar.tsx`
**公式栏**，位于 Excel 工具栏下方。

**结构**：`[单元格引用 (50px)] [fx 标记 (28px)] [公式输入框 (flex-1)]`
- 单元格引用：显示当前选中单元格坐标 (如 A1)
- fx 标记：表示可输入公式
- 公式输入框：输入内容实时写入单元格，Enter 确认，Escape 恢复原值

#### `src/components/ContextMenu.tsx`
**Excel 右键菜单**，支持递归子菜单。

**菜单结构**：
- 剪切/复制/粘贴
- 插入 (行/列)
- 删除 (行/列/单元格)
- 清除 (内容/格式/全部)
- 排序 (升序/降序)
- 冻结 (行/列)
- 隐藏 (行/列)

**子菜单实现**：
- `SubmenuOverlay` 递归组件，悬停触发
- 100ms 延迟打开，600ms 延迟关闭 (防止误触发)
- 自动边界检测 (右边缘向左翻转)

#### `src/components/TitleBar.tsx`
**自定义标题栏**，高 30px，替代系统标题栏 (Electron `frame: false`)。

**布局**：`[设置 文件 侧栏 搜索] ── [文件名居中] ── [最小化 最大化 关闭]`
- `WebkitAppRegion: "drag"`：标题栏可拖拽
- `WebkitAppRegion: "no-drag"`：按钮区域不可拖拽
- 文件下拉菜单：保存、另存为、打开工作区

#### `src/components/GlobalSearchModal.tsx`
**全局文件搜索弹窗**，通过 `Ctrl+Shift+F` 或标题栏搜索按钮触发。

- 搜索所有文件夹中的所有文件
- 支持键盘导航 (↑↓ Enter Esc)
- 结果按文件夹分组显示

#### `src/components/TemplateManager.tsx` / `TemplateModal.tsx`
**模版管理**：列表展示已保存的模版，支持删除。
**模版选择器**：从模版新建文件夹时弹出。

#### `src/components/StatusBadge.tsx`
**保存状态徽章**：已保存 / 保存中 / 未保存。11px 胶囊形状，带圆点指示器。

---

### 自定义 Hooks

#### `src/hooks/useExcelEditor.ts`
**Handsontable 完整生命周期管理**。

**初始化流程**：
1. 检查 `(window as any).Handsontable` 是否可用
2. 构建配置对象 (data, colHeaders, renderer, beforeKeyDown, formulas)
3. 创建 Handsontable 实例并挂载到 `hotRef.current` div
4. 恢复已保存的 cellMeta (颜色、粗体、斜体、字号)
5. 绑定 hooks：`afterChange`, `afterCreateRow/Col`, `afterRemoveRow/Col` 触发自动保存
6. 绑定 `afterSelection`：更新公式栏、设置边界高亮类
7. 设置 ResizeObserver 自动调整行数

**渲染器 (renderer)**：
- 基于 TextRenderer，叠加 meta 属性
- `_bold` → font-weight, `_italic` → font-style, `_fontSize` → font-size
- `_color` → color, `_bgColor` → background-color

**自动保存**：
- 每次修改 500ms 后自动写入 IndexedDB/Electron fs
- 保存整个表格数据 + cellMeta 二维数组

#### `src/hooks/useMarkdownEditor.ts`
**Monaco 编辑器状态管理 + 自动保存**。

- 文件切换时从缓存加载内容
- 1.5 秒防抖自动保存
- 支持 TipTap JSON 格式自动转换为纯文本 (通过 markdown-converter)
- `handleForceSave` 供 Ctrl+S 快捷键调用

#### `src/hooks/useFileTabs.ts`
**文件 Tab 管理**。

- `handleSelectTab(fileId)`：打开文件，加入 tab 列表
- `handleCloseTab(fileId, e)`：关闭 tab，智能选择相邻 tab
- 关闭最后一个 tab 时 `currentFileId` 设为 null

#### `src/hooks/useScrollSync.ts`
**Monaco 编辑器 ↔ HTML 预览双向滚动同步**。

- 通过 `scrollingFrom` ref 防止循环触发
- 使用 `onDidScrollChange` 监听编辑器滚动
- 通过滚动比例 (scroll ratio) 进行映射

#### `src/hooks/useSplitterDrag.ts`
**编辑/预览分屏拖拽器**。

- 比例范围：0.2 - 0.8
- 持久化到 localStorage
- 拖拽结束后调用 `editor.layout()` 刷新 Monaco 布局

#### `src/hooks/useKeyboardShortcuts.ts`
**全局键盘快捷键**：Ctrl+S / Cmd+S 保存当前 Markdown 文件。

#### `src/hooks/useMetaUndo.ts`
**单元格样式撤销栈**。Handsontable 内置 undo 不追踪 setCellMeta，此 hook 补充该功能。

#### `src/hooks/markdown-converter.ts`
**Legacy TipTap JSON → Markdown 文本转换器**。将旧版 TipTap 编辑器的 JSON 文档转为纯 Markdown 文本，确保旧文档可读。

---

### 工具函数 (Utils)

#### `src/utils/exportUtils.ts`
**文件夹导出引擎**。

导出流程：
1. Markdown 文件：TipTap JSON → Markdown 文本
2. Excel 文件：表格数据 → CSV + 样式化 HTML (Excel 可打开)
3. 嵌入表格：提取为独立 CSV 文件
4. 通过 `storageExportFiles` 统一导出 (Electron 原生对话框，浏览器下载)

#### `src/utils/colorUtils.ts`
**颜色空间转换工具**：Hex ↔ HSV ↔ RGB。为 ExcelToolbar 的自定义颜色选择器提供纯函数支持。

---

### 数据层 (Data Layer)

#### `src/db.ts`
**Dexie.js 数据库定义**。

- 数据库名：`GullDB`
- 当前版本：v2
- 表：`folders` (id, name, updatedAt)、`templates` (id, name, createdAt)
- v1→v2 迁移：将旧版 `documents` 表迁移到 `folders` 表
- **HMR 安全单例**：通过 `window.__GULL_DB__` 保持 Vite 热更新时复用同一 IndexedDB 连接

#### `src/storage.ts`
**存储抽象层**，为上层提供统一的 CRUD 接口。

**双后端设计**：
- **Electron 模式**：通过 `window.electronAPI` 进行文件操作 (JSON 文件存储)
- **浏览器模式**：通过 Dexie.js 进行 IndexedDB 操作

**API 接口**：
```typescript
storageLoadFolders() → Folder[]
storageGetFolder(id) → Folder | undefined
storageSaveFolder(folder) → number (返回 id)
storageUpdateFolder(id, changes) → void
storageDeleteFolder(id) → void
storageLoadTemplates() → Template[]
storageAddTemplate(template) → number
storageDeleteTemplate(id) → void
storageExportFiles(files) → Promise<string>
```

**超时保护**：`ensureDbReady(timeoutMs)` 防止 IndexedDB 连接永久阻塞。

---

### Electron 层

#### `electron/main.js`
**主进程入口**。

**自定义协议**：`app://` 协议用于生产模式加载 dist 文件，支持 CORS
**窗口管理**：无边框窗口 (frame: false)，最小尺寸 900×600
**IPC Handlers**：
- `fs:readFile/writeFile/deleteFile/listFiles`：文件 CRUD
- `fs:readDir/readFileAt`：目录浏览 (带路径遍历保护)
- `export:selectFolder/writeFiles`：原生导出对话框
- `dialog:selectFolder`：原生文件夹选择
- `zoom:setFactor`：Electron 级缩放
- `window-close/minimize/maximize`：窗口控制

#### `electron/preload.js`
**预加载脚本**，通过 `contextBridge.exposeInMainWorld` 安全暴露 `electronAPI` 到渲染进程。

---

## CSS 设计令牌速查表

### 暗色模式 (:root)

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--bg-darkest` | `#181818` | 最深层背景 |
| `--bg-root` | `#181818` | 根背景 |
| `--bg-panel` | `#1F1F1F` | 面板/侧栏背景 |
| `--bg-surface` | `#212121` | 卡片/输入框背景 |
| `--bg-hover` | `rgba(255,255,255,0.06)` | 悬停高亮 |
| `--bg-active` | `rgba(255,255,255,0.10)` | 激活态高亮 |
| `--bg-selected` | `rgba(168,130,255,0.42)` | 选中态(紫色 42% 透明) |
| `--text-primary` | `#D5D5D5` | 主文字 |
| `--text-secondary` | `#A5A5A5` | 次要文字 |
| `--text-tertiary` | `#666666` | 三级文字 |
| `--border-subtle` | `rgba(255,255,255,0.08)` | 细微边框 |
| `--border-medium` | `rgba(255,255,255,0.14)` | 中等边框 |
| `--accent` | `#a882ff` | 主题色 (紫色) |
| `--accent-hover` | `#b99aff` | 主题色悬停 |
| `--danger` | `#e5484d` | 危险/删除 |
| `--warning` | `#e5a023` | 警告 |
| `--success` | `#a882ff` | 成功状态 |

### 亮色模式 (:root.light)

通过 `document.documentElement.classList.toggle("light")` 切换。背景色反转为浅色，文字色反转为深色，accent 保持紫色。

### Handsontable CSS 覆盖策略

Handsontable 通过 CDN CSS 设置了许多默认样式。为了在暗色主题中正确显示，`index.html` 的 `<style>` 块和 `index.css` 需要协同覆盖：

1. **index.html `<style>`** (最高优先级)：覆盖 td/th 的背景和文字颜色
2. **index.css `.hot-container` 规则**：覆盖 clone 层 (ht_clone_top/left/corner)、边框、选区高亮
3. **自定义类**：`ht-boundary-*` 用于选区边界高亮

**关键规则**：不要在 `.ht_master td` 上使用 `color !important` — 渲染器的 inline style 设置颜色，`!important` 会覆盖它。

---

## 数据流与存储层

### 存储路径

| 模式 | 位置 | 格式 |
|------|------|------|
| Electron | `app.getPath("userData")/data/` | JSON 文件 |
| 浏览器 | IndexedDB → `GullDB` | Dexie 结构化数据 |

### 自动保存流程

```
用户编辑 (Monaco onChange / Handsontable afterChange)
  → 设置 saveStatus = "unsaved"
  → 等待防抖延迟 (md: 1500ms, excel: 500ms)
  → 设置 saveStatus = "saving"
  → 读取最新 Folder 数据
  → 更新对应文件内容
  → storageUpdateFolder() 写入存储
  → 设置 saveStatus = "saved"
```

### 最近工作区

通过 `localStorage("gull_recent_workspaces")` 存储最近 10 个工作区，在 FileExplorer 底部显示。

---

## 缩放系统

### 设计

两个独立的缩放层级，分别控制不同区域：

| 层级 | 控制区域 | 默认值 | 范围 |
|------|---------|--------|------|
| UI 缩放 (zoom) | ActivityBar + Sidebar/FileExplorer | 110% | 70%-150% |
| 内容缩放 (contentZoom) | 编辑器/表格区域 | 100% | 70%-150% |

### 实现

- UI 缩放：通过 CSS `zoom` 属性应用到包含 ActivityBar 和侧栏的容器
- 内容缩放：通过 CSS `zoom` 属性应用到编辑器容器
- 触发方式：Ctrl+滚轮，在对应容器上拦截 (passive: false, capture: true)
- 持久化：`localStorage("gull_settings").zoom` 和 `contentZoom`
- Electron 级缩放：通过 `webContents.setZoomFactor()` 同步

---

## 构建与部署

### 开发

```bash
npm run dev              # Vite 开发服务器 (http://localhost:5173)
npm run electron:dev     # Vite + Electron 并行启动
```

### 生产构建

```bash
npm run build            # Vite 生产构建 → dist/
npm run electron:build   # 构建 + Electron 打包 (portable .exe) → release/
```

### Vendor 资源更新

```bash
npm run vendor:update    # 从 jsDelivr CDN 下载 Handsontable + HyperFormula
```

### Electron 打包注意

- 国内镜像：`ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/`
- npm 镜像：`--registry https://registry.npmmirror.com`
- 输出目录：`release/`
- 打包格式：Windows portable (.exe)

---

## 常见维护场景

### 添加新的文件类型

1. 在 `types.ts` 的 `FolderFile.type` 联合类型中添加新值
2. 在 `FolderWorkspace.tsx` 的 `handleAddFile` 中添加类型分支
3. 在渲染区域添加对应的编辑器和工具栏
4. 在 `exportUtils.ts` 的 `exportFolder` 中添加导出处理

### 修改主题颜色

1. 编辑 `index.css` 的 `:root` 和 `:root.light` 中的 CSS 变量
2. 同步更新 `tailwind.config.js` 中的 `gdt` / `gdtl` 颜色映射
3. 同步更新 `index.html` `<style>` 中的 Handsontable 覆盖颜色
4. 检查亮色/暗色两种模式

### 添加新的右键菜单项

1. 在 `ContextMenu.tsx` 的 `MENU_ITEMS` 数组中添加菜单项
2. 在 `dispatchAction` 函数的 switch 中添加处理逻辑
3. 如需子菜单，添加 `children` 数组

### 添加新的全局快捷键

编辑 `src/hooks/useKeyboardShortcuts.ts`，在 `onKeyDown` 中添加新的键位判断。

### Handsontable 样式问题排查

1. 检查 `index.html` 的 `<style>` 块是否有 `!important` 覆盖冲突
2. 检查 `index.css` 的 `.hot-container` 规则
3. 运行 `git diff -- src/index.css | grep '!important'` 审查新增的 `!important`
4. 注意：不要用 `!important` 覆盖渲染器的 inline style 颜色
