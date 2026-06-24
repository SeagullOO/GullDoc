/**
 * config.ts — 集中配置文件
 *
 * 所有你经常调整的数值都放在这里，改一处全局生效。
 * CSS 文件 (index.css) 和 Electron 主进程 (main.js) 无法直接导入 TS，
 * 相关值在注释中标注，修改时需同步。
 */

// ═══════════════════════════════════════════════════════════════════════════
// Zoom — UI 缩放（Ctrl+滚轮）
// ═══════════════════════════════════════════════════════════════════════════

export const ZOOM_DEFAULT = 110;
export const ZOOM_MIN = 110;
export const ZOOM_MAX = 150;
export const ZOOM_STEP = 10;
/** CSS zoom 的基准值：此值表示 1:1 无缩放 */
export const ZOOM_REFERENCE = 100;

// ═══════════════════════════════════════════════════════════════════════════
// Colors — 统一颜色变量（映射到 CSS 变量，放在最前面以便其他常量引用）
// ═══════════════════════════════════════════════════════════════════════════

export const COLOR_BORDER = "var(--border-subtle)";
export const COLOR_TEXT_SECONDARY = "var(--text-secondary)";
export const COLOR_ACCENT = "var(--accent)";
export const COLOR_BG_PANEL = "var(--bg-panel)";
export const COLOR_BG_SELECTED = "var(--bg-selected)";

// ═══════════════════════════════════════════════════════════════════════════
// Layout — 面板 / 栏位尺寸
// ═══════════════════════════════════════════════════════════════════════════

/** 侧边面板宽度（Sidebar / FileExplorer） */
export const PANEL_WIDTH = 240;
export const PANEL_MIN_WIDTH = 210;
export const PANEL_MAX_WIDTH = 480;

/** 分隔线：视觉宽度 + 拖拽判定范围 */
export const SPLITTER_WIDTH = 1;
export const SPLITTER_HIT = 20;

/** ActivityBar 宽度 */
export const ACTIVITY_BAR_WIDTH = 48;

/** TitleBar 高度 */
export const TITLE_BAR_HEIGHT = 38;

/** FileExplorer 顶部栏高度 */
export const EXPLORER_HEADER_HEIGHT = 36;

/** 文件树缩进：基础偏移 */
export const TREE_INDENT_BASE = 8;

/** 文件树缩进：每层深度增量 */
export const TREE_INDENT_PER_DEPTH = 10;

/** 文件树：图标组到文字的间距 */
export const TREE_ICON_GAP = 38;

/** 文件树：折叠箭头在图标组内的左偏移 */
export const TREE_CHEVRON_OFFSET = -8;

/** 文件数：箭头占位宽度（文件图标对齐用） */
export const TREE_CHEVRON_WIDTH = 4;

/** 文件树：引导竖线相对箭头组的 X 偏移（箭头中心 = padding(3) + 图标(10)/2 = 8） */
export const TREE_GUIDE_OFFSET = 10;

/** 文件树：选中文件夹的引导线高亮宽度 */
export const TREE_GUIDE_HIGHLIGHT_WIDTH = 1;

/** 文件树：选中文件夹的引导线高亮颜色（与文件夹箭头同色） */
export const TREE_GUIDE_HIGHLIGHT_COLOR = COLOR_TEXT_SECONDARY;

// ═══════════════════════════════════════════════════════════════════════════
// Window — Electron 窗口默认值 | 同步自 electron/main.js
// ═══════════════════════════════════════════════════════════════════════════

export const WINDOW_WIDTH = 1400;
export const WINDOW_HEIGHT = 900;
export const WINDOW_MIN_WIDTH = 600;
export const WINDOW_MIN_HEIGHT = 400;

/** 文件读取最大字节数 (10MB) | 同步自 electron/main.js */
export const MAX_FILE_READ_SIZE = 10 * 1024 * 1024;

// ═══════════════════════════════════════════════════════════════════════════
// Misc
// ═══════════════════════════════════════════════════════════════════════════

/** 工作区右键菜单显示最近工作区数量 */
export const RECENT_WORKSPACES_COUNT = 7;

