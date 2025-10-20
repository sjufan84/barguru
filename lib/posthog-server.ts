/**
 * Server-side PostHog utilities
 * Use these functions in API routes and server components to track events and check feature flags
 */

import { PostHog } from 'posthog-node';

export function getPostHogServer(): PostHog | null {
  if (typeof window !== 'undefined') {
    console.warn('getPostHogServer called from client-side. Use client-side PostHog instead.');
    return null;
  }

  // Access the global PostHog instance initialized in instrumentation.ts
  const client = (globalThis as unknown as { posthogServer?: PostHog }).posthogServer;

  if (!client) {
    console.warn('PostHog server instance not initialized. Check instrumentation.ts');
    return null;
  }

  return client;
}

/**
 * Track an event on the server side
 * @param userId - The user identifier (usually email or user ID)
 * @param eventName - The event name to track
 * @param properties - Optional event properties
 */
export async function trackServerEvent(
  userId: string,
  eventName: string,
  properties?: Record<string, unknown>
): Promise<void> {
  const client = getPostHogServer();

  if (!client) {
    console.warn(`Event not tracked (PostHog not available): ${eventName}`);
    return;
  }

  try {
    client.capture({
      distinctId: userId,
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(`Failed to track event ${eventName}:`, error);
  }
}

/**
 * Get a feature flag value for a user
 * @param userId - The user identifier
 * @param flagKey - The feature flag key
 * @param defaultValue - Default value if flag is not found
 * @returns The feature flag value
 */
export async function getFeatureFlag(
  userId: string,
  flagKey: string,
  defaultValue: boolean = false
): Promise<boolean> {
  const client = getPostHogServer();

  if (!client) {
    console.warn(`Feature flag not evaluated (PostHog not available): ${flagKey}`);
    return defaultValue;
  }

  try {
    const flag = await client.getFeatureFlag(flagKey, userId);
    return flag === true;
  } catch (error) {
    console.error(`Failed to get feature flag ${flagKey}:`, error);
    return defaultValue;
  }
}

/**
 * Get all feature flags for a user
 * @param userId - The user identifier
 * @returns Object with flag names as keys and boolean values
 */
export async function getFeatureFlags(
  userId: string
): Promise<Record<string, boolean | string>> {
  const client = getPostHogServer();

  if (!client) {
    console.warn('Feature flags not evaluated (PostHog not available)');
    return {};
  }

  try {
    const flags = await client.getAllFlags(userId);
    return (flags || {}) as Record<string, boolean | string>;
  } catch (error) {
    console.error('Failed to get feature flags:', error);
    return {};
  }
}

/**
 * Identify a user with properties (usually used after authentication)
 * @param userId - The user identifier
 * @param properties - User properties (email, name, plan, etc.)
 */
export async function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
): Promise<void> {
  const client = getPostHogServer();

  if (!client) {
    console.warn('User not identified (PostHog not available)');
    return;
  }

  try {
    client.identify({
      distinctId: userId,
      properties: {
        ...properties,
        identified_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
}

/**
 * Flush pending events (should be called before process exit in serverless functions)
 */
export async function flushPostHog(): Promise<void> {
  const client = getPostHogServer();

  if (!client) {
    return;
  }

  try {
    return client.flush();
  } catch (error) {
    console.error('Failed to flush PostHog:', error);
  }
}
