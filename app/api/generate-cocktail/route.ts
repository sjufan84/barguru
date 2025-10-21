import { google } from "@ai-sdk/google"
import { streamObject } from "ai"
import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { auth } from "@clerk/nextjs/server"
import { cookies } from "next/headers"

import {
  cocktailInputSchema,
  generateCocktailSchema,
} from "@/schemas/cocktailSchemas"
import { checkAnonCocktailQuota, trackCocktailGeneration, getOrCreateUser } from "@/lib/db-utils"
import { trackServerEvent } from "@/lib/posthog-server"

export const maxDuration = 30

export async function POST(request: Request) {
  let parsedInput

  try {
    const body = await request.json()
    parsedInput = cocktailInputSchema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid cocktail input.", details: error.issues },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: "Unable to read request body." },
      { status: 400 },
    )
  }

  // Get or create session ID for anonymous users
  const cookieStore = await cookies()
  let sessionId = cookieStore.get("barguru_session_id")?.value

  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    // Note: Cookie will be set in response headers via NextResponse
  }

  // Get authenticated user if available
  const { userId: clerkUserId } = await auth()

  let userId: string | null = null
  let canGenerate = true
  let quotaMessage = ""

  if (clerkUserId) {
    // User is authenticated
    userId = clerkUserId
    
    // Get or create user in database
    // Note: We'll use the user ID and email info from the request
    // Clerk will sync the full user data via webhook
    await getOrCreateUser(
      clerkUserId,
      "", // Email will be synced via webhook
      undefined,
      undefined,
    )

    // Authenticated users have unlimited access
    canGenerate = true
  } else {
    // Anonymous user - check quota
    const quota = await checkAnonCocktailQuota(sessionId)
    canGenerate = quota.canGenerate

    if (!canGenerate) {
      quotaMessage = `You've enjoyed your complimentary cocktail (${quota.usageCount} of ${quota.limit}). Sign up with Clerk to craft unlimited menus.`

      await trackServerEvent(sessionId, "cocktail_quota_exceeded", {
        attempt: quota.usageCount + 1,
        sessionId,
        limit: quota.limit,
      })

      // Set session cookie before returning error
      cookieStore.set("barguru_session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })

      return NextResponse.json(
        {
          error: "Quota exceeded",
          message: quotaMessage,
          requiresSignUp: true,
          usageCount: quota.usageCount,
          limit: quota.limit,
        },
        { status: 429 }, // Too Many Requests
      )
    }
  }

  // Track the cocktail generation attempt
  await trackCocktailGeneration(userId, sessionId)

  // Track event
  await trackServerEvent(
    userId || sessionId,
    "cocktail_generated",
    {
      type: parsedInput.type,
      theme: parsedInput.theme,
      isAuthenticated: !!userId,
    },
  )

  const cuisineLine = parsedInput.cuisine
    ? `Cuisine inspiration: ${parsedInput.cuisine}.`
    : "No specific cuisine pairing was requested."

  const prompt = [
    `You are BarGuru, an inventive cocktail development assistant. Create a modern ${parsedInput.type} style cocktail (classic = classic cocktail style i.e. negroni, martini, etc.  craft = high touch, innovative cocktails that push the boundaries, standard = a standard, easy to execute cocktail designed for simplicity and speed) that showcases ${parsedInput.primaryIngredient}. ${cuisineLine} Theme or vibe to capture: ${parsedInput.theme}.`,
    "Return a JSON object that strictly matches the provided schema fields. Keep ingredient measurements precise and in ounces or drops where appropriate. Provide detailed instructions that cover preparation, technique, and service. Provide garnish, glassware, and a few atmospheric notes that help a bar team execute the concept. Tags should be 3-6 short descriptors (lowercase, no hashtags).",
  ].join("\n\n")

  console.log(`Creating cocktail with prompt: ${prompt}`);

  const result = streamObject({
    model: google("gemini-2.5-flash"),
    schema: generateCocktailSchema,
    prompt,
  })

  // Set session cookie for anonymous users (using cookies() directly)
  if (!clerkUserId) {
    cookieStore.set("barguru_session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  return result.toTextStreamResponse()
}
