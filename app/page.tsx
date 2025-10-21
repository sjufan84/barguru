"use client"

import { experimental_useObject as useObject } from "@ai-sdk/react"
import type { FormEvent } from "react"
import { useCallback, useEffect, useRef, useState } from "react"

import { useUser } from "@clerk/nextjs"

import { CocktailRequestForm } from "@/components/cocktails/cocktail-request-form"
import { GeneratedCocktailCard } from "@/components/cocktails/generated-cocktail-card"
import { SavedCocktailList } from "@/components/cocktails/saved-cocktail-list"
import { ModeToggle } from "@/components/themes/mode-toggle"
import { AuthButton } from "@/components/auth/user-button"
import { QuotaAlert } from "@/components/cocktails/quota-alert"
import { GuestTrialBanner } from "@/components/cocktails/guest-trial-banner"
import type { CocktailInput, GenerateCocktail, SavedCocktail } from "@/schemas/cocktailSchemas"
import {
  generateCocktailSchema,
  savedCocktailListSchema,
  savedCocktailSchema,
} from "@/schemas/cocktailSchemas"
import { useCocktailForm } from "@/hooks/use-cocktail-form"
import { useCocktailImage } from "@/hooks/use-cocktail-image"
import { canGenerateImage } from "@/lib/cocktail-generation"
import {
  ingredientLabelMap,
  OTHER_INGREDIENT_VALUE,
} from "@/lib/cocktail-ingredients"
import type { CocktailFormState } from "@/lib/cocktail-form"

type NormalizedError = Error | null

interface QuotaExceededResponse {
  error: string
  message: string
  requiresSignUp: boolean
  usageCount: number
  limit?: number
}

const GUEST_COCKTAIL_LIMIT = 1
const DEFAULT_QUOTA_MESSAGE =
  "Your complimentary cocktail has been poured. Sign up with Clerk to craft unlimited menus."

const HERO_STEPS = [
  {
    title: "Set the brief",
    description:
      "Pick a hero ingredient and describe the moment or guest you&apos;re serving so we can dial in the direction.",
  },
  {
    title: "Preview instantly",
    description:
      "BarGuru drafts a full spec—ingredients, method, garnish, and image concept—in a card you can tweak live.",
  },
  {
    title: "Share with the team",
    description:
      "Print, chat through adjustments, or spin up a variation without retyping your last request.",
  },
]

export default function HomePage() {
  const { isLoaded: isUserLoaded, isSignedIn } = useUser()
  const generatedCardRef = useRef<HTMLDivElement>(null)
  const previousIsLoading = useRef(false)
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const [quotaMessage, setQuotaMessage] = useState(DEFAULT_QUOTA_MESSAGE)
  const [usageCount, setUsageCount] = useState(0)
  const [guestUsageCount, setGuestUsageCount] = useState(0)
  const [complimentaryLimit, setComplimentaryLimit] = useState(
    GUEST_COCKTAIL_LIMIT,
  )

  const {
    formState,
    formErrors,
    handleFieldChange,
    buildSubmissionInput,
    isSubmissionReady,
    resetForm,
  } = useCocktailForm()

  const [lastSubmittedInputs, setLastSubmittedInputs] =
    useState<CocktailInput | null>(null)
  const [isFormCollapsed, setIsFormCollapsed] = useState(false)
  const [hasUserToggledForm, setHasUserToggledForm] = useState(false)
  const [savedCocktails, setSavedCocktails] = useState<SavedCocktail[]>([])
  const [savedCocktailsLoading, setSavedCocktailsLoading] = useState(false)
  const [selectedSavedCocktailId, setSelectedSavedCocktailId] = useState<number | null>(
    null,
  )
  const selectedSavedCocktailRef = useRef<number | null>(null)
  const [activeOverride, setActiveOverride] = useState<{
    cocktail: GenerateCocktail
    inputs: CocktailInput | null
    imageUrl?: string | null
  } | null>(null)
  const [isSavingCocktail, setIsSavingCocktail] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle")
  const saveFeedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { imageState, startImageRequest, resetImageState } = useCocktailImage()

  const { object: generatedCocktail, submit, isLoading, stop, error } =
    useObject({
      api: "/api/generate-cocktail",
      schema: generateCocktailSchema,
    })

  const normalizedError: NormalizedError =
    error instanceof Error ? error : error ? new Error(String(error)) : null

  useEffect(() => {
    selectedSavedCocktailRef.current = selectedSavedCocktailId
  }, [selectedSavedCocktailId])

  const clearSaveFeedback = useCallback(() => {
    if (saveFeedbackTimeout.current) {
      clearTimeout(saveFeedbackTimeout.current)
      saveFeedbackTimeout.current = null
    }
  }, [])

  const collapseForm = useCallback(() => {
    setIsFormCollapsed(true)
    setHasUserToggledForm(true)
  }, [])

  const resetFormCollapsePreferences = useCallback(() => {
    setIsFormCollapsed(false)
    setHasUserToggledForm(false)
  }, [])

  const handleCreateNewCocktail = useCallback(() => {
    clearSaveFeedback()
    setSaveStatus("idle")
    setIsSavingCocktail(false)
    setSelectedSavedCocktailId(null)
    setActiveOverride(null)
    setLastSubmittedInputs(null)
    resetForm()
    resetImageState()
    resetFormCollapsePreferences()
  }, [
    clearSaveFeedback,
    resetForm,
    resetImageState,
    resetFormCollapsePreferences,
  ])

  const handleRetryImage = useCallback(() => {
    const targetCocktail =
      activeOverride?.cocktail ||
      (generatedCocktail as Partial<GenerateCocktail> | undefined)

    if (!canGenerateImage(targetCocktail)) {
      return
    }

    const targetInputs = activeOverride?.inputs ?? lastSubmittedInputs ?? null

    startImageRequest(targetCocktail, targetInputs, { force: true })
  }, [activeOverride, generatedCocktail, lastSubmittedInputs, startImageRequest])

  const handleSelectSavedCocktail = useCallback(
    (saved: SavedCocktail) => {
      clearSaveFeedback()
      setSaveStatus("idle")
      setIsSavingCocktail(false)
      setSelectedSavedCocktailId(saved.id)
      setActiveOverride({
        cocktail: saved.cocktail,
        inputs: saved.inputs ?? null,
        imageUrl: saved.imageUrl ?? null,
      })
      setLastSubmittedInputs(saved.inputs ?? null)
      if (saved.inputs) {
        resetForm(mapInputToFormState(saved.inputs))
      } else {
        resetForm()
      }
      setIsFormCollapsed(true)
      resetImageState()
    },
    [
      clearSaveFeedback,
      resetForm,
      resetImageState,
    ],
  )

  const handleSaveCocktail = useCallback(async () => {
    if (!isUserLoaded || !isSignedIn) {
      return
    }

    const candidate =
      activeOverride?.cocktail ||
      (generatedCocktail as Partial<GenerateCocktail> | undefined)

    const parsedCocktail = generateCocktailSchema.safeParse(candidate)
    if (!parsedCocktail.success) {
      setSaveStatus("error")
      return
    }

    const inputsToSave = activeOverride?.inputs ?? lastSubmittedInputs ?? null
    const imageUrlToSave =
      activeOverride?.imageUrl ??
      (imageState.status === "ready" ? imageState.url : null)

    clearSaveFeedback()
    setIsSavingCocktail(true)
    setSaveStatus("idle")

    try {
      const response = await fetch("/api/saved-cocktails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cocktail: parsedCocktail.data,
          inputs: inputsToSave,
          imageUrl: imageUrlToSave ?? undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save cocktail: ${response.status}`)
      }

      const payload = await response.json()
      const saved = savedCocktailSchema.parse(payload.cocktail ?? payload)

      setSavedCocktails((current) => {
        const filtered = current.filter((item) => item.id !== saved.id)
        return [saved, ...filtered]
      })
      setSelectedSavedCocktailId(saved.id)
      if (activeOverride) {
        setActiveOverride({
          cocktail: saved.cocktail,
          inputs: saved.inputs ?? null,
          imageUrl: saved.imageUrl ?? null,
        })
      }
      setSaveStatus("saved")

      saveFeedbackTimeout.current = setTimeout(() => {
        setSaveStatus("idle")
        saveFeedbackTimeout.current = null
      }, 3000)
    } catch (saveError) {
      console.error("Failed to save cocktail", saveError)
      setSaveStatus("error")
    } finally {
      setIsSavingCocktail(false)
    }
  }, [
    activeOverride,
    clearSaveFeedback,
    generatedCocktail,
    imageState.status,
    imageState.url,
    isSignedIn,
    isUserLoaded,
    lastSubmittedInputs,
  ])

  const displayedCocktail =
    activeOverride?.cocktail ??
    (generatedCocktail as Partial<GenerateCocktail> | undefined)
  const displayedInputs = activeOverride?.inputs ?? lastSubmittedInputs
  const cardIsLoading = activeOverride ? false : isLoading
  const cardImageStatus = activeOverride
    ? activeOverride.imageUrl
      ? "ready"
      : "idle"
    : imageState.status
  const cardImageUrl =
    activeOverride?.imageUrl ??
    (imageState.status === "ready" ? imageState.url : undefined)
  const cardImageAlt = activeOverride?.imageUrl
    ? `Concept image for the ${activeOverride.cocktail.name} cocktail`
    : imageState.status === "ready"
      ? imageState.alt
      : undefined
  const cardImageError =
    activeOverride || imageState.status !== "error"
      ? null
      : imageState.error ?? null

  const isSubmitDisabled = !isSubmissionReady || isLoading
  const shouldHideForm = Boolean(
    isFormCollapsed &&
      !cardIsLoading &&
      (displayedInputs || (displayedCocktail && displayedCocktail.name)),
  )

  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      setGuestUsageCount(0)
      setComplimentaryLimit(GUEST_COCKTAIL_LIMIT)
      setQuotaExceeded(false)
      setQuotaMessage(DEFAULT_QUOTA_MESSAGE)
    }
  }, [isSignedIn, isUserLoaded])

  useEffect(() => {
    return () => {
      clearSaveFeedback()
    }
  }, [clearSaveFeedback])

  useEffect(() => {
    if (!isUserLoaded) {
      return
    }

    if (!isSignedIn) {
      setSavedCocktails([])
      setSavedCocktailsLoading(false)
      setSelectedSavedCocktailId(null)
      setActiveOverride(null)
      setSaveStatus("idle")
      setIsSavingCocktail(false)
      clearSaveFeedback()
      return
    }

    let isCancelled = false
    setSavedCocktailsLoading(true)

    ;(async () => {
      try {
        const response = await fetch("/api/saved-cocktails")
        if (!response.ok) {
          throw new Error(`Failed to load saved cocktails: ${response.status}`)
        }

        const payload = await response.json()
        const parsed = savedCocktailListSchema.parse(payload.cocktails ?? payload)

        if (!isCancelled) {
          setSavedCocktails(parsed)
          const currentSelected = selectedSavedCocktailRef.current
          if (
            currentSelected &&
            !parsed.some((cocktail) => cocktail.id === currentSelected)
          ) {
            setSelectedSavedCocktailId(null)
            setActiveOverride(null)
            setSaveStatus("idle")
            clearSaveFeedback()
          }
        }
      } catch (fetchError) {
        console.error("Failed to fetch saved cocktails", fetchError)
        if (!isCancelled) {
          setSavedCocktails([])
        }
      } finally {
        if (!isCancelled) {
          setSavedCocktailsLoading(false)
        }
      }
    })()

    return () => {
      isCancelled = true
    }
  }, [
    clearSaveFeedback,
    isSignedIn,
    isUserLoaded,
  ])

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
    clearSaveFeedback()
    setSaveStatus("idle")
    setIsSavingCocktail(false)
    setSelectedSavedCocktailId(null)
    setActiveOverride(null)
    setQuotaExceeded(false)

    const input = buildSubmissionInput()
    if (!input) {
      return
    }

    const limitForGuests = Math.max(complimentaryLimit, GUEST_COCKTAIL_LIMIT)

    if (isUserLoaded && !isSignedIn && guestUsageCount >= limitForGuests) {
      setQuotaExceeded(true)
      setQuotaMessage(DEFAULT_QUOTA_MESSAGE)
      setUsageCount(guestUsageCount)
      return
    }

    setQuotaMessage(DEFAULT_QUOTA_MESSAGE)
    resetFormCollapsePreferences()
    resetImageState()
    setLastSubmittedInputs(input)

    try {
      await submit(input)

      if (isUserLoaded && !isSignedIn) {
        const updatedLimit = Math.max(complimentaryLimit, GUEST_COCKTAIL_LIMIT)
        setGuestUsageCount((current) =>
          Math.min(current + 1, updatedLimit),
        )
      }
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
            const limitFromResponse = Math.max(
              quotaData.limit ?? GUEST_COCKTAIL_LIMIT,
              GUEST_COCKTAIL_LIMIT,
            )
            const usageFromResponse = Math.min(
              Math.max(quotaData.usageCount ?? 0, 0),
              limitFromResponse,
            )

            setComplimentaryLimit(limitFromResponse)
            setGuestUsageCount((current) =>
              Math.max(current, usageFromResponse),
            )
            setQuotaExceeded(true)
            setQuotaMessage(quotaData.message || DEFAULT_QUOTA_MESSAGE)
            setUsageCount(usageFromResponse)
          } catch {
            // If parsing fails, just show the error message
            setQuotaExceeded(true)
            setQuotaMessage(DEFAULT_QUOTA_MESSAGE)
            const fallbackLimit = Math.max(
              complimentaryLimit,
              GUEST_COCKTAIL_LIMIT,
            )
            const fallbackUsage = Math.max(guestUsageCount, fallbackLimit)
            setGuestUsageCount((current) => Math.max(current, fallbackUsage))
            setUsageCount(fallbackUsage)
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
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              BarGuru
            </p>
            <h1 className="text-xl font-semibold sm:text-2xl">
              Service-ready cocktail intelligence
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <AuthButton />
          </div>
        </header>

        {quotaExceeded && (
          <div className="mt-8">
            <QuotaAlert
              message={quotaMessage}
              usageCount={usageCount}
              limit={complimentaryLimit}
            />
          </div>
        )}

        <section className="mt-12 space-y-8 sm:mt-16">
          <div className="space-y-4">
            <span className="inline-flex w-max items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-foreground">
              Ingredient-first workflow
            </span>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                Make more with what you have.
              </h2>
              <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
                BarGuru turns excess inventory into beautiful cocktails. Describe the vibe, and we&apos;ll draft measurements, prep notes, and a visual direction while you watch.  Clear those shelves, make some money, and never compromise on quality.
              </p>
              <p className="text-sm text-muted-foreground/80">
                Your last prompt stays pinned so iterating on a build or spinning up a variation is effortless.
              </p>
            </div>
          </div>

          <ol className="grid gap-4 rounded-3xl border border-border/60 bg-card/80 p-5 sm:grid-cols-3 sm:p-6">
            {HERO_STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    {step.title}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>

          {isUserLoaded && !isSignedIn ? (
            <p className="text-sm text-muted-foreground">
              Your first cocktail is on the house. Sign up to save every card, collaborate with your team, and unlock unlimited generations.
            </p>
          ) : null}
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
              {isUserLoaded && isSignedIn ? (
                <SavedCocktailList
                  cocktails={savedCocktails}
                  isLoading={savedCocktailsLoading}
                  onSelect={handleSelectSavedCocktail}
                  selectedId={selectedSavedCocktailId}
                />
              ) : null}
              <GeneratedCocktailCard
                cocktail={displayedCocktail}
                inputs={displayedInputs}
                isLoading={cardIsLoading}
                onStop={stop}
                error={activeOverride ? null : normalizedError}
                imageStatus={cardImageStatus}
                imageUrl={cardImageUrl}
                imageAlt={cardImageAlt}
                imageError={cardImageError}
                onRetryImage={handleRetryImage}
                onCreateNewCocktail={handleCreateNewCocktail}
                canSave={Boolean(isUserLoaded && isSignedIn)}
                onSaveCocktail={
                  isUserLoaded && isSignedIn ? handleSaveCocktail : undefined
                }
                isSavingCocktail={isSavingCocktail}
                saveStatus={saveStatus}
              />
              {isUserLoaded && !isSignedIn && guestUsageCount > 0 ? (
                <GuestTrialBanner
                  usageCount={guestUsageCount}
                  limit={complimentaryLimit}
                />
              ) : null}
            </div>
            <div className="mt-8 rounded-xl border border-border/60 bg-secondary/60 p-4 text-xs text-secondary-foreground">
              Tip: Combine a clear mood with a specific service style to help BarGuru fine-tune dilution, temperature, and finishing touches.
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

function mapInputToFormState(input: CocktailInput): CocktailFormState {
  const normalizedIngredient = input.primaryIngredient.trim()
  const matchedEntry = Object.entries(ingredientLabelMap).find(
    ([, label]) => label.toLowerCase() === normalizedIngredient.toLowerCase(),
  )

  return {
    primaryIngredientSelection: matchedEntry
      ? matchedEntry[0]
      : OTHER_INGREDIENT_VALUE,
    primaryIngredientCustom: matchedEntry ? "" : normalizedIngredient,
    theme: input.theme,
    cuisine: input.cuisine ?? "",
    type: input.type,
  }
}
