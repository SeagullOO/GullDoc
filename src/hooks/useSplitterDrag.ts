/**
 * useSplitterDrag.ts — 可拖拽的分隔条（Splitter），带持久化比例
 *
 * 用于 Markdown 编辑器的编辑区/预览区水平分割。
 *
 * 拖拽机制：
 * - mousedown 在分隔条上时开始拖拽
 * - document 级别的 mousemove 计算鼠标相对于容器的比例位置
 * - mouseup 时停止拖拽并调用 editorRef.current?.layout() 让 Monaco 重新布局
 * - 拖拽过程中比例实时更新，反映在 splitRatio state 中
 *
 * 持久化：
 * - splitRatio 通过 useEffect 自动写入 localStorage (key: gull_md_split_ratio)
 * - 初始化时从 localStorage 读取，无保存值则默认 50%
 *
 * 限制：
 * - MIN_SPLIT = 0.2（编辑区最小 20%）
 * - MAX_SPLIT = 0.8（编辑区最大 80%，预览区至少 20%）
 *
 * 导出：
 * - splitRatio:           当前分割比例（0-1）
 * - isDragging:           是否正在拖拽（用于 CSS 光标样式）
 * - handleSplitterMouseDown: 分隔条 onMouseDown 处理函数
 */

import { useState, useRef, useCallback, useEffect } from "react";
import type * as Monaco from "monaco-editor";

const SPLIT_RATIO_KEY = "gull_md_split_ratio";
const DEFAULT_SPLIT = 0.5;
/** 编辑区最小宽度比例（20%） */
const MIN_SPLIT = 0.2;
/** 编辑区最大宽度比例（80%） */
const MAX_SPLIT = 0.8;

interface UseSplitterDragParams {
  containerRef: React.RefObject<HTMLDivElement | null>;
  editorRef: React.MutableRefObject<Monaco.editor.IStandaloneCodeEditor | null>;
}

/**
 * useSplitterDrag — 可拖拽分隔条
 *
 * @param containerRef 分隔条所在容器 DOM ref（用于计算相对位置）
 * @param editorRef    Monaco 编辑器实例 ref（拖拽结束后调用 layout()）
 */
export function useSplitterDrag({ containerRef, editorRef }: UseSplitterDragParams) {
  const [splitRatio, setSplitRatio] = useState(() => {
    try {
      const saved = localStorage.getItem(SPLIT_RATIO_KEY);
      return saved ? parseFloat(saved) : DEFAULT_SPLIT;
    } catch {
      return DEFAULT_SPLIT;
    }
  });
  /** 拖拽状态 ref（不触发重渲染，提高拖拽性能） */
  const isDragging = useRef(false);

  // 将 splitRatio 持久化到 localStorage（变化时自动写入）
  useEffect(() => {
    try {
      localStorage.setItem(SPLIT_RATIO_KEY, String(splitRatio));
    } catch {
      /* localStorage 不可用，静默忽略 */
    }
  }, [splitRatio]);

  /**
   * 分隔条 mousedown 处理器
   *
   * 在 document 上注册 mousemove/mouseup 监听（而非容器上），
   * 确保即使在容器外释放鼠标也能正确结束拖拽。
   * mouseup 时调用 editorRef.current?.layout() 强制 Monaco 重新计算布局。
   */
  const handleSplitterMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      const onMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const x = ev.clientX - rect.left;
        const ratio = x / rect.width;
        setSplitRatio(Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, ratio)));
      };

      const onMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        // 拖拽结束后强制 Monaco 重新布局（编辑区宽度已改变）
        editorRef.current?.layout();
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [containerRef, editorRef],
  );

  return { splitRatio, isDragging, handleSplitterMouseDown };
}
