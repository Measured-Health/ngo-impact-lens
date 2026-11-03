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
  if (/Alignment Report/.test(last)) {
    return "# NGO Strategy and Alignment Report\n\n## Organizational purpose\nScripted purpose." +
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
