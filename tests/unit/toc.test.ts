import { describe, expect, it } from "vitest";
import { isInferred, parseToc, withoutInferred } from "@/lib/toc";

const sample = {
  organization: "Clubs", problem: "Few girls code.", population: "Girls 12-17",
  inputs: ["Grants"], activities: ["Clubs", "Mentoring"], outputs: ["120 girls trained"],
  shortTermOutcomes: ["Skills"], longTermOutcomes: ["Careers"], impact: "Women in tech.",
  assumptions: [{ text: "Schools host", link: "inputs-activities", evidence: "strong" }],
  gaps: ["No follow-up"], risks: ["Grant ends"],
};

describe("parseToc", () => {
  it("reads JSON wrapped in a Markdown fence and prose", () => {
    const toc = parseToc("Here you go:\n```json\n" + JSON.stringify(sample) + "\n```\nDone.");
    expect(toc?.organization).toBe("Clubs");
    expect(toc?.activities).toEqual(["Clubs", "Mentoring"]);
    expect(toc?.assumptions[0]).toEqual({ text: "Schools host", link: "inputs-activities", evidence: "strong" });
  });

  it("caps list lengths and long items so the slides fit", () => {
    const toc = parseToc(JSON.stringify({ ...sample, activities: Array.from({ length: 9 }, (_, i) => "a".repeat(300) + i) }))!;
    expect(toc.activities).toHaveLength(5);
    expect(toc.activities[0].length).toBeLessThanOrEqual(140);
    expect(toc.activities[0].endsWith("…")).toBe(true);
  });

  it("normalizes loose link and evidence wording", () => {
    const toc = parseToc(JSON.stringify({ ...sample, assumptions: [
      { text: "x", link: "Outcomes to impact", evidence: "Partial" },
      { text: "y", link: "from activities to outputs", evidence: "unknown" },
      "a bare string",
    ] }))!;
    expect(toc.assumptions.map((a) => [a.link, a.evidence])).toEqual([
      ["outcomes-impact", "some"], ["activities-outputs", "none"], ["outputs-outcomes", "none"],
    ]);
  });

  it("rejects replies with no usable chain", () => {
    expect(parseToc("Sorry, I can't do that.")).toBeNull();
    expect(parseToc("{not json}")).toBeNull();
    expect(parseToc(JSON.stringify({ organization: "X" }))).toBeNull();
  });

  it("flags inferred items", () => {
    expect(isInferred("Inferred: More girls choose STEM")).toBe(true);
    expect(withoutInferred("Inferred: More girls choose STEM")).toBe("More girls choose STEM");
    expect(isInferred("Girls gain skills")).toBe(false);
  });
});
