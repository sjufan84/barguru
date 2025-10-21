"use client"

import { Sparkles } from "lucide-react"
import { SignInButton, SignUpButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

interface QuotaAlertProps {
  message: string
  usageCount: number
  limit?: number
}

export function QuotaAlert({ message, usageCount, limit = 1 }: QuotaAlertProps) {
  const safeLimit = Math.max(limit, 1)
  const safeUsage = Math.min(Math.max(usageCount, 0), safeLimit)
  const progressPercent = Math.round((safeUsage / safeLimit) * 100)

  return (
    <div className="relative overflow-hidden rounded-3xl border border-orange-200/70 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 p-6 shadow-md dark:border-orange-900/40 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/30">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),transparent_65%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.25),transparent_70%)]" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-inner shadow-white/40 backdrop-blur-sm dark:bg-orange-950/70">
            <Sparkles className="h-5 w-5 text-orange-600 dark:text-amber-300" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-900/60 dark:text-amber-200/70">
                Complimentary limit reached
              </p>
              <h3 className="text-base font-semibold text-orange-950 dark:text-amber-100">
                Your guest session has wrapped
              </h3>
            </div>
            <p className="max-w-xl text-sm text-orange-900/80 dark:text-amber-100/80">
              {message}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-end">
          <div className="min-w-[220px] space-y-2">
            <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-orange-900/60 dark:text-amber-200/80">
              <span>Complimentary</span>
              <span>
                {safeUsage} of {safeLimit}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-orange-200/60 dark:bg-orange-900/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <SignUpButton mode="modal" redirectUrl="/" afterSignUpUrl="/">
              <Button className="bg-orange-600 text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-400">
                Sign up free with Clerk
              </Button>
            </SignUpButton>
            <SignInButton mode="modal" redirectUrl="/" afterSignInUrl="/">
              <Button
                variant="outline"
                className="border-orange-200/70 bg-white/60 text-orange-900 hover:bg-orange-100 dark:border-orange-900/50 dark:bg-orange-950/50 dark:text-amber-100 dark:hover:bg-orange-900"
              >
                I already have an account
              </Button>
            </SignInButton>
          </div>
        </div>
      </div>
    </div>
  )
}
