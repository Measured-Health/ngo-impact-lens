import { describe, expect, it } from "vitest";
import { parseFrameworks } from "@/lib/frameworks";

const base = {
  organization: "Clubs",
  valueProposition: { beneficiary: { who: "Girls", jobs: ["Learn"], pains: ["No laptop"], gains: ["Job"] }, payer: { who: "Foundations" }, offer: ["Clubs"], painRelievers: [], gainCreators: [], alternatives: [], tension: "x" },
  strategy: { type: "Integrated strategy", theoryOfChange: 140, operations: "35", rationale: "r", accountableFor: "a" },
  accountability: [{ stakeholder: "Funders", direction: "Upward (donors)", mechanisms: ["Reports"], strength: "STRONG" }],
  power: [{ stakeholder: "Funders", power: 12, interest: 6, stance: "Supportive", note: "" }],
  loops: {
    variables: [{ id: "v1", label: "Trust" }, { id: "v2", label: "Uptake" }, { id: "v3", label: "Outcomes" }],
    links: [{ from: "v1", to: "v2", polarity: "+" }, { from: "v2", to: "v3", polarity: "-", delay: true }, { from: "v3", to: "v9", polarity: "+" }, { from: "v1", to: "v1", polarity: "+" }],
    loops: [{ id: "B1", type: "balancing", name: "n", variables: ["v1", "v2", "v9"], story: "s" }, { id: "R9", variables: ["v1"] }],
    leverage: [{ level: 12, intervention: "More places", inUse: true }, { level: 6, intervention: "Share data", inUse: "false" }, { level: 99, intervention: "x" }],
  },
};

describe("parseFrameworks", () => {
  it("normalizes enums, clamps numbers and drops broken links and loops", () => {
    const fw = parseFrameworks("```json\n" + JSON.stringify(base) + "\n```")!;
    expect(fw.strategy).toMatchObject({ type: "integrated", theoryOfChange: 100, operations: 35 });
    expect(fw.accountability[0]).toMatchObject({ direction: "upward", strength: "strong" });
    expect(fw.power[0].power).toBe(10);
    expect(fw.power[0].stance).toBe("supportive");
    expect(fw.loops.links).toEqual([
      { from: "v1", to: "v2", polarity: "+", delay: false },
      { from: "v2", to: "v3", polarity: "-", delay: true },
    ]);
    expect(fw.loops.loops).toEqual([{ id: "B1", type: "B", name: "n", variables: ["v1", "v2"], story: "s" }]);
    expect(fw.loops.leverage.map((l) => [l.level, l.inUse])).toEqual([[12, true], [12, false], [6, false]]);
    expect(fw.loops.leverage[2].name).toBe("Information flows");
    expect(fw.valueProposition.payer).toEqual({ who: "Foundations", jobs: [], pains: [], gains: [] });
  });
  it("rejects replies with nothing usable", () => {
    expect(parseFrameworks("no json")).toBeNull();
    expect(parseFrameworks(JSON.stringify({ organization: "X" }))).toBeNull();
  });
});
