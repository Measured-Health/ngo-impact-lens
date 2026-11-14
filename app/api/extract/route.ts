import { streamText } from "ai";
import { streamWithFallback } from "@/lib/fallback";
import { FRAMEWORKS_INSTRUCTIONS, FRAMEWORKS_REQUEST, parseFrameworks } from "@/lib/frameworks";
import { docsBlock, OPENING } from "@/lib/lens";
import { describe } from "@/lib/provider-errors";
import { readLensRequest } from "@/lib/request";
import { parseToc, TOC_INSTRUCTIONS, TOC_REQUEST } from "@/lib/toc";

export const maxDuration = 300;

// Reads the whole discussion and returns structured JSON for the slides
// (kind "toc") or the framework views (kind "frameworks").
const KINDS = {
  toc: { instructions: TOC_INSTRUCTIONS, request: TOC_REQUEST, parse: parseToc, what: "slides" },
  frameworks: { instructions: FRAMEWORKS_INSTRUCTIONS, request: FRAMEWORKS_REQUEST, parse: parseFrameworks, what: "framework views" },
} as const;

export async function POST(req: Request) {
  const kind = new URL(req.url).searchParams.get("kind");
  if (kind !== "toc" && kind !== "frameworks") return Response.json({ error: "Unknown export." }, { status: 400 });
  const k = KINDS[kind];
  const r = await readLensRequest(req);
  if ("error" in r) return r.error;
  const { candidates, history, docs } = r;
  if (!history.some((t) => t.role === "user")) {
    return Response.json({ error: `Describe the organization first, then make the ${k.what}.` }, { status: 400 });
  }

  // Falls back to the next configured model if the chosen one fails before writing.
  let text = "";
  const { error } = await streamWithFallback(
    candidates,
    ({ model, last }) => streamText({
      model,
      instructions: k.instructions + docsBlock(docs),
      messages: [{ role: "assistant", content: OPENING }, ...history, { role: "user", content: k.request }],
      abortSignal: req.signal,
      ...(last ? {} : { maxRetries: 0 }),
    }),
    (part) => { if (part.type === "text-delta") text += part.text; },
    req.signal,
  );
  if (error) return Response.json({ error: describe(error) }, { status: 502 });

  const data = k.parse(text);
  if (!data) {
    return Response.json({ error: `The model's answer couldn't be turned into ${k.what}. Try again, or pick another model.` }, { status: 502 });
  }
  return Response.json({ data }, { headers: { "cache-control": "no-store" } });
}
