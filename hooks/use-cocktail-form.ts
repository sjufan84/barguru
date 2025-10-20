import { useCallback, useMemo, useState } from "react"

import type { CocktailInput } from "@/schemas/cocktailSchemas"

import {
  ingredientLabelMap,
  OTHER_INGREDIENT_VALUE,
} from "@/lib/cocktail-ingredients"
import {
  type CocktailFormState,
  initialFormState,
  validateCocktailForm,
} from "@/lib/cocktail-form"

export type UseCocktailFormResult = {
  formState: CocktailFormState
  formErrors: Record<string, string>
  resolvedPrimaryIngredient: string
  isSubmissionReady: boolean
  handleFieldChange: <K extends keyof CocktailFormState>(
    key: K,
    value: CocktailFormState[K],
  ) => void
  buildSubmissionInput: () => CocktailInput | null
  resetForm: (nextState?: CocktailFormState) => void
}

export function useCocktailForm(
  startingState: CocktailFormState = initialFormState,
): UseCocktailFormResult {
  const [formState, setFormState] = useState<CocktailFormState>(startingState)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const resolvedPrimaryIngredient = useMemo(() => {
    if (!formState.primaryIngredientSelection.trim()) {
      return ""
    }

    if (formState.primaryIngredientSelection === OTHER_INGREDIENT_VALUE) {
      return formState.primaryIngredientCustom.trim()
    }

    return ingredientLabelMap[formState.primaryIngredientSelection] ?? ""
  }, [
    formState.primaryIngredientCustom,
    formState.primaryIngredientSelection,
  ])

  const isSubmissionReady = useMemo(
    () => Boolean(resolvedPrimaryIngredient && formState.theme.trim()),
    [formState.theme, resolvedPrimaryIngredient],
  )

  const handleFieldChange = useCallback(
    <K extends keyof CocktailFormState>(key: K, value: CocktailFormState[K]) => {
      setFormState((previous) => {
        const nextState = { ...previous, [key]: value }
        if (
          key === "primaryIngredientSelection" &&
          (value as CocktailFormState["primaryIngredientSelection"]) !==
            OTHER_INGREDIENT_VALUE
        ) {
          nextState.primaryIngredientCustom = ""
        }
        return nextState
      })

      setFormErrors((previous) => {
        const nextErrors = { ...previous }
        delete nextErrors[key as string]

        if (key === "primaryIngredientSelection") {
          delete nextErrors.primaryIngredientCustom
        }

        return nextErrors
      })
    },
    [],
  )

  const buildSubmissionInput = useCallback(() => {
    const validationErrors = validateCocktailForm(formState)
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors)
      return null
    }

    const primaryIngredient = resolvedPrimaryIngredient.trim()
    if (!primaryIngredient) {
      return null
    }

    const trimmedTheme = formState.theme.trim()
    const trimmedCuisine = formState.cuisine?.trim()

    return {
      primaryIngredient,
      theme: trimmedTheme,
      cuisine: trimmedCuisine ? trimmedCuisine : undefined,
      type: formState.type,
    }
  }, [formState, resolvedPrimaryIngredient])

  const resetForm = useCallback((nextState?: CocktailFormState) => {
    setFormState(nextState ?? initialFormState)
    setFormErrors({})
  }, [])

  return {
    formState,
    formErrors,
    resolvedPrimaryIngredient,
    isSubmissionReady,
    handleFieldChange,
    buildSubmissionInput,
    resetForm,
  }
}
