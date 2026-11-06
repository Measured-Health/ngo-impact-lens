import { describe, expect, it } from "vitest";
import {
  buildInstructions, DOCS_TOTAL_LIMIT, errorMarker, INITIAL_STATE, mergeState,
  readErrorMarker, readStateMarker, RULES, stripProtocol, trimHistory,
} from "@/lib/lens";

const marker = '\n<!--lens-state {"stage":"diagnose","current":2,"covered":[1],"lens":"Board member"}-->';

describe("protocol markers", () => {
  it("strips a complete state marker", () => {
    expect(stripProtocol("Hello **there**" + marker)).toBe("Hello **there**");
  });
  it("hides a marker that is still streaming in", () => {
    expect(stripProtocol('Question?\n<!--lens-state {"stage":"dia')).toBe("Question?");
    expect(stripProtocol("Question?\n<!-")).toBe("Question?");
  });
  it("reads the state marker", () => {
    expect(readStateMarker("x" + marker)).toEqual({ stage: "diagnose", current: 2, covered: [1], lens: "Board member" });
    expect(readStateMarker("no marker")).toBeNull();
    expect(readStateMarker("<!--lens-state {broken}-->")).toBeNull();
  });
  it("round-trips error markers and strips them", () => {
    const t = "partial" + errorMarker("Provider down");
    expect(readErrorMarker(t)).toBe("Provider down");
    expect(stripProtocol(t)).toBe("partial");
  });
});

describe("mergeState", () => {
  it("accumulates covered areas and normalizes the lens", () => {
    const a = mergeState(INITIAL_STATE, { stage: "diagnose", current: 1, covered: [1], lens: "board member" });
    const b = mergeState(a, { stage: "diagnose", current: 3, covered: [2] });
    expect(b).toEqual({ stage: "diagnose", current: 3, covered: [1, 2], lens: "Board member" });
  });
  it("ignores malformed fields", () => {
    const s = mergeState(INITIAL_STATE, { stage: "bogus" as never, current: 42, covered: [0, 9, 2.5, 4] as number[] });
    expect(s).toEqual({ ...INITIAL_STATE, covered: [4] });
  });
  it("returns the previous state when there is no marker", () => {
    expect(mergeState(INITIAL_STATE, null)).toBe(INITIAL_STATE);
  });
});

describe("buildInstructions", () => {
  it("includes the rules, app state and documents", () => {
    const s = buildInstructions({ ...INITIAL_STATE, lens: "Donor or foundation officer", covered: [1, 3] }, [{ name: "toc.md", text: "Clubs lead to jobs." }]);
    expect(s.startsWith(RULES)).toBe(true);
    expect(s).toContain("Selected stakeholder lens: Donor or foundation officer");
    expect(s).toContain("Diagnostic areas already covered: 1, 3");
    expect(s).toContain("=== toc.md ===\nClubs lead to jobs.");
  });
  it("caps the total document text", () => {
    const big = "x".repeat(60_000);
    const s = buildInstructions(INITIAL_STATE, [1, 2, 3, 4].map((i) => ({ name: `d${i}`, text: big })));
    expect(s.length - RULES.length).toBeLessThan(DOCS_TOTAL_LIMIT + 2_000);
    expect(s).not.toContain("=== d4 ===");
  });
});

describe("trimHistory", () => {
  it("drops the oldest turns and always starts on a user turn", () => {
    const turns = [
      { role: "user", content: "a".repeat(50) },
      { role: "assistant", content: "b".repeat(50) },
      { role: "user", content: "c".repeat(50) },
    ];
    expect(trimHistory(turns, 120)).toEqual([turns[2]]);
    expect(trimHistory(turns, 1000)).toEqual(turns);
  });
});

describe("matchLens", () => {
  it("maps model spellings to the app's lens labels", async () => {
    const { matchLens } = await import("@/lib/lens");
    expect(matchLens("Donor / Foundation Officer")).toBe("Donor or foundation officer");
    expect(matchLens("board member")).toBe("Board member");
    expect(matchLens("Independent Evaluator")).toBe("Independent evaluator");
    expect(matchLens("Program Participant")).toBe("Program participant");
    expect(matchLens("Something else")).toBe("Something else");
  });
});

describe("cleanModelMarkdown", () => {
  it("turns LaTeX arrows and <br> tags into plain text", async () => {
    const { cleanModelMarkdown } = await import("@/lib/lens");
    expect(cleanModelMarkdown("Inputs $\\rightarrow$ Activities \\to Outputs")).toBe("Inputs → Activities → Outputs");
    expect(cleanModelMarkdown("| a<br>b | c <br/> d |")).toBe("| a b | c d |");
    expect(cleanModelMarkdown("costs $5 and $10")).toBe("costs $5 and $10");
  });
});
