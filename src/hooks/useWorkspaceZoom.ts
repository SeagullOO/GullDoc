/**
 * @file useWorkspaceZoom.ts
 * @description 工作区缩放系统 — UI 缩放 + 内容缩放，Ctrl+滚轮触发，localStorage 持久化
 *
 * UI 缩放：监听 ActivityBar + Sidebar 区域的 Ctrl+滚轮
 * 内容缩放：监听编辑区域的 Ctrl+滚轮
 * 缩放值保存到 localStorage (gull_settings)，跨会话持久化
 * 使用 capture: true 确保在子元素之前拦截事件
 *
 * 导出：
 * - useWorkspaceZoom({ zoom, setZoom, contentZoom, setContentZoom, currentFileId })
 *   => { uiZoomRef, wsZoomRef }
 */

import { useEffect, useRef } from "react";
import {
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_STEP,
  ZOOM_REFERENCE,
  CONTENT_ZOOM_MIN,
  CONTENT_ZOOM_MAX,
  CONTENT_ZOOM_STEP,
  CONTENT_ZOOM_DEFAULT,
} from "../config";

interface UseWorkspaceZoomOptions {
  zoom: number;
  setZoom: (fn: (prev: number) => number) => void;
  contentZoom: number;
  setContentZoom: (fn: (prev: number) => number) => void;
  currentFileId: string | null;
}

export function useWorkspaceZoom({
  zoom,
  setZoom,
  contentZoom,
  setContentZoom,
  currentFileId,
}: UseWorkspaceZoomOptions) {
  const uiZoomRef = useRef<HTMLDivElement>(null);
  const wsZoomRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(zoom);
  const contentZoomRef = useRef(contentZoom);

  // 同步最新值到 ref（避免闭包陈旧引用）
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { contentZoomRef.current = contentZoom; }, [contentZoom]);

  useEffect(() => {
    const uiEl = uiZoomRef.current;
    const wsEl = wsZoomRef.current;

    const saveSetting = (key: string, val: number) => {
      try {
        const raw = localStorage.getItem("gull_settings");
        const s = raw ? JSON.parse(raw) : {};
        s[key] = val;
        localStorage.setItem("gull_settings", JSON.stringify(s));
      } catch { /* localStorage 不可用则静默忽略 */ }
    };

    const onUiWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      if ((e.target as HTMLElement).closest("[data-workspace-zoom]")) return;
      e.preventDefault();
      e.stopPropagation();
      setZoom((prev) => {
        const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev + (e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP)));
        saveSetting("zoom", next);
        (uiEl as HTMLElement | null)?.style.setProperty(
          "zoom",
          next !== ZOOM_REFERENCE ? String(next / ZOOM_REFERENCE) : ""
        );
        return next;
      });
    };

    const onWsWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      e.stopPropagation();
      setContentZoom((prev) => {
        const next = Math.min(CONTENT_ZOOM_MAX, Math.max(CONTENT_ZOOM_MIN, prev + (e.deltaY > 0 ? -CONTENT_ZOOM_STEP : CONTENT_ZOOM_STEP)));
        saveSetting("contentZoom", next);
        (window as any).__contentZoom = next;
        const uiZoomCss = zoomRef.current !== ZOOM_REFERENCE ? zoomRef.current / ZOOM_REFERENCE : 1;
        (wsEl as HTMLElement | null)?.style.setProperty(
          "zoom",
          next !== CONTENT_ZOOM_DEFAULT ? String((next / CONTENT_ZOOM_DEFAULT) / uiZoomCss) : ""
        );
        return next;
      });
    };

    uiEl?.addEventListener("wheel", onUiWheel, { passive: false, capture: true });
    wsEl?.addEventListener("wheel", onWsWheel, { passive: false, capture: true });
    return () => {
      uiEl?.removeEventListener("wheel", onUiWheel, { capture: true });
      wsEl?.removeEventListener("wheel", onWsWheel, { capture: true });
    };
  }, [setZoom, setContentZoom, currentFileId]);

  return { uiZoomRef, wsZoomRef } as const;
}
