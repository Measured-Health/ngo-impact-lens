"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AREAS, DOC_CHAR_LIMIT, INITIAL_STATE, LENSES, OPENING, STAGES,
  cleanModelMarkdown, mergeState, readErrorMarker, readStateMarker, stripProtocol,
  type ChatTurn, type LensDocument, type ReviewState,
} from "@/lib/lens";

type ModelOption = { id: string; label: string };
type Failure = { message: string; partial: string; retryable: boolean };

const KEY = "ngo-lens-v2";

function load(): { turns: ChatTurn[]; review: ReviewState; docs: LensDocument[]; model: string; draft: string } | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    return s && Array.isArray(s.turns) ? s : null;
  } catch {
    return null;
  }
}

function Markdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      // Model output can be steered by pasted documents, so it must never make the
      // browser fetch a URL: images render as their alt text, and only plain
      // http(s) links survive (opened in a new tab without a referrer).
      components={{
        table: (props) => <div className="tbl"><table {...props} /></div>,
        img: ({ alt }) => (alt ? <span>[image: {alt}]</span> : null),
        a: ({ href, children }) =>
          href && /^https?:\/\//i.test(href)
            ? <a href={href} target="_blank" rel="noopener noreferrer nofollow">{children}</a>
            : <span>{children}</span>,
      }}
    >
      {cleanModelMarkdown(text)}
    </ReactMarkdown>
  );
}

function BotMessage({ text, lens, children }: { text: string | null; lens?: string; children?: React.ReactNode }) {
  return (
    <div className="msg bot">
      <div className="who">Impact Lens{lens ? <span className="as">as {lens}</span> : null}</div>
      <div className="body">{text === null ? <div className="thinking">Thinking…</div> : <Markdown text={text} />}</div>
      {children}
    </div>
  );
}

function ReplyTools({ text }: { text: string }) {
  const [copied, setCopied] = useState("Copy");
  const isReport = /Strategy and Alignment Report/i.test(text);
  return (
    <div className="tools">
      <button className="tool" type="button" onClick={() => {
        navigator.clipboard.writeText(text).then(() => setCopied("Copied"), () => setCopied("Copy failed"));
        setTimeout(() => setCopied("Copy"), 1500);
      }}>{copied}</button>
      {isReport ? (
        <button className="tool" type="button" onClick={() => {
          const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
          const a = document.createElement("a");
          a.href = url; a.download = "ngo-strategy-alignment-report.md"; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}>Save report (.md)</button>
      ) : null}
    </div>
  );
}

export function LensChat({ models, needsAccessCode }: { models: ModelOption[]; needsAccessCode: boolean }) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [review, setReview] = useState<ReviewState>(INITIAL_STATE);
  const [docs, setDocs] = useState<LensDocument[]>([]);
  const [model, setModel] = useState(models[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [notice, setNotice] = useState("");
  const [access, setAccess] = useState("");
  const [needAccess, setNeedAccess] = useState(needsAccessCode);
  const [sideOpen, setSideOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const ctl = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  // Restore the review saved in this browser.
  useEffect(() => {
    const s = load();
    if (s) {
      setTurns(s.turns);
      setReview({ ...INITIAL_STATE, ...s.review });
      setDocs(s.docs ?? []);
      if (models.some((m) => m.id === s.model)) setModel(s.model);
      setDraft(s.draft ?? "");
    }
    try { setAccess(sessionStorage.getItem(KEY + "-access") ?? ""); } catch {}
    setLoaded(true);
  }, [models]);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify({ turns, review, docs, model, draft })); } catch {}
  }, [loaded, turns, review, docs, model, draft]);

  useEffect(() => {
    const el = logRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [turns, streaming, failure]);

  const noModels = models.length === 0;
  const canChat = loaded && !noModels && !busy;

  async function ask(history: ChatTurn[], state: ReviewState) {
    setBusy(true);
    setFailure(null);
    setStreaming("");
    stick.current = true;
    const controller = new AbortController();
    ctl.current = controller;
    let full = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json", ...(access ? { "x-lens-access": access } : {}) },
        body: JSON.stringify({ model, turns: history.map(({ role, content }) => ({ role, content })), state, docs }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "The server could not be reached." }));
        if (res.status === 401) setNeedAccess(true);
        setFailure({ message: err.error ?? "The server returned an error.", partial: "", retryable: res.status !== 401 });
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        full += dec.decode(value, { stream: true });
        setStreaming(stripProtocol(full));
      }
      const err = readErrorMarker(full);
      const clean = stripProtocol(full);
      if (err || !clean) {
        setFailure({ message: err ?? "No reply came back. Retry, or pick another model.", partial: clean, retryable: true });
        return;
      }
      const next = mergeState(state, readStateMarker(full));
      setReview(next);
      setTurns([...history, { role: "assistant", content: clean, lens: next.lens || undefined }]);
    } catch (e) {
      const clean = stripProtocol(full);
      if (controller.signal.aborted) {
        // Keep what was written; drop a question nothing answered.
        if (clean) setTurns([...history, { role: "assistant", content: clean, lens: state.lens || undefined }]);
        else setTurns(history.slice(0, -1));
      } else {
        setFailure({ message: "The connection dropped before the reply finished.", partial: clean, retryable: true });
      }
    } finally {
      ctl.current = null;
      setStreaming(null);
      setBusy(false);
    }
  }

  function send(content: string, event?: string) {
    if (!content.trim() || !canChat) return;
    const history = [...turns, { role: "user" as const, content, ...(event ? { event } : {}) }];
    setTurns(history);
    setSideOpen(false);
    void ask(history, review);
  }

  async function attach(files: FileList | null) {
    if (!files) return;
    const skipped: string[] = [];
    const added: LensDocument[] = [];
    for (const f of Array.from(files)) {
      if (/pdf|word|officedocument|msword/.test(f.type) || /\.(pdf|docx?|pptx?)$/i.test(f.name)) { skipped.push(f.name); continue; }
      try {
        let text = await f.text();
        if (text.length > DOC_CHAR_LIMIT) text = text.slice(0, DOC_CHAR_LIMIT) + "\n[…document truncated at 60,000 characters]";
        added.push({ name: f.name, text });
      } catch {
        skipped.push(f.name);
      }
    }
    setDocs((d) => [...d, ...added]);
    setNotice(skipped.length ? `Couldn't read ${skipped.join(", ")}. For PDF or Word files, copy the text and paste it into the message box.` : "");
  }

  function reset() {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    setConfirmReset(false);
    ctl.current?.abort();
    setTurns([]); setReview(INITIAL_STATE); setDocs([]); setFailure(null); setNotice(""); setSideOpen(false);
  }

  const stageIndex = Math.max(0, STAGES.findIndex((s) => s.id === review.stage));
  const last = turns[turns.length - 1];
  const unanswered = loaded && !busy && !failure && last?.role === "user";

  return (
    <div className="app">
      <aside className={"side" + (sideOpen ? " open" : "")} aria-label="Diagnostic map">
        <button className="btn quiet close-side" type="button" onClick={() => setSideOpen(false)}>Close ✕</button>
        <div className="brand">
          <h1>NGO Strategy &amp; Impact Lens</h1>
          <p>Tests whether a mission, theory of change, strategy, funding model and accountability system fit together. It asks one hard question at a time.</p>
        </div>

        {models.length > 1 ? (
          <section>
            <label className="label" htmlFor="model">Model</label>
            <select id="model" className="model-select" value={model} disabled={busy} onChange={(e) => setModel(e.target.value)}>
              {models.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </section>
        ) : null}

        <section>
          <p className="label">Stakeholder lens</p>
          <div className="lenses">
            {LENSES.map((l) => (
              <button key={l} type="button" className="lens" aria-pressed={review.lens === l} disabled={!canChat}
                onClick={() => review.lens !== l && send(`Please take the perspective of: ${l}. Stay in that role until I ask to change.`, `Lens switched to ${l}`)}>
                {l}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="label">Review stage</p>
          <div className="stages">{STAGES.map((s, i) => <span key={s.id} className={i <= stageIndex ? "on" : ""} title={s.label} />)}</div>
          <div className="stage-name" data-testid="stage">{STAGES[stageIndex].label}</div>
        </section>

        <section>
          <p className="label">Diagnostic areas</p>
          <ol className="chain">
            {AREAS.map((a, i) => {
              const n = i + 1, done = review.covered.includes(n), now = review.current === n;
              return (
                <li key={a} className={now ? "now" : done ? "done" : ""}>
                  <span className="dot">{done && !now ? "✓" : n}</span><span>{a}</span>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="actions">
          <button className="btn" type="button" disabled={!canChat || turns.length === 0}
            onClick={() => send("Give me a realistic stress-test scenario for this organization now, chosen to probe its weakest point so far. I will explain how the organization would respond without abandoning its mission.", "Stress test requested")}>
            Run a stress test<small>A realistic shock: funding cut, partner exit, drift…</small>
          </button>
          <button className="btn primary" type="button" disabled={!canChat || turns.length === 0}
            onClick={() => send("Please produce the NGO Strategy and Alignment Report now. If some areas have not been examined yet, say which ones and treat them as gaps.", "Report requested")}>
            Generate the report<small>NGO Strategy and Alignment Report</small>
          </button>
          <button className="btn quiet" type="button" onClick={reset}>
            {confirmReset ? "Click again to clear this review" : "Start a new review"}
          </button>
        </div>
      </aside>

      <main className="chat">
        <div className="topbar">
          <div><b>NGO Impact Lens</b><div className="lensnow">{review.lens ? `Lens: ${review.lens}` : "No lens chosen yet"}</div></div>
          <button className="icon-btn" type="button" onClick={() => setSideOpen(true)}>Map &amp; lens</button>
        </div>

        <div className="log" ref={logRef} aria-live="polite"
          onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}>
          <div className="log-inner">
            <BotMessage text={OPENING} />
            {turns.map((t, i) =>
              t.role === "user"
                ? t.event
                  ? <div key={i} className="msg event">{t.event}</div>
                  : <div key={i} className="msg you">{t.content}</div>
                : <BotMessage key={i} text={t.content} lens={t.lens}><ReplyTools text={t.content} /></BotMessage>,
            )}
            {streaming !== null ? <BotMessage text={streaming || null} lens={review.lens} /> : null}
            {failure ? (
              <BotMessage text={failure.partial || ""} lens={review.lens}>
                <div className="note err">{failure.message}</div>
                {failure.retryable ? (
                  <div className="tools"><button className="tool" type="button" onClick={() => ask(turns, review)}>Retry</button></div>
                ) : null}
              </BotMessage>
            ) : null}
            {unanswered ? (
              <BotMessage text="Your last message hasn't been answered yet.">
                <div className="tools"><button className="tool" type="button" onClick={() => ask(turns, review)}>Answer it now</button></div>
              </BotMessage>
            ) : null}
          </div>
        </div>

        <div className="composer-wrap">
          {noModels ? (
            <div className="banner">No model is configured on this server. Set LENS_MODELS and a provider key; the README lists the options.</div>
          ) : null}
          {needAccess ? (
            <div className="banner">
              <label htmlFor="access">Access code</label>
              <input id="access" type="password" value={access} autoComplete="off"
                onChange={(e) => { setAccess(e.target.value); try { sessionStorage.setItem(KEY + "-access", e.target.value); } catch {} }} />
            </div>
          ) : null}
          {notice ? <div className="banner" role="status">{notice}</div> : null}
          <form className="composer" onSubmit={(e) => {
            e.preventDefault();
            if (busy) { ctl.current?.abort(); return; }
            const t = draft;
            if (!t.trim()) return;
            setDraft("");
            send(t);
          }}>
            {docs.length ? (
              <div className="docs">
                {docs.map((d, i) => (
                  <span className="doc" key={d.name + i}>
                    <span>📄 {d.name} · {Math.round(d.text.length / 1000)}k chars</span>
                    <button type="button" aria-label={`Remove ${d.name}`} onClick={() => setDocs(docs.filter((_, j) => j !== i))}>✕</button>
                  </span>
                ))}
              </div>
            ) : null}
            <div className="row">
              <label className="icon-btn" htmlFor="file" title="Attach text documents">Attach</label>
              <input id="file" type="file" accept=".txt,.md,.markdown,.csv,.json,.html,text/*" multiple hidden
                onChange={(e) => { void attach(e.target.files); e.target.value = ""; }} />
              <textarea id="box" className="box" rows={1} value={draft} aria-label="Message"
                placeholder="Describe the organization, or answer the question above…"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); }
                }} />
              <button id="send" className={"icon-btn" + (busy ? "" : " send")} type="submit" disabled={!busy && !canChat}>
                {busy ? "Stop" : "Send"}
              </button>
            </div>
            <div className="hint">Enter to send · Shift+Enter for a new line · Attach .txt or .md files, or paste text from PDFs and Word documents</div>
          </form>
        </div>
      </main>
    </div>
  );
}
