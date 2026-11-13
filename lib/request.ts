import "server-only";
import type { LanguageModel } from "ai";
import { INITIAL_STATE, trimHistory, type ChatTurn, type LensDocument, type ReviewState } from "@/lib/lens";
import { listModels, resolveModel } from "@/lib/models";

type Body = { model?: string; turns?: ChatTurn[]; state?: ReviewState; docs?: LensDocument[] };
export type LensRequest = {
  model: LanguageModel;
  modelId: string;
  history: { role: "user" | "assistant"; content: string }[];
  docs: LensDocument[];
  state: ReviewState;
};

const MAX_BODY = 1_500_000;

/** Checks the access code, size and model, and cleans the turns and documents. */
export async function readLensRequest(req: Request): Promise<{ error: Response } | LensRequest> {
  const fail = (error: string, status: number) => ({ error: Response.json({ error }, { status }) });
  const access = process.env.LENS_ACCESS_CODE;
  if (access && req.headers.get("x-lens-access") !== access) return fail("Enter the access code to use this advisor.", 401);
  const raw = await req.text();
  if (raw.length > MAX_BODY) return fail("The conversation and documents are too large. Remove a document or start a new review.", 413);

  let body: Body;
  try { body = JSON.parse(raw); } catch { return fail("Malformed request.", 400); }

  const modelId = body.model || listModels()[0]?.id;
  const model = modelId ? await resolveModel(modelId) : null;
  if (!model) return fail("That model isn't configured on this server.", 400);

  const turns = (Array.isArray(body.turns) ? body.turns : [])
    .filter((t) => (t.role === "user" || t.role === "assistant") && typeof t.content === "string" && t.content.trim())
    .map((t) => ({ role: t.role, content: t.content }));
  const docs = (Array.isArray(body.docs) ? body.docs : [])
    .filter((d) => typeof d?.name === "string" && typeof d?.text === "string")
    .map((d) => ({ name: d.name.slice(0, 200), text: d.text }));
  return { model, modelId: modelId!, history: trimHistory(turns), docs, state: { ...INITIAL_STATE, ...(body.state ?? {}) } };
}
