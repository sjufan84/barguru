import { useCallback, useEffect, useRef, useState } from "react"

import type { CocktailInput, GenerateCocktail } from "@/schemas/cocktailSchemas"

import { buildImageRequestKey } from "@/lib/cocktail-generation"

export type CocktailImageState =
  | { status: "idle"; url?: undefined; alt?: undefined; error?: undefined }
  | { status: "loading"; url?: undefined; alt?: undefined; error?: undefined }
  | { status: "ready"; url: string; alt: string; error?: undefined }
  | { status: "error"; url?: undefined; alt?: undefined; error: string }

export type UseCocktailImageResult = {
  imageState: CocktailImageState
  startImageRequest: (
    cocktail: GenerateCocktail,
    inputs: CocktailInput | null,
    options?: { force?: boolean },
  ) => void
  resetImageState: () => void
}

export function useCocktailImage(): UseCocktailImageResult {
  const [imageState, setImageState] = useState<CocktailImageState>({
    status: "idle",
  })
  const imageRequestKeyRef = useRef<string | null>(null)
  const imageRequestIdRef = useRef(0)
  const imageAbortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      imageAbortRef.current?.abort()
    }
  }, [])

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cocktail, inputs: inputs ?? undefined }),
            signal: controller.signal,
          })

          const text = await response.text()

          if (!response.ok) {
            throw new Error(parseImageErrorMessage(text))
          }

          const payload = safeParseImagePayload(text)
          if (imageRequestIdRef.current !== requestId) {
            return
          }

          if (!payload?.imageUrl) {
            throw new Error("Image data was missing from the response.")
          }

          const alt = `Concept image for the ${cocktail.name} cocktail`
          setImageState({ status: "ready", url: payload.imageUrl, alt })
        } catch (error) {
          if (controller.signal.aborted || imageRequestIdRef.current !== requestId) {
            return
          }

          const message =
            error instanceof Error ? error.message : "Image generation failed."
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

  const resetImageState = useCallback(() => {
    imageAbortRef.current?.abort()
    imageRequestIdRef.current += 1
    imageRequestKeyRef.current = null
    setImageState({ status: "idle" })
  }, [])

  return { imageState, startImageRequest, resetImageState }
}

function parseImageErrorMessage(text: string) {
  let message = "Image generation failed."
  try {
    const parsed = JSON.parse(text) as { error?: string }
    if (parsed?.error) {
      message = parsed.error
    }
  } catch {
    // ignore parsing errors
  }
  return message
}

function safeParseImagePayload(text: string) {
  try {
    return JSON.parse(text) as { imageUrl?: string } | null
  } catch {
    return null
  }
}
