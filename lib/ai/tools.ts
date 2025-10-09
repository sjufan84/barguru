import { z } from 'zod';
import {
  CocktailSchema,
  type Cocktail,
  AdjustSweetnessInput,
  SwapIngredientInput,
  ChangeStyleInput,
  ScaleBatchInput,
  FitCostInput,
} from './schemas';

// Deterministic, pure transforms over Cocktail objects.

export function adjustSweetness(cocktail: Cocktail, args: z.infer<typeof AdjustSweetnessInput>): Cocktail {
  const fp = cocktail.flavorProfile;
  const next = { ...cocktail, flavorProfile: { ...fp, sweetness: clamp(fp.sweetness + args.delta, 0, 5) } };
  return CocktailSchema.parse(next);
}

export function swapIngredient(cocktail: Cocktail, args: z.infer<typeof SwapIngredientInput>): Cocktail {
  const ing = cocktail.ingredients.map((i) => (i.name.toLowerCase() === args.from.toLowerCase() ? { ...i, name: args.to } : i));
  const fields = swapInLists(cocktail, args.from, args.to);
  const next = { ...cocktail, ...fields, ingredients: ing };
  return CocktailSchema.parse(next);
}

export function changeStyle(cocktail: Cocktail, args: z.infer<typeof ChangeStyleInput>): Cocktail {
  const preset = args.preset.toLowerCase();
  const style = { ...cocktail.style };
  if (preset.includes('speakeasy')) style.venueType = 'speakeasy';
  if (preset.includes('chain') || preset.includes("chili")) style.venueType = 'casual-chain';
  if (preset.includes('tiki')) style.venueType = 'tiki';
  const next = { ...cocktail, style };
  return CocktailSchema.parse(next);
}

export function scaleBatch(cocktail: Cocktail, args: z.infer<typeof ScaleBatchInput>): Cocktail {
  const f = args.factor;
  const ing = cocktail.ingredients.map((i) => ({ ...i, amount: Math.round(i.amount * f * 100) / 100 }));
  const y = { ...cocktail.yield, volumeMl: Math.round(cocktail.yield.volumeMl * f) };
  const next = { ...cocktail, ingredients: ing, yield: y };
  return CocktailSchema.parse(next);
}

export function fitCost(cocktail: Cocktail, args: z.infer<typeof FitCostInput>): Cocktail {
  // Placeholder: In phase 2, adjust ingredients/amounts by cost table.
  const next = { ...cocktail, cost: { ...cocktail.cost, targetCostPerCocktail: args.target } };
  return CocktailSchema.parse(next);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function swapInLists(c: Cocktail, from: string, to: string) {
  const swap = (arr: string[]) => arr.map((x) => (eq(x, from) ? to : x));
  return {
    secondarySpirits: swap(c.secondarySpirits),
    modifiers: swap(c.modifiers),
    sweeteners: swap(c.sweeteners),
    acids: swap(c.acids),
    bitters: swap(c.bitters),
  };
}

function eq(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

// Tool registry skeleton (to be wired with Vercel AI SDK tool calling)
export const toolSchemas = {
  adjustSweetness: AdjustSweetnessInput,
  swapIngredient: SwapIngredientInput,
  changeStyle: ChangeStyleInput,
  scaleBatch: ScaleBatchInput,
  fitCost: FitCostInput,
};

export const toolFns = {
  adjustSweetness,
  swapIngredient,
  changeStyle,
  scaleBatch,
  fitCost,
};

