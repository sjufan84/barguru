import { useEffect, useState, type ReactNode } from "react"

import type { CocktailInput, GenerateCocktail } from "@/schemas/cocktailSchemas"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChatDialog } from "@/components/ui/chat-dialog"
import { cn } from "@/lib/utils"

interface GeneratedCocktailCardProps {
  cocktail?: Partial<GenerateCocktail>
  inputs?: CocktailInput | null
  isLoading: boolean
  onStop?: () => void
  error?: Error | null
  imageStatus?: "idle" | "loading" | "ready" | "error"
  imageUrl?: string
  imageAlt?: string
  imageError?: string | null
  onRetryImage?: () => void
  onCreateNewCocktail?: () => void
}

export function GeneratedCocktailCard({
  cocktail,
  inputs,
  isLoading,
  onStop,
  error,
  imageStatus = "idle",
  imageUrl,
  imageAlt,
  imageError,
  onRetryImage,
  onCreateNewCocktail,
}: GeneratedCocktailCardProps) {
  const [isBriefExpanded, setIsBriefExpanded] = useState(false)

  useEffect(() => {
    if (inputs) {
      setIsBriefExpanded(false)
    }
  }, [inputs])

  const hasGeneratedContent = Boolean(
    cocktail &&
      (cocktail.name ||
        cocktail.description ||
        cocktail.ingredients?.length ||
        cocktail.instructions ||
        cocktail.tags?.length ||
        cocktail.garnish ||
        cocktail.glass ||
        cocktail.notes),
  )

  return (
    <div className="space-y-6">
      {inputs ? (
        <CurrentBriefSection
          inputs={inputs}
          isExpanded={isBriefExpanded}
          onToggle={() => setIsBriefExpanded((previous) => !previous)}
          onCreateNewCocktail={onCreateNewCocktail}
        />
      ) : null}

      <div className="space-y-5 rounded-xl border border-border/70 bg-background/80 p-5 shadow-inner shadow-black/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Generated cocktail
          </p>
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Streaming
            </div>
          ) : null}
        </div>

        {error ? <ErrorState error={error} /> : null}

        {isLoading && onStop ? (
          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-secondary/60 px-3 py-2 text-xs text-secondary-foreground">
            <div className="space-y-0.5">
              <p className="font-medium">Crafting your cocktail</p>
              <p className="text-[0.7rem] text-secondary-foreground/80">
                We&apos;ll keep updating this card as new details arrive.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onStop()}
              className="text-xs"
            >
              Stop
            </Button>
          </div>
        ) : null}

        {/* Show cocktail content prominently during generation, feature image when ready */}
        {hasGeneratedContent || isLoading ? (
          <div className="space-y-6">
            {imageStatus === "ready" && imageUrl ? (
              /* When image is ready, feature it prominently with cocktail below */
              <>
                <ImagePreviewSection
                  status={imageStatus}
                  imageUrl={imageUrl}
                  imageAlt={imageAlt}
                  errorMessage={imageError}
                  onRetry={onRetryImage}
                  isSecondary={false}
                />
                <GeneratedContent cocktail={cocktail} isLoading={isLoading} />
              </>
            ) : (
              /* During generation, show cocktail prominently with compact image status below */
              <>
                <GeneratedContent cocktail={cocktail} isLoading={isLoading} />
                <ImagePreviewSection
                  status={imageStatus}
                  imageUrl={imageUrl}
                  imageAlt={imageAlt}
                  errorMessage={imageError}
                  onRetry={onRetryImage}
                  isSecondary={true}
                />
              </>
            )}
          </div>
        ) : (
          // When no content, show empty state without image
          <EmptyState />
        )}
      </div>
    </div>
  )
}

function CurrentBriefSection({
  inputs,
  isExpanded,
  onToggle,
  onCreateNewCocktail,
}: {
  inputs: CocktailInput
  isExpanded: boolean
  onToggle: () => void
  onCreateNewCocktail?: () => void
}) {
  return (
    <section className="rounded-xl border border-border/60 bg-background/80 p-4 shadow-inner shadow-black/5 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Current brief
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {onCreateNewCocktail ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCreateNewCocktail}
              className="text-xs"
            >
              New cocktail
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-xs"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Hide details" : "Show details"}
          </Button>
        </div>
      </div>

      {isExpanded ? (
        <>
          <Separator className="my-4 bg-border/60" />
          <BriefDetails inputs={inputs} />
        </>
      ) : (
        <>
          <div className="mt-4">
            <BriefChips inputs={inputs} />
          </div>
          <p className="mt-3 text-[0.7rem] text-muted-foreground">
            Expand to review or tweak the brief before your next round.
          </p>
        </>
      )}
    </section>
  )
}

function BriefDetails({ inputs }: { inputs: CocktailInput }) {
  return (
    <dl className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
      <SummaryItem label="Primary ingredient" value={inputs.primaryIngredient} />
      <SummaryItem label="Theme" value={inputs.theme} />
      {inputs.cuisine ? (
        <SummaryItem label="Cuisine pairing" value={inputs.cuisine} />
      ) : null}
      <SummaryItem label="Service style" value={formatServiceStyle(inputs.type)} />
    </dl>
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

function SummaryItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="space-y-1">
      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-muted-foreground/70">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  )
}

function GeneratedContent({
  cocktail,
  isLoading,
}: {
  cocktail?: Partial<GenerateCocktail>
  isLoading: boolean
}) {
  const ingredients = cocktail?.ingredients ?? []
  const tags = cocktail?.tags ?? []
  const instructionLines = splitLines(cocktail?.instructions)
  const notesLines = splitLines(cocktail?.notes)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold text-primary">
          {cocktail?.name ?? (isLoading ? <SkeletonLine className="h-7 w-40" /> : "")}
        </h3>
        {cocktail?.description ? (
          <p className="text-sm text-muted-foreground">{cocktail.description}</p>
        ) : isLoading ? (
          <div className="space-y-2">
            <SkeletonLine className="h-3 w-full" />
            <SkeletonLine className="h-3 w-5/6" />
          </div>
        ) : null}
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailPill label="Garnish" value={cocktail?.garnish} isLoading={isLoading} />
        <DetailPill label="Glass" value={cocktail?.glass} isLoading={isLoading} />
      </div>

      <section className="space-y-3">
        <SectionHeading>Ingredients</SectionHeading>
        {ingredients.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {ingredients.map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-2">
                <span className="mt-[0.35rem] h-1.5 w-1.5 rounded-full bg-primary/70" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : isLoading ? (
          <SkeletonList lines={4} />
        ) : (
          <p className="text-sm text-muted-foreground">
            We&apos;ll list precise measurements once you generate a cocktail.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeading>Instructions</SectionHeading>
        {instructionLines.length > 0 ? (
          <ol className="space-y-2 text-sm">
            {instructionLines.map((line, index) => (
              <li key={`${line}-${index}`} className="flex gap-3">
                <span className="mt-[0.15rem] font-semibold text-muted-foreground">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
        ) : isLoading ? (
          <SkeletonList lines={3} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Steps and technique will stream in here once generation starts.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeading>Notes</SectionHeading>
        {notesLines.length > 0 ? (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {notesLines.map((line, index) => (
              <li key={`${line}-${index}`}>{line}</li>
            ))}
          </ul>
        ) : isLoading ? (
          <SkeletonList lines={2} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Use this space for prep notes, batching direction, or story beats.
          </p>
        )}
      </section>

      {/* Chat functionality - only show when cocktail is fully generated */}
      {!isLoading && cocktail?.name ? (
        <section className="space-y-3">
          <Separator className="bg-border/60" />
          <div className="flex items-center justify-between gap-3">
            <SectionHeading>Have questions?</SectionHeading>
            <ChatDialog
              cocktailName={cocktail.name}
              cocktailData={cocktail}
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Ask about ingredient substitutions, techniques, or flavor profiles.
          </p>
        </section>
      ) : null}
    </div>
  )
}

function ImagePreviewSection({
  status,
  imageUrl,
  imageAlt,
  errorMessage,
  onRetry,
  isSecondary = false,
}: {
  status: "idle" | "loading" | "ready" | "error"
  imageUrl?: string
  imageAlt?: string
  errorMessage?: string | null
  onRetry?: () => void
  isSecondary?: boolean
}) {
  if (status === "idle") {
    return null
  }

  if (status === "ready" && imageUrl) {
    return (
      <section className={`space-y-3 ${!isSecondary ? 'ring-2 ring-primary/20 rounded-3xl p-4 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5' : ''}`}>
        <SectionHeading className={!isSecondary ? 'text-primary font-bold' : ''}>Visual concept</SectionHeading>
        <figure className={`overflow-hidden ${!isSecondary ? 'rounded-3xl shadow-2xl border-2 border-primary/30' : 'rounded-2xl border border-border/70'} bg-background/90 shadow-inner shadow-black/5`}>
          <img
            src={imageUrl}
            alt={imageAlt ?? "Concept cocktail render"}
            className="aspect-square h-auto w-full object-cover"
          />
          <figcaption className={`border-t ${!isSecondary ? 'border-primary/30 bg-primary/10' : 'border-border/70 bg-background/80'} px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.25em] ${!isSecondary ? 'text-primary' : 'text-muted-foreground/80'}`}>
            {!isSecondary ? '✨ Visual concept ready' : 'Ready for moodboarding'}
          </figcaption>
        </figure>
      </section>
    )
  }

  if (status === "loading") {
    if (isSecondary) {
      return (
        <section className="space-y-3">
          <SectionHeading>Visual concept</SectionHeading>
          <div className="rounded-xl border border-border/50 bg-muted/15 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Generating visual concept...
            </div>
          </div>
        </section>
      )
    }
    return (
      <section className="space-y-3">
        <SectionHeading>Visual concept</SectionHeading>
        <ImageSkeleton />
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <SectionHeading>Visual concept</SectionHeading>
      <div className="space-y-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
        <p>{errorMessage ?? "We couldn&apos;t generate an image this time."}</p>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-destructive/40 text-destructive hover:text-destructive"
          >
            Try again
          </Button>
        ) : null}
      </div>
    </section>
  )
}

function ImageSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
      <div className="aspect-square w-full animate-pulse bg-gradient-to-br from-muted/50 via-muted/20 to-muted/50" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      <p>
        When you generate a cocktail, we&apos;ll showcase the concept here with ingredients, steps, and finishing notes ready for your team.
      </p>
      <p>Share the mood, cuisine, and service style to see ideas stream in real time.</p>
    </div>
  )
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {error.message || "We couldn't complete that request. Try again."}
    </div>
  )
}

function DetailPill({
  label,
  value,
  isLoading,
}: {
  label: string
  value?: string
  isLoading: boolean
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/90 px-3 py-2">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </p>
      {value ? (
        <p className="text-sm text-foreground">{value}</p>
      ) : isLoading ? (
        <SkeletonLine className="mt-1 h-3 w-24" />
      ) : (
        <p className="text-sm text-muted-foreground">Awaiting details</p>
      )}
    </div>
  )
}

function SectionHeading({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h4 className={cn("text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground", className)}>
      {children}
    </h4>
  )
}

function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-full bg-muted/40", className)} />
}

function SkeletonList({ lines }: { lines: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLine key={index} className="h-3 w-full" />
      ))}
    </div>
  )
}

function splitLines(value?: string) {
  if (!value) {
    return []
  }

  return value
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function formatServiceStyle(value: CocktailInput["type"]) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
