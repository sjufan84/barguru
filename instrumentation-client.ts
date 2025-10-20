/**
 * Client-side instrumentation for PostHog and Sentry
 * This file should be imported in the root layout
 */

import posthog from "posthog-js";
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: "https://609b5cebfeafcec3f92006ddfc9110ca@o4510224267804672.ingest.us.sentry.io/4510224312762368",
  tracesSampleRate: 1.0,
  enableLogs: true,
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

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

    console.log("✅ Client analytics initialized (PostHog + Sentry)");
  }
}


// Export PostHog for manual event capture
export { posthog };
