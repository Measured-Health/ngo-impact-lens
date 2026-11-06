// Theory-of-change extraction: the model turns the whole discussion into a small JSON
// object, which the app draws as two slides (flow diagram, then assumptions and evidence).
// Plain JSON in the reply text, no structured-output API, so any provider works.

export const LINKS = ["inputs-activities", "activities-outputs", "outputs-outcomes", "outcomes-impact"] as const;
export type Link = (typeof LINKS)[number];
export const LINK_LABELS: Record<Link, string> = {
  "inputs-activities": "Inputs to activities",
  "activities-outputs": "Activities to outputs",
  "outputs-outcomes": "Outputs to outcomes",
  "outcomes-impact": "Outcomes to impact",
};
export type Evidence = "strong" | "some" | "none";
export type Assumption = { text: string; link: Link; evidence: Evidence };

export type TheoryOfChange = {
  organization: string;
  problem: string;
  population: string;
  inputs: string[];
  activities: string[];
  outputs: string[];
  shortTermOutcomes: string[];
  longTermOutcomes: string[];
  impact: string;
  assumptions: Assumption[];
  gaps: string[];
  risks: string[];
};

/** Marks the extraction request; the scripted test model keys off it too. */
export const TOC_REQUEST =
  "THEORY OF CHANGE EXTRACTION. Summarize the theory of change we have discussed as the JSON object described in your instructions. Reply with the JSON only.";

export const TOC_INSTRUCTIONS = `You turn a conversation about an NGO or social-impact project into its theory of change, for two presentation slides.

Use what the conversation and any documents say. Where a component was never discussed, give your best inference, start that item with "Inferred:", and list the missing evidence under "gaps". Do not invent numbers. Keep every item under 15 words and write in plain language a board member would understand.

Reply with one JSON object and nothing else (no Markdown, no commentary), in exactly this shape:
{
  "organization": "name of the organization or project",
  "problem": "the problem it addresses, one sentence",
  "population": "who it serves and where, one sentence",
  "inputs": ["up to 4 resources: money, people, partners, data"],
  "activities": ["up to 5 things the organization does"],
  "outputs": ["up to 4 direct, countable products of the activities"],
  "shortTermOutcomes": ["up to 3 changes in knowledge, behaviour or access within about a year"],
  "longTermOutcomes": ["up to 3 lasting changes in people's lives or systems"],
  "impact": "the long-term goal, one sentence",
  "assumptions": [{"text": "what must be true for one step to lead to the next", "link": "inputs-activities | activities-outputs | outputs-outcomes | outcomes-impact", "evidence": "strong | some | none"}],
  "gaps": ["up to 4 missing evidence or measurement gaps"],
  "risks": ["up to 4 external factors or risks that could break the chain"]
}
Give 3 to 6 assumptions, covering the weakest links first. "evidence" says how well the discussion supported the assumption.`;

const MAX_ITEM = 140;

function str(v: unknown, max = MAX_ITEM): string {
  if (typeof v !== "string") return "";
  const s = v.replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

function list(v: unknown, n: number): string[] {
  return (Array.isArray(v) ? v : []).map((x) => str(x)).filter(Boolean).slice(0, n);
}

function link(v: unknown): Link {
  const s = String(v ?? "").toLowerCase();
  const hit = LINKS.find((l) => s.includes(l));
  if (hit) return hit;
  if (/impact/.test(s)) return "outcomes-impact";
  if (/outcome/.test(s)) return "outputs-outcomes";
  if (/output/.test(s)) return "activities-outputs";
  return "inputs-activities";
}

function evidence(v: unknown): Evidence {
  const s = String(v ?? "").toLowerCase();
  if (/strong|high|good/.test(s)) return "strong";
  if (/some|partial|medium|moderate|weak/.test(s)) return "some";
  return "none";
}

/** Pulls the JSON object out of a model reply and normalizes it; null when unusable. */
export function parseToc(text: string): TheoryOfChange | null {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let raw: Record<string, unknown>;
  try { raw = JSON.parse(text.slice(start, end + 1)); } catch { return null; }
  if (!raw || typeof raw !== "object") return null;
  const toc: TheoryOfChange = {
    organization: str(raw.organization, 80) || "The organization",
    problem: str(raw.problem, 220),
    population: str(raw.population, 180),
    inputs: list(raw.inputs, 4),
    activities: list(raw.activities, 5),
    outputs: list(raw.outputs, 4),
    shortTermOutcomes: list(raw.shortTermOutcomes, 3),
    longTermOutcomes: list(raw.longTermOutcomes, 3),
    impact: str(raw.impact, 180),
    assumptions: (Array.isArray(raw.assumptions) ? raw.assumptions : [])
      .map((a: { text?: unknown; link?: unknown; evidence?: unknown } | string) =>
        typeof a === "string"
          ? { text: str(a), link: "outputs-outcomes" as Link, evidence: "none" as Evidence }
          : { text: str(a?.text), link: link(a?.link), evidence: evidence(a?.evidence) })
      .filter((a) => a.text)
      .slice(0, 6),
    gaps: list(raw.gaps, 4),
    risks: list(raw.risks, 4),
  };
  const hasChain = toc.activities.length + toc.shortTermOutcomes.length + toc.longTermOutcomes.length > 0 || toc.impact;
  return hasChain ? toc : null;
}

/** "Inferred:" items were not stated in the discussion; the slides mark them. */
export function isInferred(item: string): boolean {
  return /^inferred:/i.test(item);
}
export function withoutInferred(item: string): string {
  return item.replace(/^inferred:\s*/i, "");
}
