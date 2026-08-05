# 俺妈厨房 · 家庭点餐网站

在线体验：[打开俺妈厨房](https://zsjohnson.site/anma/)

一个只供家里使用的私用点餐本，支持点餐、查看订单、菜单管理和本地数据保存。

## 本地运行

在仓库根目录执行：

```bash
pnpm install
pnpm --dir apps/anma-kitchen dev
```

开发服务默认运行在 `http://localhost:5178/`。厨房服务数据保存在本地 `.data/` 目录，不提交到 Git。

## 技术栈

React、TypeScript、Vite，以及用于开发环境订单和菜单接口的 Vite 中间件。
