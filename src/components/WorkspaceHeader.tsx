/**
 * @file WorkspaceHeader.tsx
 * @description 工作区头部 — 文件标题输入、面包屑路径、保存状态、条件工具栏（MD/Excel）
 *
 * 【角色】在 FolderWorkspace workspace 模式中渲染编辑器上方所有控件：
 *         标题输入、StatusBadge、面包屑路径、条件 EditorToolbar / ExcelToolbar + FormulaBar。
 *         替代 FolderWorkspace 中约 150 行内联 JSX。
 *
 * 【依赖】StatusBadge、EditorToolbar、ExcelToolbar、FormulaBar 组件；i18n 翻译。
 */

import { type FC } from "react";
import type { FolderFile } from "../types";
import type * as Monaco from "monaco-editor";
import { t, getLang } from "../i18n";
import StatusBadge from "./StatusBadge";
import EditorToolbar from "./EditorToolbar";
import ExcelToolbar from "./ExcelToolbar";
import FormulaBar from "./FormulaBar";

export interface WorkspaceHeaderProps {
  folderName: string;
  currentFile: FolderFile | null;
  isComposing: React.MutableRefObject<boolean>;
  onRenameFile: (id: string, name: string) => void;
  onFolderNameChange: (name: string) => void;
  saveStatus: "saved" | "saving" | "unsaved";
  isMdPreview: boolean;
  onTogglePreview: () => void;
  editorRef: React.MutableRefObject<Monaco.editor.IStandaloneCodeEditor | null>;
  hotInstance: React.MutableRefObject<any>;
  hotKey: number;
  onUndo: () => void;
  onRedo: () => void;
  cellRef: React.MutableRefObject<string>;
  formulaValue: string;
  isFormulaBarFocused: React.MutableRefObject<boolean>;
  onFormulaValueChange: (v: string) => void;
}

export const WorkspaceHeader: FC<WorkspaceHeaderProps> = ({
  folderName,
  currentFile,
  isComposing,
  onRenameFile,
  onFolderNameChange,
  saveStatus,
  isMdPreview,
  onTogglePreview,
  editorRef,
  hotInstance,
  hotKey,
  onUndo,
  onRedo,
  cellRef,
  formulaValue,
  isFormulaBarFocused,
  onFormulaValueChange,
}) => {
  const lang = getLang();

  return (
    <>
      <header
        className="px-4 py-2 flex items-center gap-3 shrink-0"
        style={{
          background: "var(--bg-panel)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <input
          id="workspace-title-input"
          value={
            currentFile
              ? (currentFile.name.split("/").pop() || "").replace(
                  /\.(md|csv|xlsx)$/,
                  ""
                )
              : folderName
          }
          onCompositionStart={() => {
            isComposing.current = true;
          }}
          onCompositionEnd={(e) => {
            isComposing.current = false;
            const target = e.target as HTMLInputElement;
            if (currentFile) {
              const ext =
                currentFile.name.match(/\.(md|csv|xlsx)$/)?.[0] || "";
              const dir = currentFile.name.split("/").slice(0, -1).join("/");
              const newName = dir
                ? `${dir}/${target.value}${ext}`
                : `${target.value}${ext}`;
              onRenameFile(currentFile.id, newName);
            } else {
              onFolderNameChange(target.value);
            }
          }}
          onChange={(e) => {
            if (isComposing.current) return;
            if (currentFile) {
              const ext =
                currentFile.name.match(/\.(md|csv|xlsx)$/)?.[0] || "";
              const dir = currentFile.name.split("/").slice(0, -1).join("/");
              const newName = dir
                ? `${dir}/${e.target.value}${ext}`
                : `${e.target.value}${ext}`;
              onRenameFile(currentFile.id, newName);
            } else {
              onFolderNameChange(e.target.value);
            }
          }}
          className="max-w-md px-2 py-1 text-sm font-semibold border rounded outline-none bg-transparent transition-colors"
          style={{ color: "var(--text-primary)", borderColor: "transparent" }}
          placeholder={
            currentFile ? t("fileName", lang) : t("folderName", lang)
          }
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "var(--accent)")
          }
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "transparent";
            // 清空后失焦 → 自动恢复默认文件名
            if (currentFile) {
              const trimmed = (e.target as HTMLInputElement).value.trim();
              if (!trimmed) {
                const isMd = currentFile.type === "md";
                const defaultBase = isMd
                  ? t("untitledDocument", lang).replace(/\.md$/, "")
                  : t("untitledSheet", lang);
                const ext =
                  currentFile.name.match(/\.(md|csv|xlsx)$/)?.[0] || "";
                const dir = currentFile.name
                  .split("/")
                  .slice(0, -1)
                  .join("/");
                const fallbackName = dir
                  ? `${dir}/${defaultBase}${ext}`
                  : `${defaultBase}${ext}`;
                onRenameFile(currentFile.id, fallbackName);
              }
            }
          }}
          onMouseEnter={(e) => {
            if (document.activeElement !== e.currentTarget)
              e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
          onMouseLeave={(e) => {
            if (document.activeElement !== e.currentTarget)
              e.currentTarget.style.borderColor = "transparent";
          }}
        />
        <div className="flex-1" />
        <StatusBadge status={saveStatus} />
      </header>

      {/* Breadcrumb: file path (VS Code-style) */}
      {currentFile &&
        (() => {
          const parts = currentFile.name.split("/");
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 22,
                padding: "0 12px",
                fontSize: 11,
                color: "var(--text-tertiary)",
                background: "var(--bg-root)",
                borderBottom: "1px solid var(--border-subtle)",
                flexShrink: 0,
                gap: 2,
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {parts.map((part, i) => (
                <span
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  {i > 0 && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ opacity: 0.4, flexShrink: 0 }}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                  <span
                    style={
                      i === parts.length - 1
                        ? { color: "var(--accent-text)" }
                        : undefined
                    }
                  >
                    {part}
                  </span>
                </span>
              ))}
            </div>
          );
        })()}

      {/* Editor toolbar (MD mode) */}
      {currentFile?.type === "md" && (
        <EditorToolbar
          editorRef={editorRef}
          isPreviewMode={isMdPreview}
          onTogglePreview={onTogglePreview}
        />
      )}

      {/* Excel toolbar + formula bar */}
      {currentFile?.type === "excel" && (
        <>
          <ExcelToolbar
            hot={hotInstance.current}
            key={hotKey}
            onUndo={onUndo}
            onRedo={onRedo}
          />
          <FormulaBar
            cellRef={cellRef}
            formulaValue={formulaValue}
            hotInstance={hotInstance}
            isFormulaBarFocused={isFormulaBarFocused}
            onFormulaValueChange={onFormulaValueChange}
          />
        </>
      )}
    </>
  );
};
