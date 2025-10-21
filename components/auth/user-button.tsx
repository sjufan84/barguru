"use client"

import { UserButton, SignInButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthButton() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />;
  }

  if (isSignedIn) {
    return <UserButton afterSignOutUrl="/" />;
  }

  return (
    <SignInButton mode="modal">
      <Button variant="outline" size="sm">
        Sign In
      </Button>
    </SignInButton>
  );
}
