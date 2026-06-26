/**
 * @file useTabDrag.ts
 * @description 标签页中点法拖拽排序 — computeInsertIndex + mousemove/mouseup 事件管理
 *
 * 算法：中点法（midpoint method）
 * - 每个标签以其中点为分界线
 * - 鼠标在标签中点左侧 → 插入到该标签前面
 * - 鼠标在标签中点右侧 → 插入到该标签后面
 * - 鼠标与边缘的距离决定最近的间隙
 * - 向左和向右拖拽的感觉完全对称
 *
 * 导出：
 * - useTabDrag({ openTabs, setOpenTabs }): { onTabMouseDown, dropIndicatorRef, tabBarRef }
 */

import { useRef, useEffect, useCallback } from "react";
import type { FolderFile } from "../types";

interface DragState {
  idx: number;
  x: number;
  dragging: boolean;
  fileId: string;
}

function computeInsertIndex(
  mouseX: number,
  fromIdx: number,
  tabs: HTMLElement[]
): number {
  if (tabs.length <= 1) return 0;

  let bestGap = 0;
  let bestDist = Infinity;
  let postIdx = 0;

  for (let i = 0; i < tabs.length; i++) {
    if (i === fromIdx) continue;

    const rect = tabs[i].getBoundingClientRect();
    const mid = (rect.left + rect.right) / 2;
    const gap = mouseX < mid ? postIdx : postIdx + 1;
    const targetX = mouseX < mid ? rect.left : rect.right;
    const dist = Math.abs(mouseX - targetX);

    if (dist < bestDist) {
      bestDist = dist;
      bestGap = gap;
    }
    postIdx++;
  }

  const maxIdx = tabs.length - 1;
  return Math.max(0, Math.min(bestGap, maxIdx));
}

interface UseTabDragOptions {
  openTabs: FolderFile[];
  setOpenTabs: (tabs: FolderFile[]) => void;
}

export function useTabDrag({ openTabs, setOpenTabs }: UseTabDragOptions) {
  const dragRef = useRef<DragState>({ idx: -1, x: 0, dragging: false, fileId: "" });
  const dropIndicatorRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const openTabsRef = useRef<string[]>([]);

  // 同步 openTabs → openTabsRef
  useEffect(() => {
    openTabsRef.current = openTabs.map((f) => f.id);
  }, [openTabs]);

  const getTabs = useCallback((): HTMLElement[] => {
    const bar = tabBarRef.current;
    if (!bar) return [];
    const els = bar.querySelectorAll<HTMLElement>(".tab:not(.tab-drop-indicator)");
    return Array.from(els);
  }, []);

  // 全局 mousemove / mouseup：统一处理拖拽视觉反馈和释放
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (d.idx < 0 || !d.fileId) return;
      if (!d.dragging && Math.abs(e.clientX - d.x) > 4) {
        d.dragging = true;
      }
      if (!d.dragging) return;

      const tabs = getTabs();
      if (tabs.length === 0) return;
      const indicator = dropIndicatorRef.current;

      // 从 DOM 中定位被拖拽的 tab（通过 tab-dragging class）
      let dragIdx = -1;
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].classList.contains("tab-dragging")) { dragIdx = i; break; }
      }
      if (dragIdx < 0) {
        const idx = openTabsRef.current.indexOf(d.fileId);
        if (idx >= 0 && idx < tabs.length) {
          tabs[idx].classList.add("tab-dragging");
        }
      }

      const fromIdxMove = openTabsRef.current.indexOf(d.fileId);
      if (fromIdxMove < 0) return;

      const toIndex = computeInsertIndex(e.clientX, fromIdxMove, tabs);

      // 将 post-removal toIndex 映射回原始 DOM 索引定位指示线
      let domIdx = toIndex;
      for (let i = 0; i <= domIdx && i < tabs.length; i++) {
        if (tabs[i].classList.contains("tab-dragging")) { domIdx++; break; }
      }

      if (indicator && domIdx >= 0 && domIdx < tabs.length) {
        const targetRect = tabs[domIdx].getBoundingClientRect();
        indicator.style.left = targetRect.left - 2 + "px";
        indicator.style.display = "block";
      }
    };

    const onUp = (e: MouseEvent) => {
      const d = dragRef.current;
      if (d.idx < 0 || !d.fileId) {
        dragRef.current = { idx: -1, x: 0, dragging: false, fileId: "" };
        return;
      }

      // 清理视觉状态
      const tabs = getTabs();
      tabs.forEach((t) => t.classList.remove("tab-dragging"));
      const indicator = dropIndicatorRef.current;
      if (indicator) { indicator.style.display = "none"; }

      if (!d.dragging) {
        // 纯点击（无拖拽），在 FolderWorkspace 中处理
        dragRef.current = { idx: -1, x: 0, dragging: false, fileId: "" };
        return;
      }

      const fromIdx = openTabsRef.current.indexOf(d.fileId);
      if (fromIdx < 0) {
        dragRef.current = { idx: -1, x: 0, dragging: false, fileId: "" };
        return;
      }

      const toIndex = computeInsertIndex(e.clientX, fromIdx, tabs);
      const arr = [...openTabsRef.current];
      arr.splice(fromIdx, 1);
      arr.splice(toIndex, 0, d.fileId);

      // 重建完整 FolderFile 数组
      const fileMap = new Map<string, FolderFile>();
      const currentOpenTabs = openTabsRef.current.map(
        (id) => openTabs.find((f) => f.id === id)
      ).filter(Boolean) as FolderFile[];
      for (const f of currentOpenTabs) fileMap.set(f.id, f);

      const reordered: FolderFile[] = [];
      for (const id of arr) {
        const f = fileMap.get(id);
        if (f) reordered.push(f);
      }
      setOpenTabs(reordered);
      dragRef.current = { idx: -1, x: 0, dragging: false, fileId: "" };
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [openTabs, setOpenTabs, getTabs]);

  const onTabMouseDown = useCallback(
    (e: React.MouseEvent, fileId: string, idx: number) => {
      if (e.button === 1) return; // 中键
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest(".tab-close")) return;
      e.preventDefault();
      dragRef.current = { idx, x: e.clientX, dragging: false, fileId };
    },
    []
  );

  return { onTabMouseDown, dropIndicatorRef, tabBarRef } as const;
}
