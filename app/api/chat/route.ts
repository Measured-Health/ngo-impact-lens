import { streamText } from "ai";
import { buildInstructions, errorMarker, INITIAL_STATE, OPENING, trimHistory, type ChatTurn, type LensDocument, type ReviewState } from "@/lib/lens";
import { listModels, resolveModel } from "@/lib/models";
import { describe } from "@/lib/provider-errors";

export const maxDuration = 300;

type Body = { model?: string; turns?: ChatTurn[]; state?: ReviewState; docs?: LensDocument[] };

const MAX_BODY = 1_500_000;

export async function POST(req: Request) {
  const access = process.env.LENS_ACCESS_CODE;
  if (access && req.headers.get("x-lens-access") !== access) {
    return Response.json({ error: "Enter the access code to use this advisor." }, { status: 401 });
  }
  const raw = await req.text();
  if (raw.length > MAX_BODY) return Response.json({ error: "The conversation and documents are too large. Remove a document or start a new review." }, { status: 413 });

  let body: Body;
  try { body = JSON.parse(raw); } catch { return Response.json({ error: "Malformed request." }, { status: 400 }); }

  const modelId = body.model || listModels()[0]?.id;
  const model = modelId ? await resolveModel(modelId) : null;
  if (!model) return Response.json({ error: "That model isn't configured on this server." }, { status: 400 });

  const turns = (Array.isArray(body.turns) ? body.turns : [])
    .filter((t) => (t.role === "user" || t.role === "assistant") && typeof t.content === "string" && t.content.trim())
    .map((t) => ({ role: t.role, content: t.content }));
  const history = trimHistory(turns);
  if (!history.length || history[history.length - 1].role !== "user") {
    return Response.json({ error: "Send a message first." }, { status: 400 });
  }
  const docs = (Array.isArray(body.docs) ? body.docs : [])
    .filter((d) => typeof d?.name === "string" && typeof d?.text === "string")
    .map((d) => ({ name: d.name.slice(0, 200), text: d.text }));
  const state = { ...INITIAL_STATE, ...(body.state ?? {}) };

  const result = streamText({
    model,
    instructions: buildInstructions(state, docs),
    messages: [{ role: "assistant", content: OPENING }, ...history],
    abortSignal: req.signal,
  });

  // Plain text stream. A provider failure is appended as a hidden
  // <!--lens-error--> marker so the client can show it next to any partial text.
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") controller.enqueue(enc.encode(part.text));
          else if (part.type === "error") {
            console.error("[lens] model error", part.error);
            controller.enqueue(enc.encode(errorMarker(describe(part.error))));
            break;
          }
        }
      } catch (e) {
        if (!req.signal.aborted) {
          console.error("[lens] stream failed", e);
          controller.enqueue(enc.encode(errorMarker(describe(e))));
        }
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}
