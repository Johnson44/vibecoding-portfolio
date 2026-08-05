# RAG 客服机器人 · 本机规则增强原型

一个不依赖外部模型 API 的本地知识助手原型。系统先对用户问题进行规则化重写，再从已上传资料中检索原文，返回证据摘录和来源引用；无法找到依据时明确拒答。

## 在线体验

公网演示地址：[https://zsjohnson.site/rag/](https://zsjohnson.site/rag/)。公网版本只使用脱敏样例；本地版本仍支持上传已授权的资料并运行完整 Express + SQLite 知识库，避免把本机资料暴露到公开环境。

## 项目亮点

- 支持 PDF、DOCX、Markdown 和 TXT 上传。
- 按标题、页码和长度切分文档，并使用 SQLite 保存本地索引。
- 使用 BM25 与中文字符 n-gram 进行检索排序。
- 维护简称、部门名、产品名和同义词词典。
- 支持上下文追问重写、多意图拆分、来源引用和无依据拒答。
- 通过单元测试覆盖解析、重写、检索和回答证据边界。

## 功能说明

- 设计知识库上传、索引状态、对话问答和证据引用的完整交互。
- 实现文档解析、分块、词典归一化、BM25/n-gram 检索和回答生成链路。
- 建立“回答必须有来源依据、找不到就拒答”的验证边界。

## 技术栈

React 19、TypeScript、Vite、Express、sql.js、Multer、pdf-parse、Mammoth、Vitest。

## 本地运行

需要 Node.js 22+ 和 pnpm。

```bash
pnpm install
pnpm --filter @portfolio/rag-customer-service dev
```

打开 `http://localhost:5173`。开发模式下前端运行在 5173，后端运行在 3001。

生产构建与测试：

```bash
pnpm --filter @portfolio/rag-customer-service test
pnpm --filter @portfolio/rag-customer-service build
pnpm --filter @portfolio/rag-customer-service start
```

请只使用已获授权且完成脱敏的资料。运行产生的 `data/`、SQLite 索引和上传文件不会进入 Git。
