# Vibecoding Portfolio

AI 产品运营与应用原型作品集，集中展示三个可运行项目：领取资料获客、世界杯预测和 RAG 客服机器人。

> 本仓库只包含可公开的代码、测试和示例配置，不包含企业原始资料、用户数据、数据库文件或任何访问密钥。

## 项目导航

| 项目 | 在线体验 | 源码与说明 |
| --- | --- | --- |
| [领取资料获客 · 升学图文与留资 Agent](apps/lead-material-acquisition/README.md) | [腾讯云 Demo](https://lingshiziliaoku-d7fi5hsic461a61a-1455113928.tcloudbaseapp.com/education-agent/) | [查看源码](apps/lead-material-acquisition/) |
| [世界杯预测 · World XI Lab](apps/world-cup-predictor/README.md) | 暂无当前可用公网部署 | [查看源码](apps/world-cup-predictor/) |
| [RAG 客服机器人 · 本机规则增强原型](apps/rag-customer-service/README.md) | 本地运行 | [查看源码](apps/rag-customer-service/) |

## 技术概览

- React、TypeScript、Vite
- pnpm workspace 多项目管理
- BM25 与中文字符 n-gram 检索
- SQLite / sql.js 本地索引
- CloudBase Web SDK 与腾讯云静态托管 Demo
- Vitest 测试与 TypeScript 类型检查

## 本地运行

需要 Node.js 20+ 和 pnpm 10+。RAG 项目建议使用 Node.js 22+。

```bash
pnpm install
pnpm dev:lead
pnpm dev:world-cup
pnpm dev:rag
```

质量检查：

```bash
pnpm check
```

## 作品集边界

- 获客 Agent 使用演示数据；真实 CloudBase 凭证只应存在于部署环境变量中。
- 世界杯项目的概率和赛果为可复算的演示数据，不构成投注建议。
- RAG 项目只支持本地资料索引；仓库不提供企业原始文件，运行时请使用已获授权且脱敏的资料。

## 后续扩展

新网站按 `apps/<project-name>/` 增加，并在本 README 的项目导航表中补充一行即可。
