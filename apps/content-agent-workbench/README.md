# 内容运营 Agent 工作台

这是独立于手机号留资网站的内容运营 Agent 工作台，包含四个模块：升学图文与留资 Agent、B 站电竞视频 Agent、爆款内容拆解 Agent、新闻事实核查与摘要 Agent。

## 在线 Demo

[打开统一 Agent 工作台](https://zsjohnson.site/content-agent/)

## 项目亮点

- 用统一的输入、证据、输出和人工复核结构组织多个内容运营场景。
- 升学模块输出图文方案、CTA、评论区和私信承接规则。
- 电竞模块输出视频选题、分镜、服务边界和接单 SOP。
- 爆款拆解模块输出钩子、结构、改写计划与风险提示。
- 新闻核查模块输出事实主张、来源状态、带证据摘要和人工复核闸门。
- 支持本地演示数据，并预留 CloudBase 云函数调用入口。

## 功能说明

- 拆解四个内容运营场景，设计跨模块的 Agent 输入输出契约。
- 实现 React/Vite 工作台、模块导航、结果卡片、证据状态和合规提示。
- 保留云端调用与本地回退路径，明确展示数据来源、证据边界和人工确认点。

## 技术栈

React 19、TypeScript、Vite、CloudBase Web SDK、pnpm workspace。

## 本地运行

在仓库根目录执行：

```bash
pnpm install
pnpm dev:workbench
```

打开 `http://localhost:5173/`，使用本地演示模式体验四个 Agent 模块。公网部署使用 `/content-agent/` 作为统一入口，进入后通过左侧导航切换四个模块。
