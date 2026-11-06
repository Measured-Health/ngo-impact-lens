# NGO Strategy & Impact Lens

A chat advisor for nonprofit founders, social-enterprise leaders, students, board members and evaluators. It checks whether an organization's mission, value proposition, theory of change, strategy, business model, accountability system and measurements fit together.

It works like a tough interviewer. It asks one question at a time from the perspective of a stakeholder you choose: a community member, frontline employee, donor, board member, government official, evaluator, and so on. It challenges unsupported claims and runs stress tests (funding cut by 30%, a partner withdraws, mission drift). It finishes with an **NGO Strategy and Alignment Report**.

It applies the Managing NGOs course frameworks: Ebrahim & Rangan, Ebrahim's accountability framework, Brumme & Trelstad, Daily Table, VisionSpring, Harlem Children's Zone, AKRSP, WIEGO, the Advocacy Strategy Framework, outcome harvesting, contribution analysis, collective impact, systems mapping and Meadows' leverage points. The full instructions are in [`lib/lens.ts`](lib/lens.ts).

## Any LLM provider

The app is built on the [AI SDK](https://ai-sdk.dev), so it isn't tied to one vendor. List the models to offer in `LENS_MODELS`, then set the credentials for each provider you use. The picker hides any model whose provider has no credentials.

| Provider | Model id prefix | Credentials |
| --- | --- | --- |
| Anthropic (Claude) | `anthropic:` | `ANTHROPIC_API_KEY` |
| OpenAI | `openai:` | `OPENAI_API_KEY` |
| Google (Gemini) | `google:` | `GOOGLE_GENERATIVE_AI_API_KEY` |
| Vercel AI Gateway (many providers, one key) | `gateway:` e.g. `gateway:anthropic/claude-sonnet-5.5` | `AI_GATEWAY_API_KEY` |
| Any OpenAI-compatible server: Ollama, vLLM, LM Studio, Groq, Together, OpenRouter | `local:` | `LOCAL_LLM_BASE_URL`, optional `LOCAL_LLM_API_KEY` |

Example: `LENS_MODELS=anthropic:claude-sonnet-5-5=Claude Sonnet 5.5,local:llama3.3=Llama 3.3 (local)`. The first entry is the default. See [`.env.example`](.env.example).

The advisor tracks progress through the review (stage, diagnostic areas covered, current lens) with a hidden marker line at the end of each reply. No tool calling or structured-output support is needed, so smaller open models work too. They follow the protocol less reliably, which only affects the progress map, not the conversation.

Set `LENS_ACCESS_CODE` to require a shared code before anyone can chat. Otherwise anyone who can reach the server can spend your API credit.

## Privacy

Conversations and attached documents are stored only in the user's browser (`localStorage`). Each message is sent to the server, which forwards the conversation and documents to the selected model provider and keeps nothing. Choose a provider whose data terms suit the organization. For sensitive material, use a self-hosted model through `local:`.

## Develop

Node 24. Don't run builds or tests on the laptop. Use the build server:

```bash
scripts/remote-run.sh <<'CMDS'
npm ci || exit 1
npm run typecheck || exit 1
npm test || exit 1
npm run build || exit 1
npm run e2e || exit 1
CMDS
```

`scripts/remote-run.sh` syncs the checkout to `steven-reid` (key `../stb.pem`), then runs the commands in the `mhai-web-ci:pw1.64.1` image (Node 24 + Playwright browsers). Set `REMOTE_HOST` / `REMOTE_KEY` to use another machine.

- `npm test`: unit tests (Vitest) for the prompt, protocol parsing and model configuration.
- `npm run e2e`: browser tests (Playwright) against the production build, with a scripted mock model (`LENS_MOCK_LLM=1`), so no API key is needed.

To try it with a real model, run `npm run dev` on the server with a provider key in `.env.local`, then tunnel the port: `ssh -i ../stb.pem -N -L 3000:127.0.0.1:3000 steven-reid@75.46.59.136`.

## Demo video

`scripts/record-demo.mjs` walks the app through a full review of a fictional NGO, with captions, and records it. On the build server, start the app (`npx next start -p 3200 -H 127.0.0.1`), then:

```bash
MODEL_ID=google:gemini-3.8-flash BASE_URL=http://127.0.0.1:3200 node scripts/record-demo.mjs   # writes demo/ngo-impact-lens-demo.webm
docker run --rm -v "$PWD/demo":/d -w /d linuxserver/ffmpeg -y -i ngo-impact-lens-demo.webm \
  -c:v libx264 -crf 22 -pix_fmt yuv420p -movflags +faststart ngo-impact-lens-demo.mp4
```

## Layout

```
app/page.tsx            server component: reads the model list from the environment
app/api/chat/route.ts   streams the model's reply as plain text
components/LensChat.tsx the chat UI, progress map, lens picker, documents
lib/lens.ts             instructions, stages, lenses, protocol helpers (pure)
lib/models.ts           provider registry and model allow-list
lib/mock-model.ts       scripted model for end-to-end tests
```

## Limits

- Attachments must be text (`.txt`, `.md`, `.csv`, `.json`, `.html`). For PDF or Word files, paste the text.
- Each document is capped at 60,000 characters, 150,000 in total. The oldest turns of very long conversations are dropped from what the model sees.
