"use client"

import { Martini } from "lucide-react"
import { SignInButton, SignUpButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

interface GuestTrialBannerProps {
  usageCount: number
  limit?: number
}

export function GuestTrialBanner({ usageCount, limit = 1 }: GuestTrialBannerProps) {
  const safeLimit = Math.max(limit, 1)
  const safeUsage = Math.min(Math.max(usageCount, 0), safeLimit)

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-orange-50 to-white/70 p-6 shadow-md dark:border-amber-900/50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-zinc-950/40">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.18),transparent_65%)] dark:bg-[radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.25),transparent_70%)]" />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-inner shadow-white/40 backdrop-blur-sm dark:bg-amber-950/70">
            <Martini className="h-5 w-5 text-amber-600 dark:text-amber-200" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-900/60 dark:text-amber-200/70">
                Complimentary cocktail served
              </p>
              <h3 className="text-lg font-semibold text-amber-950 dark:text-amber-100">
                Keep the menu flowing with unlimited recipes
              </h3>
            </div>
            <p className="max-w-xl text-sm text-amber-900/80 dark:text-amber-100/80">
              Sign up with Clerk to save your builds, unlock unlimited generations, and keep iterating with your bar team.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:items-end">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-amber-900/70 shadow-sm dark:bg-amber-950/60 dark:text-amber-200/80">
            <span>Guest access</span>
            <span>
              {safeUsage} of {safeLimit}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <SignUpButton mode="modal" redirectUrl="/" afterSignUpUrl="/">
              <Button className="bg-amber-500 text-amber-950 shadow-lg shadow-amber-500/30 transition hover:bg-amber-400 dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-300">
                Create my free account
              </Button>
            </SignUpButton>
            <SignInButton mode="modal" redirectUrl="/" afterSignInUrl="/">
              <Button
                variant="ghost"
                className="text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900/60"
              >
                Sign in
              </Button>
            </SignInButton>
          </div>
        </div>
      </div>
    </div>
  )
}
