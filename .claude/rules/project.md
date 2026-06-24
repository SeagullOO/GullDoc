# Gull 专属规则

## Handsontable 禁区
- 不要在 .ht_master td、.handsontable td 上加 color !important 或 background !important
- renderer 的颜色由 inline style 设置，外层 !important 会覆盖
- 写完 Handsontable 样式后必须检查: git diff -- src/index.css | grep '!important'

## CSS 规则
- 只用 CSS 变量（var(--accent)），不用硬编码色值（#a882ff）
- index.html 的 <style> 是最高优先级，覆盖 CDN CSS
- 新增组件用 Tailwind 工具类 + CSS 变量，不创建新 CSS 文件

## 组件拆分
- FolderWorkspace.tsx 已 878 行 — 新功能提成 hook 或独立组件
- hooks/ 放 useAutoSave、useExcel、useMd 等
- 每个新组件 < 200 行

## 构建
- npm 镜像: --registry https://registry.npmmirror.com
- Electron 打包: ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
