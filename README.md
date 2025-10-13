# BarGuru

A cocktail recipe and bartending assistant app built with Next.js and Bun.

## Prerequisites

- [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager
- Node.js 18+ (for compatibility)

## Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```

2. Run the development server:
   ```bash
   bun run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build for production with Turbopack
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run test` - Run tests with Vitest

## Tech Stack

- **Framework**: Next.js 15 with Turbopack
- **Runtime**: Bun
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with class-variance-authority
- **AI**: Vercel AI SDK with Google AI
- **Validation**: Zod schemas
- **Testing**: Vitest

## Project Structure

- `app/` - Next.js app directory with pages and API routes
- `components/` - Reusable React components
- `lib/` - Utility functions and configurations
- `app/schemas/` - Zod validation schemas

## Development

This project uses Bun for fast package management and execution. The lockfile `bun.lock` ensures consistent dependency versions across environments.
