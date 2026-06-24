import type { ReactNode } from "react";

/**
 * Panel — 通用侧边面板骨架
 *
 * 【角色】为主页侧边栏 (Sidebar) 和工作区文件面板 (FileExplorer) 提供统一的
 *         容器布局：240px 宽度、纵向 flex、顶部/中间/底部三区域。
 *
 * 【视觉布局】
 *   - 容器：w-60 (240px) + h-full + flex-col + bg-panel + border-right
 *   - header：shrink-0，可选显示，默认带底部分割线
 *   - body：flex-1 + overflow-y-auto，可滚动内容区
 *   - footer：shrink-0，可选显示，默认带顶部分割线
 */
interface PanelProps {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

function Panel({ header, children, footer }: PanelProps) {
  return (
    <div
      className="h-full w-full flex flex-col flex-shrink-0 select-none"
      style={{
        background: "var(--bg-panel)",
      }}
    >
      {header && <div className="shrink-0">{header}</div>}

      <div className="flex-1 overflow-y-auto">{children}</div>

      {footer && (
        <div
          className="shrink-0"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

export default Panel;
