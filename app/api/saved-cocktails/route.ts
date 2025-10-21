import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { ZodError, z } from "zod"

import { getSavedCocktailsForUser, saveCocktailForUser, deleteSavedCocktail, getOrCreateUser } from "@/lib/db-utils"
import type { SavedCocktail } from "@/lib/db.schema"
import {
  cocktailInputSchema,
  generateCocktailSchema,
  savedCocktailSchema,
} from "@/schemas/cocktailSchemas"

const saveCocktailRequestSchema = z.object({
  cocktail: generateCocktailSchema,
  inputs: cocktailInputSchema.nullable().optional(),
  imageUrl: z.string().url().optional().nullable(),
})

const deleteCocktailRequestSchema = z.object({
  cocktailId: z.number(),
})

function serializeSavedCocktail(record: SavedCocktail) {
  return {
    id: record.id,
    name: record.name,
    cocktail: record.cocktail,
    inputs: record.inputs ?? null,
    imageUrl: record.imageUrl ?? null,
    createdAt:
      record.createdAt instanceof Date
        ? record.createdAt.toISOString()
        : record.createdAt,
    updatedAt:
      record.updatedAt instanceof Date
        ? record.updatedAt.toISOString()
        : record.updatedAt,
  }
}

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const records = await getSavedCocktailsForUser(userId)
    const cocktails = records.map(serializeSavedCocktail)
    return NextResponse.json({ cocktails })
  } catch (error) {
    console.error("Failed to load saved cocktails", error)
    return NextResponse.json({ error: "Unable to load saved cocktails." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let payload: z.infer<typeof saveCocktailRequestSchema>

  try {
    const body = await request.json()
    payload = saveCocktailRequestSchema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid cocktail payload.", details: error.issues },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: "Unable to read request body." }, { status: 400 })
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
      cocktail: payload.cocktail,
      inputs: payload.inputs ?? null,
      imageUrl: payload.imageUrl ?? null,
    })

    const cocktail = serializeSavedCocktail(record)
    // Validate the response with our schema to ensure consistent shape
    savedCocktailSchema.parse(cocktail)

    return NextResponse.json({ cocktail }, { status: 201 })
  } catch (error) {
    console.error("Failed to save cocktail", error)
    return NextResponse.json({ error: "Unable to save cocktail." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let payload: z.infer<typeof deleteCocktailRequestSchema>

  try {
    const body = await request.json()
    payload = deleteCocktailRequestSchema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid cocktail ID.", details: error.issues },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: "Unable to read request body." }, { status: 400 })
  }

  try {
    const deletedRecord = await deleteSavedCocktail(userId, payload.cocktailId)

    if (!deletedRecord) {
      return NextResponse.json({ error: "Cocktail not found." }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Cocktail deleted successfully." })
  } catch (error) {
    console.error("Failed to delete cocktail", error)
    return NextResponse.json({ error: "Unable to delete cocktail." }, { status: 500 })
  }
}
