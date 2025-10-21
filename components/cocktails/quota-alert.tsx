"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface QuotaAlertProps {
  message: string
  usageCount: number
  onSignUp?: () => void
}

export function QuotaAlert({ message, usageCount, onSignUp }: QuotaAlertProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-orange-200/50 bg-gradient-to-r from-orange-50 to-amber-50 p-6 shadow-sm dark:border-orange-900/30 dark:from-orange-950/30 dark:to-amber-950/30">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.1),transparent_70%)]" />
      
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        
        <div className="flex flex-1 flex-col gap-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">
              Free Trial Limit Reached
            </h3>
            <p className="text-sm text-orange-800 dark:text-orange-200">
              {message}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/sign-up">
              <Button
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
                onClick={onSignUp}
              >
                Sign Up for Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                size="sm"
                variant="outline"
                className="border-orange-200 dark:border-orange-800"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
