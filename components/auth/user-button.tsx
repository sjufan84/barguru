"use client"

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

export function AuthButton() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          You&apos;re signed in
        </span>
        <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <SignUpButton mode="modal" redirectUrl="/" afterSignUpUrl="/">
        <Button size="sm" className="rounded-full px-5">
          Create account
        </Button>
      </SignUpButton>
      <SignInButton mode="modal" redirectUrl="/" afterSignInUrl="/">
        <Button variant="ghost" size="sm" className="rounded-full px-5">
          Sign in
        </Button>
      </SignInButton>
    </div>
  )
}
