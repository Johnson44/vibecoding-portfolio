export type SupportedMime = "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "text/markdown" | "text/plain";

export interface PageText {
  page: number;
  text: string;
}

export interface DocumentRecord {
  id: string;
  originalName: string;
  mimeType: string;
  bytes: number;
  status: "indexing" | "indexed" | "error";
  chunkCount: number;
  createdAt: string;
  errorMessage?: string;
}

export interface TextChunk {
  id: string;
  documentId: string;
  sourceName: string;
  page: number;
  section: string;
  text: string;
}

export interface GlossaryEntry {
  id: string;
  source: string;
  target: string;
  kind: "alias" | "synonym" | "department" | "product";
}

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export interface RewriteResult {
  normalized: string;
  standalone: string;
  subQuestions: string[];
  alternatives: string[];
  keywords: string[];
  appliedTerms: Array<{ source: string; target: string }>;
  usedContext: boolean;
}

export interface SearchHit extends TextChunk {
  score: number;
  matchedTerms: string[];
  snippet: string;
}

export interface Citation {
  chunkId: string;
  sourceName: string;
  page: number;
  section: string;
  snippet: string;
}

export interface AnswerResult {
  mode: "extractive";
  text: string;
  citations: Citation[];
  confident: boolean;
}

export interface RewriteProvider {
  rewrite(question: string, history: ConversationTurn[], glossary: GlossaryEntry[]): RewriteResult;
}

export interface AnswerProvider {
  answer(question: string, hits: SearchHit[]): AnswerResult;
}
