import { google } from "@ai-sdk/google"
import { convertToModelMessages, streamText } from "ai"
import type { UIMessage } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

interface ChatRequest {
  messages: UIMessage[]
  cocktailName?: string
  cocktailData?: {
    name?: string
    description?: string
    ingredients?: string[]
    instructions?: string
    garnish?: string
    glass?: string
    tags?: string[]
    notes?: string
  }
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json()
    const { messages, cocktailName, cocktailData } = body

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