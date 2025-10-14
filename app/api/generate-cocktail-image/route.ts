import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server"
import { ZodError } from "zod"

import {
  cocktailImageRequestSchema,
  type CocktailInput,
  type GenerateCocktail,
} from "@/schemas/cocktailSchemas"

export const maxDuration = 60

export async function POST(request: Request) {
  let parsedInput: { cocktail: GenerateCocktail; inputs?: CocktailInput }

  try {
    const body = await request.json()
    parsedInput = cocktailImageRequestSchema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid cocktail payload.", details: error.issues },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: "Unable to read request body." },
      { status: 400 },
    )
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });

  const { cocktail, inputs } = parsedInput

  try {
    const prompt = buildImagePrompt(cocktail, inputs)

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
    });

    let imageUrl = "";
    const candidates = response?.candidates;
    if (Array.isArray(candidates) && candidates.length > 0) {
      const parts = candidates[0]?.content?.parts;
      if (Array.isArray(parts)) {
        for (const part of parts) {
          if (part?.text) {
            console.log(part.text);
          } else if (part?.inlineData) {
            const imageData = part.inlineData.data;
            imageUrl = `data:image/png;base64,${imageData}`
            console.log(`Image URL: ${imageUrl.substring(0, 100)}`)
          }
        }
      }
    }

    return NextResponse.json({
      imageUrl,
    })
  } catch (error) {
    console.error("Cocktail image generation failed", error)

    return NextResponse.json(
      { error: "We couldn't generate the cocktail image." },
      { status: 500 },
    )
  }
}

function buildImagePrompt(cocktail: GenerateCocktail, inputs?: CocktailInput) {
  const flavorTags = [
    ...cocktail.tags,
    inputs?.theme ?? "",
    inputs?.primaryIngredient ?? "",
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ")

  const headline = `Create a cinematic, high-end cocktail photograph of the "${cocktail.name}".`
  const style = `Photograph the drink in a ${inputs?.type ?? "modern"} cocktail bar setting with atmospheric lighting and a polished bar top. Favor shallow depth of field, dramatic highlights, and crisp glass reflections.`
  const glass = `Serve the drink in a ${cocktail.glass}, garnished with ${cocktail.garnish}.`
  const flavor = `Express the flavor profile as ${flavorTags}.`
  const description = `Notes to include: ${cocktail.description}`
  const ingredients = `Key elements: ${cocktail.ingredients.join(", ")}.`
  const finishing = `Avoid text overlays or logos. Compose square framing ready for menu inspiration.`

  return [
    headline,
    style,
    glass,
    flavor,
    description,
    ingredients,
    finishing,
  ].join("\n")
}
