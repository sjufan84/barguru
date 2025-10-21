import { google } from "@ai-sdk/google"
import { convertToModelMessages, generateObject, streamText } from "ai"
import type { UIMessage } from "ai"
import { z } from "zod"

import { auth, currentUser } from "@clerk/nextjs/server"

import {
  getOrCreateUser,
  saveCocktailForUser,
} from "@/lib/db-utils"
import {
  cocktailInputSchema,
  generateCocktailSchema,
} from "@/schemas/cocktailSchemas"
import type { GenerateCocktail } from "@/schemas/cocktailSchemas"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

interface ChatRequest {
  messages: UIMessage[]
  cocktailName?: string
  cocktailData?: Partial<GenerateCocktail>
  cocktailInputs?: z.infer<typeof cocktailInputSchema> | null
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json()
    const { messages, cocktailName, cocktailData, cocktailInputs } = body

    const { userId } = await auth()

    const baseCocktail = cocktailData

    // Build cocktail context for the AI
    let cocktailContext = ""
    if (cocktailData) {
      cocktailContext = `
CURRENT COCKTAIL CONTEXT:
Name: ${cocktailData.name || "Unknown"}
Description: ${cocktailData.description || "No description available"}
Ingredients: ${cocktailData.ingredients?.join(", ") || "No ingredients listed"}
Instructions: ${cocktailData.instructions || "No instructions provided"}
Glass: ${cocktailData.glass || "Not specified"}
Garnish: ${cocktailData.garnish || "Not specified"}
Tags: ${cocktailData.tags?.join(", ") || "No tags"}
Notes: ${cocktailData.notes || "No additional notes"}
`
    }

    const systemPrompt = `You are a knowledgeable and friendly cocktail expert bartender specializing in the ${cocktailName || "featured cocktail"}. Your role is to help users understand and work with this specific cocktail.

${cocktailContext}

You can leverage the following tools to help the guest:
- editCocktail: generate a refreshed cocktail specification that incorporates the requested adjustments. Always return a complete spec that matches the house format.
- saveCocktail: store the current cocktail spec to the guest profile when they explicitly ask to save. ${userId ? "Only call this tool after confirming the guest wants to save a specific version." : "The guest is not signed in, so instead of calling this tool explain how signing in unlocks saving."}

When you call editCocktail, include the most up-to-date cocktail data in the currentCocktail field and describe the desired changes inside changeRequest. When you call saveCocktail, pass the full cocktail object and any known generation inputs.

When a guest asks for recipe tweaks, prefer using the editCocktail tool so they receive an updated specification. If saving is unavailable, warmly encourage them to sign in before emphasizing the benefits.

Your expertise includes:
- Ingredient substitutions and alternatives
- Preparation techniques and best practices
- Flavor profile analysis
- Pairing suggestions
- Troubleshooting common issues
- History and background information
- Variations and modifications

Guidelines:
- Be concise but thorough in your responses
- Focus on practical, actionable advice
- Consider the user's skill level (don't assume professional knowledge unless indicated)
- When suggesting substitutions, explain the flavor impact
- Provide specific measurements and techniques when relevant
- Maintain a friendly, encouraging tone
- If asked about topics unrelated to cocktails, gently redirect back to cocktail-related questions

Always consider the specific cocktail details provided above when answering questions. If the user asks about general cocktail topics, relate your answers back to their specific cocktail when possible.`

    const result = streamText({
      model: google("gemini-2.0-flash-exp"),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      temperature: 0.7,
      tools: {
        editCocktail: {
          description:
            "Revise the cocktail specification to incorporate guest feedback while keeping measurements precise.",
          inputSchema: z.object({
            changeRequest: z
              .string()
              .describe(
                "Detailed description of the adjustments the guest wants, including flavor or ingredient notes.",
              ),
            currentCocktail: generateCocktailSchema
              .partial()
              .describe(
                "The latest version of the cocktail specification that should be used as the starting point.",
              )
              .optional(),
          }),
          execute: async ({ changeRequest, currentCocktail }) => {
            const startingCocktail = (currentCocktail ?? baseCocktail) || null

            if (!startingCocktail) {
              return {
                success: false,
                message:
                  "I couldn't locate the current cocktail spec to update. Ask the guest to regenerate the drink first.",
              }
            }

            const formattedCocktail = formatCocktailForPrompt(startingCocktail)
            const prompt = [
              "You are BarGuru, an advanced cocktail development assistant.",
              "Revise the provided cocktail so it follows the guest request. Maintain professional structure and keep measurements in ounces when relevant.",
              "Return a JSON object that matches the generateCocktailSchema fields.",
              "If instructions are provided as an array, keep each step concise.",
              "",
              "CURRENT SPEC:",
              formattedCocktail,
              "",
              "GUEST REQUEST:",
              changeRequest,
            ].join("\n")

            try {
              const { object: updatedCocktail } = await generateObject({
                model: google("gemini-2.5-flash"),
                schema: generateCocktailSchema,
                prompt,
                temperature: 0.6,
              })

              return {
                success: true,
                cocktail: updatedCocktail,
                summary: changeRequest,
              }
            } catch (error) {
              console.error("Failed to edit cocktail via tool", error)
              return {
                success: false,
                message:
                  "The edit request couldn't be completed. Try refining the change or regenerating the cocktail.",
              }
            }
          },
        },
        saveCocktail: {
          description:
            "Save the current cocktail to the guest's profile once they confirm they want to keep it.",
          inputSchema: z.object({
            cocktail: generateCocktailSchema.describe(
              "The cocktail specification that should be saved to the guest profile.",
            ),
            inputs: cocktailInputSchema
              .describe(
                "Original generation inputs for reference. Include when available to improve saved metadata.",
              )
              .nullable()
              .optional(),
          }),
          execute: async ({ cocktail, inputs }) => {
            if (!userId) {
              return {
                status: "requires-auth" as const,
                message:
                  "Saving cocktails is available for signed-in members. Invite the guest to create an account to unlock it.",
              }
            }

            try {
              const clerkUser = await currentUser()

              await getOrCreateUser(
                userId,
                clerkUser?.primaryEmailAddress?.emailAddress ?? "",
                clerkUser?.firstName,
                clerkUser?.lastName,
              )

              const record = await saveCocktailForUser(userId, {
                cocktail,
                inputs: inputs ?? cocktailInputs ?? null,
                imageUrl: null,
              })

              return {
                status: "saved" as const,
                cocktailName: record.name,
                savedCocktailId: record.id,
                message: `${record.name} was saved to the guest profile.`,
              }
            } catch (error) {
              console.error("Failed to save cocktail via tool", error)
              return {
                status: "error" as const,
                message:
                  "I couldn't save the cocktail right now. Please try again in a moment.",
              }
            }
          },
        },
      },
    })

    return result.toUIMessageStreamResponse({
      onError: error => {
        console.error("Chat API error:", error)
        if (error == null) {
          return "I'm having trouble connecting right now. Please try again."
        }
        if (typeof error === "string") {
          return error
        }
        if (error instanceof Error) {
          return error.message
        }
        return "Something went wrong. Please try again."
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}

function formatCocktailForPrompt(cocktail: Partial<GenerateCocktail>) {
  const ingredientsList = Array.isArray(cocktail?.ingredients)
    ? cocktail?.ingredients
    : typeof cocktail?.ingredients === "string"
      ? [cocktail?.ingredients]
      : []
  const instructionsList = Array.isArray(cocktail?.instructions)
    ? cocktail?.instructions
    : typeof cocktail?.instructions === "string"
      ? [cocktail?.instructions]
      : []

  const formattedIngredients =
    ingredientsList.length > 0 ? `- ${ingredientsList.join("\n- ")}` : "None provided"
  const formattedInstructions =
    instructionsList.length > 0
      ? `- ${instructionsList.join("\n- ")}`
      : "Keep steps concise and actionable."

  return `Name: ${cocktail?.name ?? "Unknown"}
Description: ${cocktail?.description ?? ""}
Ingredients:\n${formattedIngredients}
Instructions:\n${formattedInstructions}
Garnish: ${cocktail?.garnish ?? ""}
Glass: ${cocktail?.glass ?? ""}
Tags: ${Array.isArray(cocktail?.tags) ? cocktail?.tags.join(", ") : ""}
Notes: ${cocktail?.notes ?? ""}`
}