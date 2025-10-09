//# WP-AI-1 — AI SDK Setup, Schemas, Tools

Owner: @agent-coder-1
Status: In Progress
Estimate: M

## Description
Set up the AI integration scaffolding:
- Define Google model ids and env wiring.
- Create Zod schemas for Cocktail and Context (bar-friendly + SEO-ready).
- Implement deterministic tool transforms (sweetness adjust, swap ingredient, change style, scale batch, fit cost stub).
- Provide a streaming chat API route that will use Vercel AI SDK with structured outputs (gracefully degrades if SDK packages are not installed yet).

## Acceptance Criteria
- `lib/ai/models.ts` exports text/image model ids from env.
- `lib/ai/schemas.ts` contains `CocktailSchema`, `ContextSchema`, and tool input schemas.
- `lib/ai/tools.ts` exports a `tools` registry (inputs validated), with pure transform functions.
- `app/api/ai/chat/route.ts` accepts POST `{ messages, context }` and attempts to stream via Vercel AI SDK; if unavailable, returns 501 with clear message.
- `.env.example` includes required keys.

## Tech Notes
- Use dynamic `import()` for `ai` and `@ai-sdk/google` to avoid build failures when deps aren’t installed yet.
- In a follow-up, wire `responseFormat` to Zod for structured outputs and the tool-call loop.

## Test Plan
- POST to `/api/ai/chat` without SDK installed → receive 501 JSON explaining missing dependency.
- Unit-test pure transforms in `lib/ai/tools.ts` (future).

## Links
- docs/DEVELOPMENT_PLAN.md
- docs/SCHEMAS.md
