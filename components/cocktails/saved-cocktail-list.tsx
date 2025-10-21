import { Bookmark, Loader2 } from "lucide-react"

import type { SavedCocktail } from "@/schemas/cocktailSchemas"
import { formatServiceStyle } from "@/lib/cocktail-form"
import { cn } from "@/lib/utils"

import { ScrollArea } from "@/components/ui/scroll-area"

type SavedCocktailListProps = {
  cocktails: SavedCocktail[]
  isLoading: boolean
  onSelect: (cocktail: SavedCocktail) => void
  selectedId?: number | null
}

export function SavedCocktailList({
  cocktails,
  isLoading,
  onSelect,
  selectedId,
}: SavedCocktailListProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-border/70 bg-card/95 p-5 shadow-inner shadow-black/5">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Your library
          </p>
          <h2 className="text-base font-semibold text-foreground sm:text-lg">Saved cocktails</h2>
        </div>
        <div className="rounded-full bg-secondary/60 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-secondary-foreground">
          {cocktails.length}
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-background/70 px-4 py-6 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading your saved pours…
        </div>
      ) : cocktails.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollArea className="max-h-64 rounded-2xl border border-border/60 bg-background/60">
          <ul className="divide-y divide-border/60">
            {cocktails.map((cocktail) => (
              <li key={cocktail.id}>
                <button
                  type="button"
                  onClick={() => onSelect(cocktail)}
                  className={cn(
                    "flex w-full flex-col gap-2 px-4 py-4 text-left transition",
                    "hover:bg-primary/5 hover:text-foreground",
                    selectedId === cocktail.id
                      ? "bg-primary/10 text-foreground"
                      : "bg-background/0",
                  )}
                  aria-current={selectedId === cocktail.id}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Bookmark className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {cocktail.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {buildSubtitle(cocktail)}
                      </p>
                    </div>
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-primary">
                      Load
                    </span>
                  </div>
                  <p className="text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
                    {formatSavedTimestamp(cocktail.createdAt)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </section>
  )
}

function buildSubtitle(cocktail: SavedCocktail) {
  const inputs = cocktail.inputs

  if (inputs) {
    const parts = [inputs.primaryIngredient]
    if (inputs.theme) {
      parts.push(inputs.theme)
    }
    if (inputs.type) {
      parts.push(formatServiceStyle(inputs.type))
    }
    return parts.filter(Boolean).join(" • ")
  }

  const tags = cocktail.cocktail.tags
  if (Array.isArray(tags) && tags.length > 0) {
    return tags.slice(0, 3).join(" • ")
  }

  return "Saved spec"
}

function formatSavedTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "Recently saved"
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
}

function EmptyState() {
  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-border/60 bg-background/70 px-4 py-6 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">No saved cocktails yet</p>
      <p className="text-xs text-muted-foreground">
        Generate a cocktail card and tap “Save to library” to keep your specs handy.
      </p>
    </div>
  )
}
