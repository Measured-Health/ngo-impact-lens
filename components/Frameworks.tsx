"use client";

import type { Direction, Frameworks, LmLevel, Stance, StrategyType } from "@/lib/frameworks";
import { Mark } from "./Exports";

// Five 1280 x 720 slides drawn from the discussion. Fixed brand colours so they
// read the same on screen, in dark mode and in print.

export const FRAMEWORK_TABS = [
  { id: "value", label: "Value proposition" },
  { id: "logic", label: "Logic model" },
  { id: "strategy", label: "Strategy" },
  { id: "accountability", label: "Accountability" },
  { id: "power", label: "Power map" },
  { id: "loops", label: "Causal loops" },
] as const;
export type FrameworkTab = (typeof FRAMEWORK_TABS)[number]["id"];

const inferred = (t: string) => /^inferred:/i.test(t);
const clean = (t: string) => t.replace(/^inferred:\s*/i, "");

function Items({ items, empty = "Not discussed" }: { items: string[]; empty?: string }) {
  return <ul className="fw-items">{items.length ? items.map((t, i) => <li key={i} className={inferred(t) ? "inferred" : ""}>{clean(t)}</li>) : <li className="inferred">{empty}</li>}</ul>;
}

function Head({ title, org }: { title: string; org: string }) {
  return (
    <header className="tc-head">
      <Mark size={30} />
      <h2>{title}<span className="fw-org">{org}</span></h2>
    </header>
  );
}

function Foot({ note }: { note: string }) {
  return (
    <footer className="tc-foot">
      <span>{note}</span>
      <span>NGO Strategy &amp; Impact Lens, {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
    </footer>
  );
}

function ValueSlide({ fw }: { fw: Frameworks }) {
  const v = fw.valueProposition;
  const profile = (title: string, seg: Frameworks["valueProposition"]["beneficiary"]) => (
    <div className="vp-profile">
      <h3>{title}<span>{seg.who}</span></h3>
      <div className="vp-grid">
        <div><b>Jobs to be done</b><Items items={seg.jobs} /></div>
        <div><b>Pains</b><Items items={seg.pains} /></div>
        <div><b>Gains</b><Items items={seg.gains} /></div>
      </div>
    </div>
  );
  return (
    <section className="slide fw" data-fw="value">
      <Head title="Value proposition canvas" org={fw.organization} />
      <div className="vp">
        <div className="vp-map">
          <h3>What the organization offers</h3>
          <div><b>Products and services</b><Items items={v.offer} /></div>
          <div><b>Pain relievers</b><Items items={v.painRelievers} /></div>
          <div><b>Gain creators</b><Items items={v.gainCreators} /></div>
        </div>
        <div className="vp-right">
          {profile("Who benefits", v.beneficiary)}
          {profile("Who pays", v.payer)}
        </div>
      </div>
      <div className="vp-bottom">
        <div><b>What people use instead</b><Items items={v.alternatives} empty="No alternatives discussed" /></div>
        <div className="vp-tension"><b>Where the interests differ</b><p>{v.tension || "Not discussed."}</p></div>
      </div>
      <Foot note="A fit needs both sides: the offer must relieve the beneficiary's real pains, and the payer must value the same results." />
    </section>
  );
}

const LM_LABEL: Record<LmLevel, string> = { impact: "Impact", outcome: "Outcome", output: "Output", activity: "Activity", input: "Input" };

function LogicSlide({ fw }: { fw: Frameworks }) {
  const rows = fw.logicModel;
  const cell = (t: string) => <span className={inferred(t) ? "inferred" : ""}>{clean(t)}</span>;
  return (
    <section className="slide fw" data-fw="logic">
      <Head title="Logic model" org={fw.organization} />
      <table className="lm">
        <thead><tr><th>Level</th><th>What happens</th><th>Indicators</th><th>Source of evidence</th><th>Assumption to reach the level above</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={"lv-" + r.level}>
              <td><span className="lm-level">{LM_LABEL[r.level]}</span></td>
              <td>{cell(r.statement)}</td>
              <td>{r.indicators.length ? r.indicators.map((t, j) => <div key={j}>{cell(t)}</div>) : <span className="inferred">None stated</span>}</td>
              <td>{r.source ? cell(r.source) : <span className="inferred">None stated</span>}</td>
              <td>{r.level === "impact" ? <span className="lm-na">Top of the chain</span> : r.assumption ? cell(r.assumption) : <span className="inferred">Not discussed</span>}</td>
            </tr>
          ))}
          {rows.length === 0 ? <tr><td colSpan={5} className="inferred">No logic model could be drawn from the discussion yet.</td></tr> : null}
        </tbody>
      </table>
      <Foot note="Read bottom up: if the inputs are in place and the assumption holds, the level above follows. Italic items were inferred, not stated in the discussion." />
    </section>
  );
}

const QUADRANT: Record<StrategyType, { title: string; measure: string }> = {
  niche: { title: "Niche", measure: "Inputs, activities and outputs" },
  integrated: { title: "Integrated", measure: "Outputs and outcomes" },
  institutional: { title: "Institutional", measure: "Outputs and influence: policies and practices changed" },
  ecosystem: { title: "Ecosystem", measure: "Outcomes and, where control is sufficient, impacts" },
};

function StrategySlide({ fw }: { fw: Frameworks }) {
  const st = fw.strategy;
  const x = 40 + (st.operations / 100) * 520, y = 40 + (1 - st.theoryOfChange / 100) * 440;
  const cell = (t: StrategyType, cx: number, cy: number) => (
    <g key={t} className={"er-q" + (st.type === t ? " on" : "")}>
      <rect x={cx} y={cy} width={258} height={218} rx={14} />
      <text x={cx + 16} y={cy + 30} className="er-title">{QUADRANT[t].title}</text>
    </g>
  );
  return (
    <section className="slide fw" data-fw="strategy">
      <Head title="Strategy and what to be accountable for" org={fw.organization} />
      <div className="er">
        <svg viewBox="0 0 600 540" width="600" height="540" role="img" aria-label={`Ebrahim and Rangan matrix: ${QUADRANT[st.type].title}`}>
          {cell("institutional", 40, 40)}{cell("ecosystem", 302, 40)}{cell("niche", 40, 262)}{cell("integrated", 302, 262)}
          <text x={300} y={512} className="er-axis" textAnchor="middle">Operational strategy: focused → complex (control over the causal chain)</text>
          <text x={14} y={260} className="er-axis" textAnchor="middle" transform="rotate(-90 14 260)">Theory of change: focused → complex</text>
          <circle cx={x} cy={y} r={12} className="er-dot" />
          <text x={x + (x > 420 ? -18 : 18)} y={y + 5} textAnchor={x > 420 ? "end" : "start"} className="er-label">{fw.organization}</text>
        </svg>
        <div className="er-side">
          <p className="er-type">{QUADRANT[st.type].title} strategy</p>
          <p>{st.rationale || "No rationale given."}</p>
          <div className="er-box"><b>Accountable for</b><p>{st.accountableFor || QUADRANT[st.type].measure}</p></div>
          <div className="er-box quiet"><b>What this type usually measures</b><p>{QUADRANT[st.type].measure}</p></div>
        </div>
      </div>
      <Foot note="Ebrahim and Rangan: hold an organization to the results its causal theory and its control of the pathway can deliver." />
    </section>
  );
}

const DIR_LABEL: Record<Direction, string> = { upward: "Upward: funders and regulators", downward: "Downward: the people served", internal: "Internal: mission, staff, board", lateral: "Lateral: partners and peers" };

function AccountabilitySlide({ fw }: { fw: Frameworks }) {
  const group = (d: Direction) => {
    const rows = fw.accountability.filter((r) => r.direction === d);
    return (
      <div className={"acc acc-" + d}>
        <h3>{DIR_LABEL[d]}</h3>
        {rows.length ? rows.map((r, i) => (
          <div key={i} className={"acc-row s-" + r.strength}>
            <div className="acc-top"><b>{r.stakeholder}</b><span className={"acc-str s-" + r.strength}>{r.strength === "absent" ? "No mechanism" : r.strength === "weak" ? "Weak" : "Strong"}</span></div>
            <p>{r.mechanisms.length ? r.mechanisms.join(", ") : "No way to hold the organization to account"}</p>
          </div>
        )) : <p className="acc-none">None identified</p>}
      </div>
    );
  };
  return (
    <section className="slide fw" data-fw="accountability">
      <Head title="Who the organization answers to, and how" org={fw.organization} />
      <div className="acc-grid">
        {group("upward")}
        {group("internal")}
        <div className="acc-core"><Mark size={34} /><b>{fw.organization}</b></div>
        {group("lateral")}
        {group("downward")}
      </div>
      <Foot note="Ebrahim's accountability framework. Dashed rows have weak or no mechanisms: the people affected cannot hold the organization to account there." />
    </section>
  );
}

const STANCE: Record<Stance, { label: string; shape: (x: number, y: number) => React.ReactNode }> = {
  supportive: { label: "Supportive", shape: (x, y) => <circle cx={x} cy={y} r={9} /> },
  neutral: { label: "Neutral", shape: (x, y) => <rect x={x - 8} y={y - 8} width={16} height={16} rx={3} transform={`rotate(45 ${x} ${y})`} /> },
  resistant: { label: "Resistant", shape: (x, y) => <path d={`M${x} ${y - 10} L${x + 10} ${y + 8} L${x - 10} ${y + 8} Z`} /> },
};

function PowerSlide({ fw }: { fw: Frameworks }) {
  const W = 640, H = 500, L = 50, T = 20;
  const px = (v: number) => L + (v / 10) * (W - L - 20), py = (v: number) => T + (1 - v / 10) * (H - T - 50);
  return (
    <section className="slide fw" data-fw="power">
      <Head title="Stakeholder power and interest" org={fw.organization} />
      <div className="pw">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Stakeholder power and interest map">
          {[["Keep satisfied", 0, 5], ["Manage closely", 5, 5], ["Monitor", 0, 0], ["Keep informed", 5, 0]].map(([t, ix, iy]) => (
            <g key={t as string}>
              <rect x={px(ix as number)} y={py((iy as number) + 5)} width={px(5) - px(0)} height={py(0) - py(5)} className="pw-q" />
              <text x={px(ix as number) + 12} y={py((iy as number) + 5) + 22} className="pw-qt">{t as string}</text>
            </g>
          ))}
          <text x={(L + W) / 2} y={H - 12} textAnchor="middle" className="er-axis">Interest in the organization's work →</text>
          <text x={16} y={(H - 50) / 2} textAnchor="middle" className="er-axis" transform={`rotate(-90 16 ${(H - 50) / 2})`}>Power over it →</text>
          {fw.power.map((p, i) => {
            const x = px(p.interest), y = py(p.power), right = x < W - 170;
            return (
              <g key={i} className={"pw-dot st-" + p.stance}>
                <title>{`${p.stakeholder}: power ${p.power}/10, interest ${p.interest}/10, ${STANCE[p.stance].label.toLowerCase()}. ${p.note}`}</title>
                {STANCE[p.stance].shape(x, y)}
                <text x={x + (right ? 14 : -14)} y={y + (i % 2 ? 16 : -6)} textAnchor={right ? "start" : "end"} className="pw-label">{p.stakeholder}</text>
              </g>
            );
          })}
        </svg>
        <div className="pw-side">
          <ul className="pw-legend">
            {(Object.keys(STANCE) as Stance[]).map((s) => (
              <li key={s} className={"st-" + s}><svg width="22" height="22" viewBox="-11 -11 22 22">{STANCE[s].shape(0, 0)}</svg>{STANCE[s].label}</li>
            ))}
          </ul>
          <ol className="pw-list">
            {[...fw.power].sort((a, b) => b.power - a.power).map((p, i) => (
              <li key={i}><b>{p.stakeholder}</b><span>Power {p.power}, interest {p.interest}. {p.note}</span></li>
            ))}
          </ol>
        </div>
      </div>
      <Foot note="Those with high power and low interest can stop the work without ever engaging with it; those with high interest and little power are often the people served." />
    </section>
  );
}

function LoopsSlide({ fw }: { fw: Frameworks }) {
  const { variables, links, loops, leverage } = fw.loops;
  const W = 720, H = 540, cx = W / 2, cy = H / 2 - 4, R = Math.min(W, H) / 2 - 70;
  const pos = Object.fromEntries(variables.map((v, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(1, variables.length);
    return [v.id, { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }];
  }));
  const edge = (from: string, to: string) => {
    const a = pos[from], b = pos[to];
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    const nx = -dy / d, ny = dx / d, bend = Math.min(60, d * 0.22);
    const c = { x: (a.x + b.x) / 2 + nx * bend, y: (a.y + b.y) / 2 + ny * bend };
    const trim = (p: { x: number; y: number }, q: { x: number; y: number }, r: number) => {
      const l = Math.hypot(q.x - p.x, q.y - p.y) || 1;
      return { x: p.x + ((q.x - p.x) / l) * r, y: p.y + ((q.y - p.y) / l) * r };
    };
    const s = trim(a, c, 40), e = trim(b, c, 46);
    const m = { x: 0.25 * s.x + 0.5 * c.x + 0.25 * e.x, y: 0.25 * s.y + 0.5 * c.y + 0.25 * e.y };
    return { path: `M${s.x} ${s.y} Q${c.x} ${c.y} ${e.x} ${e.y}`, mid: m, tangent: { x: e.x - s.x, y: e.y - s.y } };
  };
  return (
    <section className="slide fw" data-fw="loops">
      <Head title="Causal loops and leverage points" org={fw.organization} />
      <div className="cl">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Causal loop diagram">
          <defs>
            <marker id="cl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#3A2E2A" />
            </marker>
          </defs>
          {links.map((l, i) => {
            const e = edge(l.from, l.to);
            const t = e.tangent, tl = Math.hypot(t.x, t.y) || 1, ux = t.x / tl, uy = t.y / tl;
            return (
              <g key={i} className={"cl-link " + (l.polarity === "-" ? "neg" : "pos")}>
                <path d={e.path} markerEnd="url(#cl-arrow)" />
                {l.delay ? (
                  <g className="cl-delay">
                    {[-5, 5].map((o) => <line key={o} x1={e.mid.x + ux * o - uy * 9} y1={e.mid.y + uy * o + ux * 9} x2={e.mid.x + ux * o + uy * 9} y2={e.mid.y + uy * o - ux * 9} />)}
                  </g>
                ) : null}
                <circle cx={e.mid.x + uy * 16} cy={e.mid.y - ux * 16} r={11} className="cl-pol-bg" />
                <text x={e.mid.x + uy * 16} y={e.mid.y - ux * 16 + 5} textAnchor="middle" className="cl-pol">{l.polarity === "-" ? "−" : "+"}</text>
              </g>
            );
          })}
          {loops.map((lp) => {
            const pts = lp.variables.map((v) => pos[v]).filter(Boolean);
            // Centroid of the loop's variables, pulled toward the middle so the marker sits inside the loop, clear of its arrows.
            const gx = pts.reduce((n, p) => n + p.x, 0) / pts.length, gy = pts.reduce((n, p) => n + p.y, 0) / pts.length;
            const x = gx + (cx - gx) * 0.5, y = gy + (cy - gy) * 0.5;
            return (
              <g key={lp.id} className={"cl-loop " + lp.type}>
                <circle cx={x} cy={y} r={22} />
                <text x={x} y={y + 6} textAnchor="middle">{lp.id}</text>
              </g>
            );
          })}
          {variables.map((v) => {
            const p = pos[v.id];
            return (
              <g key={v.id} className="cl-var">
                <rect x={p.x - 66} y={p.y - 22} width={132} height={44} rx={22} />
                <foreignObject x={p.x - 62} y={p.y - 20} width={124} height={40}><div className="cl-var-t">{v.label}</div></foreignObject>
              </g>
            );
          })}
        </svg>
        <div className="cl-side">
          <ul className="cl-loops">
            {loops.map((lp) => (
              <li key={lp.id}><span className={"cl-badge " + lp.type}>{lp.id}</span><div><b>{lp.type === "R" ? "Reinforcing" : "Balancing"}: {lp.name}</b><p>{lp.story}</p></div></li>
            ))}
            {loops.length === 0 ? <li><div><p>No complete loop was identified yet.</p></div></li> : null}
          </ul>
          <div className="cl-lev">
            <b>Leverage points (Meadows)</b>
            <ol>
              {leverage.map((l, i) => (
                <li key={i} className={l.inUse ? "used" : "open"}>
                  <span className="lv-n" title={l.name}>{l.level}</span>
                  <div><small>{l.name}{l.inUse ? ", in use" : ", not used yet"}</small><p>{l.intervention}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <Foot note="+ the two move the same way, − opposite ways; ‖ marks a delay. R loops amplify change, B loops resist it. Lower numbers are stronger leverage." />
    </section>
  );
}

export function FrameworkSlide({ fw, tab }: { fw: Frameworks; tab: FrameworkTab }) {
  if (tab === "value") return <ValueSlide fw={fw} />;
  if (tab === "logic") return <LogicSlide fw={fw} />;
  if (tab === "strategy") return <StrategySlide fw={fw} />;
  if (tab === "accountability") return <AccountabilitySlide fw={fw} />;
  if (tab === "power") return <PowerSlide fw={fw} />;
  return <LoopsSlide fw={fw} />;
}

export function AllFrameworkSlides({ fw }: { fw: Frameworks }) {
  return <>{FRAMEWORK_TABS.map((t) => <FrameworkSlide key={t.id} fw={fw} tab={t.id} />)}</>;
}
