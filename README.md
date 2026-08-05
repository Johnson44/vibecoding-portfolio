# Vibecoding Portfolio

面向 AI 产品经理岗位的应用原型作品集，记录从用户任务、Agent 工作流、评测指标到可运行 Demo 的完整设计过程。

仓库只包含脱敏后的源代码、演示数据、测试和配置示例，不包含企业内部资料、用户数据、真实密钥或未脱敏的生产数据。

## 项目导航

| 项目 | 在线 / 本地体验 | 源码与说明 |
| --- | --- | --- |
| [手机号留资资料领取站](apps/lead-material-acquisition/README.md) | [打开领取资料网站](https://zsjohnson.site/lead-material-acquisition/) | [查看源码](apps/lead-material-acquisition/) |
| [四模块内容运营 Agent 工作台](apps/content-agent-workbench/README.md) | [打开统一入口](https://zsjohnson.site/content-agent/) | [查看源码](apps/content-agent-workbench/) |
| [AI Agent Eval Lab](apps/ai-agent-eval-lab/README.md) | [打开公网 Demo](https://zsjohnson.site/ai-agent-eval-lab/) | [查看源码](apps/ai-agent-eval-lab/) |
| [世界杯预测与阵容社区 · World XI Lab](apps/world-cup-predictor/README.md) | [打开公网 Demo](https://zsjohnson.site/world-cup/) | [查看源码](apps/world-cup-predictor/) |
| [RAG 客服机器人 · 知识助手](apps/rag-customer-service/README.md) | [打开公网演示](https://zsjohnson.site/rag/) | [查看源码](apps/rag-customer-service/) |
| [点点轻食 · AI 点餐网站](apps/meal-web/README.md) | [打开公网网站](https://zsjohnson.site/) | [查看源码](apps/meal-web/) |
| [俺妈厨房 · 家庭点餐网站](apps/anma-kitchen/README.md) | [打开公网网站](https://zsjohnson.site/anma/) | [查看源码](apps/anma-kitchen/) |

> 以上两个项目已经补充源码目录并改为公网入口，直接点击即可体验。

## 重点项目：AI Agent Eval Lab

这是一个独立运行的智能体评测工作台原型，围绕“同一用户任务下，免费版与收费版 Agent 的体验差异如何被量化”展开。

- 内置四个具体任务：台风“巴威”信息总结、青岛周末两日旅行规划、小红书手机测评改写、烟雨江南女子撑伞图提示词生成。
- 支持“豆包免费版”和“豆包收费版”盲测对比，并按任务完成度、准确性、稳定性、交互体验、付费价值五个维度评分。
- 自动记录事实错误、幻觉、答非所问、格式错误、工具失败等问题，生成严重度、影响范围、修复优先级和改进建议。
- 默认使用本地脱敏样本和确定性结果，配置 CloudBase 后可以调用统一接口；云端失败时仍会回退到本地演示模式。

## 技术概览

- React、TypeScript、Vite、pnpm workspace
- 共享契约与核心评测逻辑：`packages/contracts`、`packages/core`
- CloudBase Web SDK 与统一 `aigc-api` 调用入口
- Vitest 单元测试、TypeScript 类型检查、Vite 生产构建
- 本地演示优先：可解释、可复现、无需提交任何内部数据或密钥

## 本地运行

环境要求：Node.js 20+、pnpm 10+。

```bash
pnpm install

# 手机号留资资料领取站
pnpm dev:lead

# 内容运营 Agent 工作台
pnpm dev:workbench

# AI Agent Eval Lab
pnpm dev:eval

# 世界杯预测
pnpm dev:world-cup

# RAG 客服机器人
pnpm dev:rag

# 点点轻食
pnpm dev:meal

# 俺妈厨房
pnpm dev:anma
```

运行全量质量检查：

```bash
pnpm check
```

## 作品集边界

- 作品集中的 Agent 工作台和 Eval Lab 是基于实习经历与公开场景设计的个人原型，不宣称为凤凰网内部系统。
- 新闻核查模块使用预置公开来源样本，不依赖不稳定的实时爬虫。
- 评测项目默认使用自制脱敏答案与确定性评分，云端模型调用为可选能力。
- 世界杯预测结果仅用于交互演示，不构成投注或投资建议。

## 简历展示建议

建议在简历中将 `AI Agent Eval Lab` 描述为：

> 设计并实现智能体评测工作台，围绕信息总结、旅行规划、内容改写和图像提示词生成搭建任务集；建立完成度、准确性、稳定性、交互体验、付费价值五维评分体系，支持豆包免费版 / 收费版盲测对比、问题归因与修复优先级输出。

