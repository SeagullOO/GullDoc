/**
 * @file WorkspaceTabs.tsx
 * @description 工作区标签页条 — 标签渲染、拖拽感知、关闭按钮、脏标记
 *
 * 【角色】在 FolderWorkspace 中渲染打开的标签页条。
 *         支持标签页点击、关闭、中键关闭、拖拽排序。
 *
 * 【视觉】高度 35px，flex 水平行，overflow-hidden。
 *         - 每个标签包含：文件类型指示符（M/W/E）、文件名、脏标记点、关闭按钮
 *         - 底部 drop indicator 线用于拖拽排序指示
 *         - 活跃标签有 active 样式（浅背景、强调色左边框）
 */

import type { FC } from "react";
import type { FolderFile } from "../types";

export interface WorkspaceTabsProps {
  openTabFiles: FolderFile[];
  currentFileId: string | null;
  onTabMouseDown: (e: React.MouseEvent, fileId: string, idx: number) => void;
  onCloseTab: (fileId: string, e: React.MouseEvent) => void;
  onSelectTab: (fileId: string) => void;
  dropIndicatorRef: React.RefObject<HTMLDivElement>;
  tabBarRef: React.RefObject<HTMLDivElement>;
}

export const WorkspaceTabs: FC<WorkspaceTabsProps> = ({
  openTabFiles,
  currentFileId,
  onTabMouseDown,
  onCloseTab,
  onSelectTab,
  dropIndicatorRef,
  tabBarRef,
}) => {
  return (
    <div className="tab-bar" id="tab-bar" ref={tabBarRef}>
      <div ref={dropIndicatorRef} className="tab-drop-indicator" />
      {openTabFiles.map((file, idx) => (
        <div
          key={file.id}
          className={`tab ${currentFileId === file.id ? "active" : ""}`}
          onMouseDown={(e) => {
            if (e.button === 1) {
              e.preventDefault();
              onCloseTab(file.id, e as any);
              return;
            }
            onTabMouseDown(e, file.id, idx);
          }}
          onClick={() => onSelectTab(file.id)}
        >
          <span style={{ fontSize: 11, opacity: 0.4 }}>
            {file.type === "md" ? "M" : file.type === "docx" ? "W" : "E"}
          </span>
          <span>{file.name.split("/").pop() || ""}</span>
          {currentFileId === file.id && <span className="tab-dirty" />}
          <button
            className="tab-close"
            onClick={(e) => {
              e.stopPropagation();
              onCloseTab(file.id, e as any);
            }}
          >
            {"×"}
          </button>
        </div>
      ))}
    </div>
  );
};
