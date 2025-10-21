import { ChevronDown } from "lucide-react"
import type { FormEvent, ReactNode } from "react"

import type { CocktailInput } from "@/schemas/cocktailSchemas"

import {
  ingredientCategories,
  ingredientOptions,
  OTHER_INGREDIENT_VALUE,
} from "@/lib/cocktail-ingredients"
import {
  type CocktailFormState,
  typeOptions,
} from "@/lib/cocktail-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

import { BriefChips } from "./brief-chips"

type CocktailRequestFormProps = {
  formState: CocktailFormState
  formErrors: Record<string, string>
  isLoading: boolean
  lastSubmittedInputs: CocktailInput | null
  isSubmitDisabled: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onFieldChange: <K extends keyof CocktailFormState>(
    key: K,
    value: CocktailFormState[K],
  ) => void
  onHideBrief?: () => void
}

export function CocktailRequestForm({
  formState,
  formErrors,
  isLoading,
  lastSubmittedInputs,
  isSubmitDisabled,
  onSubmit,
  onFieldChange,
  onHideBrief,
}: CocktailRequestFormProps) {
  return (
    <form
      onSubmit={onSubmit}
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
            <p className="font-medium uppercase tracking-[0.28em]">Generating</p>
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
            {onHideBrief ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onHideBrief}
                className="text-xs"
              >
                Hide brief
              </Button>
            ) : null}
          </div>
          <BriefChips inputs={lastSubmittedInputs} />
        </div>
      ) : null}

      <p className="mb-6 text-sm text-muted-foreground">
        Guide us through the build: choose a hero ingredient, set the mood, then add any service specifics. Everything except cuisine is required.
      </p>

      <fieldset aria-disabled={isLoading} className="grid gap-6" disabled={isLoading}>
        <FormSection
          step={1}
          title="Choose your hero ingredient"
          description="Pick the spirit or element you want to spotlight so we can pair flavors that complement it."
        >
          <div className="space-y-2">
            <Label htmlFor="primaryIngredientSelection">Primary ingredient</Label>
            <div className="relative">
              <select
                id="primaryIngredientSelection"
                name="primaryIngredientSelection"
                value={formState.primaryIngredientSelection}
                onChange={(event) =>
                  onFieldChange("primaryIngredientSelection", event.target.value)
                }
                className="h-11 w-full appearance-none rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              <ChevronDown className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-xs text-muted-foreground">
              Unsure where it fits? Choose “Other” and describe the ingredient or prep you have ready.
            </p>
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
                  onFieldChange("primaryIngredientCustom", event.target.value)
                }
                aria-invalid={Boolean(formErrors.primaryIngredientCustom)}
                aria-describedby={
                  formErrors.primaryIngredientCustom
                    ? "primaryIngredientCustom-error"
                    : undefined
                }
              />
              <p className="text-xs text-muted-foreground">
                Be as specific as you like—include prep style, infusions, or finishing notes.
              </p>
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
        </FormSection>

        <FormSection
          step={2}
          title="Set the vibe"
          description="Tell us the mood, occasion, or guest you&apos;re designing for so we can match the energy."
        >
          <div className="space-y-2">
            <Label htmlFor="theme">Mood or theme</Label>
            <Input
              id="theme"
              name="theme"
              placeholder="e.g. tropical sunset, spirit-forward"
              value={formState.theme}
              onChange={(event) => onFieldChange("theme", event.target.value)}
              aria-invalid={Boolean(formErrors.theme)}
              aria-describedby={formErrors.theme ? "theme-error" : undefined}
            />
            <p className="text-xs text-muted-foreground">
              Include any flavor cues, guest personas, or service moments (pre-dinner, low ABV, celebratory, etc.).
            </p>
            {formErrors.theme ? (
              <p id="theme-error" className="text-sm text-destructive">
                {formErrors.theme}
              </p>
            ) : null}
          </div>
        </FormSection>

        <FormSection
          step={3}
          title="Dial in the service details"
          description="Optional extras help us tailor glassware and prep to your program."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cuisine">
                Cuisine pairing <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="cuisine"
                name="cuisine"
                placeholder="e.g. coastal Mexican, late-night snacks"
                value={formState.cuisine ?? ""}
                onChange={(event) => onFieldChange("cuisine", event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Useful for pairing menus or service moments tied to food.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Service style</Label>
              <div className="relative">
                <select
                  id="type"
                  name="type"
                  value={formState.type}
                  onChange={(event) =>
                    onFieldChange("type", event.target.value as CocktailInput["type"])
                  }
                  className="h-11 w-full appearance-none rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="text-xs text-muted-foreground">
                Choose how it will be presented at service to match dilution and build recommendations.
              </p>
            </div>
          </div>
        </FormSection>
      </fieldset>

      <Separator className="my-6 bg-border/80" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          We&apos;ll turn this brief into a spec draft, complete with ingredients, method, and talking points.
        </p>
        <Button type="submit" disabled={isSubmitDisabled} className="min-w-[11rem] rounded-full">
          {isLoading ? "Gathering ideas..." : "Generate cocktail card"}
        </Button>
      </div>
    </form>
  )
}

function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: number
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-background/85 p-5 shadow-inner shadow-black/5">
      <header className="space-y-2">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {step}
          </span>
          <div className="space-y-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Step {step}
            </p>
            <h2 className="text-base font-semibold text-foreground sm:text-lg">{title}</h2>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
