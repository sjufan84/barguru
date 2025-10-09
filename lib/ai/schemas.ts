import { z } from 'zod';

export const IngredientSchema = z.object({
  name: z.string().min(1),
  amount: z.number().nonnegative(),
  unit: z
    .enum(['ml', 'oz', 'dash', 'barspoon', 'tsp', 'drop', 'slice', 'piece'])
    .or(z.string().min(1)),
  prepNote: z.string().optional(),
  optional: z.boolean().optional(),
});

export const MethodSchema = z.object({
  technique: z.enum(['shake', 'stir', 'build', 'blend', 'whip', 'throw', 'carbonate']),
  steps: z.array(z.string().min(1)).min(1),
});

export const FlavorProfileSchema = z.object({
  sweetness: z.number().int().min(0).max(5),
  acidity: z.number().int().min(0).max(5),
  bitterness: z.number().int().min(0).max(5),
  body: z.number().int().min(0).max(5),
  aroma: z.array(z.string()).default([]),
  spice: z.array(z.string()).default([]),
  textureNotes: z.array(z.string()).default([]),
});

export const CocktailSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).optional(),
  name: z.string().min(1),
  description: z.string().min(1),
  story: z.string().default(''),
  style: z.object({
    venueType: z
      .enum(['casual-chain', 'speakeasy', 'hotel-bar', 'tiki', 'neighborhood', 'fine-dining'])
      .or(z.string().min(1)),
    menuContext: z.string().default(''),
    theme: z.string().default(''),
    cuisineTags: z.array(z.string()).default([]),
  }),
  baseSpirit: z.string().min(1),
  secondarySpirits: z.array(z.string()).default([]),
  modifiers: z.array(z.string()).default([]),
  sweeteners: z.array(z.string()).default([]),
  acids: z.array(z.string()).default([]),
  bitters: z.array(z.string()).default([]),
  ingredients: z.array(IngredientSchema).min(1),
  method: MethodSchema,
  glassware: z.string().min(1),
  ice: z.string().default(''),
  garnish: z.array(z.object({ name: z.string().min(1), prepNote: z.string().optional() })).default([]),
  yield: z.object({ volumeMl: z.number().nonnegative(), serves: z.number().int().positive() }),
  abvEstimatePct: z.number().nonnegative().optional(),
  dilutionNote: z.string().optional(),
  cost: z
    .object({
      currency: z.string().default('USD'),
      targetCostPerCocktail: z.number().optional(),
      estimatedCostPerCocktail: z.number().optional(),
    })
    .default({ currency: 'USD' }),
  allergens: z.array(z.string()).default([]),
  substitutions: z.array(z.string()).default([]),
  variations: z.array(z.string()).default([]),
  flavorProfile: FlavorProfileSchema,
  difficulty: z.enum(['easy', 'medium', 'advanced']).default('medium'),
  timeMinutes: z.number().int().nonnegative().default(5),
  equipment: z.array(z.string()).default([]),
  imagePrompt: z.string().default(''),
  imageUrl: z.string().url().optional(),
  imageAlt: z.string().default('Cocktail photo'),
  seo: z
    .object({
      keywords: z.array(z.string()).default([]),
      jsonLd: z.record(z.any()).default({}),
    })
    .default({ keywords: [], jsonLd: {} }),
});

export type Cocktail = z.infer<typeof CocktailSchema>;

export const ContextSchema = z.object({
  venue: z
    .object({
      name: z.string().optional(),
      type: z.string().optional(),
      positioning: z.string().optional(),
      averageCheck: z.number().optional(),
      brandVoice: z.string().optional(),
    })
    .default({}),
  barProgram: z
    .object({
      style: z.string().optional(),
      constraints: z.array(z.string()).optional(),
      bannedIngredients: z.array(z.string()).optional(),
    })
    .default({}),
  cuisineStyle: z.array(z.string()).optional(),
  season: z.string().optional(),
  theme: z.string().optional(),
  inventory: z.array(z.object({ name: z.string(), amount: z.number().optional(), unit: z.string().optional() })).optional(),
  costTargets: z.object({ currency: z.string(), maxCostPerCocktail: z.number().optional() }).optional(),
});

export type Context = z.infer<typeof ContextSchema>;

// Tool input schemas
export const AdjustSweetnessInput = z.object({ delta: z.number().int().min(-2).max(2) });
export const SwapIngredientInput = z.object({ from: z.string().min(1), to: z.string().min(1) });
export const ChangeStyleInput = z.object({ preset: z.string().min(1) });
export const ScaleBatchInput = z.object({ factor: z.number().positive() });
export const FitCostInput = z.object({ target: z.number().positive() });

export type AdjustSweetnessArgs = z.infer<typeof AdjustSweetnessInput>;
export type SwapIngredientArgs = z.infer<typeof SwapIngredientInput>;
export type ChangeStyleArgs = z.infer<typeof ChangeStyleInput>;
export type ScaleBatchArgs = z.infer<typeof ScaleBatchInput>;
export type FitCostArgs = z.infer<typeof FitCostInput>;
