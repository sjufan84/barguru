"use client"

import { experimental_useObject as useObject } from "@ai-sdk/react"
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import type { CocktailInput, GenerateCocktail } from "@/schemas/cocktailSchemas"
import { generateCocktailSchema } from "@/schemas/cocktailSchemas"
import { GeneratedCocktailCard } from "@/components/cocktails/generated-cocktail-card"
import { ModeToggle } from "@/components/themes/mode-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type IngredientOption = {
  value: string
  label: string
  category: string
}

const ingredientOptions: IngredientOption[] = [
  { value: "vodka", label: "Vodka", category: "Base Spirits" },
  { value: "london-dry-gin", label: "London Dry Gin", category: "Base Spirits" },
  { value: "old-tom-gin", label: "Old Tom Gin", category: "Base Spirits" },
  { value: "blanco-tequila", label: "Blanco Tequila", category: "Base Spirits" },
  { value: "reposado-tequila", label: "Reposado Tequila", category: "Base Spirits" },
  { value: "anejo-tequila", label: "Anejo Tequila", category: "Base Spirits" },
  { value: "mezcal", label: "Mezcal", category: "Base Spirits" },
  { value: "light-rum", label: "Light Rum", category: "Base Spirits" },
  { value: "aged-rum", label: "Aged Rum", category: "Base Spirits" },
  { value: "dark-rum", label: "Dark Rum", category: "Base Spirits" },
  { value: "jamaican-rum", label: "Jamaican Rum", category: "Base Spirits" },
  { value: "rhum-agricole", label: "Rhum Agricole", category: "Base Spirits" },
  { value: "cachaca", label: "Cachaca", category: "Base Spirits" },
  { value: "bourbon", label: "Bourbon", category: "Base Spirits" },
  { value: "rye-whiskey", label: "Rye Whiskey", category: "Base Spirits" },
  { value: "irish-whiskey", label: "Irish Whiskey", category: "Base Spirits" },
  { value: "scotch-whisky", label: "Scotch Whisky", category: "Base Spirits" },
  { value: "japanese-whisky", label: "Japanese Whisky", category: "Base Spirits" },
  { value: "canadian-whisky", label: "Canadian Whisky", category: "Base Spirits" },
  { value: "brandy", label: "Brandy", category: "Base Spirits" },
  { value: "cognac", label: "Cognac", category: "Base Spirits" },
  { value: "armagnac", label: "Armagnac", category: "Base Spirits" },
  { value: "pisco", label: "Pisco", category: "Base Spirits" },
  { value: "aperol", label: "Aperol", category: "Liqueurs & Cordials" },
  { value: "campari", label: "Campari", category: "Liqueurs & Cordials" },
  { value: "amaro-averna", label: "Amaro Averna", category: "Liqueurs & Cordials" },
  { value: "amaro-nonino", label: "Amaro Nonino", category: "Liqueurs & Cordials" },
  { value: "fernet-branca", label: "Fernet-Branca", category: "Liqueurs & Cordials" },
  { value: "cynar", label: "Cynar", category: "Liqueurs & Cordials" },
  { value: "green-chartreuse", label: "Green Chartreuse", category: "Liqueurs & Cordials" },
  { value: "yellow-chartreuse", label: "Yellow Chartreuse", category: "Liqueurs & Cordials" },
  { value: "benedictine", label: "Benedictine", category: "Liqueurs & Cordials" },
  { value: "maraschino-liqueur", label: "Maraschino Liqueur", category: "Liqueurs & Cordials" },
  { value: "velvet-falernum", label: "Velvet Falernum", category: "Liqueurs & Cordials" },
  { value: "elderflower-liqueur", label: "Elderflower Liqueur", category: "Liqueurs & Cordials" },
  { value: "orange-liqueur", label: "Orange Liqueur / Triple Sec", category: "Liqueurs & Cordials" },
  { value: "coffee-liqueur", label: "Coffee Liqueur", category: "Liqueurs & Cordials" },
  { value: "creme-de-cacao", label: "Creme de Cacao", category: "Liqueurs & Cordials" },
  { value: "creme-de-cassis", label: "Creme de Cassis", category: "Liqueurs & Cordials" },
  { value: "absinthe", label: "Absinthe / Pastis", category: "Liqueurs & Cordials" },
  { value: "amaretto", label: "Amaretto", category: "Liqueurs & Cordials" },
  { value: "limoncello", label: "Limoncello", category: "Liqueurs & Cordials" },
  { value: "sweet-vermouth", label: "Sweet Vermouth", category: "Fortified & Aperitifs" },
  { value: "dry-vermouth", label: "Dry Vermouth", category: "Fortified & Aperitifs" },
  { value: "blanc-vermouth", label: "Blanc Vermouth", category: "Fortified & Aperitifs" },
  { value: "lillet-blanc", label: "Lillet Blanc", category: "Fortified & Aperitifs" },
  { value: "cocchi-americano", label: "Cocchi Americano", category: "Fortified & Aperitifs" },
  { value: "fino-sherry", label: "Fino Sherry", category: "Fortified & Aperitifs" },
  { value: "amontillado-sherry", label: "Amontillado Sherry", category: "Fortified & Aperitifs" },
  { value: "oloroso-sherry", label: "Oloroso Sherry", category: "Fortified & Aperitifs" },
  { value: "px-sherry", label: "Pedro Ximenez Sherry", category: "Fortified & Aperitifs" },
  { value: "ruby-port", label: "Ruby Port", category: "Fortified & Aperitifs" },
  { value: "tawny-port", label: "Tawny Port", category: "Fortified & Aperitifs" },
  { value: "madeira", label: "Madeira", category: "Fortified & Aperitifs" },
  { value: "sweet-marsala", label: "Sweet Marsala", category: "Fortified & Aperitifs" },
  { value: "orgeat", label: "Orgeat Syrup", category: "Syrups & Shrubs" },
  { value: "demerara-syrup", label: "Demerara Syrup", category: "Syrups & Shrubs" },
  { value: "honey-syrup", label: "Honey Syrup", category: "Syrups & Shrubs" },
  { value: "ginger-syrup", label: "Ginger Syrup", category: "Syrups & Shrubs" },
  { value: "grenadine", label: "Grenadine", category: "Syrups & Shrubs" },
  { value: "pineapple-shrub", label: "Pineapple Shrub", category: "Syrups & Shrubs" },
  { value: "berry-shrub", label: "Seasonal Berry Shrub", category: "Syrups & Shrubs" },
  { value: "apple-cider-shrub", label: "Apple Cider Shrub", category: "Syrups & Shrubs" },
  { value: "chamomile-syrup", label: "Chamomile Syrup", category: "Syrups & Shrubs" },
  { value: "lavender-syrup", label: "Lavender Syrup", category: "Syrups & Shrubs" },
  { value: "cold-brew", label: "Cold Brew Concentrate", category: "Mixers & NA" },
  { value: "espresso", label: "Espresso Concentrate", category: "Mixers & NA" },
  { value: "matcha", label: "Matcha Elixir", category: "Mixers & NA" },
  { value: "chai-syrup", label: "Chai Syrup", category: "Mixers & NA" },
  { value: "coconut-water", label: "Coconut Water Reduction", category: "Mixers & NA" },
  { value: "kombucha", label: "House Kombucha", category: "Mixers & NA" },
  { value: "tonic-syrup", label: "Tonic Syrup", category: "Mixers & NA" },
  { value: "bitters-blend", label: "Bitters Blend / Tincture", category: "Mixers & NA" },
]

const ingredientCategories = Array.from(
  new Set(ingredientOptions.map((option) => option.category)),
)

const ingredientLabelMap = ingredientOptions.reduce<Record<string, string>>(
  (accumulator, option) => {
    accumulator[option.value] = option.label
    return accumulator
  },
  {},
)

const OTHER_INGREDIENT_VALUE = "other"

type CocktailFormState = {
  primaryIngredientSelection: string
  primaryIngredientCustom: string
  theme: string
  cuisine?: string
  type: CocktailInput["type"]
}

const initialFormState: CocktailFormState = {
  primaryIngredientSelection: "",
  primaryIngredientCustom: "",
  theme: "",
  cuisine: "",
  type: "classic",
}

const typeOptions: Array<{ value: CocktailInput["type"]; label: string }> = [
  { value: "classic", label: "Classic" },
  { value: "standard", label: "Standard" },
  { value: "craft", label: "Craft" },
]

function formatServiceStyle(value: CocktailInput["type"]) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

type CocktailImageState =
  | { status: "idle"; url?: undefined; alt?: undefined; error?: undefined }
  | { status: "loading"; url?: undefined; alt?: undefined; error?: undefined }
  | { status: "ready"; url: string; alt: string; error?: undefined }
  | { status: "error"; url?: undefined; alt?: undefined; error: string }

export default function HomePage() {
  const [formState, setFormState] = useState<CocktailFormState>(initialFormState)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [lastSubmittedInputs, setLastSubmittedInputs] =
    useState<CocktailInput | null>(null)
  const generatedCardRef = useRef<HTMLDivElement>(null)
  const previousIsLoading = useRef(false)
  const [imageState, setImageState] = useState<CocktailImageState>({
    status: "idle",
  })
  const imageRequestKeyRef = useRef<string | null>(null)
  const imageRequestIdRef = useRef(0)
  const imageAbortRef = useRef<AbortController | null>(null)
  const [isFormCollapsed, setIsFormCollapsed] = useState(false)
  const [hasUserToggledForm, setHasUserToggledForm] = useState(false)

  const handleManualCollapse = useCallback((next: boolean) => {
    setIsFormCollapsed(next)
    setHasUserToggledForm(true)
  }, [])

  const resetFormCollapsePreferences = useCallback(() => {
    setIsFormCollapsed(false)
    setHasUserToggledForm(false)
  }, [])

  const {
    object: generatedCocktail,
    submit,
    isLoading,
    stop,
    error,
  } = useObject({
    api: "/api/generate-cocktail",
    schema: generateCocktailSchema,
  })

  useEffect(() => {
    return () => {
      imageAbortRef.current?.abort()
    }
  }, [])

  const normalizedError =
    error instanceof Error ? error : error ? new Error(String(error)) : null

  const startImageRequest = useCallback(
    (
      cocktail: GenerateCocktail,
      inputs: CocktailInput | null,
      options?: { force?: boolean },
    ) => {
      const force = options?.force ?? false
      const requestKey = buildImageRequestKey(cocktail, inputs)
      if (!force && imageRequestKeyRef.current === requestKey) {
        return
      }

      imageAbortRef.current?.abort()

      imageRequestKeyRef.current = requestKey
      const controller = new AbortController()
      imageAbortRef.current = controller
      const requestId = ++imageRequestIdRef.current

      setImageState({ status: "loading" })

      ;(async () => {
        try {
          const response = await fetch("/api/generate-cocktail-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ cocktail, inputs: inputs ?? undefined }),
            signal: controller.signal,
          })

          const text = await response.text()

          if (!response.ok) {
            let message = "Image generation failed."
            try {
              const parsed = JSON.parse(text) as { error?: string }
              if (parsed?.error) {
                message = parsed.error
              }
            } catch {
              // ignore parsing errors
            }
            throw new Error(message)
          }

          let payload: { imageUrl?: string } | null = null
          try {
            payload = JSON.parse(text)
          } catch {
            // ignore parsing errors
          }

          if (imageRequestIdRef.current !== requestId) {
            return
          }

          if (!payload?.imageUrl) {
            throw new Error("Image data was missing from the response.")
          }

          const alt = `Concept image for the ${cocktail.name} cocktail`
          setImageState({ status: "ready", url: payload.imageUrl, alt })
        } catch (imageError) {
          if (controller.signal.aborted || imageRequestIdRef.current !== requestId) {
            return
          }

          const message =
            imageError instanceof Error
              ? imageError.message
              : "Image generation failed."
          setImageState({ status: "error", error: message })
        } finally {
          if (imageAbortRef.current === controller) {
            imageAbortRef.current = null
          }
        }
      })()
    },
    [],
  )

  const handleRetryImage = useCallback(() => {
    if (!lastSubmittedInputs || !canGenerateImage(generatedCocktail as Partial<GenerateCocktail> | undefined)) {
      return
    }

    startImageRequest(generatedCocktail as GenerateCocktail, lastSubmittedInputs, { force: true })
  }, [generatedCocktail, lastSubmittedInputs, startImageRequest])

  const resolvedPrimaryIngredient = useMemo(() => {
    if (!formState.primaryIngredientSelection.trim()) {
      return ""
    }

    if (formState.primaryIngredientSelection === OTHER_INGREDIENT_VALUE) {
      return formState.primaryIngredientCustom.trim()
    }

    return ingredientLabelMap[formState.primaryIngredientSelection] ?? ""
  }, [formState.primaryIngredientSelection, formState.primaryIngredientCustom])

  const isGenerateDisabled = useMemo(
    () =>
      !resolvedPrimaryIngredient || !formState.theme.trim() || isLoading,
    [resolvedPrimaryIngredient, formState.theme, isLoading],
  )

  const showCollapsedBrief = Boolean(
    isFormCollapsed && lastSubmittedInputs && !isLoading,
  )

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      isLoading &&
      !previousIsLoading.current &&
      window.innerWidth < 1024
    ) {
      generatedCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }

    previousIsLoading.current = isLoading
  }, [isLoading])

  useEffect(() => {
    if (
      !isLoading &&
      generatedCocktail?.name &&
      lastSubmittedInputs &&
      !hasUserToggledForm
    ) {
      setIsFormCollapsed(true)
    }
  }, [generatedCocktail, hasUserToggledForm, isLoading, lastSubmittedInputs])

  useEffect(() => {
    if (isLoading || !lastSubmittedInputs || !canGenerateImage(generatedCocktail as Partial<GenerateCocktail> | undefined)) {
      return
    }

    startImageRequest(generatedCocktail as GenerateCocktail, lastSubmittedInputs)
  }, [generatedCocktail, isLoading, lastSubmittedInputs, startImageRequest])

  function validateInputs(state: CocktailFormState) {
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

  function handleChange<K extends keyof CocktailFormState>(
    key: K,
    value: CocktailFormState[K],
  ) {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "primaryIngredientSelection" &&
      (value as CocktailFormState["primaryIngredientSelection"]) !==
        OTHER_INGREDIENT_VALUE
        ? { primaryIngredientCustom: "" }
        : {}),
    }))

    setFormErrors((prev) => {
      const next = { ...prev }
      delete next[key as string]

      if (key === "primaryIngredientSelection") {
        const selectionValue =
          value as CocktailFormState["primaryIngredientSelection"]
        if (selectionValue !== OTHER_INGREDIENT_VALUE) {
          delete next.primaryIngredientCustom
        }
      }

      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors = validateInputs(formState)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const primaryIngredient = resolvedPrimaryIngredient.trim()
    if (!primaryIngredient) {
      return
    }

    const trimmedTheme = formState.theme.trim()
    const trimmedCuisine = formState.cuisine?.trim()

    const input: CocktailInput = {
      primaryIngredient,
      theme: trimmedTheme,
      cuisine: trimmedCuisine ? trimmedCuisine : undefined,
      type: formState.type,
    }

    resetFormCollapsePreferences()
    imageAbortRef.current?.abort()
    imageRequestIdRef.current += 1
    imageRequestKeyRef.current = null
    setImageState({ status: "idle" })
    setLastSubmittedInputs(input)

    try {
      await submit(input)
    } catch (submissionError) {
      console.error("Cocktail generation failed", submissionError)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(188,164,129,0.18),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(78,61,45,0.45),transparent_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(255,250,244,0.75),transparent_40%)] dark:bg-[linear-gradient(to_bottom,_rgba(28,22,18,0.75),transparent_45%)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 pb-16 pt-12 sm:px-8 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
              BarGuru
            </p>
            <h1 className="text-xl font-semibold sm:text-2xl">
              Ingredient-first cocktail studio
            </h1>
          </div>
          <ModeToggle />
        </header>

        <section className="mt-10 flex flex-col gap-4 sm:mt-14">
          <span className="inline-flex w-max items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-foreground">
            Jump right in
          </span>
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Make more of what you already have.
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              Enter the ingredient you want to feature, the vibe you need to match,
              and let BarGuru sketch a service-ready idea you can riff on.
            </p>
          </div>
        </section>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {showCollapsedBrief && lastSubmittedInputs ? (
            <CollapsedBriefCard
              inputs={lastSubmittedInputs}
              onExpand={() => handleManualCollapse(false)}
            />
          ) : (
            <form
              onSubmit={handleSubmit}
              aria-busy={isLoading}
              className={`relative overflow-hidden rounded-3xl border border-border/70 bg-card/95 p-6 shadow-lg shadow-black/5 backdrop-blur-sm transition duration-200 sm:p-8 ${
                isLoading ? "ring-1 ring-primary/30" : ""
              }`}
            >
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(205,184,150,0.22),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(92,71,53,0.35),transparent_60%)]" />
            {isLoading ? (
              <div
                aria-live="polite"
                className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-xs text-primary sm:text-sm"
              >
                <div className="space-y-1">
                  <p className="font-medium uppercase tracking-[0.28em]">
                    Generating
                  </p>
                  <p className="text-[0.7rem] uppercase tracking-[0.24em] text-primary/80">
                    Crafting your cocktail brief
                  </p>
                </div>
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                </span>
              </div>
            ) : null}

            {lastSubmittedInputs ? (
              <div
                className={`mb-6 space-y-3 rounded-2xl border border-border/60 bg-background/85 p-4 shadow-inner shadow-black/5 transition duration-200 ${
                  isLoading ? "border-primary/40 shadow-primary/10" : ""
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    Current brief
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleManualCollapse(true)}
                    className="text-xs"
                  >
                    Hide brief
                  </Button>
                </div>
                <BriefChips inputs={lastSubmittedInputs} />
              </div>
            ) : null}

            <fieldset
              aria-disabled={isLoading}
              className="grid gap-6"
              disabled={isLoading}
            >
              <div className="space-y-2">
                <Label htmlFor="primaryIngredientSelection">Primary ingredient</Label>
                <div className="relative">
                  <select
                    id="primaryIngredientSelection"
                    name="primaryIngredientSelection"
                    value={formState.primaryIngredientSelection}
                    onChange={(event) =>
                      handleChange("primaryIngredientSelection", event.target.value)
                    }
                    className="h-11 w-full appearance-none rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-invalid={Boolean(formErrors.primaryIngredientSelection)}
                    aria-describedby={
                      formErrors.primaryIngredientSelection
                        ? "primaryIngredientSelection-error"
                        : undefined
                    }
                  >
                    <option value="">Select an ingredient</option>
                    {ingredientCategories.map((category) => (
                      <optgroup key={category} label={category}>
                        {ingredientOptions
                          .filter((option) => option.category === category)
                          .map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                    <option value={OTHER_INGREDIENT_VALUE}>Other (specify)</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                    v
                  </span>
                </div>
                {formErrors.primaryIngredientSelection ? (
                  <p
                    id="primaryIngredientSelection-error"
                    className="text-sm text-destructive"
                  >
                    {formErrors.primaryIngredientSelection}
                  </p>
                ) : null}
              </div>

              {formState.primaryIngredientSelection === OTHER_INGREDIENT_VALUE ? (
                <div className="space-y-2">
                  <Label htmlFor="primaryIngredientCustom">Custom ingredient</Label>
                  <Input
                    id="primaryIngredientCustom"
                    name="primaryIngredientCustom"
                    placeholder="e.g. roasted pineapple shrub"
                    value={formState.primaryIngredientCustom}
                    onChange={(event) =>
                      handleChange("primaryIngredientCustom", event.target.value)
                    }
                    aria-invalid={Boolean(formErrors.primaryIngredientCustom)}
                    aria-describedby={
                      formErrors.primaryIngredientCustom
                        ? "primaryIngredientCustom-error"
                        : undefined
                    }
                  />
                  {formErrors.primaryIngredientCustom ? (
                    <p
                      id="primaryIngredientCustom-error"
                      className="text-sm text-destructive"
                    >
                      {formErrors.primaryIngredientCustom}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="theme">Mood or theme</Label>
                <Input
                  id="theme"
                  name="theme"
                  placeholder="e.g. tropical sunset, spirit-forward"
                  value={formState.theme}
                  onChange={(event) => handleChange("theme", event.target.value)}
                  aria-invalid={Boolean(formErrors.theme)}
                  aria-describedby={formErrors.theme ? "theme-error" : undefined}
                />
                {formErrors.theme ? (
                  <p id="theme-error" className="text-sm text-destructive">
                    {formErrors.theme}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuisine">
                  Cuisine pairing <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="cuisine"
                  name="cuisine"
                  placeholder="e.g. coastal Mexican, late-night snacks"
                  value={formState.cuisine ?? ""}
                  onChange={(event) => handleChange("cuisine", event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Service style</Label>
                <div className="relative">
                  <select
                    id="type"
                    name="type"
                    value={formState.type}
                    onChange={(event) =>
                      handleChange("type", event.target.value as CocktailInput["type"])
                    }
                    className="h-11 w-full appearance-none rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                    v
                  </span>
                </div>
              </div>
            </fieldset>

            <Separator className="my-6 bg-border/80" />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                We will turn this prompt into a spec draft you can share with the team.
              </p>
              <Button
                type="submit"
                disabled={isGenerateDisabled}
                className="min-w-[10rem]"
              >
                {isLoading ? "Gathering ideas..." : "Generate cocktail"}
              </Button>
            </div>
          </form>
          )}

          <aside
            ref={generatedCardRef}
            className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card/95 p-6 shadow-inner shadow-black/5 backdrop-blur-sm sm:p-8"
          >
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_right,_rgba(196,175,144,0.2),transparent_55%)] dark:bg-[radial-gradient(circle_at_bottom_right,_rgba(84,67,51,0.35),transparent_65%)]" />
            <div className="space-y-6">
              <GeneratedCocktailCard
                cocktail={generatedCocktail as Partial<GenerateCocktail> | undefined}
                inputs={lastSubmittedInputs}
                isLoading={isLoading}
                onStop={stop}
                error={normalizedError}
                imageStatus={imageState.status}
                imageUrl={imageState.status === "ready" ? imageState.url : undefined}
                imageAlt={imageState.status === "ready" ? imageState.alt : undefined}
                imageError={imageState.status === "error" ? imageState.error : null}
                onRetryImage={handleRetryImage}
              />
            </div>
            <div className="mt-8 rounded-xl border border-border/60 bg-secondary/60 p-4 text-xs text-secondary-foreground">
              Tip: try contrasting inputs like &quot;charred citrus&quot; with &quot;after-dinner&quot; to
              stretch your menu in fresh directions.
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

function CollapsedBriefCard({
  inputs,
  onExpand,
}: {
  inputs: CocktailInput
  onExpand: () => void
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/95 p-6 shadow-lg shadow-black/5 backdrop-blur-sm sm:p-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(205,184,150,0.22),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(92,71,53,0.35),transparent_60%)]" />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Current brief
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={onExpand} className="text-xs">
            Edit brief
          </Button>
        </div>
        <BriefChips inputs={inputs} />
        <p className="text-xs text-muted-foreground">
          Your prompt stays pinned here. Expand to tweak details for the next round.
        </p>
      </div>
    </div>
  )
}

function BriefChips({ inputs }: { inputs: CocktailInput }) {
  const chips = [
    { label: "Ingredient", value: inputs.primaryIngredient },
    { label: "Theme", value: inputs.theme },
    ...(inputs.cuisine ? [{ label: "Cuisine", value: inputs.cuisine }] : []),
    { label: "Service", value: formatServiceStyle(inputs.type) },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map(({ label, value }) => (
        <BriefChip key={`${label}-${value}`} label={label} value={value} />
      ))}
    </div>
  )
}

function BriefChip({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs text-secondary-foreground">
      <span className="uppercase tracking-[0.24em] text-[0.65rem]">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </span>
  )
}

function buildImageRequestKey(
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

function canGenerateImage(
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
