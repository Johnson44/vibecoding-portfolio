# AI 应用原型项目集

一组可运行的 AI 与业务应用原型，覆盖 Agent 工作台、RAG 知识助手、智能体评测、资料领取、体育内容和点餐场景。代码、演示数据和配置均已脱敏。

## 项目导航

| 项目 | 在线体验 | 源码与说明 |
| --- | --- | --- |
| [RAG 客服机器人 · 知识助手](apps/rag-customer-service/README.md) | [打开公网演示](https://zsjohnson.site/rag/) | [查看源码](apps/rag-customer-service/) |
| [四模块内容运营 Agent 工作台](apps/content-agent-workbench/README.md) | [打开统一入口](https://zsjohnson.site/content-agent/) | [查看源码](apps/content-agent-workbench/) |
| [AI Agent Eval Lab](apps/ai-agent-eval-lab/README.md) | [打开公网 Demo](https://zsjohnson.site/ai-agent-eval-lab/) | [查看源码](apps/ai-agent-eval-lab/) |
| [手机号留资资料领取站](apps/lead-material-acquisition/README.md) | [打开领取资料网站](https://zsjohnson.site/lead-material-acquisition/) | [查看源码](apps/lead-material-acquisition/) |
| [世界杯预测与阵容社区 · World XI Lab](apps/world-cup-predictor/README.md) | [打开公网 Demo](https://zsjohnson.site/world-cup/) | [查看源码](apps/world-cup-predictor/) |
| [点点轻食 · AI 点餐网站](apps/meal-web/README.md) | [打开公网网站](https://zsjohnson.site/) | [查看源码](apps/meal-web/) |
| [俺妈厨房 · 家庭点餐网站](apps/anma-kitchen/README.md) | [打开公网网站](https://zsjohnson.site/anma/) | [查看源码](apps/anma-kitchen/) |

## 重点项目：RAG 客服机器人

一个本地规则增强的知识助手，围绕“回答必须有依据，找不到依据就拒答”设计。

- 支持 PDF、DOCX、Markdown 和 TXT 文档上传、解析、切分与索引。
- 使用 SQLite 保存本地知识库，结合 BM25 与中文字符 n-gram 完成检索排序。
- 支持问题重写、上下文追问、多意图拆分、来源引用和无依据拒答。
- 提供治理后台，可追踪文档版本、检索切片、引用来源、错误归因和更新建议。
- 公网演示只使用脱敏样例；本地模式支持在授权范围内运行完整知识库。

## 其他项目简介

### 四模块内容运营 Agent 工作台

统一承载升学、电竞、爆款内容拆解和新闻事实核查四类场景，使用一致的输入、证据、输出和人工复核结构组织 Agent 流程。

### AI Agent Eval Lab

围绕信息总结、旅行规划、内容改写和图像提示词生成建立任务集，对不同 Agent 版本进行五维评分，并输出问题证据、严重度、修复优先级和评测报告。

### 手机号留资资料领取站

展示资料选择、手机号登记、隐私同意、访问解锁和事件记录组成的线索转化流程，并保留 CloudBase 接口与短期访问凭证设计。

### 世界杯预测与阵容社区

将赛前预测、赛事中心、梦幻阵容和社区互动合并为一个网站，提供可解释的预测因素、阵容规则校验和内容发布流程。

### 点点轻食与俺妈厨房

两个点餐类网站：点点轻食提供菜单浏览、推荐和点餐交互；俺妈厨房面向家庭使用，支持点餐、订单查看和菜单管理。

## 技术与运行

- React、TypeScript、Vite、pnpm workspace
- CloudBase Web SDK、Express、SQLite、Vitest
- 本地演示使用脱敏数据和确定性结果，不依赖真实业务数据或密钥

环境要求：Node.js 20+、pnpm 10+。

```bash
pnpm install
pnpm dev:rag       # RAG 客服机器人
pnpm dev:workbench # 内容运营 Agent 工作台
pnpm dev:eval      # AI Agent Eval Lab
pnpm dev:lead      # 资料领取站
pnpm dev:world-cup # 世界杯预测
pnpm dev:meal      # 点点轻食
pnpm dev:anma      # 俺妈厨房
pnpm check
```

## 数据边界

- 所有公开演示均使用脱敏或自制样例，不包含企业内部资料、用户数据和真实密钥。
- 新闻核查使用预置公开来源样本；RAG 本地知识库只应导入已获授权并完成脱敏的资料。
- 世界杯预测结果仅用于交互展示，不构成投注或投资建议。
