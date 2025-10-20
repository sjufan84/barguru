import type { CocktailInput } from "@/schemas/cocktailSchemas"

import { formatServiceStyle } from "@/lib/cocktail-form"

type BriefChipsProps = {
  inputs: CocktailInput
}

export function BriefChips({ inputs }: BriefChipsProps) {
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

type BriefChipProps = {
  label: string
  value: string
}

function BriefChip({ label, value }: BriefChipProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs text-secondary-foreground">
      <span className="uppercase tracking-[0.24em] text-[0.65rem]">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </span>
  )
}
