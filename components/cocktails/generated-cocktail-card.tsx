import { Sparkles, Info } from "lucide-react"
import { useEffect, useState, type ReactNode, useRef } from "react"
import Image from "next/image"
import { useReactToPrint } from "react-to-print"
import ReactMarkdown from "react-markdown"

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
  const [isRequestExpanded, setIsRequestExpanded] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${cocktail?.name || "Cocktail"} Recipe`,
  })

  useEffect(() => {
    if (inputs) {
      setIsRequestExpanded(false)
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
  const showEmptyState = !hasGeneratedContent && !isLoading

  return (
    <div className="space-y-6">
      {inputs ? (
        <CurrentRequestSection
          inputs={inputs}
          isExpanded={isRequestExpanded}
          onToggle={() => setIsRequestExpanded((previous) => !previous)}
          onCreateNewCocktail={onCreateNewCocktail}
        />
      ) : null}

      <div className="space-y-5 rounded-xl border border-border/70 bg-background/80 p-5 shadow-inner shadow-black/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Latest build
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {hasGeneratedContent && !isLoading && cocktail?.name ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePrint()}
                className="text-xs"
              >
                🖨️ Print Recipe
              </Button>
            ) : null}
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
        </div>

        {error ? <ErrorState error={error} /> : null}

        {isLoading && onStop ? (
          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-secondary/60 px-3 py-2 text-xs text-secondary-foreground">
            <div className="space-y-0.5">
              <p className="font-medium">Building your cocktail</p>
              <p className="text-[0.7rem] text-secondary-foreground/80">
                We&apos;ll keep polishing this card as new details arrive.
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

        <div ref={printRef} className="print-content">
          {showEmptyState ? (
            <EmptyState
              hasRequest={Boolean(inputs)}
              onCreateNewCocktail={onCreateNewCocktail}
            />
          ) : (
            <div className="space-y-6">
              {imageStatus === "ready" && imageUrl ? (
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
                <>
                  <GeneratedContent cocktail={cocktail} isLoading={isLoading} />
                  <ImagePreviewSection
                    status={imageStatus}
                    imageUrl={imageUrl}
                    imageAlt={imageAlt}
                    errorMessage={imageError}
                    onRetry={onRetryImage}
                    isSecondary={true}
                    showIdleHelper
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CurrentRequestSection({
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
    <section className="space-y-4 rounded-2xl border border-border/60 bg-background/85 p-5 shadow-inner shadow-black/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Your latest brief
          </p>
          <p className="text-sm text-muted-foreground">
            Review the essentials or pop it open to tweak the details before pouring again.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onCreateNewCocktail ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCreateNewCocktail}
              className="rounded-full text-xs"
            >
              Start fresh
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="rounded-full text-xs"
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Hide specs" : "Show specs"}
          </Button>
        </div>
      </div>

      {isExpanded ? (
        <>
          <Separator className="bg-border/60" />
          <RequestDetails inputs={inputs} />
        </>
      ) : (
        <>
          <RequestChips inputs={inputs} />
          <p className="text-[0.7rem] text-muted-foreground">
            Need to adjust something? Expand for the full rundown of your request.
          </p>
        </>
      )}
    </section>
  )
}

function RequestDetails({ inputs }: { inputs: CocktailInput }) {
  return (
    <dl className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
      <SummaryItem label="Base spirit" value={inputs.primaryIngredient} />
      <SummaryItem label="Mood" value={inputs.theme} />
      {inputs.cuisine ? (
        <SummaryItem label="Cuisine pairing" value={inputs.cuisine} />
      ) : null}
      <SummaryItem label="Service style" value={formatServiceStyle(inputs.type)} />
    </dl>
  )
}

function RequestChips({ inputs }: { inputs: CocktailInput }) {
  const chips = [
    { label: "Spirit", value: inputs.primaryIngredient },
    { label: "Mood", value: inputs.theme },
    ...(inputs.cuisine ? [{ label: "Cuisine", value: inputs.cuisine }] : []),
    { label: "Service", value: formatServiceStyle(inputs.type) },
  ].filter(({ value }) => Boolean(value?.trim?.()))

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map(({ label, value }) => (
        <RequestChip key={`${label}-${value}`} label={label} value={value} />
      ))}
    </div>
  )
}

function RequestChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/70 px-3 py-1.5 text-xs text-secondary-foreground shadow-sm">
      <span className="uppercase tracking-[0.24em] text-[0.65rem] text-secondary-foreground/70">
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
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
  const displayValue = value?.trim()

  return (
    <div className="space-y-1">
      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-muted-foreground/70">
        {label}
      </dt>
      <dd className="text-sm text-foreground">
        {displayValue ? displayValue : <span className="text-muted-foreground">Not set</span>}
      </dd>
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
  const notesLines = splitLines(cocktail?.notes)

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          {cocktail?.name ?? (isLoading ? <SkeletonLine className="h-7 w-40" /> : "")}
        </h3>
        {cocktail?.description ? (
          <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl">{cocktail.description}</p>
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
              className="inline-flex items-center rounded-full bg-gradient-to-r from-secondary/60 to-secondary/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-foreground border border-secondary/40 backdrop-blur-sm hover:shadow-md hover:shadow-secondary/30 transition-all"
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
          <div className="rounded-lg border border-border/50 bg-background/60 p-4">
            <ul className="space-y-2.5 text-sm">
              {ingredients.map((item, index) => (
                <li key={`${item}-${index}`} className="flex items-start gap-3 group">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-primary to-primary/60 flex-shrink-0 group-hover:shadow-md group-hover:shadow-primary/50 transition-shadow" aria-hidden />
                  <span className="text-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : isLoading ? (
          <SkeletonList lines={4} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Measurements will drop in as soon as the build is dialed.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeading>Instructions</SectionHeading>
        {cocktail?.instructions?.length && cocktail.instructions.length > 0 ? (
          <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-border/50 bg-background/60 p-4 text-sm">
            <ol className="space-y-3 text-sm [&>li]:marker:text-primary [&>li]:marker:font-semibold">
              {cocktail.instructions.map((line, index) => (
                <li key={index} className="marker:content-[counter(list-item,decimal)] pl-3">
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_*]:my-0 [&_code]:bg-secondary/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_strong]:font-semibold [&_strong]:text-foreground [&_em]:text-muted-foreground">
                    <ReactMarkdown
                      components={{
                        p: ({ ...props }) => <span {...props} />,
                        strong: ({ ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                        em: ({ ...props }) => <em className="italic text-muted-foreground" {...props} />,
                        code: ({ ...props }) => <code className="bg-secondary/40 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />,
                      }}
                    >
                      {line}
                    </ReactMarkdown>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : isLoading ? (
          <SkeletonList lines={3} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Method details post here the moment we start assembling.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeading>Notes</SectionHeading>
        {notesLines.length > 0 ? (
          <div className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/20 via-background/60 to-background/80 p-4">
            <ul className="space-y-2.5 text-sm text-foreground">
              {notesLines.map((line, index) => (
                <li key={`${line}-${index}`} className="flex items-start gap-3 leading-relaxed">
                  <span className="inline-block mt-1 h-1.5 w-1.5 rounded-full bg-secondary/70 flex-shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : isLoading ? (
          <SkeletonList lines={2} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Use this space for prep cues, batching direction, or the story you&apos;ll share at service.
          </p>
        )}
      </section>

      {/* Chat functionality - only show when cocktail is fully generated */}
      {!isLoading && cocktail?.name ? (
        <section className="space-y-3">
          <Separator className="bg-border/60" />
          <div className="flex items-center justify-between gap-3">
            <SectionHeading>Need a second opinion?</SectionHeading>
            <ChatDialog
              cocktailName={cocktail.name}
              cocktailData={cocktail}
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Ask about ingredient swaps, prep timing, or how it plays with your menu.
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
  showIdleHelper = false,
}: {
  status: "idle" | "loading" | "ready" | "error"
  imageUrl?: string
  imageAlt?: string
  errorMessage?: string | null
  onRetry?: () => void
  isSecondary?: boolean
  showIdleHelper?: boolean
}) {
  if (status === "idle") {
    if (!showIdleHelper) {
      return null
    }

    return (
      <section className="space-y-3 rounded-2xl border border-dashed border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Info className="h-4 w-4" aria-hidden="true" />
          <span>We&apos;ll queue a concept render as soon as you generate a cocktail.</span>
        </div>
      </section>
    )
  }

  if (status === "ready" && imageUrl) {
    return (
      <section className={`space-y-3 ${!isSecondary ? 'ring-2 ring-primary/20 rounded-3xl p-4 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5' : ''}`}>
        <SectionHeading className={!isSecondary ? 'text-primary font-bold' : ''}>Visual concept</SectionHeading>
        <figure className={`overflow-hidden ${!isSecondary ? 'rounded-3xl shadow-2xl border-2 border-primary/30' : 'rounded-2xl border border-border/70'} bg-background/90 shadow-inner shadow-black/5`}>
          <Image
            src={imageUrl}
            alt={imageAlt ?? "Concept cocktail render"}
            width={500}
            height={500}
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
            className="rounded-full border-destructive/40 text-destructive hover:text-destructive"
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

function EmptyState({
  hasRequest,
  onCreateNewCocktail,
}: {
  hasRequest: boolean
  onCreateNewCocktail?: () => void
}) {
  return (
    <div className="space-y-5 rounded-2xl border border-dashed border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">
            Waiting for your first pour
          </h3>
          <p>
            Fill out the brief on the left and we&apos;ll drop the full cocktail spec—ingredients, build, garnish, and image concept—right here.
          </p>
        </div>
      </div>

      <ul className="space-y-2 text-xs">
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" aria-hidden />
          <span>Start with a hero ingredient and the mood you&apos;re aiming for.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" aria-hidden />
          <span>Optional service notes help us lock in glassware, prep, and pairings.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" aria-hidden />
          <span>Once generated, you can print, chat about tweaks, or start another round instantly.</span>
        </li>
      </ul>

      {onCreateNewCocktail ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCreateNewCocktail}
          className="rounded-full"
        >
          {hasRequest ? "Clear brief" : "Start a brief"}
        </Button>
      ) : null}
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
