import type { CocktailInput, GenerateCocktail } from "@/schemas/cocktailSchemas"

export function buildImageRequestKey(
  cocktail: GenerateCocktail,
  inputs: CocktailInput | null,
) {
  return JSON.stringify({
    name: cocktail.name,
    description: cocktail.description,
    garnish: cocktail.garnish,
    glass: cocktail.glass,
    tags: cocktail.tags,
    primaryIngredient: inputs?.primaryIngredient ?? "",
    theme: inputs?.theme ?? "",
    cuisine: inputs?.cuisine ?? "",
    type: inputs?.type ?? "",
  })
}

export function canGenerateImage(
  cocktail: Partial<GenerateCocktail> | undefined,
): cocktail is GenerateCocktail {
  return Boolean(
    cocktail &&
      cocktail.name &&
      cocktail.description &&
      Array.isArray(cocktail.ingredients) &&
      cocktail.ingredients.length > 0 &&
      cocktail.garnish &&
      cocktail.glass &&
      Array.isArray(cocktail.tags) &&
      cocktail.tags.length > 0,
  )
}
