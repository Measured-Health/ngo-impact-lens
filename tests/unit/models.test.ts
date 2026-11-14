import { describe, expect, it } from "vitest";
import { activeProviders, listModels } from "@/lib/models";
import { reply } from "@/lib/mock-model";

describe("listModels", () => {
  const models = "anthropic:claude-sonnet-5-5=Claude Sonnet 5.5, openai:gpt-6.1-sol, local:llama3.3=Llama (local), bogus";
  it("offers only models whose provider has credentials", () => {
    expect(listModels({ LENS_MODELS: models, OPENAI_API_KEY: "k", LOCAL_LLM_BASE_URL: "http://x/v1" })).toEqual([
      { id: "openai:gpt-6.1-sol", label: "gpt-6.1-sol" },
      { id: "local:llama3.3", label: "Llama (local)" },
    ]);
  });
  it("is empty when nothing is configured", () => {
    expect(listModels({ LENS_MODELS: models })).toEqual([]);
    expect(activeProviders({})).toEqual([]);
  });
  it("adds the scripted model only in mock mode", () => {
    expect(listModels({ LENS_MOCK_LLM: "1" })).toEqual([{ id: "mock:scripted", label: "Scripted test model" }]);
  });
});

describe("scripted mock model", () => {
  const user = (t: string) => [{ role: "system", content: "rules" }, { role: "user", content: [{ type: "text", text: t }] }];
  it("adopts a requested lens", () => {
    expect(reply(user("Please take the perspective of: Board member. Stay."))).toContain('"lens":"Board member"');
  });
  it("fails on request", () => {
    expect(() => reply(user("FAIL_PLEASE"))).toThrow();
  });
});

describe("researchTools", () => {
  it("offers the provider's own search, and can be turned off", async () => {
    const { researchTools } = await import("@/lib/models");
    expect(Object.keys(researchTools("google:gemini-x", {}) ?? {})).toEqual(["google_search"]);
    expect(Object.keys(researchTools("anthropic:claude-x", {}) ?? {})).toEqual(["web_search"]);
    expect(researchTools("local:llama", {})).toBeNull();
    expect(researchTools("google:gemini-x", { LENS_WEB_RESEARCH: "off" })).toBeNull();
  });
});

describe("fallbackOrder", () => {
  const env = { LENS_MODELS: "google:a=A, google:b=B, google:c=C", GOOGLE_GENERATIVE_AI_API_KEY: "k" };
  it("tries the chosen model first, then the others in configured order", async () => {
    const { fallbackOrder, modelLabel } = await import("@/lib/models");
    expect(fallbackOrder("google:b", env)).toEqual(["google:b", "google:a", "google:c"]);
    expect(modelLabel("google:c", env)).toBe("C");
  });
  it("can be turned off", async () => {
    const { fallbackOrder } = await import("@/lib/models");
    expect(fallbackOrder("google:b", { ...env, LENS_MODEL_FALLBACK: "off" })).toEqual(["google:b"]);
  });
});
