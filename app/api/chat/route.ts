import { streamText } from "ai";
import { buildInstructions, errorMarker, OPENING, sourcesMarker, type WebSource } from "@/lib/lens";
import { researchTools } from "@/lib/models";
import { readLensRequest } from "@/lib/request";
import { describe } from "@/lib/provider-errors";

export const maxDuration = 300;

export async function POST(req: Request) {
  const r = await readLensRequest(req);
  if ("error" in r) return r.error;
  const { model, modelId, history, docs, state } = r;
  const tools = researchTools(modelId);
  if (!history.length || history[history.length - 1].role !== "user") {
    return Response.json({ error: "Send a message first." }, { status: 400 });
  }

  const result = streamText({
    model,
    instructions: buildInstructions(state, docs, Boolean(tools)),
    ...(tools ? { tools } : {}),
    messages: [{ role: "assistant", content: OPENING }, ...history],
    abortSignal: req.signal,
  });

  // Plain text stream. A provider failure is appended as a hidden
  // <!--lens-error--> marker so the client can show it next to any partial text.
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const sources: WebSource[] = [];
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") controller.enqueue(enc.encode(part.text));
          else if (part.type === "source" && part.sourceType === "url" && !sources.some((s) => s.url === part.url)) {
            sources.push({ url: part.url, title: part.title ?? "" });
          }
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
        if (sources.length) controller.enqueue(enc.encode(sourcesMarker(sources)));
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}
