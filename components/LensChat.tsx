"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AREAS, DOC_CHAR_LIMIT, INITIAL_STATE, LENSES, MIN_PROBES, OPENING, STAGES,
  cleanModelMarkdown, hostOf, mergeState, readErrorMarker, readModelMarker, readSourcesMarker, switchNote, readStateMarker, safeSources, stripProtocol,
  type ChatTurn, type LensDocument, type ReviewState, type WebSource,
} from "@/lib/lens";
import type { Frameworks } from "@/lib/frameworks";
import type { TheoryOfChange } from "@/lib/toc";
import { AreaMarks, Ledger, LedgerCounts, Scorecard } from "./Evidence";
import { Glossary } from "./Glossary";
import { ThemeToggle } from "./ThemeToggle";
import { downloadPptx, ReportPrint, SlideStage, TocSlides } from "./Exports";
import { AllFrameworkSlides, FRAMEWORK_TABS, FrameworkSlide, type FrameworkTab } from "./Frameworks";

type ModelOption = { id: string; label: string };
type Failure = { message: string; partial: string; retryable: boolean };
type Printing = { kind: "report"; text: string; lens: string } | { kind: "slides" } | { kind: "frameworks" };

const isReport = (text: string) => /Strategy and Alignment Report/i.test(text);

const KEY = "ngo-lens-v2";

function load(): { turns: ChatTurn[]; review: ReviewState; docs: LensDocument[]; model: string; draft: string; toc?: TheoryOfChange | null; fw?: Frameworks | null } | null {
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
      <div className="who"><LensMark /><b>Impact Lens</b>{lens ? <span className="as">as {lens}</span> : null}</div>
      <div className="body">{text === null ? <div className="thinking">Thinking…</div> : <Markdown text={text} />}</div>
      {children}
    </div>
  );
}

function Sources({ sources: raw }: { sources?: WebSource[] }) {
  const sources = safeSources(raw); // replies saved in the browser are re-checked too
  if (!sources.length) return null;
  return (
    <details className="sources">
      <summary>Searched the web: {sources.length} source{sources.length === 1 ? "" : "s"}</summary>
      <ol>
        {sources.map((s) => (
          <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer nofollow">{s.title}</a><span>{hostOf(s.url)}</span></li>
        ))}
      </ol>
    </details>
  );
}

function ReplyTools({ text, onPdf }: { text: string; onPdf: () => void }) {
  const [copied, setCopied] = useState("Copy");
  return (
    <div className="tools">
      <button className="tool" type="button" onClick={() => {
        navigator.clipboard.writeText(text).then(() => setCopied("Copied"), () => setCopied("Copy failed"));
        setTimeout(() => setCopied("Copy"), 1500);
      }}>{copied}</button>
      {isReport(text) ? (
        <button className="tool" type="button" onClick={() => {
          const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
          const a = document.createElement("a");
          a.href = url; a.download = "ngo-strategy-alignment-report.md"; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}>Save report (.md)</button>
      ) : null}
      {isReport(text) ? <button className="tool" type="button" onClick={onPdf}>Save as PDF</button> : null}
    </div>
  );
}

// Stage labels carry their number ("1 · Understand…"); the stepper shows the number separately.
const stageName = (label: string) => label.replace(/^\d+\s*·\s*/, "");

const TEMPLATE = "Organization: \nWhere it works: \nWho it serves: \nMain programme or product: \nHow it is funded: \nWhat it says it achieves: ";

function LensMark() {
  return (
    <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="12" fill="none" stroke="var(--orange)" strokeWidth="4" />
      <circle cx="16" cy="16" r="4.5" fill="var(--green)" />
    </svg>
  );
}

function Check() {
  return <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M2.5 6.2 5 8.6l4.6-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Clip() {
  return <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M13.5 6.5 7.8 12.2a1.8 1.8 0 0 0 2.5 2.5l6-6a3.5 3.5 0 0 0-5-5l-6.2 6.2a5.2 5.2 0 0 0 7.4 7.4l5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

// The eight diagnostic areas as a ring: green once covered, orange for the one being probed now.
function Dial({ covered, current, size, labels = false }: { covered: number[]; current: number; size: number; labels?: boolean }) {
  const n = AREAS.length, c = 50, r = 38, gap = 7;
  const pt = (deg: number, rad = r) => [c + rad * Math.cos((deg * Math.PI) / 180), c + rad * Math.sin((deg * Math.PI) / 180)];
  return (
    <svg className={"dial" + (labels ? " big" : "")} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      {AREAS.map((_, i) => {
        const a0 = -90 + (i * 360) / n + gap / 2, a1 = a0 + 360 / n - gap;
        const [x0, y0] = pt(a0), [x1, y1] = pt(a1);
        const state = current === i + 1 ? "now" : covered.includes(i + 1) ? "done" : "";
        const [lx, ly] = pt((a0 + a1) / 2, 26);
        return (
          <g key={i}>
            <path className={"seg " + state} style={{ animationDelay: `${i * 70}ms` }} d={`M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`} />
            {labels ? <text x={lx} y={ly} className="seg-num">{i + 1}</text> : null}
          </g>
        );
      })}
      {labels ? null : <text x={c} y={c} className="dial-n">{covered.length}</text>}
    </svg>
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
  const [toc, setToc] = useState<TheoryOfChange | null>(null);
  const [tocBusy, setTocBusy] = useState(false);
  const [slidesOpen, setSlidesOpen] = useState(false);
  const [pptxBusy, setPptxBusy] = useState(false);
  const [printing, setPrinting] = useState<Printing | null>(null);
  const [fw, setFw] = useState<Frameworks | null>(null);
  const [fwBusy, setFwBusy] = useState(false);
  const [fwOpen, setFwOpen] = useState(false);
  const [fwTab, setFwTab] = useState<FrameworkTab>("value");
  const [sideTab, setSideTab] = useState<"map" | "evidence" | "glossary">("map");
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
      setToc(s.toc ?? null);
      setFw(s.fw ?? null);
    }
    try { setAccess(sessionStorage.getItem(KEY + "-access") ?? ""); } catch {}
    setLoaded(true);
  }, [models]);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify({ turns, review, docs, model, draft, toc, fw })); } catch {}
  }, [loaded, turns, review, docs, model, draft, toc, fw]);

  // Printing renders the export into .print-root, then opens the browser's print
  // dialog, where "Save as PDF" writes the file.
  useEffect(() => {
    if (!printing) return;
    const done = () => setPrinting(null);
    window.addEventListener("afterprint", done, { once: true });
    const id = requestAnimationFrame(() => window.print());
    return () => { cancelAnimationFrame(id); window.removeEventListener("afterprint", done); };
  }, [printing]);

  useEffect(() => {
    if (!slidesOpen && !fwOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setSlidesOpen(false); setFwOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slidesOpen, fwOpen]);

  useEffect(() => {
    const el = logRef.current;
    if (el && stick.current && (turns.length > 0 || streaming !== null)) el.scrollTop = el.scrollHeight;
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
      const nonce = res.headers.get("x-lens-marker") ?? "";
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        full += dec.decode(value, { stream: true });
        setStreaming(stripProtocol(full));
      }
      const err = readErrorMarker(full, nonce);
      const clean = stripProtocol(full);
      if (err || !clean) {
        setFailure({ message: err ?? "No reply came back. Retry, or pick another model.", partial: clean, retryable: true });
        return;
      }
      const next = mergeState(state, readStateMarker(full));
      setReview(next);
      const sources = readSourcesMarker(full, nonce);
      const switched = readModelMarker(full, nonce);
      if (switched && models.some((m) => m.id === switched.id)) setModel(switched.id);
      setTurns([...history, {
        role: "assistant", content: clean, lens: next.lens || undefined,
        ...(sources.length ? { sources } : {}), ...(switched ? { note: switchNote(switched) } : {}),
      }]);
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

  /** Asks the model to read the whole discussion and return structured data for an export. */
  async function extract(kind: "toc" | "frameworks"): Promise<unknown> {
    setNotice("");
    setSideOpen(false);
    try {
      const res = await fetch(`/api/extract?kind=${kind}`, {
        method: "POST",
        headers: { "content-type": "application/json", ...(access ? { "x-lens-access": access } : {}) },
        body: JSON.stringify({ model, turns: turns.map(({ role, content }) => ({ role, content })), state: review, docs }),
      });
      const data = await res.json().catch(() => ({ error: "The server could not be reached." }));
      if (res.status === 401) setNeedAccess(true);
      if (!res.ok || !data.data) { setNotice(data.error ?? "That couldn't be made. Try again."); return null; }
      return data.data;
    } catch {
      setNotice("The connection dropped before it was ready. Try again.");
      return null;
    }
  }

  async function makeSlides() {
    if (tocBusy || !canChat) return;
    setTocBusy(true);
    const data = await extract("toc");
    setTocBusy(false);
    if (data) { setToc(data as TheoryOfChange); setSlidesOpen(true); }
  }

  async function makeFrameworks() {
    if (fwBusy || !canChat) return;
    setFwBusy(true);
    const data = await extract("frameworks");
    setFwBusy(false);
    if (data) { setFw(data as Frameworks); setFwOpen(true); }
  }

  function printReport(text: string) {
    setSideOpen(false);
    setPrinting({ kind: "report", text: text.replace(/^\s*#\s*NGO Strategy and Alignment Report\s*\n/i, ""), lens: review.lens });
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
    setTurns([]); setReview(INITIAL_STATE); setDocs([]); setToc(null); setFw(null); setFailure(null); setNotice(""); setSideOpen(false);
  }

  const stageIndex = Math.max(0, STAGES.findIndex((s) => s.id === review.stage));
  const last = turns[turns.length - 1];
  const unanswered = loaded && !busy && !failure && last?.role === "user";
  const lastReport = [...turns].reverse().find((t) => t.role === "assistant" && isReport(t.content));
  const hasTalk = turns.some((t) => t.role === "user" && !t.event);

  const covered = review.covered.length;

  return (
    <>
    <div className="app">
      <aside className={"side" + (sideOpen ? " open" : "")} aria-label="Diagnostic map">
        <div className="side-head">
          <div className="brand">
            <LensMark />
            <div><b>Impact Lens</b><span>NGO strategy review</span></div>
          </div>
          <button className="ghost close-side" type="button" onClick={() => setSideOpen(false)}>Close</button>
        </div>

        {models.length > 1 ? (
          <label className="model side-model">
            <span className="side-title">Model</span>
            <select value={model} disabled={busy} onChange={(e) => setModel(e.target.value)}>
              {models.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </label>
        ) : null}

        <div className="side-tabs" role="tablist" aria-label="Sidebar">
          <button role="tab" type="button" aria-selected={sideTab === "map"} onClick={() => setSideTab("map")}>Map</button>
          <button role="tab" type="button" aria-selected={sideTab === "evidence"} onClick={() => setSideTab("evidence")}>
            Evidence{review.claims.length ? <span className="tab-n">{review.claims.length}</span> : null}
          </button>
          <button role="tab" type="button" aria-selected={sideTab === "glossary"} onClick={() => setSideTab("glossary")}>Glossary</button>
        </div>

        {sideTab === "glossary" ? <Glossary /> : sideTab === "evidence" ? (
          <section className="evidence-tab">
            <h2 className="side-title">Claims ledger</h2>
            <p className="side-sub">Every claim the organization makes, and how well it has been backed up so far.</p>
            <LedgerCounts claims={review.claims} />
            <Ledger claims={review.claims} />
          </section>
        ) : <>
        <section className="dial-card">
          <Dial covered={review.covered} current={review.current} size={64} />
          <div className="dial-copy">
            <b>{covered} of {AREAS.length} areas</b>
            <span>{review.current
              ? `Now probing: ${AREAS[review.current - 1]} (${Math.min(review.probes[review.current] ?? 0, MIN_PROBES)} of ${MIN_PROBES} exchanges)`
              : "Starts once you describe the organization"}</span>
          </div>
        </section>

        <section>
          <h2 className="side-title">Diagnostic areas</h2>
          <ol className="chain">
            {AREAS.map((a, i) => {
              const n = i + 1, done = review.covered.includes(n), now = review.current === n;
              return (
                <li key={a} className={now ? "now" : done ? "done" : ""}>
                  <span className="dot">{done && !now ? <Check /> : n}</span><span>{a}</span><AreaMarks score={review.scores[n]} />
                </li>
              );
            })}
          </ol>
        </section>

        <section>
          <h2 className="side-title">Stakeholder lens</h2>
          <p className="side-sub">Pick who the advisor speaks for. It stays in that role until you switch.</p>
          <div className="lenses">
            {LENSES.map((l) => (
              <button key={l} type="button" className="lens" aria-pressed={review.lens === l} disabled={!canChat}
                onClick={() => review.lens !== l && send(`Please take the perspective of: ${l}. Stay in that role until I ask to change.`, `Lens switched to ${l}`)}>
                {l}
              </button>
            ))}
          </div>
        </section>
        </>}

        <div className="actions">
          <button className="act" type="button" disabled={!canChat || turns.length === 0}
            onClick={() => send("Give me a realistic stress-test scenario for this organization now, chosen to probe its weakest point so far. I will explain how the organization would respond without abandoning its mission.", "Stress test requested")}>
            Run a stress test<small>A funding cut, a partner leaving, mission drift</small>
          </button>
          <button className="act" type="button" disabled={!canChat || turns.length === 0}
            onClick={() => send("Let's brainstorm. Pick the weakest or most open point in what we've discussed so far, tell me which one you chose, and run a brainstorm with me on it: ask for my ideas first, then build on them and add a few options of your own, then help me choose.", "Brainstorm started")}>
            Brainstorm with me<small>Ideas on the weakest point so far, built on yours</small>
          </button>
          <button className="act primary" type="button" disabled={!canChat || turns.length === 0}
            onClick={() => send("Please produce the NGO Strategy and Alignment Report now. If some areas have not been examined yet, say which ones and treat them as gaps.", "Report requested")}>
            Generate the report<small>NGO Strategy and Alignment Report</small>
          </button>
          <div className="exports">
            <button className="act" type="button" disabled={!canChat || !hasTalk || fwBusy} onClick={() => void makeFrameworks()}>
              {fwBusy ? "Applying the frameworks…" : "Framework views"}
              <small>{fwBusy ? "Reading the whole discussion" : "Value proposition, strategy, accountability, power, causal loops"}</small>
            </button>
            {fw && !fwBusy ? <button className="ghost" type="button" onClick={() => { setSideOpen(false); setFwOpen(true); }}>Open the last framework views</button> : null}
            <button className="act" type="button" disabled={!canChat || !hasTalk || tocBusy} onClick={() => void makeSlides()}>
              {tocBusy ? "Drawing the slides…" : "Theory of change slides"}
              <small>{tocBusy ? "Reading the whole discussion" : "Flow diagram as PowerPoint or PDF"}</small>
            </button>
            {toc && !tocBusy ? <button className="ghost" type="button" onClick={() => { setSideOpen(false); setSlidesOpen(true); }}>Open the last slides</button> : null}
            <button className="act" type="button" disabled={!lastReport} onClick={() => lastReport && printReport(lastReport.content)}>
              Report as PDF
              <small>{lastReport ? "In the print dialog, choose Save as PDF" : "Available once the report is written"}</small>
            </button>
          </div>
          <button className="ghost reset" type="button" onClick={reset}>
            {confirmReset ? "Click again to clear this review" : "Start a new review"}
          </button>
        </div>
      </aside>
      {sideOpen ? <div className="scrim" onClick={() => setSideOpen(false)} aria-hidden="true" /> : null}

      <main className="chat">
        <header className="topbar">
          <div className="mobile-brand"><LensMark /><b>Impact Lens</b></div>
          <ol className="stepper" aria-label="Review stage">
            {STAGES.map((s, i) => (
              <li key={s.id} className={i < stageIndex ? "past" : i === stageIndex ? "current" : ""}
                aria-current={i === stageIndex ? "step" : undefined} title={stageName(s.label)}>
                <span className="num">{i < stageIndex ? <Check /> : i + 1}</span>
                <span className="lbl" data-testid={i === stageIndex ? "stage" : undefined}>{stageName(s.label)}</span>
              </li>
            ))}
          </ol>
          <div className="top-right">
            {models.length > 1 ? (
              <label className="model top-model">
                <span className="sr">Model</span>
                <select id="model" value={model} disabled={busy} onChange={(e) => setModel(e.target.value)}>
                  {models.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </label>
            ) : null}
            <ThemeToggle />
            <button className="ghost map-btn" type="button" onClick={() => setSideOpen(true)}>Map &amp; lens</button>
          </div>
        </header>

        <div className="log" ref={logRef} aria-live="polite"
          onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}>
          <div className="log-inner">
            {loaded && turns.length === 0 ? (
              <section className="hero">
                <div className="hero-copy">
                  <h1>Does your strategy hold together?</h1>
                  <p>Describe an organization or project. The Lens questions it one point at a time, from the stakeholder you choose, across eight areas from mission to measurement. Then it writes an alignment report.</p>
                  <div className="hero-actions">
                    <button className="pill solid" type="button" onClick={() => { setDraft(TEMPLATE); document.getElementById("box")?.focus(); }}>Start from a template</button>
                    <label className="pill" htmlFor="file">Attach a strategy document</label>
                  </div>
                </div>
                <Dial covered={[1, 2, 3]} current={4} size={240} labels />
              </section>
            ) : null}
            <BotMessage text={OPENING} />
            {turns.map((t, i) =>
              t.role === "user"
                ? t.event
                  ? <div key={i} className="msg event">{t.event}</div>
                  : <div key={i} className="msg you">{t.content}</div>
                : <BotMessage key={i} text={t.content} lens={t.lens}>
                    {t.note ? <p className="model-note" role="note">{t.note}</p> : null}
                    <Sources sources={t.sources} />
                    {isReport(t.content) ? <div className="report-extras"><Scorecard scores={review.scores} /><Ledger claims={review.claims} full /></div> : null}
                    <ReplyTools text={t.content} onPdf={() => printReport(t.content)} />
                  </BotMessage>,
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
                    <span>{d.name} ({Math.round(d.text.length / 1000)}k characters)</span>
                    <button type="button" aria-label={`Remove ${d.name}`} onClick={() => setDocs(docs.filter((_, j) => j !== i))}>✕</button>
                  </span>
                ))}
              </div>
            ) : null}
            <textarea id="box" className="box" rows={1} value={draft} aria-label="Message"
              placeholder="Describe the organization, or answer the question above"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); }
              }} />
            <div className="row">
              <label className="attach" htmlFor="file" title="Attach text documents (.txt, .md, .csv)"><Clip />Attach</label>
              <input id="file" type="file" accept=".txt,.md,.markdown,.csv,.json,.html,text/*" multiple hidden
                onChange={(e) => { void attach(e.target.files); e.target.value = ""; }} />
              <span className="hint">Shift+Enter for a new line. For PDF or Word files, paste the text.</span>
              <button id="send" className={"send" + (busy ? " stop" : "")} type="submit" disabled={!busy && !canChat}>
                {busy ? "Stop" : "Send"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>

    {slidesOpen && toc ? (
      <div className="modal" role="dialog" aria-modal="true" aria-label="Theory of change slides" onClick={(e) => { if (e.target === e.currentTarget) setSlidesOpen(false); }}>
        <div className="modal-card">
          <div className="modal-head">
            <h2>Theory of change slides</h2>
            <div className="modal-actions">
              <button className="pill solid" type="button" disabled={pptxBusy}
                onClick={async () => { setPptxBusy(true); try { await downloadPptx(toc); } finally { setPptxBusy(false); } }}>
                {pptxBusy ? "Building…" : "Download PowerPoint"}
              </button>
              <button className="pill" type="button" onClick={() => setPrinting({ kind: "slides" })}>Save as PDF</button>
              <button className="pill" type="button" disabled={tocBusy || !canChat} onClick={() => void makeSlides()}>{tocBusy ? "Redrawing…" : "Redraw"}</button>
              <button className="ghost" type="button" onClick={() => setSlidesOpen(false)}>Close</button>
            </div>
          </div>
          <div className="modal-body">
            <SlideStage><TocSlides toc={toc} /></SlideStage>
          </div>
        </div>
      </div>
    ) : null}

    {fwOpen && fw ? (
      <div className="modal" role="dialog" aria-modal="true" aria-label="Framework views" onClick={(e) => { if (e.target === e.currentTarget) setFwOpen(false); }}>
        <div className="modal-card">
          <div className="modal-head">
            <h2>Framework views</h2>
            <div className="modal-actions">
              <button className="pill solid" type="button" onClick={() => setPrinting({ kind: "frameworks" })}>Save all as PDF</button>
              <button className="pill" type="button" disabled={fwBusy || !canChat} onClick={() => void makeFrameworks()}>{fwBusy ? "Redrawing…" : "Redraw"}</button>
              <button className="ghost" type="button" onClick={() => setFwOpen(false)}>Close</button>
            </div>
          </div>
          <div className="fw-tabs" role="tablist" aria-label="Framework">
            {FRAMEWORK_TABS.map((t) => (
              <button key={t.id} role="tab" type="button" aria-selected={fwTab === t.id} onClick={() => setFwTab(t.id)}>{t.label}</button>
            ))}
          </div>
          <div className="modal-body">
            <SlideStage><FrameworkSlide fw={fw} tab={fwTab} /></SlideStage>
          </div>
        </div>
      </div>
    ) : null}

    {printing ? (
      <div className="print-root">
        {printing.kind === "report"
          ? <ReportPrint lens={printing.lens}><Scorecard scores={review.scores} /><Markdown text={printing.text} /><Ledger claims={review.claims} full /></ReportPrint>
          : printing.kind === "frameworks" ? (fw ? <AllFrameworkSlides fw={fw} /> : null)
          : toc ? <TocSlides toc={toc} /> : null}
      </div>
    ) : null}
    </>
  );
}
