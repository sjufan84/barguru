# BarGuru — Development Plan (Lead Engineer)

Goal: Build a Next.js + shadcn UI application that uses the Vercel AI SDK with Google models to help bar managers and bartenders generate on-brand cocktails from chat, ingredients, inventory/dead stock, theme, and cuisine style. Output streams as structured data (Zod schemas) into a stunning Cocktail display component with async image generation and iterative refinement through tool calls. Enable quick download/print and SEO-friendly pages.

## 0) Guiding Principles
- Streaming-first UX: chat + live cocktail card updates as fields resolve
- Structured outputs: Zod schemas for correctness, safety, and SEO
- Bar-first design: fields bartenders expect; batch scaling; cost control
- Modular agents: model/tool separation; robust function calling
- Accessibility + performance: shadcn, Tailwind, dark mode, keyboard nav

## 1) Architecture Overview
- Next.js 14 App Router (RSC) with shadcn-ui components
- Vercel AI SDK for: `streamText`, tool calls, structured output, vision
- Google models via AI SDK:
  - Text + vision: Gemini 1.5 Pro (for reasoning and image understanding)
  - Image generation: Imagen (or latest supported Google image model)
- File uploads: Next.js Route Handlers, process via Gemini (OCR + understanding)
- Cocktail schemas: Zod, plus JSON-LD (schema.org Recipe) for SEO
- Optional persistence: Postgres/Prisma or SQLite for local dev (phase 2)

## 2) User Journeys
1) Generate a cocktail from chat: “Use up Frangelico for our summer Chili’s menu.”
   - System streams a Cocktail object; image generates asynchronously
2) Generate by ingredients/theme/cuisine: “Peruvian-Japanese Nikkei style, shochu base.”
3) Upload menu/inventory image(s): extract style/constraints/ingredients automatically
4) Iterate: “Less sweet”, “Swap to bourbon”, “Keep under $2.50 COGS”, “Batch x40”
5) Download/print: bartender-friendly print layout + JSON export

## 3) Data Models (Zod Schemas)
- CocktailSchema (bar-intuitive + SEO-complete)
  - id, slug, name, description, story
  - style: venueType (e.g., Chili’s vs speakeasy), menuContext, theme, cuisineTags
  - baseSpirit, secondarySpirits, modifiers, sweeteners, acids, bitters
  - ingredients: [{ name, amount, unit, prepNote, optional: boolean }]
  - method: { technique: 'shake'|'stir'|'build'|'blend'|'whip'|'throw'|'carbonate', steps: string[] }
  - glassware, ice, garnish: [{ name, prepNote }]
  - yield: { volumeMl, serves }, abvEstimatePct?, dilutionNote?
  - cost: { currency, targetCostPerCocktail, estimatedCostPerCocktail } (phase 2: per-ingredient costs)
  - allergens: string[], substitutions: string[], variations: string[]
  - flavorProfile: { sweetness, acidity, bitterness, body, aroma, spice, textureNotes: string[] }
  - difficulty: 'easy'|'medium'|'advanced', timeMinutes, equipment: string[]
  - imagePrompt, imageUrl?, imageAlt
  - seo: { keywords: string[], jsonLd: object }
- ContextSchema (prompt constraints)
  - venue: { name, type, positioning, averageCheck, brandVoice }
  - barProgram: { style, constraints: string[], bannedIngredients: string[] }
  - cuisineStyle: string[], season: string, theme: string
  - inventory: [{ name, amount?: number, unit?: string }]
  - costTargets: { currency, maxCostPerCocktail? }

## 4) Core Features & Workstreams
1) Chat + Streaming (RSC)
   - Implement `/app/(cocktails)/chat` UI with shadcn chat components
   - Server action or route handler using AI SDK `streamText`
   - Provide Zod schema to enforce Cocktail structured output
   - Handle tool calls for adjustments (sweetness, swaps, scaling, cost)
   - Persist chat state in client; optional DB phase 2

2) File Uploads + Vision
   - Upload images (menus/inventory). Store in `/public/uploads` (dev) or object storage (phase 2)
   - Route handler: parse via Gemini 1.5 Pro (vision) → ContextSchema fragments
   - Merge into session context; surface extracted assumptions to user to confirm

3) Cocktail Display (Streaming Component)
   - A “mind-blowing” CocktailCard: focus on hierarchy, legibility, and photography
   - Streams fields as they arrive: name, ingredients, steps, garnish, etc.
   - Async image generation via Google image model from `imagePrompt`
   - Print-friendly view + quick JSON download
   - JSON-LD injection for SEO on dedicated route

4) Tools (Function Calling)
   - `adjustSweetness(delta)`, `swapIngredient(from,to)`, `changeStyle(stylePreset)`
   - `scaleBatch(factor)`, `fitCost(target)` (phase 2: cost model)
   - Expose all tools with Zod input schemas; implement safe, deterministic transforms

5) SEO + Pages
   - `/cocktails/[slug]`: RSC page rendering Cocktail + JSON-LD script
   - Canonical tags, open graph, structured data serialized from schema
   - Sitemap/robots; incremental static regen if persisted (phase 2)

6) Optional Persistence (Phase 2)
   - DB schema for Sessions, Cocktails, Images; Prisma + Postgres/SQLite
   - Save/Load cocktail sessions; named recipes library

## 5) Technical Breakdown by Task

A) AI Integration
- Install Vercel AI SDK; configure Google provider (env keys)
- Create `lib/ai/models.ts` exporting model IDs (e.g., `gemini-1.5-pro`, `imagen-3`)
- Create `lib/ai/schemas.ts` for Zod schemas (Cocktail, Context, Tool inputs)
- Create `lib/ai/tools.ts` for tool definitions (Zod in/out + pure transforms)
- Create `app/api/ai/chat/route.ts` using `streamText` + schema + tools
- Create `app/api/ai/image/route.ts` to generate images from prompts (async)

B) Chat UI
- `components/chat/ChatPanel.tsx` (input, attach files, style presets)
- `components/chat/Messages.tsx` (streaming; partial render)
- `components/chat/UploadButton.tsx` (drag-and-drop)
- Client actions calling `/api/ai/chat` with streaming reader

C) Cocktail UI
- `components/cocktail/CocktailCard.tsx` (beautiful recipe layout)
- `components/cocktail/CocktailImage.tsx` (async fetch + shimmer)
- `components/cocktail/JsonLd.tsx` to serialize schema.org Recipe
- `app/cocktails/[slug]/page.tsx` to render a saved/generated cocktail
- `components/cocktail/Actions.tsx` (print, download JSON, copy)

D) File Uploads + Vision
- `app/api/uploads/route.ts` for handling images (dev: local; prod: storage)
- `lib/ai/extractors.ts` uses Gemini vision to parse menus/inventory
- Merge extracted ContextSchema into chat session state

E) Styles + shadcn
- Install needed shadcn components: input, dropdown, badge, card, toast, textarea, tabs, tooltip, skeleton
- Global themes (light/dark), print CSS

F) SEO + Routing
- Next metadata API for open graph and canonical
- `/cocktails/[slug]` route + JSON-LD script

G) QA + Observability
- Zod-safe boundaries in all routes; user-facing error states
- Rate limiting for image generation; retries with backoff
- Basic analytics events (phase 2)

## 6) Milestones & Acceptance Criteria

Milestone 1: Streaming Chat → Cocktail
- Can prompt by ingredient/theme/style and receive a streaming Cocktail object
- CocktailCard progressively populates; no hard page reloads
- Basic tool calls for `adjustSweetness`, `swapIngredient`

Milestone 2: Menu/Inventory Image Ingestion
- Upload image; vision parses into ContextSchema (ingredients, style cues)
- User can confirm/modify extracted context; new cocktail respects it

Milestone 3: Image Generation + Print/Download
- Async cocktail image generated and displayed with beautiful styling
- Print-friendly page works; download JSON includes CocktailSchema

Milestone 4: SEO Pages
- `/cocktails/[slug]` renders Cocktail + JSON-LD
- Metadata API configured; clean slugs generated

Milestone 5 (Optional): Persistence
- Save/load recipes; list of generated cocktails
- Cost estimation fields filled with per-ingredient pricing

## 7) Assignable Work Packages

WP-AI-1: AI SDK Setup
- Files: `lib/ai/models.ts`, `lib/ai/schemas.ts`, `lib/ai/tools.ts`
- Deliver: working `streamText` with schema + mock tool transforms

WP-UI-1: Chat Shell
- Files: `components/chat/*`, integrate shadcn inputs, file attach
- Deliver: streaming messages, file attach stub, style presets dropdown

WP-CKT-1: CocktailCard + Image
- Files: `components/cocktail/*`
- Deliver: progressive card; async image fetch; download/print actions

WP-API-1: Chat Route
- Files: `app/api/ai/chat/route.ts`
- Deliver: tool-call loop, schema, partial streaming to client

WP-API-2: Image Route
- Files: `app/api/ai/image/route.ts`
- Deliver: returns image URL from generation; handles rate limit errors

WP-VSN-1: Uploads + Extractors
- Files: `app/api/uploads/route.ts`, `lib/ai/extractors.ts`
- Deliver: vision extraction → ContextSchema merge

WP-SEO-1: Slug + JSON-LD
- Files: `app/cocktails/[slug]/page.tsx`, `components/cocktail/JsonLd.tsx`
- Deliver: SSR page + structured data; metadata configured

WP-DX-1: Env + Docs
- Files: `.env.example`, `README.md` updates; add runbook
- Deliver: clear setup; env vars for Google + Vercel AI SDK

## 8) Env Vars
- `AI_GOOGLE_API_KEY` (or provider key used by Vercel AI SDK for Google)
- `AI_GOOGLE_IMAGE_MODEL` (e.g., `imagen-3`); `AI_GOOGLE_TEXT_MODEL` (e.g., `gemini-1.5-pro`)
- Optional phase 2: `DATABASE_URL`

## 9) Risks & Mitigations
- Model/tool drift: Zod schemas with strict parse + user-safe fallbacks
- Image gen latency: async fetch + skeletons; cache generated URLs
- Cost calc accuracy: phase 2 pricing tables; allow operator overrides
- SEO correctness: validate JSON-LD; test structured data with Google Rich Results Test

## 10) References
- See `llms.txt` for Vercel AI SDK documentation and examples
- Next.js App Router, shadcn-ui, TailwindCSS

## 11) Definition of Done (Initial Release)
- Users can: prompt by ingredient/style, upload menu image, receive/iterate cocktail, view gorgeous card with generated image, print/download, and share a SEO-friendly page.

