# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `bun install` - Install dependencies
- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build for production with Turbopack
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run test` - Run tests with Vitest
- `bun run db:generate` - Generate database migrations with Drizzle
- `bun run db:migrate` - Run database migrations with Drizzle

## Technology Stack

- **Runtime**: Bun (JavaScript runtime and package manager)
- **Framework**: Next.js 15 with App Router and Turbopack
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4
- **AI Integration**: Vercel AI SDK with Google AI (Gemini models)
- **Authentication**: Clerk
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas
- **Testing**: Vitest
- **Theme**: next-themes for dark/light mode
- **Monitoring**: Sentry and PostHog

## Project Architecture

### Core Application Flow
BarGuru is a cocktail generation application that allows users to create custom cocktail recipes based on ingredients they have on hand.

**Main Flow:**
1. User fills form with primary ingredient, theme, optional cuisine, and service style
2. Form data validated against Zod schemas and sent to `/api/generate-cocktail`
3. AI generates structured cocktail data using Vercel AI SDK's streaming object generation
4. Simultaneous image generation triggered via `/api/generate-cocktail-image`
5. Results displayed in real-time with streaming updates

### Key Directories Structure

- `app/` - Next.js App Router pages and API routes
  - `api/generate-cocktail/route.ts` - Main cocktail generation endpoint using Google Gemini
  - `api/generate-cocktail-image/route.ts` - Image generation endpoint
  - `api/chat/route.ts` - Chat API for cocktail discussions
  - `api/saved-cocktails/route.ts` - CRUD operations for saved cocktails
  - `api/webhooks/clerk/route.ts` - Clerk authentication webhooks
- `components/` - React components organized by function
  - `ui/` - Reusable UI components built with Radix UI and Tailwind
  - `themes/` - Theme switching components
  - `cocktails/` - Cocktail-specific display components
  - `auth/` - Authentication components
- `schemas/` - Zod validation schemas
- `lib/` - Utility functions and configurations
  - `db.ts` - Database connection
  - `db.schema.ts` - Drizzle database schema definitions
  - `db-utils.ts` - Database utility functions
- `hooks/` - Custom React hooks for state management

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
- Includes quota checking for anonymous users

**Image Generation (`/api/generate-cocktail-image`):**
- Uses Google Gemini 2.5 Flash Image model
- Builds cinematic prompts from cocktail data and user inputs
- Returns base64-encoded images
- 60-second max duration

### Database Schema

**Users Table:**
- Synced with Clerk authentication
- Tracks premium status and usage quotas
- Stores email and basic profile information

**Cocktail Usage Table:**
- Tracks generation attempts for quota enforcement
- Non-members limited to 1 cocktail before sign-up prompt
- Links to users table for authenticated users

**Saved Cocktails Table:**
- Stores user's saved cocktail recipes
- Relates to users table with full recipe data

### Component Architecture

**Main Page (`app/page.tsx`):**
- Large single-page application with form and results side-by-side
- Complex state management for form data, loading states, and image generation
- Uses `experimental_useObject` hook for streaming AI responses
- Responsive design that collapses to single column on mobile

**Key Hooks:**
- `useCocktailForm` - Manages form state, validation, and submission
- `useCocktailImage` - Handles image generation with deduplication and abort logic

**GeneratedCocktailCard:**
- Displays streaming cocktail data with skeleton states
- Handles image loading, error states, and retry functionality
- Organized sections for ingredients, instructions, and notes

### Authentication & Quotas

**Guest Users:**
- Limited to 1 cocktail generation
- Encouraged to sign up for unlimited access
- Usage tracked via cookies and database

**Authenticated Users:**
- Full access to cocktail generation
- Can save and manage cocktail collections
- Usage tracked for analytics and potential premium features

### Environment Variables
The application requires:
- `GOOGLE_GENERATIVE_AI_API_KEY` - For Google AI integration
- Database connection string for Neon PostgreSQL
- Clerk authentication keys
- Sentry and PostHog configuration

### Development Notes
- Uses experimental React Compiler (`reactCompiler: true` in next.config.ts)
- Tailwind CSS v4 with custom color system
- Comprehensive form validation with real-time error handling
- Image generation includes request deduplication and abort controller logic
- Accessibility features include ARIA labels and screen reader support
- Error tracking with Sentry and analytics with PostHog