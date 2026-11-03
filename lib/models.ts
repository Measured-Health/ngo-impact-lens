import "server-only";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGateway, createProviderRegistry, type LanguageModel } from "ai";

// Provider-agnostic model configuration. Models are listed in LENS_MODELS as
// comma-separated `provider:model-id` entries, optionally `=Label`. A provider
// is only active when its credentials are present, so the model picker never
// offers something that cannot answer.
//
//   anthropic:  ANTHROPIC_API_KEY
//   openai:     OPENAI_API_KEY
//   google:     GOOGLE_GENERATIVE_AI_API_KEY
//   gateway:    AI_GATEWAY_API_KEY             (Vercel AI Gateway, ids like anthropic/claude-sonnet-5.5)
//   local:      LOCAL_LLM_BASE_URL [+ LOCAL_LLM_API_KEY]
//               any OpenAI-compatible server: Ollama, vLLM, LM Studio, Groq, Together, OpenRouter…
//   mock:       LENS_MOCK_LLM=1                (scripted replies, for tests only)

export type ModelOption = { id: string; label: string };

type Env = Record<string, string | undefined>;

export function activeProviders(env: Env = process.env): string[] {
  const on: string[] = [];
  if (env.ANTHROPIC_API_KEY) on.push("anthropic");
  if (env.OPENAI_API_KEY) on.push("openai");
  if (env.GOOGLE_GENERATIVE_AI_API_KEY) on.push("google");
  if (env.AI_GATEWAY_API_KEY) on.push("gateway");
  if (env.LOCAL_LLM_BASE_URL) on.push("local");
  if (env.LENS_MOCK_LLM === "1") on.push("mock");
  return on;
}

/** Parses LENS_MODELS and keeps only entries whose provider is active. */
export function listModels(env: Env = process.env): ModelOption[] {
  const active = new Set(activeProviders(env));
  const raw = (env.LENS_MODELS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (active.has("mock") && !raw.some((r) => r.startsWith("mock:"))) raw.push("mock:scripted=Scripted test model");
  const seen = new Set<string>();
  const out: ModelOption[] = [];
  for (const entry of raw) {
    const [id, label] = entry.split("=").map((s) => s.trim());
    const provider = id.split(":")[0];
    if (!id.includes(":") || !active.has(provider) || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, label: label || id.slice(provider.length + 1) });
  }
  return out;
}

let registry: ReturnType<typeof buildRegistry> | null = null;

function buildRegistry() {
  const env = process.env;
  const providers: Record<string, Parameters<typeof createProviderRegistry>[0][string]> = {};
  if (env.ANTHROPIC_API_KEY) providers.anthropic = anthropic;
  if (env.OPENAI_API_KEY) providers.openai = openai;
  if (env.GOOGLE_GENERATIVE_AI_API_KEY) providers.google = google;
  if (env.AI_GATEWAY_API_KEY) providers.gateway = createGateway({ apiKey: env.AI_GATEWAY_API_KEY });
  if (env.LOCAL_LLM_BASE_URL) {
    providers.local = createOpenAICompatible({
      name: "local",
      baseURL: env.LOCAL_LLM_BASE_URL,
      apiKey: env.LOCAL_LLM_API_KEY || undefined,
    });
  }
  return createProviderRegistry(providers);
}

/** Resolves a configured model id, or null when it is not on the allow-list. */
export async function resolveModel(id: string): Promise<LanguageModel | null> {
  if (!listModels().some((m) => m.id === id)) return null;
  if (id.startsWith("mock:")) {
    const { scriptedModel } = await import("./mock-model");
    return scriptedModel();
  }
  registry ??= buildRegistry();
  return registry.languageModel(id as never);
}
