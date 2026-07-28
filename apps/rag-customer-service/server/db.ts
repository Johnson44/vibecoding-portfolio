import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import type { DocumentRecord, GlossaryEntry, TextChunk } from "./types.js";

const require = createRequire(import.meta.url);
const dataDir = path.resolve(process.cwd(), "data");
const dbPath = path.join(dataDir, "rag.sqlite");
let databasePromise: Promise<Database> | undefined;

async function createDatabase(): Promise<Database> {
  fs.mkdirSync(dataDir, { recursive: true });
  const SQL: SqlJsStatic = await initSqlJs({
    locateFile: (file) => path.join(path.dirname(require.resolve("sql.js")), file),
  });
  const saved = fs.existsSync(dbPath) ? fs.readFileSync(dbPath) : undefined;
  const db = saved ? new SQL.Database(saved) : new SQL.Database();
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      bytes INTEGER NOT NULL,
      status TEXT NOT NULL,
      chunk_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      error_message TEXT
    );
    CREATE TABLE IF NOT EXISTS chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      page INTEGER NOT NULL,
      section TEXT NOT NULL,
      text TEXT NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS glossary (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL UNIQUE,
      target TEXT NOT NULL,
      kind TEXT NOT NULL
    );
  `);
  repairMojibakeDocumentNames(db);
  seedGlossary(db);
  persist(db);
  return db;
}

function repairMojibakeDocumentNames(db: Database): void {
  const statement = db.prepare("SELECT id, original_name FROM documents");
  const updates: Array<[string, string]> = [];
  while (statement.step()) {
    const row = statement.getAsObject() as { id: string; original_name: string };
    if (!/[\u00e4\u00e5\u00e7\u00e9\u00f6\u00fc]/.test(row.original_name)) continue;
    const repaired = Buffer.from(row.original_name, "latin1").toString("utf8");
    if (!repaired.includes("�")) updates.push([repaired, row.id]);
  }
  statement.free();
  for (const [name, id] of updates) db.run("UPDATE documents SET original_name = ? WHERE id = ?", [name, id]);
}

function seedGlossary(db: Database): void {
  const result = db.exec("SELECT COUNT(*) AS count FROM glossary");
  const count = Number(result[0]?.values[0]?.[0] ?? 0);
  if (count > 0) return;
  const defaults = [
    ["客服", "客户服务", "synonym"],
    ["报销", "费用报销", "synonym"],
    ["工资", "薪资", "synonym"],
    ["请假", "休假申请", "synonym"],
    ["入职", "员工入职", "synonym"],
    ["离职", "员工离职", "synonym"],
  ];
  const statement = db.prepare("INSERT INTO glossary (id, source, target, kind) VALUES (?, ?, ?, ?)");
  for (const [source, target, kind] of defaults) {
    statement.run([cryptoRandomId(), source, target, kind]);
  }
  statement.free();
}

function cryptoRandomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function persist(db: Database): void {
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

export async function getDatabase(): Promise<Database> {
  databasePromise ??= createDatabase();
  return databasePromise;
}

export async function saveDocument(document: DocumentRecord): Promise<void> {
  const db = await getDatabase();
  db.run(
    `INSERT INTO documents (id, original_name, mime_type, bytes, status, chunk_count, created_at, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET original_name=excluded.original_name, mime_type=excluded.mime_type,
       bytes=excluded.bytes, status=excluded.status, chunk_count=excluded.chunk_count,
       created_at=excluded.created_at, error_message=excluded.error_message`,
    [document.id, document.originalName, document.mimeType, document.bytes, document.status, document.chunkCount, document.createdAt, document.errorMessage ?? null],
  );
  persist(db);
}

export async function replaceDocumentChunks(documentId: string, chunks: TextChunk[]): Promise<void> {
  const db = await getDatabase();
  db.run("BEGIN");
  try {
    db.run("DELETE FROM chunks WHERE document_id = ?", [documentId]);
    const statement = db.prepare("INSERT INTO chunks (id, document_id, page, section, text) VALUES (?, ?, ?, ?, ?)");
    for (const chunk of chunks) {
      statement.run([chunk.id, documentId, chunk.page, chunk.section, chunk.text]);
    }
    statement.free();
    db.run("UPDATE documents SET chunk_count = ?, status = 'indexed', error_message = NULL WHERE id = ?", [chunks.length, documentId]);
    db.run("COMMIT");
    persist(db);
  } catch (error) {
    db.run("ROLLBACK");
    throw error;
  }
}

export async function markDocumentError(documentId: string, message: string): Promise<void> {
  const db = await getDatabase();
  db.run("UPDATE documents SET status = 'error', error_message = ? WHERE id = ?", [message, documentId]);
  persist(db);
}

export async function deleteDocument(documentId: string): Promise<void> {
  const db = await getDatabase();
  db.run("DELETE FROM chunks WHERE document_id = ?", [documentId]);
  db.run("DELETE FROM documents WHERE id = ?", [documentId]);
  persist(db);
}

function rows<T>(db: Database, sql: string, params: unknown[] = []): T[] {
  const statement = db.prepare(sql);
  statement.bind(params as never[]);
  const result: T[] = [];
  while (statement.step()) result.push(statement.getAsObject() as T);
  statement.free();
  return result;
}

export async function listDocuments(): Promise<DocumentRecord[]> {
  const db = await getDatabase();
  return rows<DocumentRecord>(db, `SELECT id, original_name AS originalName, mime_type AS mimeType, bytes,
    status, chunk_count AS chunkCount, created_at AS createdAt, error_message AS errorMessage
    FROM documents ORDER BY created_at DESC`);
}

export async function listChunks(): Promise<TextChunk[]> {
  const db = await getDatabase();
  return rows<TextChunk>(db, `SELECT c.id, c.document_id AS documentId, d.original_name AS sourceName,
    c.page, c.section, c.text FROM chunks c JOIN documents d ON d.id = c.document_id
    WHERE d.status = 'indexed' ORDER BY d.created_at DESC, c.page ASC`);
}

export async function listGlossary(): Promise<GlossaryEntry[]> {
  const db = await getDatabase();
  return rows<GlossaryEntry>(db, "SELECT id, source, target, kind FROM glossary ORDER BY source ASC");
}

export async function upsertGlossary(entry: Omit<GlossaryEntry, "id">): Promise<GlossaryEntry> {
  const db = await getDatabase();
  const id = cryptoRandomId();
  db.run(
    `INSERT INTO glossary (id, source, target, kind) VALUES (?, ?, ?, ?)
     ON CONFLICT(source) DO UPDATE SET target=excluded.target, kind=excluded.kind`,
    [id, entry.source.trim(), entry.target.trim(), entry.kind],
  );
  persist(db);
  const result = rows<GlossaryEntry>(db, "SELECT id, source, target, kind FROM glossary WHERE source = ?", [entry.source.trim()]);
  return result[0] ?? { id, ...entry };
}

export async function deleteGlossary(id: string): Promise<void> {
  const db = await getDatabase();
  db.run("DELETE FROM glossary WHERE id = ?", [id]);
  persist(db);
}
