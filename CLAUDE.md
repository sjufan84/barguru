# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `bun install` - Install dependencies
- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build for production with Turbopack
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run test` - Run tests with Vitest

## Technology Stack

- **Runtime**: Bun (JavaScript runtime and package manager)
- **Framework**: Next.js 15 with App Router and Turbopack
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4
- **AI Integration**: Vercel AI SDK with Google AI (Gemini models)
- **Validation**: Zod schemas
- **Testing**: Vitest
- **Theme**: next-themes for dark/light mode

## Project Architecture

### Core Application Flow
BarGuru is an ingredient-first cocktail generation application that allows users to create custom cocktail recipes based on ingredients they have on hand.

**Main Flow:**
1. User inputs primary ingredient, theme, optional cuisine pairing, and service style
2. Form data is validated against Zod schemas and sent to `/api/generate-cocktail`
3. AI generates structured cocktail data using Vercel AI SDK's streaming object generation
4. Simultaneously, image generation is triggered via `/api/generate-cocktail-image`
5. Results are displayed in real-time with streaming updates

### Key Directories Structure

- `app/` - Next.js App Router pages and API routes
  - `api/generate-cocktail/route.ts` - Main cocktail generation endpoint using Google Gemini
  - `api/generate-cocktail-image/route.ts` - Image generation endpoint
- `components/` - React components organized by function
  - `ui/` - Reusable UI components built with Radix UI and Tailwind
  - `themes/` - Theme switching components
  - `cocktails/` - Cocktail-specific display components
- `schemas/` - Zod validation schemas
- `lib/` - Utility functions and configurations

### Schema Architecture
The application uses a comprehensive schema system:

**Input Schema (`cocktailInputSchema`):**
- `primaryIngredient` (required) - Main ingredient to feature
- `theme` (required) - Mood or vibe description
- `cuisine` (optional) - Food pairing context
- `type` (enum) - Service style: "classic", "standard", or "craft"

**Output Schema (`generateCocktailSchema`):**
- `name`, `description` - Cocktail identity
- `ingredients`, `instructions` - Recipe details
- `tags`, `garnish`, `glass` - Presentation elements
- `notes` - Technique and preparation guidance

### AI Integration Details

**Cocktail Generation (`/api/generate-cocktail`):**
- Uses Google Gemini 2.5 Flash model
- Streaming object generation with `streamObject` from Vercel AI SDK
- Structured output matching Zod schema
- 30-second max duration

**Image Generation (`/api/generate-cocktail-image`):**
- Uses Google Gemini 2.5 Flash Image model
- Builds cinematic prompts from cocktail data and user inputs
- Returns base64-encoded images
- 60-second max duration

### Component Architecture

**Main Page (`app/page.tsx`):**
- Large single-page application with form and results side-by-side
- Complex state management for form data, loading states, and image generation
- Uses `experimental_useObject` hook for streaming AI responses
- Responsive design that collapses to single column on mobile

**GeneratedCocktailCard:**
- Displays streaming cocktail data with skeleton states
- Handles image loading, error states, and retry functionality
- Organized sections for ingredients, instructions, and notes

### Environment Variables
The application requires:
- `GOOGLE_GENERATIVE_AI_API_KEY` - For Google AI integration

### Development Notes
- Uses experimental React Compiler (`reactCompiler: true` in next.config.ts)
- Tailwind CSS v4 with custom color system
- Comprehensive form validation with real-time error handling
- Image generation includes request deduplication and abort controller logic
- Accessibility features include ARIA labels and screen reader support