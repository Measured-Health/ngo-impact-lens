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
    const nested = '<!--lens-state {"current":1,"scores":{"1":{"evidence":2,"alignment":3,"note":"a}b"}},"claims":[]}-->';
    expect(readStateMarker("x\n" + nested)?.scores).toEqual({ 1: { evidence: 2, alignment: 3, note: "a}b" } });
    expect(readStateMarker("no marker")).toBeNull();
    expect(readStateMarker("<!--lens-state {broken}-->")).toBeNull();
  });
  it("round-trips error markers and strips them", () => {
    const t = "partial" + errorMarker("Provider down");
    expect(readErrorMarker(t)).toBe("Provider down");
    expect(stripProtocol(t)).toBe("partial");
  });
});

describe("sources marker", () => {
  it("round-trips sources, drops non-http links and is stripped from display", async () => {
    const { sourcesMarker, readSourcesMarker } = await import("@/lib/lens");
    const m = sourcesMarker([{ url: "https://a.org/x", title: "A --> B" }, { url: "javascript:alert(1)", title: "bad" }, { url: "https://b.org", title: "" }]);
    expect(readSourcesMarker("text" + m)).toEqual([{ url: "https://a.org/x", title: "A --> B" }, { url: "https://b.org", title: "b.org" }]);
    expect(stripProtocol("Reply" + m)).toBe("Reply");
    expect(sourcesMarker([])).toBe("");
  });
});

describe("mergeState", () => {
  const score = { evidence: 2, alignment: 3, note: "ok" };
  it("normalizes the lens and counts exchanges per area", () => {
    const a = mergeState(INITIAL_STATE, { stage: "diagnose", current: 1, lens: "board member" });
    const b = mergeState(a, { stage: "diagnose", current: 1 });
    expect(b.lens).toBe("Board member");
    expect(b.probes).toEqual({ 1: 2 });
  });
  it("only accepts an area as covered once it is scored and probed enough", () => {
    let s = INITIAL_STATE;
    s = mergeState(s, { current: 1, covered: [1], scores: { 1: score } });
    expect(s.covered).toEqual([]); // one exchange
    s = mergeState(s, { current: 1 });
    s = mergeState(s, { current: 1, covered: [1] });
    expect(s.covered).toEqual([1]); // three exchanges and a score
    s = mergeState(s, { current: 2, covered: [2] });
    expect(s.covered).toEqual([1]); // area 2 has no score
  });
  it("upserts claims by id, keeps them in order and clamps scores", () => {
    let s = mergeState(INITIAL_STATE, { claims: [
      { id: "C2", text: "Costs $40 per girl", area: 4, status: "untested", evidence: "", source: "user" },
      { id: "c1", text: "80% complete", area: 1, status: "UNSUPPORTED", evidence: "none", source: "user" },
    ], scores: { 1: { evidence: 9, alignment: -2, note: "x" }, 12: score } });
    s = mergeState(s, { claims: [{ id: "C1", text: "80% complete", status: "partial", evidence: "attendance sheets" }] });
    expect(s.claims.map((c) => [c.id, c.status, c.area])).toEqual([["C1", "partial", 1], ["C2", "untested", 4]]);
    expect(s.claims[0].evidence).toBe("attendance sheets");
    expect(s.scores).toEqual({ 1: { evidence: 4, alignment: 0, note: "x" } });
  });
  it("ignores malformed fields", () => {
    const s = mergeState(INITIAL_STATE, { stage: "bogus" as never, current: 42, covered: [0, 9, 2.5, 4] as number[], claims: [{ id: "X", text: "y" }, "z"], scores: "no" });
    expect(s).toEqual(INITIAL_STATE);
  });
  it("returns the previous state when there is no marker", () => {
    expect(mergeState(INITIAL_STATE, null)).toEqual(INITIAL_STATE);
  });
});

describe("buildInstructions", () => {
  it("includes the rules, app state, ledger and documents", () => {
    const s = buildInstructions({
      ...INITIAL_STATE, lens: "Donor or foundation officer", covered: [1], probes: { 1: 3, 2: 1 },
      scores: { 1: { evidence: 2, alignment: 3, note: "" } },
      claims: [{ id: "C1", text: "80% complete", area: 1, status: "partial", evidence: "sheets", source: "user" }],
    }, [{ name: "toc.md", text: "Clubs lead to jobs." }]);
    expect(s.startsWith(RULES)).toBe(true);
    expect(s).toContain("Selected stakeholder lens: Donor or foundation officer");
    expect(s).toContain("1 Problem & value proposition: 3 exchanges, scored evidence 2/4, alignment 3/4, closed");
    expect(s).toContain("2 Theory of change & assumptions: 1 exchange, needs 2 more before closing");
    expect(s).toContain("C1 [area 1, partial] 80% complete");
    expect(s).toContain("=== toc.md ===\nClubs lead to jobs.");
  });
  it("tells the model to coach rather than supply answers", () => {
    expect(RULES).toContain("Draw the organization's answers out of the user");
    expect(RULES).toContain("Never write the organization's value proposition");
    expect(RULES).toContain("THINKING PARTNER");
    expect(RULES).toMatch(/Integrated \(focused theory of change, complex operations\)/);
    expect(RULES).toMatch(/Ecosystem \(complex theory of change, complex operations\).*Harlem Children's Zone/);
    expect(RULES).toContain("name it gently as an output");
  });
  it("caps the total document text", () => {
    const big = "x".repeat(60_000);
    const s = buildInstructions(INITIAL_STATE, [1, 2, 3, 4].map((i) => ({ name: `d${i}`, text: big })));
    expect(s.length - RULES.length).toBeLessThan(DOCS_TOTAL_LIMIT + 70_000);
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
