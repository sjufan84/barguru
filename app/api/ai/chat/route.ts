import { NextResponse } from 'next/server';
import { GOOGLE_TEXT_MODEL } from '@/lib/ai/models';
import { CocktailSchema, ContextSchema } from '@/lib/ai/schemas';
import { toolSchemas } from '@/lib/ai/tools';

export const runtime = 'nodejs';

type Message = { role: 'user'|'assistant'|'system'|'tool'; content: string };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: Message[] = body?.messages ?? [];
    const context = body?.context ? ContextSchema.parse(body.context) : undefined;

    // Try to use Vercel AI SDK with Google provider dynamically.
    try {
      const aiMod: any = await import('ai');
      const googleMod: any = await import('@ai-sdk/google');
      const { z } = await import('zod');

      const createGoogle = googleMod.createGoogleGenerativeAI as (cfg: { apiKey?: string }) => any;
      const google = createGoogle({ apiKey: process.env.AI_GOOGLE_API_KEY });
      const model = google(GOOGLE_TEXT_MODEL);

      // Tool wiring (inputs only for now; execution loop will be added next).
      const tools = Object.fromEntries(
        Object.entries(toolSchemas).map(([name, schema]) => [
          name,
          aiMod.tool({
            description: name,
            parameters: schema,
            execute: async () => ({ ok: true }), // placeholder; execution handled in follow-up
          }),
        ])
      );

      const result = await aiMod.streamText({
        model,
        messages,
        tools,
        toolChoice: 'auto',
        // TODO: enforce structured output with Zod schema when supported here
        // responseFormat: aiMod.zodSchema(CocktailSchema),
        system: buildSystemPrompt(context),
      });

      if (typeof result.toAIStreamResponse === 'function') {
        return result.toAIStreamResponse();
      }
      if (typeof aiMod.toAIStreamResponse === 'function') {
        return aiMod.toAIStreamResponse(result);
      }
      // Fallback: collect text (not ideal; should stream in real env)
      const text = await result.text();
      return new NextResponse(text, { status: 200, headers: { 'content-type': 'text/plain' } });
    } catch (e: any) {
      return NextResponse.json(
        {
          error: 'AI SDK or provider not available',
          detail: String(e?.message || e),
        },
        { status: 501 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Bad request', detail: String(err?.message || err) }, { status: 400 });
  }
}

function buildSystemPrompt(context?: any) {
  const base = `You are BarGuru, an expert bar program assistant. Generate on-brand cocktails to use dead stock and fit venue style.
Respond with structured, bartender-friendly details and clear, measurable ingredients.`;
  if (!context) return base;
  try {
    const ctx = ContextSchema.parse(context);
    const parts: string[] = [];
    if (ctx.venue?.type) parts.push(`Venue Type: ${ctx.venue.type}`);
    if (ctx.barProgram?.style) parts.push(`Program Style: ${ctx.barProgram.style}`);
    if (ctx.cuisineStyle?.length) parts.push(`Cuisine: ${ctx.cuisineStyle.join(', ')}`);
    if (ctx.theme) parts.push(`Theme: ${ctx.theme}`);
    if (ctx.costTargets?.maxCostPerCocktail) parts.push(`Max Cost: ${ctx.costTargets.maxCostPerCocktail}`);
    if (ctx.inventory?.length) parts.push(`Inventory: ${ctx.inventory.map((i) => i.name).join(', ')}`);
    return base + '\n' + parts.join('\n');
  } catch {
    return base;
  }
}

