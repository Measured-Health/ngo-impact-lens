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
| Any OpenAI-compatible service or server: Groq, OpenRouter, Cerebras, GitHub Models, Ollama, vLLM, LM Studio | `local:` | `LOCAL_LLM_BASE_URL`, optional `LOCAL_LLM_API_KEY` |

Example: `LENS_MODELS=anthropic:claude-sonnet-5-5=Claude Sonnet 5.5,local:llama3.3=Llama 3.3 (local)`. The first entry is the default. See [`.env.example`](.env.example).

The advisor tracks progress through the review (stage, diagnostic areas covered, current lens) with a hidden marker line at the end of each reply. No tool calling or structured-output support is needed, so smaller open models work too. They follow the protocol less reliably, which only affects the progress map, not the conversation.

The `local:` slot points at one OpenAI-compatible endpoint at a time. You can still mix it with the named providers, for example Gemini plus Groq.

Set `LENS_ACCESS_CODE` to require a shared code before anyone can chat. Otherwise anyone who can reach the server can spend your API credit.

## Free and low-cost model options

You can run the app without paying for a model. Each option below needs only settings in `.env.local`, with no code changes. Free tiers change often, so check the current limits when you sign up.

**Free tiers usually allow the provider to use your prompts to improve its models.** Use them for demos, teaching and fictional cases. For real NGO documents, use a self-hosted model or a paid plan whose terms exclude training.

| Option | Good for | Limits |
| --- | --- | --- |
| [Groq](https://console.groq.com) | Demos and recordings: free, no card, very fast replies, strong open models | Daily request and token caps |
| [Google AI Studio](https://aistudio.google.com) | Gemini Flash on the free tier | The key must belong to a project **without** billing. A key on a prepaid project stops working once the credit runs out |
| [OpenRouter](https://openrouter.ai) | One key for many models, including ones marked `:free` | Low rate limits; free models are sometimes busy |
| [Cerebras](https://cloud.cerebras.ai) | Free, very fast open models | Daily caps |
| [GitHub Models](https://github.com/marketplace/models) | Free with a GitHub account and a personal access token | Low daily limits; meant for prototyping |
| Self-hosted with [Ollama](https://ollama.com) | Fully free and private: documents never leave your machine | Needs a local or remote machine. Without a GPU, replies take 30–90 seconds |

Example `.env.local` for each. Model ids are examples; use the provider's current model list.

```bash
# Groq
LENS_MODELS=local:llama-3.3-70b-versatile=Llama 3.3 70B (Groq)
LOCAL_LLM_BASE_URL=https://api.groq.com/openai/v1
LOCAL_LLM_API_KEY=gsk_...

# Google AI Studio (free-tier project)
LENS_MODELS=google:gemini-3.8-flash=Gemini 3.8 Flash
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# OpenRouter (free models end in :free)
LENS_MODELS=local:meta-llama/llama-3.3-70b-instruct:free=Llama 3.3 70B (OpenRouter)
LOCAL_LLM_BASE_URL=https://openrouter.ai/api/v1
LOCAL_LLM_API_KEY=sk-or-...

# Cerebras
LENS_MODELS=local:llama-3.3-70b=Llama 3.3 70B (Cerebras)
LOCAL_LLM_BASE_URL=https://api.cerebras.ai/v1
LOCAL_LLM_API_KEY=csk-...

# GitHub Models (token needs the "models" permission)
LENS_MODELS=local:openai/gpt-4.1=GPT-4.1 (GitHub Models)
LOCAL_LLM_BASE_URL=https://models.github.ai/inference
LOCAL_LLM_API_KEY=github_pat_...

# Ollama on a local or remote machine (no key needed)
LENS_MODELS=local:qwen3:8b=Qwen 3 8B (self-hosted)
LOCAL_LLM_BASE_URL=http://localhost:11434/v1
```

For Ollama, install it, run `ollama pull qwen3:8b`, and point `LOCAL_LLM_BASE_URL` at the machine running it. An 8B model runs on CPU alone. Larger models (70B) need a GPU to reply at a usable speed. If Ollama runs on a remote machine, reach it through an SSH tunnel rather than exposing port 11434 to the internet.

Smaller models handle the conversation well but sometimes skip the hidden progress line. When they do, only the sidebar map lags; the chat is unaffected.

## Privacy

Conversations and attached documents are stored only in the user's browser (`localStorage`). Each message is sent to the server, which forwards the conversation and documents to the selected model provider and keeps nothing. Choose a provider whose data terms suit the organization. For sensitive material, use a self-hosted model through `local:`.

## Develop

Node 24. Builds and browser tests are heavy, so you can run them on a remote machine instead of your own computer:

```bash
scripts/remote-run.sh <<'CMDS'
npm ci || exit 1
npm run typecheck || exit 1
npm test || exit 1
npm run build || exit 1
npm run e2e || exit 1
CMDS
```

`scripts/remote-run.sh` syncs the checkout to the remote machine over SSH, then runs the commands in a Docker image with Node 24 and Playwright browsers. Configure it once in a gitignored `.remote.env`:

```bash
REMOTE_HOST=user@build-machine
REMOTE_KEY=/path/to/ssh-key.pem
# REMOTE_IMAGE=...   optional; defaults to the official Playwright image
```

To run everything on your own machine instead, use the same `npm` commands directly.

- `npm test`: unit tests (Vitest) for the prompt, protocol parsing, model configuration and error messages.
- `npm run e2e`: browser tests (Playwright) against the production build, with a scripted mock model (`LENS_MOCK_LLM=1`), so no API key is needed.

To try it with a real model, put a provider key in `.env.local` and run `npm run dev`. On a remote machine, put `.env.local` there and open the app through an SSH tunnel: `ssh -i /path/to/ssh-key.pem -N -L 3000:127.0.0.1:3000 user@build-machine`, then browse to http://localhost:3000.

## Demo video

`scripts/record-demo.mjs` walks the app through a full review of a fictional NGO, with captions, and records it. It needs a working model. Start the app (`npm run build && npx next start -p 3200 -H 127.0.0.1`), then:

```bash
MODEL_ID=local:llama-3.3-70b-versatile BASE_URL=http://127.0.0.1:3200 node scripts/record-demo.mjs   # writes demo/ngo-impact-lens-demo.webm
docker run --rm -v "$PWD/demo":/d -w /d linuxserver/ffmpeg -y -i ngo-impact-lens-demo.webm \
  -c:v libx264 -crf 22 -pix_fmt yuv420p -movflags +faststart ngo-impact-lens-demo.mp4
```

The MP4 plays in WhatsApp, email and slide decks. A fast model (Groq, Cerebras, Gemini Flash) keeps the video short, because the recording waits for every reply.

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
