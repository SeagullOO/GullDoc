/**
 * @file HomeView.tsx
 * @description 首页模式视图 — TemplateModal + 欢迎区域
 *
 * 【角色】在 FolderWorkspace 处于 home 模式时渲染中间欢迎区域和模版弹窗。
 *         替代 FolderWorkspace 中约 20 行内联 JSX。
 *
 * 【依赖】TemplateModal 组件；i18n 翻译函数。
 */

import type { FC } from "react";
import type { Template } from "../types";
import { t, getLang } from "../i18n";
import TemplateModal from "./TemplateModal";

export interface HomeViewProps {
  templateModalOpen: boolean;
  onCloseTemplateModal: () => void;
  onSelectTemplate: (template: Template) => void;
  onDeselectAll: () => void;
  onOpenWorkspace: () => void;
  onNewWorkspace: () => void;
  onOpenTemplateModal: () => void;
  onManageTemplates: () => void;
}

export const HomeView: FC<HomeViewProps> = ({
  templateModalOpen,
  onCloseTemplateModal,
  onSelectTemplate,
  onDeselectAll,
  onOpenWorkspace,
  onNewWorkspace,
  onOpenTemplateModal,
  onManageTemplates,
}) => {
  const lang = getLang();

  return (
    <>
      <TemplateModal
        open={templateModalOpen}
        onClose={onCloseTemplateModal}
        onSelect={onSelectTemplate}
      />

      <div
        className="flex-1 flex flex-col items-center justify-center"
        onClick={onDeselectAll}
      >
        <div className="text-5xl mb-4 opacity-20">+</div>
        <p style={{ color: "var(--text-tertiary)", fontSize: 14 }}>
          {t("selectFolderToStart", lang)}
        </p>
        <div className="flex gap-3 mt-6">
          <button onClick={onOpenWorkspace} className="btn-secondary py-1.5 px-4 text-[13px]">
            {t("openWorkspaceBtn", lang)}
          </button>
          <button onClick={onNewWorkspace} className="btn-secondary py-1.5 px-4 text-[13px]">
            {t("newWorkspaceBtn", lang)}
          </button>
          <button onClick={onOpenTemplateModal} className="btn-secondary py-1.5 px-4 text-[13px]">
            {t("fromTemplateBtn", lang)}
          </button>
        </div>
        <button
          onClick={onManageTemplates}
          className="mt-4 text-[11px]"
          style={{
            color: "var(--text-tertiary)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          {t("manageTemplates", lang)}
        </button>
      </div>
    </>
  );
};
