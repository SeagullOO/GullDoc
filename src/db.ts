/**
 * db.ts — IndexedDB 数据库层（Dexie.js）
 *
 * 封装 GullDB 的 IndexedDB 数据库，管理 folders 和 templates 表。
 * 使用 Dexie.js 的版本控制机制实现 schema 迁移。
 *
 * 关键设计决策：
 * - HMR 安全单例：将 db 实例挂在 window.__GULL_DB__ 上，确保 Vite 热更新时
 *   复用同一个 IndexedDB 连接，避免重复打开数据库被浏览器阻塞。
 * - v1 → v2 迁移：将旧版 documents 表的数据转换为 folders 表格式，
 *   每个旧文档变为一个文件夹（含一个 Markdown 文件）。
 *
 * 导出：
 * - db: GullDB 单例实例
 */

import Dexie, { type Table } from "dexie";
import type { Folder, Template } from "./types";
import { generateId } from "./types";

/**
 * GullDB — Gull的 IndexedDB 数据库
 *
 * 表结构：
 * - folders:   按 updatedAt 索引，支持增删改查
 * - templates: 按 createdAt 索引，用于工作区模版管理
 */
class GullDB extends Dexie {
  folders!: Table<Folder, number>;
  templates!: Table<Template, number>;

  constructor() {
    super("GullDB");

    // v1: 初始 schema，包含 documents 表（已弃用）
    this.version(1).stores({
      documents: "++id, title, updatedAt",
      templates: "++id, name, createdAt",
    });

    // v2: 当前 schema，将 documents 替换为 folders
    this.version(2)
      .stores({
        folders: "++id, name, updatedAt",
        templates: "++id, name, createdAt",
      })
      .upgrade((tx) => {
        // v1 → v2: 将旧 documents 表数据迁移为 folders 结构。
        // 仅在从 v1 升级时触发；全新安装 v2 不执行此回调。
        // 使用 try-catch 包裹，因为当前版本 schema 中不存在 documents 表时
        // tx.table("documents") 会抛出异常。
        try {
          const docsTable = tx.table("documents");
          if (!docsTable.schema) return;
          return docsTable.toArray().then((docs: any[]) => {
            const now = Date.now();
            const folderDocs: Folder[] = docs.map((d: any) => ({
              name: d.title || "未命名文档",
              files: [
                {
                  id: generateId(),
                  name: (d.title || "未命名文档") + ".md",
                  type: "md" as const,
                  content: d.content || {
                    type: "doc",
                    content: [{ type: "paragraph" }],
                  },
                  createdAt: d.createdAt || now,
                  updatedAt: d.updatedAt || now,
                },
              ],
              createdAt: d.createdAt || now,
              updatedAt: d.updatedAt || now,
            }));
            if (folderDocs.length > 0) {
              return tx.table("folders").bulkAdd(folderDocs);
            }
          });
        } catch {
          // 当前版本 schema 中不存在 documents 表，无需迁移
        }
      });
  }
}

/**
 * HMR 安全单例模式：
 *
 * 将数据库实例持久化在 window 上，Vite 热模块替换重新加载此模块时，
 * 复用已有连接而非创建新连接，避免 IndexedDB 连接被阻塞。
 */
const g = window as unknown as Record<string, unknown>;
export const db: GullDB =
  (g.__GULL_DB__ as GullDB) ?? (g.__GULL_DB__ = new GullDB());
