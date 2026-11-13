import { describe, expect, it } from "vitest";
import { GLOSSARY } from "@/lib/glossary";
import { KNOWLEDGE } from "@/lib/knowledge";
import { buildInstructions, INITIAL_STATE } from "@/lib/lens";

describe("knowledge base", () => {
  it("goes to the model on every reply", () => {
    const s = buildInstructions(INITIAL_STATE, []);
    expect(s).toContain("REFERENCE KNOWLEDGE");
    expect(s).toContain("Contribution analysis (Mayne)");
    expect(s).toContain("Ebrahim and Rangan contingency framework");
  });
  it("keeps the glossary tab in step with the knowledge base", () => {
    const terms = [...KNOWLEDGE.split("## 8. Glossary")[1].split("## Sources")[0].matchAll(/^- \*\*(.+?)\*\*:/gm)].map((m) => m[1]);
    expect(GLOSSARY.map((g) => g.term)).toEqual(terms);
    expect(GLOSSARY.length).toBeGreaterThan(50);
    expect(GLOSSARY.find((g) => g.term === "Output")?.confusedWith).toMatch(/^outcome/);
  });
  it("uses Ebrahim and Rangan's own examples and measures", () => {
    expect(KNOWLEDGE).toMatch(/Ecosystem \(complex ToC, complex operations\).*Harlem Children's Zone/);
    expect(KNOWLEDGE).toMatch(/Niche .*Measure inputs, activities and outputs/);
  });
});
