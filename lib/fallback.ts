import "server-only";
import { streamText, type LanguageModel } from "ai";
import { modelLabel, resolveModel } from "@/lib/models";

type StreamResult = ReturnType<typeof streamText>;
type StreamPart = StreamResult["fullStream"] extends AsyncIterable<infer P> ? P : never;
export type Attempt = { id: string; label: string; model: LanguageModel; last: boolean };

/**
 * Runs `start` on each candidate model in turn. A model that fails before
 * producing any text (used-up quota, rate limit, outage, rejected key) is
 * skipped and the next one is tried; once text has been produced, a failure is
 * final because the user has already seen part of the reply.
 *
 * `onPart` receives every stream part with the attempt that produced it and the
 * labels of the models skipped before it.
 */
export async function streamWithFallback(
  candidates: string[],
  start: (a: Attempt) => StreamResult,
  onPart: (part: StreamPart, attempt: Attempt, skipped: string[]) => void,
  signal: AbortSignal,
): Promise<{ error: unknown | null; skipped: string[] }> {
  const skipped: string[] = [];
  let first: unknown = null;
  let error: unknown = null;
  for (let i = 0; i < candidates.length; i++) {
    const id = candidates[i];
    const model = await resolveModel(id);
    if (!model) continue;
    const label = modelLabel(id);
    let wrote = false;
    error = null;
    try {
      const attempt = { id, label, model, last: i === candidates.length - 1 };
      const result = start(attempt);
      for await (const part of result.fullStream) {
        if (part.type === "error") { error = part.error; break; }
        if (part.type === "text-delta") wrote = true;
        onPart(part, attempt, skipped);
      }
    } catch (e) {
      error = e;
    }
    if (!error || signal.aborted) return { error: null, skipped };
    console.error(`[lens] ${id} failed${wrote ? " mid-reply" : ""}`, error);
    if (wrote) return { error, skipped };
    first ??= error;
    skipped.push(label);
  }
  // Nothing answered: report the chosen model's failure, the one the user picked.
  return { error: first ?? error, skipped };
}
