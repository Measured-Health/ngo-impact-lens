"use client";

import { useEffect, useRef, useState } from "react";
import { isInferred, LINK_LABELS, LINKS, withoutInferred, type Evidence, type TheoryOfChange } from "@/lib/toc";

// Two 16:9 slides (1280 x 720 design units) drawn from the theory of change, plus the
// print layout for the report. PDFs come from the browser's print dialog, which keeps
// text selectable; the PowerPoint file is built in the browser with pptxgenjs.

const EVIDENCE_LABEL: Record<Evidence, string> = { strong: "Strong evidence", some: "Some evidence", none: "No evidence yet" };

const today = () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="12" fill="none" stroke="#FF5C00" strokeWidth="4" />
      <circle cx="16" cy="16" r="4.5" fill="#3DB029" />
    </svg>
  );
}

function Item({ text }: { text: string }) {
  return <li className={isInferred(text) ? "inferred" : ""}>{withoutInferred(text)}</li>;
}

/** Assumption numbers (A1, A2…) sitting on each arrow of the chain. */
function tagsFor(toc: TheoryOfChange) {
  return LINKS.map((l) => toc.assumptions.flatMap((a, i) => (a.link === l ? [i + 1] : [])));
}

export function TocSlides({ toc }: { toc: TheoryOfChange }) {
  const tags = tagsFor(toc);
  const arrow = (k: number) => (
    <div className="tc-arrow" aria-hidden="true">
      <svg viewBox="0 0 30 24" width="30" height="24"><path d="M2 12h22M17 5l8 7-8 7" fill="none" stroke="#FF5C00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {tags[k].map((n) => <span key={n} className={"tc-tag ev-" + toc.assumptions[n - 1].evidence}>A{n}</span>)}
    </div>
  );
  const column = (n: number, title: string, items: string[]) => (
    <div className="tc-col">
      <h3><span>{n}</span>{title}</h3>
      <ul>{items.length ? items.map((t, i) => <Item key={i} text={t} />) : <li className="inferred">Not discussed</li>}</ul>
    </div>
  );
  return (
    <>
      <section className="slide tc">
        <header className="tc-head">
          <Mark size={30} />
          <h2>How {toc.organization} expects change to happen</h2>
        </header>
        <div className="tc-context">
          <div><b>Problem</b><p>{toc.problem || "Not stated in the discussion."}</p></div>
          <div><b>Who it serves</b><p>{toc.population || "Not stated in the discussion."}</p></div>
        </div>
        <div className="tc-flow">
          {column(1, "Inputs", toc.inputs)}
          {arrow(0)}
          {column(2, "Activities", toc.activities)}
          {arrow(1)}
          {column(3, "Outputs", toc.outputs)}
          {arrow(2)}
          <div className="tc-col">
            <h3><span>4</span>Outcomes</h3>
            <p className="tc-sub">Short term</p>
            <ul>{toc.shortTermOutcomes.map((t, i) => <Item key={i} text={t} />)}</ul>
            <p className="tc-sub">Long term</p>
            <ul>{toc.longTermOutcomes.map((t, i) => <Item key={i} text={t} />)}</ul>
          </div>
          {arrow(3)}
          <div className="tc-col tc-impact">
            <h3><span>5</span>Impact</h3>
            <p>{withoutInferred(toc.impact) || "Not stated in the discussion."}</p>
          </div>
        </div>
        <footer className="tc-foot">
          <span>Dashed items were inferred, not stated in the discussion. A1 to A{Math.max(1, toc.assumptions.length)} are the assumptions on the next slide.</span>
          <span>Impact Lens, {today()}</span>
        </footer>
      </section>

      <section className="slide tc">
        <header className="tc-head">
          <Mark size={30} />
          <h2>What has to be true for the chain to hold</h2>
        </header>
        <div className="tc-two">
          <ol className="tc-assume">
            {toc.assumptions.map((a, i) => (
              <li key={i}>
                <span className={"tc-tag ev-" + a.evidence}>A{i + 1}</span>
                <div><p>{a.text}</p><small>{LINK_LABELS[a.link]}</small></div>
                <span className={"tc-ev ev-" + a.evidence}>{EVIDENCE_LABEL[a.evidence]}</span>
              </li>
            ))}
            {toc.assumptions.length === 0 ? <li><div><p>No assumptions were identified in the discussion.</p></div></li> : null}
          </ol>
          <div className="tc-side">
            <div className="tc-box"><b>Evidence gaps</b><ul>{(toc.gaps.length ? toc.gaps : ["None identified"]).map((t, i) => <li key={i}>{t}</li>)}</ul></div>
            <div className="tc-box risk"><b>Risks outside its control</b><ul>{(toc.risks.length ? toc.risks : ["None identified"]).map((t, i) => <li key={i}>{t}</li>)}</ul></div>
          </div>
        </div>
        <footer className="tc-foot">
          <span>Evidence reflects what the discussion supported, not an external evaluation.</span>
          <span>Impact Lens, {today()}</span>
        </footer>
      </section>
    </>
  );
}

/** Scales the 1280 x 720 slides to fit the dialog. */
export function SlideStage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0.5);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setK(el.clientWidth / 1280));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return <div className="slide-stage" ref={ref} style={{ ["--k" as string]: k }}>{children}</div>;
}

export function ReportPrint({ lens, children }: { lens: string; children: React.ReactNode }) {
  return (
    <article className="report-print">
      <header>
        <Mark size={34} />
        <div>
          <p className="rp-kicker">Impact Lens</p>
          <h1>NGO Strategy and Alignment Report</h1>
          <p className="rp-meta">{today()}{lens ? `. Reviewed from the perspective of: ${lens}` : ""}</p>
        </div>
      </header>
      <div className="rp-body">{children}</div>
    </article>
  );
}

/** Builds the same two slides as an editable PowerPoint file. */
export async function downloadPptx(toc: TheoryOfChange) {
  const { default: Pptx } = await import("pptxgenjs");
  const p = new Pptx();
  p.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in, the same 16:9 as the on-screen slides
  p.title = `Theory of change: ${toc.organization}`;
  const X = (px: number) => px / 96;
  const pt = (px: number) => Math.round(px * 0.75);
  const C = { orange: "FF5C00", orangeInk: "C24500", wash: "FFF0E6", green: "3DB029", ink: "1C0D0A", body: "3A2E2A", muted: "74675F", sand: "E9DDD6", white: "FFFFFF" };
  const EV: Record<Evidence, string> = { strong: C.green, some: "C98A24", none: "C0392B" };
  const font = "Arial";
  const tags = tagsFor(toc);

  const header = (s: ReturnType<typeof p.addSlide>, title: string) => {
    s.background = { color: "FFFAF6" };
    s.addShape(p.ShapeType.ellipse, { x: X(64), y: X(52), w: X(28), h: X(28), line: { color: C.orange, width: 3 } });
    s.addShape(p.ShapeType.ellipse, { x: X(73), y: X(61), w: X(10), h: X(10), fill: { color: C.green }, line: { color: C.green } });
    s.addText(title, { x: X(104), y: X(40), w: X(1100), h: X(52), fontFace: font, fontSize: pt(32), bold: true, color: C.ink, margin: 0 });
  };
  const footer = (s: ReturnType<typeof p.addSlide>, left: string) => {
    s.addText(left, { x: X(64), y: X(668), w: X(820), h: X(24), fontFace: font, fontSize: pt(12), color: C.muted, margin: 0 });
    s.addText(`Impact Lens, ${today()}`, { x: X(880), y: X(668), w: X(336), h: X(24), fontFace: font, fontSize: pt(12), color: C.muted, align: "right", margin: 0 });
  };

  // Slide 1: the chain
  const s1 = p.addSlide();
  header(s1, `How ${toc.organization} expects change to happen`);
  [["Problem", toc.problem], ["Who it serves", toc.population]].forEach(([label, text], i) => {
    const x = 64 + i * 584;
    s1.addShape(p.ShapeType.roundRect, { x: X(x), y: X(112), w: X(568), h: X(84), fill: { color: C.wash }, line: { color: C.wash }, rectRadius: 0.12 });
    s1.addText([
      { text: label + "\n", options: { bold: true, color: C.orangeInk, fontSize: pt(13) } },
      { text: text || "Not stated in the discussion.", options: { color: C.body, fontSize: pt(15) } },
    ], { x: X(x + 16), y: X(118), w: X(536), h: X(72), fontFace: font, valign: "top", margin: 0 });
  });

  const colW = 196, gut = 43, top = 222, bottom = 648;
  const colX = (i: number) => 64 + i * (colW + gut);
  const card = (s: ReturnType<typeof p.addSlide>, text: string, x: number, y: number, h: number) => {
    const inferred = isInferred(text);
    s.addText(withoutInferred(text), {
      x: X(x), y: X(y), w: X(colW), h: X(h), shape: p.ShapeType.roundRect, rectRadius: 0.08,
      fill: { color: C.white }, line: { color: inferred ? C.muted : C.sand, width: 1, dashType: inferred ? "dash" : "solid" },
      fontFace: font, fontSize: pt(13), color: C.body, italic: inferred, valign: "middle", margin: 6,
    });
  };
  const stack = (s: ReturnType<typeof p.addSlide>, items: string[], x: number, y0: number, y1: number) => {
    const n = Math.max(1, items.length), gap = 8, h = Math.min(74, (y1 - y0 - gap * (n - 1)) / n);
    (items.length ? items : ["Inferred: Not discussed"]).forEach((t, i) => card(s, t, x, y0 + i * (h + gap), h));
  };
  const head = (s: ReturnType<typeof p.addSlide>, n: number, title: string, x: number) =>
    s.addText(`${n}  ${title}`, { x: X(x), y: X(top), w: X(colW), h: X(30), fontFace: font, fontSize: pt(17), bold: true, color: C.ink, margin: 0 });

  head(s1, 1, "Inputs", colX(0)); stack(s1, toc.inputs, colX(0), top + 40, bottom);
  head(s1, 2, "Activities", colX(1)); stack(s1, toc.activities, colX(1), top + 40, bottom);
  head(s1, 3, "Outputs", colX(2)); stack(s1, toc.outputs, colX(2), top + 40, bottom);
  head(s1, 4, "Outcomes", colX(3));
  const mid = (top + 40 + bottom) / 2;
  s1.addText("Short term", { x: X(colX(3)), y: X(top + 36), w: X(colW), h: X(20), fontFace: font, fontSize: pt(12), bold: true, color: C.orangeInk, margin: 0 });
  stack(s1, toc.shortTermOutcomes, colX(3), top + 60, mid - 6);
  s1.addText("Long term", { x: X(colX(3)), y: X(mid), w: X(colW), h: X(20), fontFace: font, fontSize: pt(12), bold: true, color: C.orangeInk, margin: 0 });
  stack(s1, toc.longTermOutcomes, colX(3), mid + 24, bottom);
  head(s1, 5, "Impact", colX(4));
  s1.addText(withoutInferred(toc.impact) || "Not stated in the discussion.", {
    x: X(colX(4)), y: X(top + 40), w: X(colW), h: X(bottom - top - 40), shape: p.ShapeType.roundRect, rectRadius: 0.1,
    fill: { color: C.ink }, line: { color: C.ink }, fontFace: font, fontSize: pt(18), bold: true, color: C.white, valign: "middle", margin: 12,
  });
  for (let k = 0; k < 4; k++) {
    const ax = colX(k) + colW + 6, ay = top + 92;
    s1.addShape(p.ShapeType.line, { x: X(ax), y: X(ay), w: X(gut - 12), h: 0, line: { color: C.orange, width: 2.5, endArrowType: "triangle" } });
    tags[k].forEach((n, j) => s1.addText(`A${n}`, {
      x: X(ax), y: X(ay + 14 + j * 26), w: X(gut - 12), h: X(22), shape: p.ShapeType.roundRect, rectRadius: 0.1,
      fill: { color: EV[toc.assumptions[n - 1].evidence] }, line: { color: EV[toc.assumptions[n - 1].evidence] },
      fontFace: font, fontSize: pt(11), bold: true, color: C.white, align: "center", valign: "middle", margin: 0,
    }));
  }
  footer(s1, `Dashed items were inferred, not stated in the discussion. A1 to A${Math.max(1, toc.assumptions.length)} are the assumptions on the next slide.`);

  // Slide 2: assumptions and evidence
  const s2 = p.addSlide();
  header(s2, "What has to be true for the chain to hold");
  const rows = toc.assumptions.length ? toc.assumptions : [{ text: "No assumptions were identified in the discussion.", link: LINKS[0], evidence: "none" as Evidence }];
  const rowH = Math.min(80, (520 - 10 * (rows.length - 1)) / rows.length);
  rows.forEach((a, i) => {
    const y = 120 + i * (rowH + 10);
    s2.addShape(p.ShapeType.roundRect, { x: X(64), y: X(y), w: X(700), h: X(rowH), fill: { color: C.white }, line: { color: C.sand }, rectRadius: 0.08 });
    s2.addText(`A${i + 1}`, { x: X(78), y: X(y + rowH / 2 - 15), w: X(44), h: X(30), shape: p.ShapeType.roundRect, rectRadius: 0.12, fill: { color: EV[a.evidence] }, line: { color: EV[a.evidence] }, fontFace: font, fontSize: pt(13), bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    s2.addText([
      { text: a.text + "\n", options: { color: C.ink, fontSize: pt(15) } },
      { text: LINK_LABELS[a.link], options: { color: C.muted, fontSize: pt(12) } },
    ], { x: X(136), y: X(y + 6), w: X(470), h: X(rowH - 12), fontFace: font, valign: "middle", margin: 0 });
    s2.addText(EVIDENCE_LABEL[a.evidence], { x: X(614), y: X(y + rowH / 2 - 14), w: X(136), h: X(28), fontFace: font, fontSize: pt(12), bold: true, color: EV[a.evidence], align: "right", valign: "middle", margin: 0 });
  });
  [["Evidence gaps", toc.gaps, C.wash], ["Risks outside its control", toc.risks, "FDECEA"]].forEach(([title, items, fill], i) => {
    const y = 120 + i * 270;
    s2.addShape(p.ShapeType.roundRect, { x: X(796), y: X(y), w: X(420), h: X(250), fill: { color: fill as string }, line: { color: fill as string }, rectRadius: 0.08 });
    const list = (items as string[]).length ? (items as string[]) : ["None identified"];
    s2.addText([
      { text: (title as string) + "\n", options: { bold: true, color: C.ink, fontSize: pt(16), breakLine: true } },
      ...list.map((t) => ({ text: t, options: { bullet: true, color: C.body, fontSize: pt(14), breakLine: true } })),
    ], { x: X(816), y: X(y + 14), w: X(380), h: X(222), fontFace: font, valign: "top", margin: 0, paraSpaceAfter: 4 });
  });
  footer(s2, "Evidence reflects what the discussion supported, not an external evaluation.");

  await p.writeFile({ fileName: "theory-of-change.pptx" });
}
