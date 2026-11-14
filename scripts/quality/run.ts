// Runs the sample conversations in scenarios.json against a running server and a real
// model, and writes one Markdown transcript per scenario (replies, claims ledger, scores)
// for a person to grade against rubric.md.
//
//   BASE_URL=http://127.0.0.1:3200 MODEL_ID=google:gemini-3.6-flash LENS_ACCESS_CODE=... \
//     npx -y tsx@4.20.3 scripts/quality/run.ts [scenario-id ...]
//
// Output: quality-out/<scenario-id>.md (gitignored). Uses one request per user turn.
import fs from "node:fs";
import path from "node:path";
import {
  INITIAL_STATE, mergeState, readErrorMarker, readModelMarker, readSourcesMarker, readStateMarker, stripProtocol,
  type LensDocument, type ReviewState,
} from "../../lib/lens";

type Scenario = { id: string; tests: string; docs: LensDocument[]; turns: string[] };

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3200";
const MODEL_ID = process.env.MODEL_ID ?? "";
const ACCESS = process.env.LENS_ACCESS_CODE ?? "";
const OUT = path.resolve(process.env.OUT_DIR ?? "quality-out");
const here = __dirname;
const all: Scenario[] = JSON.parse(fs.readFileSync(path.join(here, "scenarios.json"), "utf8"));
const pick = process.argv.slice(2);
const scenarios = pick.length ? all.filter((s) => pick.includes(s.id)) : all;

async function ask(turns: { role: string; content: string }[], state: ReviewState, docs: LensDocument[]) {
  const res = await fetch(BASE_URL + "/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", ...(ACCESS ? { "x-lens-access": ACCESS } : {}) },
    body: JSON.stringify({ model: MODEL_ID || undefined, turns, state, docs }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const nonce = res.headers.get("x-lens-marker") ?? "";
  const full = await res.text();
  const err = readErrorMarker(full, nonce);
  if (err) throw new Error(err);
  return {
    text: stripProtocol(full),
    state: mergeState(state, readStateMarker(full)),
    sources: readSourcesMarker(full, nonce),
    model: readModelMarker(full, nonce),
  };
}

async function main() {
fs.mkdirSync(OUT, { recursive: true });
for (const s of scenarios) {
  const md: string[] = [`# ${s.id}`, "", `Tests: ${s.tests}`, "", `Model: ${MODEL_ID || "server default"}`, ""];
  if (s.docs.length) md.push(`Attached: ${s.docs.map((d) => d.name).join(", ")}`, "");
  const turns: { role: string; content: string }[] = [];
  let state: ReviewState = INITIAL_STATE;
  try {
    for (const [i, user] of s.turns.entries()) {
      turns.push({ role: "user", content: user });
      const r = await ask(turns, state, s.docs);
      turns.push({ role: "assistant", content: r.text });
      state = r.state;
      md.push(`## Turn ${i + 1}`, "", `**User:** ${user}`, "", "**Advisor:**", "", r.text, "");
      if (r.sources.length) md.push("Sources: " + r.sources.map((x) => `${x.title} <${x.url}>`).join("; "), "");
      if (r.model) md.push(`Model note: ${JSON.stringify(r.model)}`, "");
      md.push(`State: lens=${state.lens || "-"}, stage=${state.stage}, current=${state.current}, covered=[${state.covered}]`, "");
      console.log(`${s.id} turn ${i + 1} ok`);
    }
  } catch (e) {
    md.push(`**RUN FAILED:** ${(e as Error).message}`, "");
    console.log(`${s.id} FAILED: ${(e as Error).message.slice(0, 200)}`);
  }
  md.push("## Claims ledger", "");
  for (const c of state.claims) md.push(`- [${c.status}] (area ${c.area}) ${c.text.replace(/\.+$/, "")}. Source: ${c.source || "-"}. Evidence: ${c.evidence || "-"}`);
  md.push("", "## Scores", "", "```json", JSON.stringify(state.scores, null, 1), "```", "");
  fs.writeFileSync(path.join(OUT, s.id + ".md"), md.join("\n"));
}
}

void main();
