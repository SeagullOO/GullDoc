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

import { type FC, useState, useCallback } from "react";
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
  cellRef: string;
  formulaValue: string;
  isFormulaBarFocused: React.MutableRefObject<boolean>;
  onFormulaValueChange: (v: string) => void;
}

/** 提取文件扩展名（含点），如 ".md" ".xlsx" ".csv"，无扩展名返回 "" */
function getExt(name: string): string {
  const m = name.match(/\.(md|csv|xlsx|docx)$/);
  return m ? m[0] : "";
}

/** 提取文件目录部分（去掉最后一个 / 之后的文件名） */
function getDir(name: string): string {
  return name.split("/").slice(0, -1).join("/");
}

/** 拼接新文件名：dir + base + ext，base 为用户输入的无后缀名 */
function buildName(dir: string, base: string, ext: string): string {
  return dir ? `${dir}/${base}${ext}` : `${base}${ext}`;
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

  const [focused, setFocused] = useState(false);

  const ext = currentFile ? getExt(currentFile.name) : "";
  const dir = currentFile ? getDir(currentFile.name) : "";
  const fullName = currentFile ? (currentFile.name.split("/").pop() || "") : "";

  /** 显示值：聚焦时只显示文件名（隐藏后缀），失焦后显示完整文件名 */
  const displayValue = currentFile
    ? focused
      ? fullName.replace(ext, "")
      : fullName
    : folderName;

  /** 提交重命名：将用户输入的纯名称 + 原后缀拼接 */
  const commitRename = useCallback(
    (userInput: string) => {
      if (!currentFile) return;
      const ext = getExt(currentFile.name);
      const dir = getDir(currentFile.name);
      onRenameFile(currentFile.id, buildName(dir, userInput, ext));
    },
    [currentFile, onRenameFile],
  );

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
          value={displayValue}
          onCompositionStart={() => {
            isComposing.current = true;
          }}
          onCompositionEnd={(e) => {
            isComposing.current = false;
            const target = e.target as HTMLInputElement;
            if (currentFile) {
              commitRename(target.value);
            } else {
              onFolderNameChange(target.value);
            }
          }}
          onChange={(e) => {
            if (isComposing.current) return;
            if (currentFile) {
              commitRename(e.target.value);
            } else {
              onFolderNameChange(e.target.value);
            }
          }}
          className="max-w-md px-2 py-1 text-sm font-semibold border rounded outline-none bg-transparent transition-colors"
          style={{ color: "var(--text-primary)", borderColor: "transparent" }}
          placeholder={
            currentFile ? t("fileName", lang) : t("folderName", lang)
          }
          onFocus={(e) => {
            setFocused(true);
            e.currentTarget.style.borderColor = "var(--accent)";
            // 选中文件名部分（不含后缀），方便直接输入
            const input = e.currentTarget;
            if (currentFile && ext) {
              const dotIdx = input.value.lastIndexOf(ext);
              if (dotIdx > 0) input.setSelectionRange(0, dotIdx);
            }
          }}
          onBlur={(e) => {
            setFocused(false);
            e.currentTarget.style.borderColor = "transparent";
            // 清空后失焦 → 自动恢复默认文件名
            if (currentFile) {
              const trimmed = (e.target as HTMLInputElement).value.trim();
              if (!trimmed) {
                const defaultBase =
                  currentFile.type === "md"
                    ? t("untitledDocument", lang).replace(/\.md$/, "")
                    : t("untitledSheet", lang);
                const ext = getExt(currentFile.name);
                const dir = getDir(currentFile.name);
                const extFinal =
                  ext || (currentFile.type === "md" ? ".md" : ".xlsx");
                const fallbackName = dir
                  ? `${dir}/${defaultBase}${extFinal}`
                  : `${defaultBase}${extFinal}`;
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
