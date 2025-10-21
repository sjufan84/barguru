import { z } from "zod"

export const cocktailInputSchema = z.object({
  primaryIngredient: z
    .string()
    .min(1)
    .describe("The primary ingredient of the cocktail"),
  theme: z.string().min(1).describe("The theme of the cocktail"),
  cuisine: z
    .string()
    .optional()
    .describe("The cuisine to pair with the cocktail"),
  type: z.enum(["classic", "standard", "craft"]).describe("The type of cocktail"),
})

export const generateCocktailSchema = z.object({
  name: z
    .string()
    .describe("The name of the cocktail.  Should be creative and unique."),
  description: z
    .string()
    .describe(
      "The description of the cocktail.  Should be a short description of the cocktail.",
    ),
  ingredients: z.array(z.string()).describe("The ingredients of the cocktail."),
  instructions: z.array(z.string()).describe("The instructions to make the cocktail."),
  tags: z.array(z.string()).describe("The tags of the cocktail."),
  garnish: z.string().describe("The garnish of the cocktail."),
  glass: z.string().describe("The glass to serve the cocktail in."),
  notes: z.string().describe("Notes regarding technique, preparation, etc."),
})

export const cocktailSchema = z.object({
  cocktailInputs: cocktailInputSchema,
  generatedCocktail: generateCocktailSchema,
})

export const cocktailImageRequestSchema = z.object({
  cocktail: generateCocktailSchema,
  inputs: cocktailInputSchema.optional(),
})

export type CocktailInput = z.infer<typeof cocktailInputSchema>
export type GenerateCocktail = z.infer<typeof generateCocktailSchema>
export type Cocktail = z.infer<typeof cocktailSchema>
export type CocktailImageRequest = z.infer<typeof cocktailImageRequestSchema>

export const savedCocktailSchema = z.object({
  id: z.number(),
  name: z.string(),
  cocktail: generateCocktailSchema,
  inputs: cocktailInputSchema.nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const savedCocktailListSchema = z.array(savedCocktailSchema)

export type SavedCocktail = z.infer<typeof savedCocktailSchema>
