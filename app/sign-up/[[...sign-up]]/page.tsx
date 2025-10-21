"use client"

import { SignUp } from "@clerk/nextjs"

import { AuthPageShell } from "@/components/auth/auth-page-shell"

export default function SignUpPage() {
  return (
    <AuthPageShell
      title="Create your BarGuru workspace"
      description="Personalize the cocktail generator to your bar program and save every winning build for service."
      footer={
        <p>
          By creating an account you agree to our service terms and privacy policy. We only use your email to keep your workspace in sync.
        </p>
      }
    >
      <SignUp
        afterSignUpUrl="/"
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
