# 领取资料获客 · 升学图文与留资 Agent

一个面向升学内容运营场景的 AI 工作台原型：输入目标主题、用户画像和运营目标后，生成可用于内容生产与线索承接的结构化方案。

## 在线体验

[打开腾讯云 Demo](https://lingshiziliaoku-d7fi5hsic461a61a-1455113928.tcloudbaseapp.com/education-agent/)

## 项目亮点

- 将选题、标题、封面、正文、CTA 和线索分层组织为一条可视化流程。
- 以升学内容和资料领取为场景，展示从内容触达、留资登记到人工承接的链路。
- 支持本地演示模式；配置 CloudBase 环境后可切换到云端函数调用。
- 对来源、证据范围和人工复核边界进行显式提示，避免把演示数据包装成真实业务结果。

## 我的工作

- 拆解升学图文获客场景，设计输入表单、内容输出和留资线索分层。
- 搭建 React/Vite 工作台，完成结果卡片、CTA、线索规则和流程状态的交互实现。
- 接入 CloudBase Web SDK 的云端调用入口，并保留本地确定性演示与失败回退路径。

## 技术栈

React 19、TypeScript、Vite、CloudBase Web SDK、pnpm workspace。

## 本地运行

在仓库根目录执行：

```bash
pnpm install
pnpm dev:lead
```

打开 `http://localhost:5173/education-agent`。默认使用本地演示模式，不需要 API Key。

如需配置云端模式，请复制 `.env.example` 为本地环境文件，并将凭证放在部署环境中，禁止提交到 Git。
