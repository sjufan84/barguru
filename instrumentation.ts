/**
 * Server-side instrumentation for Next.js
 * This file is automatically loaded by Next.js before any other code runs
 * Reference: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize Sentry for server-side error tracking

    await import('./sentry.server.config');


    // Initialize PostHog server-side SDK
    const { PostHog } = await import("posthog-node");
    global.posthogServer = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com",
      flushInterval: 30000, // Flush events every 30 seconds
    });

    console.log("✅ Server instrumentation initialized (Sentry + PostHog)");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import('./sentry.edge.config');
  }
}

// Extend global namespace for TypeScript
declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var posthogServer: any;
}

export const onRequestError = Sentry.captureRequestError;
