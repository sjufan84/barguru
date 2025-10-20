/**
 * Server-side instrumentation for Next.js
 * This file is automatically loaded by Next.js before any other code runs
 * Reference: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize Sentry for server-side error tracking
    const sentry = await import("@sentry/nextjs");

    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        debug: process.env.NODE_ENV === "development",
      });
    }

    // Initialize PostHog server-side SDK
    const { PostHog } = await import("posthog-node");
    global.posthogServer = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com",
      flushInterval: 30000, // Flush events every 30 seconds
    });

    console.log("✅ Server instrumentation initialized (Sentry + PostHog)");
  }
}

// Extend global namespace for TypeScript
declare global {
  var posthogServer: any;
}
