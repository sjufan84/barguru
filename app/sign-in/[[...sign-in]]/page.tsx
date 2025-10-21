"use client"

import { SignIn } from "@clerk/nextjs"

import { AuthPageShell } from "@/components/auth/auth-page-shell"

export default function SignInPage() {
  return (
    <AuthPageShell
      title="Sign in to continue crafting"
      description="Pick up right where you left off—your saved builds, guest prompts, and print-ready cards are waiting."
      footer={
        <p>
          We&apos;ll keep you signed in on this device. You can always manage your session from the user menu once you&apos;re back inside the app.
        </p>
      }
    >
      <SignIn
        afterSignInUrl="/"
        redirectUrl="/"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "border-0 bg-transparent p-0 shadow-none",
            headerTitle: "text-left text-2xl font-semibold",
            headerSubtitle: "text-left text-sm text-muted-foreground",
            formFieldLabel: "text-sm font-medium text-foreground",
            formFieldInput: "rounded-lg border-border bg-background/80 text-foreground focus:ring-2 focus:ring-ring",
            formFieldInput__active: "ring-2 ring-ring",
            formButtonPrimary:
              "mt-2 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90",
            footerActionText: "text-sm text-muted-foreground",
            footerActionLink: "text-primary hover:text-primary/80",
            socialButtonsBlockButton:
              "rounded-full border border-border/70 bg-background/70 text-foreground hover:bg-secondary/60",
            dividerText: "text-xs uppercase tracking-[0.25em] text-muted-foreground",
            identityPreview: "rounded-2xl border border-border/70 bg-background/70",
          },
          variables: {
            colorBackground: "transparent",
            colorText: "hsl(var(--foreground))",
            colorPrimary: "hsl(var(--primary))",
            colorInputText: "hsl(var(--foreground))",
          },
        }}
      />
    </AuthPageShell>
  )
}
