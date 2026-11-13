// Course frameworks drawn from the whole discussion: value proposition canvas,
// Ebrahim & Rangan strategy matrix, accountability map, stakeholder power map,
// and a causal loop diagram with Meadows' leverage points. Plain JSON in the
// reply text, so any provider works.

export const STRATEGY_TYPES = ["niche", "integrated", "institutional", "ecosystem"] as const;
export type StrategyType = (typeof STRATEGY_TYPES)[number];
export const DIRECTIONS = ["upward", "downward", "internal", "lateral"] as const;
export type Direction = (typeof DIRECTIONS)[number];
export type Strength = "strong" | "weak" | "absent";
export type Stance = "supportive" | "neutral" | "resistant";

export const LM_LEVELS = ["impact", "outcome", "output", "activity", "input"] as const;
export type LmLevel = (typeof LM_LEVELS)[number];
export type LmRow = { level: LmLevel; statement: string; indicators: string[]; source: string; assumption: string };

export type Segment = { who: string; jobs: string[]; pains: string[]; gains: string[] };
export type Frameworks = {
  organization: string;
  valueProposition: {
    beneficiary: Segment;
    payer: Segment;
    offer: string[];
    painRelievers: string[];
    gainCreators: string[];
    alternatives: string[];
    tension: string;
  };
  strategy: {
    type: StrategyType;
    /** 0 = focused, well-understood causal theory; 100 = complex, uncertain. */
    theoryOfChange: number;
    /** 0 = focused operations, little control of the pathway; 100 = integrated, controls much of it. */
    operations: number;
    rationale: string;
    accountableFor: string;
  };
  accountability: { stakeholder: string; direction: Direction; mechanisms: string[]; strength: Strength }[];
  power: { stakeholder: string; power: number; interest: number; stance: Stance; note: string }[];
  /** Logframe-style logic model, impact first. */
  logicModel: LmRow[];
  loops: {
    variables: { id: string; label: string }[];
    links: { from: string; to: string; polarity: "+" | "-"; delay: boolean }[];
    loops: { id: string; type: "R" | "B"; name: string; variables: string[]; story: string }[];
    leverage: { level: number; name: string; intervention: string; inUse: boolean }[];
  };
};

/** Meadows' twelve leverage points, 12 weakest to 1 strongest. */
export const MEADOWS: Record<number, string> = {
  12: "Numbers and parameters", 11: "Buffers", 10: "Stock-and-flow structure", 9: "Delays",
  8: "Balancing feedback loops", 7: "Reinforcing feedback loops", 6: "Information flows",
  5: "Rules", 4: "Self-organization", 3: "Goals", 2: "Paradigms", 1: "Transcending paradigms",
};

export const FRAMEWORKS_REQUEST =
  "FRAMEWORKS EXTRACTION. Apply the course frameworks to the organization we have discussed and reply with the JSON object described in your instructions. JSON only.";

export const FRAMEWORKS_INSTRUCTIONS = `You turn a conversation about an NGO or social-impact project into five course frameworks for a visual dashboard.

Use what the conversation and any documents say. Where you must infer, start the item with "Inferred:". Never invent numbers. Keep each item under 14 words, in plain language.

Reply with one JSON object and nothing else (no Markdown, no commentary), in exactly this shape:
{
  "organization": "name",
  "valueProposition": {
    "beneficiary": {"who": "main beneficiary", "jobs": ["up to 3 jobs they are trying to get done"], "pains": ["up to 3"], "gains": ["up to 3"]},
    "payer": {"who": "main funder or payer", "jobs": ["up to 3"], "pains": ["up to 3"], "gains": ["up to 3"]},
    "offer": ["up to 4 products or services"],
    "painRelievers": ["up to 3, each tied to a beneficiary pain"],
    "gainCreators": ["up to 3, each tied to a gain"],
    "alternatives": ["up to 3 things people use or do instead today"],
    "tension": "one sentence on where beneficiary and payer interests differ"
  },
  "strategy": {
    "type": "niche | integrated | institutional | ecosystem",
    "theoryOfChange": 0-100 (0 focused and well understood, 100 complex and uncertain),
    "operations": 0-100 (0 focused, controls little of the causal pathway; 100 integrated, controls much of it),
    "rationale": "one sentence (Ebrahim & Rangan)",
    "accountableFor": "the results it can reasonably be held accountable for, one sentence"
  },
  "accountability": [{"stakeholder": "...", "direction": "upward | downward | internal | lateral", "mechanisms": ["up to 3: reports, evaluations, participation, social audits, self-regulation..."], "strength": "strong | weak | absent"}],
  "power": [{"stakeholder": "...", "power": 0-10, "interest": 0-10, "stance": "supportive | neutral | resistant", "note": "one short phrase"}],
  "logicModel": [{"level": "impact | outcome | output | activity | input", "statement": "what happens at this level", "indicators": ["up to 2 SMART indicators: what is counted, for whom, by when"], "source": "where the data would come from (means of verification)", "assumption": "what must hold for this level to lead to the next one up"}],
  "loops": {
    "variables": [{"id": "v1", "label": "2-4 word variable that can rise or fall, e.g. Community trust"}],
    "links": [{"from": "v1", "to": "v2", "polarity": "+ or -", "delay": true or false}],
    "loops": [{"id": "R1 or B1", "type": "R or B", "name": "short name", "variables": ["v1", "v2", "v3"], "story": "one sentence on how the loop behaves"}],
    "leverage": [{"level": 1-12 (Meadows; 12 parameters ... 6 information flows, 5 rules, 3 goals, 2 paradigms), "intervention": "what the organization does or could do there", "inUse": true or false}]
  }
}
Give the logic model 6 to 10 rows: one impact, 2 or 3 outcomes (short and longer term), 2 or 3 outputs, 1 or 2 activities and 1 input row, in that order. Outputs are countable products; outcomes are changes in people or conditions. If the user stated no indicator or data source, propose one and start it with "Inferred:".
Give 4 to 8 accountability rows covering upward, downward and internal; 5 to 8 power-map stakeholders; 5 to 9 causal-loop variables with 6 to 12 links forming at least one reinforcing and one balancing loop (each loop's variables must be connected in order by links); 3 to 5 leverage points, including at least one higher-leverage option (level 6 or stronger) the organization does not use yet.`;

const s = (v: unknown, max = 140) => {
  if (typeof v !== "string") return "";
  const t = v.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
};
const list = (v: unknown, n: number) => (Array.isArray(v) ? v : []).map((x) => s(x)).filter(Boolean).slice(0, n);
const num = (v: unknown, lo: number, hi: number, dflt: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, Math.round(n))) : dflt;
};
const pick = <T extends string>(v: unknown, opts: readonly T[], dflt: T): T => {
  const t = String(v ?? "").toLowerCase();
  return opts.find((o) => t.includes(o)) ?? dflt;
};
const obj = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

function segment(v: unknown, fallback: string): Segment {
  const o = obj(v);
  return { who: s(o.who, 80) || fallback, jobs: list(o.jobs, 3), pains: list(o.pains, 3), gains: list(o.gains, 3) };
}

/** Pulls the JSON object out of a model reply and normalizes it; null when unusable. */
export function parseFrameworks(text: string): Frameworks | null {
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  let raw: Record<string, unknown>;
  try { raw = JSON.parse(text.slice(a, b + 1)); } catch { return null; }
  const vp = obj(raw.valueProposition), st = obj(raw.strategy), lp = obj(raw.loops);

  const variables = (Array.isArray(lp.variables) ? lp.variables : []).map((v) => obj(v))
    .map((v) => ({ id: s(v.id, 12), label: s(v.label, 40) })).filter((v) => v.id && v.label).slice(0, 10);
  const ids = new Set(variables.map((v) => v.id));
  const links = (Array.isArray(lp.links) ? lp.links : []).map((l) => obj(l))
    .map((l) => ({ from: s(l.from, 12), to: s(l.to, 12), polarity: (String(l.polarity).includes("-") ? "-" : "+") as "+" | "-", delay: l.delay === true || l.delay === "true" }))
    .filter((l) => ids.has(l.from) && ids.has(l.to) && l.from !== l.to).slice(0, 16);
  const loops = (Array.isArray(lp.loops) ? lp.loops : []).map((l) => obj(l)).map((l, i) => {
    const type = String(l.type ?? l.id ?? "").toUpperCase().startsWith("B") ? "B" : "R";
    return { id: s(l.id, 6) || `${type}${i + 1}`, type: type as "R" | "B", name: s(l.name, 50), variables: list(l.variables, 10).filter((v) => ids.has(v)), story: s(l.story, 200) };
  }).filter((l) => l.variables.length >= 2).slice(0, 4);
  const leverage = (Array.isArray(lp.leverage) ? lp.leverage : []).map((l) => obj(l)).map((l) => {
    const level = num(l.level, 1, 12, 12);
    return { level, name: MEADOWS[level], intervention: s(l.intervention, 160), inUse: l.inUse === true || l.inUse === "true" };
  }).filter((l) => l.intervention).slice(0, 6).sort((x, y) => y.level - x.level);

  const fw: Frameworks = {
    organization: s(raw.organization, 80) || "The organization",
    valueProposition: {
      beneficiary: segment(vp.beneficiary, "Beneficiaries"),
      payer: segment(vp.payer, "Funders"),
      offer: list(vp.offer, 4),
      painRelievers: list(vp.painRelievers, 3),
      gainCreators: list(vp.gainCreators, 3),
      alternatives: list(vp.alternatives, 3),
      tension: s(vp.tension, 220),
    },
    strategy: {
      type: pick(st.type, STRATEGY_TYPES, "niche"),
      theoryOfChange: num(st.theoryOfChange, 0, 100, 50),
      operations: num(st.operations, 0, 100, 50),
      rationale: s(st.rationale, 240),
      accountableFor: s(st.accountableFor, 240),
    },
    accountability: (Array.isArray(raw.accountability) ? raw.accountability : []).map((r) => obj(r)).map((r) => ({
      stakeholder: s(r.stakeholder, 60), direction: pick(r.direction, DIRECTIONS, "upward"),
      mechanisms: list(r.mechanisms, 3), strength: pick(r.strength, ["strong", "weak", "absent"] as const, "weak"),
    })).filter((r) => r.stakeholder).slice(0, 8),
    power: (Array.isArray(raw.power) ? raw.power : []).map((r) => obj(r)).map((r) => ({
      stakeholder: s(r.stakeholder, 40), power: num(r.power, 0, 10, 5), interest: num(r.interest, 0, 10, 5),
      stance: pick(r.stance, ["supportive", "neutral", "resistant"] as const, "neutral"), note: s(r.note, 80),
    })).filter((r) => r.stakeholder).slice(0, 8),
    logicModel: (Array.isArray(raw.logicModel) ? raw.logicModel : []).map((r) => obj(r)).map((r) => ({
      level: pick(r.level, LM_LEVELS, "output"), statement: s(r.statement, 160), indicators: list(r.indicators, 2),
      source: s(r.source, 120), assumption: s(r.assumption, 160),
    })).filter((r) => r.statement).slice(0, 10)
      .sort((x, y) => LM_LEVELS.indexOf(x.level) - LM_LEVELS.indexOf(y.level)),
    loops: { variables, links, loops, leverage },
  };
  const usable = fw.valueProposition.offer.length + fw.accountability.length + fw.power.length + variables.length + fw.logicModel.length > 0;
  return usable ? fw : null;
}
