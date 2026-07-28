import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Rewrite = {
  normalized: string;
  standalone: string;
  subQuestions: string[];
  alternatives: string[];
  keywords: string[];
  appliedTerms: Array<{ source: string; target: string }>;
  usedContext: boolean;
};

type Evidence = {
  id: string;
  sourceName: string;
  page: number;
  section: string;
  snippet: string;
  score: number;
};

type Answer = {
  text: string;
  confident: boolean;
  citations: Array<{ sourceName: string; page: number; section: string; snippet: string }>;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  rewrite?: Rewrite;
  answer?: Answer;
  evidence?: Evidence[];
};

const starters = [
  "81中划片地图？",
  "48中摇中率？",
  "石家庄二中作息？",
];

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "你好，我是领世知识助手。把资料放进本机知识库后，我会先把问题整理清楚，再从资料原文里找依据。",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const floatingPreview = useMemo(() => {
    const latestMessage = [...messages].reverse().find((message) => message.id !== "welcome" && message.text.trim());
    return latestMessage?.text ?? "等你输入一个问题，我会从本机资料里帮你找答案。";
  }, [messages]);

  async function submitQuestion(event?: FormEvent): Promise<void> {
    event?.preventDefault();
    const question = draft.trim();
    if (!question || busy) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", text: question };
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setBusy(true);
    try {
      const history = [...messages, userMessage].slice(-8).map((message) => ({ role: message.role, content: message.text }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "回答失败");
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        text: result.answer.text,
        rewrite: result.rewrite,
        answer: result.answer,
        evidence: result.evidence,
      }]);
    } catch (error) {
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        text: error instanceof Error ? error.message : "本机服务暂时不可用，请检查后端是否已启动。",
      }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-logo-crop"><img src="/brand/lingshi-logo.jpg" alt="有道领世" /></div>
          <div className="brand-caption"><span>LOCAL KNOWLEDGE ASSISTANT</span><small>本机知识助手</small></div>
        </div>
        <div className="topbar-status"><span className="status-dot" />本机模式 · 不联网</div>
      </header>
      <FloatingMascot preview={floatingPreview} busy={busy} />

      <main className="page-content">
        <section className="intro-row">
          <div className="intro-copy">
            <h1>庄里升学，不懂问我！</h1>
          </div>
        </section>

        <section className="workspace-grid">
          <section className="chat-panel card">
            <div className="chat-heading"><div><p className="section-kicker">ASK THE LIBRARY</p><h2>问问资料库</h2></div><div className="chat-indicator"><span className="status-dot" />规则引擎在线</div></div>
            <div className="starter-row">{starters.map((starter) => <button key={starter} onClick={() => setDraft(starter)}>{starter}</button>)}</div>
            <div className="message-list">
              {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
              {busy && <div className="message assistant-message"><MascotAvatar /><div className="message-content"><div className="typing"><i /><i /><i /></div><small className="muted">正在整理问题并查找本机资料…</small></div></div>}
            </div>
            <form className="composer" onSubmit={submitQuestion}><div className="composer-entry"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="输入一个关于内部流程的问题…" rows={3} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submitQuestion(); } }} /></div><button type="submit" disabled={!draft.trim() || busy} aria-label="发送">↗</button></form>
            {notice && <div className="notice">{notice}</div>}
          </section>
        </section>
      </main>
      <footer><span>本地资料仅用于当前电脑的检索</span><span>LINGSHI · INTERNAL PROTOTYPE</span></footer>
    </div>
  );
}

type FloatingPosition = { x: number; y: number };
type DragState = FloatingPosition & { pointerId: number; startX: number; startY: number };

function FloatingMascot({ preview, busy }: { preview: string; busy: boolean }) {
  const [position, setPosition] = useState<FloatingPosition>(() => ({
    x: Math.max(12, window.innerWidth - (window.innerWidth <= 700 ? 170 : 282)),
    y: Math.max(78, window.innerHeight - (window.innerWidth <= 700 ? 360 : 188)),
  }));
  const [minimized, setMinimized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  function clampPosition(next: FloatingPosition): FloatingPosition {
    const compactViewport = window.innerWidth <= 700;
    const width = widgetRef.current?.offsetWidth ?? (minimized ? 82 : compactViewport ? 174 : 258);
    const height = widgetRef.current?.offsetHeight ?? (minimized ? 82 : compactViewport ? 84 : 140);
    return {
      x: Math.min(Math.max(12, next.x), Math.max(12, window.innerWidth - width - 12)),
      y: Math.min(Math.max(78, next.y), Math.max(78, window.innerHeight - height - 12)),
    };
  }

  useEffect(() => {
    const keepInViewport = () => setPosition((current) => clampPosition(current));
    const frame = window.requestAnimationFrame(keepInViewport);
    window.addEventListener("resize", keepInViewport);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", keepInViewport);
    };
  }, [minimized]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: position.x,
      y: position.y,
    };
    setDragging(true);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>): void {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setPosition(clampPosition({
      x: drag.x + event.clientX - drag.startX,
      y: drag.y + event.clientY - drag.startY,
    }));
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>): void {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div
      ref={widgetRef}
      className={`floating-mascot ${minimized ? "is-minimized" : ""} ${dragging ? "is-dragging" : ""}`}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label="领世小助手悬浮窗"
    >
      <div className="floating-drag-handle">
        <div className="floating-mascot-art" aria-hidden="true">
          <div className="mascot">
            <div className="antenna"><i /></div>
            <div className="mascot-ear ear-left" /><div className="mascot-ear ear-right" />
            <div className="mascot-face"><div className="eye eye-left" /><div className="eye eye-right" /><div className="mascot-smile" /><div className="cheek cheek-left" /><div className="cheek cheek-right" /></div>
            <div className="mascot-body"><div className="body-screen"><span>↗</span></div><div className="body-glow" /></div>
            <div className="mascot-shadow" />
          </div>
        </div>
        {!minimized && <div className="floating-mascot-copy"><strong>领世小助手</strong><span className="floating-conversation-label">{busy ? "正在处理这条对话" : "当前对话"}</span><p className="floating-conversation" title={preview}>{preview}</p><small><i /> 本机规则引擎在线</small></div>}
        <button className="floating-mascot-toggle" type="button" onClick={() => setMinimized((value) => !value)} aria-label={minimized ? "展开助手" : "收起助手"}>{minimized ? "+" : "−"}</button>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") return <div className="message user-message"><div className="user-bubble">{message.text}</div></div>;
  return <div className="message assistant-message"><MascotAvatar /><div className="message-content"><div className="assistant-bubble">{message.text.split("\n").map((line, index) => <p key={`${message.id}-${index}`}>{line || <>&nbsp;</>}</p>)}</div>{message.rewrite && <details className="rewrite-card"><summary><span>✦</span>我把问题理解为 <b>{message.rewrite.standalone}</b><i>查看重写</i></summary><div className="rewrite-details"><div><label>规范化问题</label><p>{message.rewrite.normalized}</p></div>{message.rewrite.subQuestions.length > 0 && <div><label>拆分出的子问题</label><ul>{message.rewrite.subQuestions.map((item) => <li key={item}>{item}</li>)}</ul></div>}<div><label>检索关键词</label><div className="keyword-row">{message.rewrite.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div></div></div></details>}{message.answer && message.answer.citations.length > 0 && <div className="evidence-block"><div className="evidence-title"><span>来源依据</span><small>{message.answer.citations.length} 个片段</small></div>{message.answer.citations.map((citation) => <div className="citation" key={`${citation.sourceName}-${citation.page}-${citation.snippet}`}><div className="citation-meta"><span className="citation-file">{citation.sourceName}</span><span>第 {citation.page} 页 · {citation.section}</span></div><p>{citation.snippet}</p></div>)}</div>}</div></div>;
}

function MascotAvatar() { return <div className="mini-mascot"><span /><i /></div>; }

createRoot(document.getElementById("root")!).render(<App />);
