# Schema Drafts (Zod) — Cocktail & Context

This document describes the intended fields for CocktailSchema and ContextSchema. Implementation will live in `lib/ai/schemas.ts`.

## CocktailSchema
- id: string (uuid)
- slug: string (kebab-case)
- name: string
- description: string
- story: string
- style:
  - venueType: 'casual-chain'|'speakeasy'|'hotel-bar'|'tiki'|'neighborhood'|'fine-dining'|string
  - menuContext: string
  - theme: string
  - cuisineTags: string[]
- baseSpirit: string
- secondarySpirits: string[]
- modifiers: string[]
- sweeteners: string[]
- acids: string[]
- bitters: string[]
- ingredients: Array<{
  name: string
  amount: number
  unit: 'ml'|'oz'|'dash'|'barspoon'|'tsp'|'drop'|'slice'|'piece'|string
  prepNote?: string
  optional?: boolean
}>
- method: {
  technique: 'shake'|'stir'|'build'|'blend'|'whip'|'throw'|'carbonate'
  steps: string[]
}
- glassware: string
- ice: string
- garnish: Array<{ name: string; prepNote?: string }>
- yield: { volumeMl: number; serves: number }
- abvEstimatePct?: number
- dilutionNote?: string
- cost: { currency: string; targetCostPerCocktail?: number; estimatedCostPerCocktail?: number }
- allergens: string[]
- substitutions: string[]
- variations: string[]
- flavorProfile: {
  sweetness: 0|1|2|3|4|5
  acidity: 0|1|2|3|4|5
  bitterness: 0|1|2|3|4|5
  body: 0|1|2|3|4|5
  aroma: string[]
  spice: string[]
  textureNotes: string[]
}
- difficulty: 'easy'|'medium'|'advanced'
- timeMinutes: number
- equipment: string[]
- imagePrompt: string
- imageUrl?: string
- imageAlt: string
- seo: {
  keywords: string[]
  jsonLd: object (schema.org Recipe)
}

## ContextSchema
- venue: {
  name?: string
  type?: string
  positioning?: string
  averageCheck?: number
  brandVoice?: string
}
- barProgram: {
  style?: string
  constraints?: string[]
  bannedIngredients?: string[]
}
- cuisineStyle?: string[]
- season?: string
- theme?: string
- inventory?: Array<{ name: string; amount?: number; unit?: string }>
- costTargets?: { currency: string; maxCostPerCocktail?: number }

## Tools (Function Calling)
- adjustSweetness: { delta: -2..+2 }
- swapIngredient: { from: string; to: string }
- changeStyle: { preset: string }
- scaleBatch: { factor: number }
- fitCost: { target: number }

