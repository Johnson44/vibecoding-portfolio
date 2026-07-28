import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import express from "express";
import multer from "multer";
import { getDatabase as initDatabase, listChunks, listDocuments, listGlossary, markDocumentError, replaceDocumentChunks, saveDocument, upsertGlossary, deleteGlossary, deleteDocument } from "./db.js";
import { makeChunks, parseDocument } from "./parser.js";
import { RuleRewriteProvider } from "./rewrite.js";
import { searchChunks } from "./search.js";
import { ExtractiveAnswerProvider } from "./answer.js";
import type { ConversationTurn, GlossaryEntry } from "./types.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const rewriteProvider = new RuleRewriteProvider();
const answerProvider = new ExtractiveAnswerProvider();
const PORT = Number(process.env.PORT ?? 3001);

function decodeUploadFileName(value: string): string {
  if (!/[\u00e4\u00e5\u00e7\u00e9\u00f6\u00fc]/.test(value)) return value;
  const repaired = Buffer.from(value, "latin1").toString("utf8");
  return repaired.includes("�") ? value : repaired;
}

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, mode: "offline-extractive", externalRequests: false });
});

app.get("/api/knowledge/documents", async (_request, response, next) => {
  try {
    response.json({ documents: await listDocuments() });
  } catch (error) {
    next(error);
  }
});

app.post("/api/knowledge/upload", upload.single("file"), async (request, response) => {
  const file = request.file;
  if (!file) {
    response.status(400).json({ error: "请选择要上传的文件。" });
    return;
  }
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const originalName = decodeUploadFileName(file.originalname);
  const document = {
    id,
    originalName,
    mimeType: file.mimetype || "application/octet-stream",
    bytes: file.size,
    status: "indexing" as const,
    chunkCount: 0,
    createdAt,
  };
  try {
    await saveDocument(document);
    const uploadDir = path.resolve(process.cwd(), "data", "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, `${id}-${originalName.replace(/[^\w\u3400-\u9fff.-]+/g, "_")}`), file.buffer);
    const pages = await parseDocument(file.buffer, originalName, file.mimetype);
    const chunks = makeChunks(pages, id, originalName);
    await replaceDocumentChunks(id, chunks);
    response.status(201).json({ document: { ...document, status: "indexed", chunkCount: chunks.length } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "文件解析失败。";
    await markDocumentError(id, message).catch(() => undefined);
    response.status(422).json({ error: message });
  }
});

app.delete("/api/knowledge/documents/:id", async (request, response, next) => {
  try {
    const id = request.params.id;
    await deleteDocument(id);
    const uploadDir = path.resolve(process.cwd(), "data", "uploads");
    if (fs.existsSync(uploadDir)) {
      for (const name of fs.readdirSync(uploadDir)) {
        if (name.startsWith(`${id}-`)) fs.rmSync(path.join(uploadDir, name));
      }
    }
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/glossary", async (_request, response, next) => {
  try {
    response.json({ entries: await listGlossary() });
  } catch (error) {
    next(error);
  }
});

app.post("/api/glossary", async (request, response, next) => {
  try {
    const body = request.body as Partial<GlossaryEntry>;
    if (!body.source?.trim() || !body.target?.trim()) {
      response.status(400).json({ error: "source 和 target 不能为空。" });
      return;
    }
    const kind = ["alias", "synonym", "department", "product"].includes(body.kind ?? "") ? body.kind! : "synonym";
    response.status(201).json({ entry: await upsertGlossary({ source: body.source, target: body.target, kind }) });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/glossary/:id", async (request, response, next) => {
  try {
    await deleteGlossary(request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.post("/api/chat", async (request, response, next) => {
  try {
    const body = request.body as { question?: string; history?: ConversationTurn[] };
    const question = body.question?.trim();
    if (!question) {
      response.status(400).json({ error: "问题不能为空。" });
      return;
    }
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
    const glossary = await listGlossary();
    const rewrite = rewriteProvider.rewrite(question, history, glossary);
    const chunks = await listChunks();
    const hits = searchChunks(rewrite.alternatives, chunks, 6);
    const answer = answerProvider.answer(question, hits);
    response.json({ originalQuestion: question, rewrite, answer, evidence: answer.confident ? hits.slice(0, 6) : [] });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "服务器发生未知错误。";
  response.status(500).json({ error: message });
});

async function start(): Promise<void> {
  await initDatabase();
  const distPath = path.resolve(process.cwd(), "dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/^(?!\/api).*/, (_request, response) => response.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`领世本机 RAG 服务已启动：http://127.0.0.1:${PORT}`);
  });
}

void start();

export { app };
