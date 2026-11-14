import { buildInstructions, errorMarker, modelMarker, OPENING, sourcesMarker, wantsResearch, type WebSource } from "@/lib/lens";
import { streamText } from "ai";
import { searchPaused, streamWithFallback } from "@/lib/fallback";
import { researchTools } from "@/lib/models";
import { readLensRequest } from "@/lib/request";
import { describe } from "@/lib/provider-errors";

export const maxDuration = 300;

export async function POST(req: Request) {
  const r = await readLensRequest(req);
  if ("error" in r) return r.error;
  const { candidates, history, docs, state } = r;
  if (!history.length || history[history.length - 1].role !== "user") {
    return Response.json({ error: "Send a message first." }, { status: 400 });
  }
  const messages = [{ role: "assistant" as const, content: OPENING }, ...history];
  // Web search is off by default. It is on for this reply when the user asks for
  // outside facts or the advisor asked for it last time (LENS_WEB_RESEARCH=always
  // keeps it on; =off removes it).
  const wanted = process.env.LENS_WEB_RESEARCH === "always" || wantsResearch(history[history.length - 1].content) || Boolean(state.researchNext);
  const canSearch = (id: string) => researchTools(id) !== null;

  // Plain text stream. If the chosen model fails before writing anything, the next
  // configured model answers and a hidden <!--lens-model--> marker says which. A
  // final failure is appended as a hidden <!--lens-error--> marker so the client can
  // show it next to any partial text.
  const enc = new TextEncoder();
  const nonce = crypto.randomUUID();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const sources: WebSource[] = [];
      let announced = false;
      try {
        const { error } = await streamWithFallback(
          candidates,
          ({ id, model, research, last }) => {
            const tools = research ? researchTools(id) : null;
            const mode = tools ? "on" : canSearch(id) && !wanted && !searchPaused(id) ? "available" : "unavailable";
            return streamText({
              model,
              instructions: buildInstructions(state, docs, mode),
              ...(tools ? { tools } : {}),
              messages,
              abortSignal: req.signal,
              // With another model to fall back on, don't spend time retrying this one.
              ...(last ? {} : { maxRetries: 0 }),
            });
          },
          (part, attempt, skipped) => {
            if (part.type === "text-delta") {
              const noResearch = wanted && !attempt.research && canSearch(attempt.id);
              if (!announced && (skipped.length || noResearch)) {
                controller.enqueue(enc.encode(modelMarker({ id: attempt.id, label: attempt.label, skipped, noResearch }, nonce)));
              }
              announced = true;
              controller.enqueue(enc.encode(part.text));
            } else if (part.type === "source" && part.sourceType === "url" && !sources.some((s) => s.url === part.url)) {
              sources.push({ url: part.url, title: part.title ?? "" });
            }
          },
          req.signal,
          (id) => wanted && canSearch(id),
        );
        if (error && !req.signal.aborted) controller.enqueue(enc.encode(errorMarker(describe(error), nonce)));
      } catch (e) {
        if (!req.signal.aborted) {
          console.error("[lens] stream failed", e);
          controller.enqueue(enc.encode(errorMarker(describe(e), nonce)));
        }
      } finally {
        if (sources.length) controller.enqueue(enc.encode(sourcesMarker(sources, nonce)));
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-lens-marker": nonce } });
}
