/**
 * Client-side instrumentation for PostHog and Sentry
 * This file should be imported in the root layout
 */

import posthog from "posthog-js";

export function initializeAnalytics() {
  // Initialize PostHog for client-side analytics and feature flags
  if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      person_profiles: "identified_only", // Only create profiles for identified users
      capture_pageview: true, // Capture page views automatically
      capture_pageleave: true, // Capture when users leave
      capture_exceptions: true, // Capture exceptions/errors
      debug: process.env.NODE_ENV === "development",
      autocapture: false, // Disable autocapture for better control
    });

    // Initialize Sentry client-side if DSN is provided
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      import("@sentry/nextjs").then((Sentry) => {
        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          environment: process.env.NODE_ENV,
          tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
          debug: process.env.NODE_ENV === "development",
        });
      });
    }

    console.log("✅ Client analytics initialized (PostHog + Sentry)");
  }
}


// Export PostHog for manual event capture
export { posthog };
