"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { ModeToggle } from "@/components/themes/mode-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AuthPageShellProps {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthPageShell({
  title,
  description,
  children,
  footer,
}: AuthPageShellProps) {
  const pathname = usePathname()
  const isSignIn = pathname?.includes("sign-in")

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(228,216,201,0.4),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(60,47,37,0.6),transparent_60%)]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,_rgba(255,255,255,0.85),transparent_45%)] dark:bg-[linear-gradient(to_bottom_right,_rgba(12,10,8,0.8),transparent_50%)]" />

      <div className="relative z-10 flex w-full max-w-5xl flex-col gap-12 px-6 py-12 sm:px-10 lg:flex-row lg:items-start lg:gap-20">
        <div className="mx-auto w-full max-w-xl space-y-10">
          <header className="flex items-center justify-between">
            <Link href="/" className="group inline-flex flex-col text-left">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground group-hover:text-primary">
                BarGuru
              </span>
              <span className="text-lg font-semibold">Cocktail studio</span>
            </Link>
            <ModeToggle />
          </header>

          <section className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {isSignIn ? "Welcome back" : "Join the bar"}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
              <p className="text-base text-muted-foreground sm:text-lg">{description}</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/80 p-5 text-sm text-muted-foreground shadow-lg shadow-black/5">
              <ol className="space-y-4">
                <AuthHint
                  step={1}
                  title="Save every build"
                  description="Keep a log of guest prompts, finished specs, and printable cards for the team."
                />
                <AuthHint
                  step={2}
                  title="Collaborate in real time"
                  description="Iterate together with live updates and quick editing without losing your place."
                />
                <AuthHint
                  step={3}
                  title="Stay in flow"
                  description="Switch between devices knowing BarGuru remembers exactly where you left off."
                />
              </ol>
            </div>

            <div className="text-sm text-muted-foreground">
              {isSignIn ? (
                <p>
                  Need an account? {""}
                  <Button variant="link" className="px-0 text-sm" asChild>
                    <Link href="/sign-up">Sign up instead</Link>
                  </Button>
                </p>
              ) : (
                <p>
                  Already with us? {""}
                  <Button variant="link" className="px-0 text-sm" asChild>
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="mx-auto w-full max-w-md lg:sticky lg:top-20">
          <div className="rounded-3xl border border-border/60 bg-background/95 p-6 shadow-xl shadow-black/10 backdrop-blur">
            {children}
          </div>
          {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </div>
    </div>
  )
}

function AuthHint({
  step,
  title,
  description,
  className,
}: {
  step: number
  title: string
  description: string
  className?: string
}) {
  return (
    <li className={cn("flex gap-4", className)}>
      <div className="mt-1 h-8 w-8 flex-shrink-0 rounded-full border border-border/70 bg-background/90 text-center text-sm font-semibold leading-8 text-foreground">
        {step}
      </div>
      <div className="space-y-1">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground/90">{description}</p>
      </div>
    </li>
  )
}
