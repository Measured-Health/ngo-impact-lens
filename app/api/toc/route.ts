import { streamText } from "ai";
import { docsBlock, OPENING } from "@/lib/lens";
import { describe } from "@/lib/provider-errors";
import { readLensRequest } from "@/lib/request";
import { parseToc, TOC_INSTRUCTIONS, TOC_REQUEST } from "@/lib/toc";

export const maxDuration = 300;

// Extracts the theory of change from the whole discussion as JSON for the slides.
export async function POST(req: Request) {
  const r = await readLensRequest(req);
  if ("error" in r) return r.error;
  const { model, history, docs } = r;
  if (!history.some((t) => t.role === "user")) {
    return Response.json({ error: "Describe the organization first, then make the slides." }, { status: 400 });
  }

  let text = "";
  try {
    const result = streamText({
      model,
      instructions: TOC_INSTRUCTIONS + docsBlock(docs),
      messages: [{ role: "assistant", content: OPENING }, ...history, { role: "user", content: TOC_REQUEST }],
      abortSignal: req.signal,
    });
    for await (const part of result.fullStream) {
      if (part.type === "text-delta") text += part.text;
      else if (part.type === "error") throw part.error;
    }
  } catch (e) {
    console.error("[lens] toc failed", e);
    return Response.json({ error: describe(e) }, { status: 502 });
  }

  const toc = parseToc(text);
  if (!toc) {
    return Response.json({ error: "The model's answer couldn't be turned into slides. Try again, or pick another model." }, { status: 502 });
  }
  return Response.json({ toc }, { headers: { "cache-control": "no-store" } });
}
