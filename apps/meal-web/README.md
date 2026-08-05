# 点点轻食 · AI 点餐网站

在线体验：[打开点点轻食](https://zsjohnson.site/)

这是点点轻食的公网静态前端快照，支持菜单浏览、轻食推荐和点餐交互。

## 目录说明

当前本地工程中没有找到原始 `src/` 目录，因此本目录提交的是可复现当前公网首页的前端快照：

- `index.html`：入口页面
- `assets/`：当前构建产物中的 JavaScript 和 CSS
- `package.json`、`vite.config.ts`、`tsconfig.json`：项目配置

不提交 `dist/` 和 `node_modules/`。如果后续找回原始 React/TypeScript 源文件，可以直接补回 `src/` 并恢复完整构建链路。

## 本地运行

在仓库根目录执行：

```bash
pnpm install
pnpm --dir apps/meal-web dev
```
