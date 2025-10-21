import { google } from "@ai-sdk/google"
import { streamObject } from "ai"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

import {
  cocktailInputSchema,
  generateCocktailSchema,
} from "@/schemas/cocktailSchemas"

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

  return result.toTextStreamResponse()
}
