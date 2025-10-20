import type { CocktailInput } from "@/schemas/cocktailSchemas"

import { ingredientLabelMap, OTHER_INGREDIENT_VALUE } from "./cocktail-ingredients"

export type CocktailFormState = {
  primaryIngredientSelection: string
  primaryIngredientCustom: string
  theme: string
  cuisine?: string
  type: CocktailInput["type"]
}

export const initialFormState: CocktailFormState = {
  primaryIngredientSelection: "",
  primaryIngredientCustom: "",
  theme: "",
  cuisine: "",
  type: "classic",
}

export const typeOptions: Array<{ value: CocktailInput["type"]; label: string }> = [
  { value: "classic", label: "Classic" },
  { value: "standard", label: "Standard" },
  { value: "craft", label: "Craft" },
]

export function formatServiceStyle(value: CocktailInput["type"]) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function validateCocktailForm(state: CocktailFormState) {
  const errors: Record<string, string> = {}

  if (!state.primaryIngredientSelection.trim()) {
    errors.primaryIngredientSelection = "Select a primary ingredient."
  } else if (
    state.primaryIngredientSelection !== OTHER_INGREDIENT_VALUE &&
    !ingredientLabelMap[state.primaryIngredientSelection]
  ) {
    errors.primaryIngredientSelection = "Select a valid ingredient option."
  }

  if (state.primaryIngredientSelection === OTHER_INGREDIENT_VALUE) {
    if (!state.primaryIngredientCustom.trim()) {
      errors.primaryIngredientCustom =
        "Please describe the ingredient you want to feature."
    }
  }

  if (!state.theme.trim()) {
    errors.theme = "Theme is required."
  }

  return errors
}
