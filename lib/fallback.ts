import "server-only";
import { streamText, type LanguageModel } from "ai";
import { modelLabel, resolveModel } from "@/lib/models";

type StreamResult = ReturnType<typeof streamText>;
type StreamPart = StreamResult["fullStream"] extends AsyncIterable<infer P> ? P : never;
/** One try: a model, with or without its web search tool. */
export type Attempt = { id: string; label: string; model: LanguageModel; research: boolean; last: boolean };

// Models whose web search was refused (e.g. a free key with no search allowance),
// so later messages go straight to answering without it for a while.
const SEARCH_PAUSE_MS = 60 * 60 * 1000;
const searchPausedUntil = new Map<string, number>();
export const searchPaused = (id: string, now = Date.now()) => (searchPausedUntil.get(id) ?? 0) > now;
export const resetSearchPause = () => searchPausedUntil.clear();

/**
 * Runs `start` on each candidate model in turn. A model that fails before
 * producing any text (used-up quota, rate limit, outage, rejected key) is
 * skipped and the next one is tried; once text has been produced, a failure is
 * final because the user has already seen part of the reply.
 *
 * Where `canResearch(id)` is true, each model is first tried with web search and,
 * if that fails, again without it. When the search-free try then succeeds, search
 * was the cause, so it is paused for that model for an hour.
 *
 * `onPart` receives every stream part with the attempt that produced it and the
 * labels of the models skipped before it.
 */
export async function streamWithFallback(
  candidates: string[],
  start: (a: Attempt) => StreamResult,
  onPart: (part: StreamPart, attempt: Attempt, skipped: string[]) => void,
  signal: AbortSignal,
  canResearch: (id: string) => boolean = () => false,
): Promise<{ error: unknown | null; skipped: string[] }> {
  const plan = candidates.flatMap((id) =>
    canResearch(id) && !searchPaused(id) ? [{ id, research: true }, { id, research: false }] : [{ id, research: false }]);
  const skipped: string[] = [];
  let first: unknown = null;
  let error: unknown = null;
  let searchFailed = "";
  for (let i = 0; i < plan.length; i++) {
    const { id, research } = plan[i];
    const model = await resolveModel(id);
    if (!model) continue;
    const label = modelLabel(id);
    let wrote = false;
    error = null;
    try {
      const attempt = { id, label, model, research, last: i === plan.length - 1 };
      const result = start(attempt);
      for await (const part of result.fullStream) {
        if (part.type === "error") { error = part.error; break; }
        if (part.type === "text-delta") {
          if (!wrote && searchFailed === id) searchPausedUntil.set(id, Date.now() + SEARCH_PAUSE_MS);
          wrote = true;
        }
        onPart(part, attempt, skipped);
      }
    } catch (e) {
      error = e;
    }
    if (!error || signal.aborted) return { error: null, skipped };
    console.error(`[lens] ${id}${research ? " with web search" : ""} failed${wrote ? " mid-reply" : ""}`, error);
    if (wrote) return { error, skipped };
    first ??= error;
    if (research) { searchFailed = id; continue; }
    skipped.push(label);
  }
  // Nothing answered: report the chosen model's failure, the one the user picked.
  return { error: first ?? error, skipped };
}
