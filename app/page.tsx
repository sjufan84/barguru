"use client"

import { experimental_useObject as useObject } from "@ai-sdk/react"
import type { FormEvent } from "react"
import { useCallback, useEffect, useRef, useState } from "react"

import { CocktailRequestForm } from "@/components/cocktails/cocktail-request-form"
import { GeneratedCocktailCard } from "@/components/cocktails/generated-cocktail-card"
import { ModeToggle } from "@/components/themes/mode-toggle"
import { AuthButton } from "@/components/auth/user-button"
import { QuotaAlert } from "@/components/cocktails/quota-alert"
import type { CocktailInput, GenerateCocktail } from "@/schemas/cocktailSchemas"
import { generateCocktailSchema } from "@/schemas/cocktailSchemas"
import { useCocktailForm } from "@/hooks/use-cocktail-form"
import { useCocktailImage } from "@/hooks/use-cocktail-image"
import { canGenerateImage } from "@/lib/cocktail-generation"

type NormalizedError = Error | null

interface QuotaExceededResponse {
  error: string
  message: string
  requiresSignUp: boolean
  usageCount: number
}

export default function HomePage() {
  const generatedCardRef = useRef<HTMLDivElement>(null)
  const previousIsLoading = useRef(false)
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const [quotaMessage, setQuotaMessage] = useState("")
  const [usageCount, setUsageCount] = useState(0)

  const {
    formState,
    formErrors,
    handleFieldChange,
    buildSubmissionInput,
    isSubmissionReady,
  } = useCocktailForm()

  const [lastSubmittedInputs, setLastSubmittedInputs] =
    useState<CocktailInput | null>(null)
  const [isFormCollapsed, setIsFormCollapsed] = useState(false)
  const [hasUserToggledForm, setHasUserToggledForm] = useState(false)

  const { imageState, startImageRequest, resetImageState } = useCocktailImage()

  const { object: generatedCocktail, submit, isLoading, stop, error } =
    useObject({
      api: "/api/generate-cocktail",
      schema: generateCocktailSchema,
    })

  const normalizedError: NormalizedError =
    error instanceof Error ? error : error ? new Error(String(error)) : null

  const collapseForm = useCallback(() => {
    setIsFormCollapsed(true)
    setHasUserToggledForm(true)
  }, [])

  const resetFormCollapsePreferences = useCallback(() => {
    setIsFormCollapsed(false)
    setHasUserToggledForm(false)
  }, [])

  const handleCreateNewCocktail = useCallback(() => {
    resetFormCollapsePreferences()
  }, [resetFormCollapsePreferences])

  const handleRetryImage = useCallback(() => {
    if (
      !lastSubmittedInputs ||
      !canGenerateImage(
        generatedCocktail as Partial<GenerateCocktail> | undefined,
      )
    ) {
      return
    }

    startImageRequest(
      generatedCocktail as GenerateCocktail,
      lastSubmittedInputs,
      { force: true },
    )
  }, [generatedCocktail, lastSubmittedInputs, startImageRequest])

  const isSubmitDisabled = !isSubmissionReady || isLoading
  const shouldHideForm = Boolean(
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
    if (
      isLoading ||
      !lastSubmittedInputs ||
      !canGenerateImage(
        generatedCocktail as Partial<GenerateCocktail> | undefined,
      )
    ) {
      return
    }

    startImageRequest(
      generatedCocktail as GenerateCocktail,
      lastSubmittedInputs,
    )
  }, [generatedCocktail, isLoading, lastSubmittedInputs, startImageRequest])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setQuotaExceeded(false)

    const input = buildSubmissionInput()
    if (!input) {
      return
    }

    resetFormCollapsePreferences()
    resetImageState()
    setLastSubmittedInputs(input)

    try {
      await submit(input)
    } catch (submissionError) {
      // Check if it's a quota error
      if (submissionError instanceof Error) {
        const errorMessage = submissionError.message
        console.error("Submission error:", errorMessage)
        
        // Check if error contains quota exceeded info
        if (errorMessage.includes("429") || errorMessage.includes("Quota exceeded")) {
          try {
            // Try to parse the error response
            const quotaData = JSON.parse(errorMessage) as QuotaExceededResponse
            setQuotaExceeded(true)
            setQuotaMessage(quotaData.message)
            setUsageCount(quotaData.usageCount)
          } catch {
            // If parsing fails, just show the error message
            setQuotaExceeded(true)
            setQuotaMessage("You've reached your free quota. Sign up to generate unlimited cocktails!")
            setUsageCount(1)
          }
        }
      }
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
          <AuthButton />
        </header>

        {quotaExceeded && (
          <div className="mt-8">
            <QuotaAlert
              message={quotaMessage}
              usageCount={usageCount}
            />
          </div>
        )}

        <section className="mt-10 flex flex-col gap-4 sm:mt-14">
          <span className="inline-flex w-max items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-foreground">
            Jump right in
          </span>
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Make more with what you already have.
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              Enter the ingredient you want to feature, the vibe you need to match, and let
              BarGuru sketch a service-ready idea you can riff on.
            </p>
            <p className="text-sm text-muted-foreground/80">
              We keep your latest prompt handy so it&apos;s effortless to iterate.
            </p>
          </div>
        </section>

        <div
          className={`mt-12 grid gap-8 ${
            !shouldHideForm ? "lg:grid-cols-[1.05fr_0.95fr]" : ""
          }`}
        >
          {!shouldHideForm ? (
            <CocktailRequestForm
              formState={formState}
              formErrors={formErrors}
              isLoading={isLoading}
              lastSubmittedInputs={lastSubmittedInputs}
              isSubmitDisabled={isSubmitDisabled}
              onSubmit={handleSubmit}
              onFieldChange={handleFieldChange}
              onHideBrief={collapseForm}
            />
          ) : null}

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
                onCreateNewCocktail={handleCreateNewCocktail}
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
