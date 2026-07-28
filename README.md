# Vibecoding Portfolio

AI 产品运营与应用原型作品集，集中展示四个项目。

> 仓库只包含脱敏后的源码、测试和示例配置，不包含企业原始资料、用户数据、数据库文件或访问凭证。

## 项目导航

| 项目 | 在线体验 | 源码与说明 |
| --- | --- | --- |
| [手机号留资资料领取站](apps/lead-material-acquisition/README.md) | [打开领取资料网站](https://lingshiziliaoku-d7fi5hsic461a61a-1455113928.ap-shanghai.app.tcloudbase.com/) | [查看源码](apps/lead-material-acquisition/) |
| [内容运营 Agent 工作台](apps/content-agent-workbench/README.md) | [打开 Agent 工作台](https://lingshiziliaoku-d7fi5hsic461a61a-1455113928.tcloudbaseapp.com/education-agent/) | [查看源码](apps/content-agent-workbench/) |
| [世界杯预测 · World XI Lab](apps/world-cup-predictor/README.md) | 暂无当前可验证的公网部署 | [查看源码](apps/world-cup-predictor/) |
| [RAG 客服机器人 · 本地规则增强原型](apps/rag-customer-service/README.md) | 本地运行 | [查看源码](apps/rag-customer-service/) |

## 技术概览

- React、TypeScript、Vite、pnpm workspace
- Next.js / CloudBase HTTP 云函数 / 飞书多维表格（资料领取项目）
- CloudBase Web SDK 与结构化 Agent 输出（内容运营工作台）
- BM25 与中文字符 n-gram 检索、SQLite 本地索引（RAG 项目）
- Vitest 测试与 TypeScript 类型检查

## 本地运行

需要 Node.js 20+ 与 pnpm 10+；RAG 项目建议 Node.js 22+。

```bash
pnpm install
pnpm dev:lead
pnpm dev:workbench
pnpm dev:world-cup
pnpm dev:rag
```

质量检查：

```bash
pnpm check
```

## 作品集边界

- 资料领取项目的公网 Demo 使用真实 CloudBase 服务，但仓库不提交企业原始资料、飞书凭证或云端环境变量。
- Agent 工作台使用演示数据和脱敏配置，真实云端密钥不进入仓库。
- 世界杯项目的概率和赛果为可复算的演示数据，不构成投注建议。
- RAG 项目只支持本地知识库索引，运行时请使用已获授权且脱敏的资料。

## 后续扩展

新项目按 `apps/<project-name>/` 添加，并在本 README 的项目导航中补充一行即可。
