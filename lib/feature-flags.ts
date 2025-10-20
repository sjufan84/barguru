/**
 * Feature flag names enum
 * All feature flag keys used in the application should be defined here
 * This ensures consistency and type safety across the codebase
 */
export const FEATURE_FLAGS = {
  MONETIZATION_ENABLED: process.env.NEXT_PUBLIC_FEATURE_FLAG_MONETIZATION_ENABLED || 'monetization_enabled',
  PRO_TIER_ENABLED: process.env.NEXT_PUBLIC_FEATURE_FLAG_PRO_TIER_ENABLED || 'pro_tier_enabled',
  TEAM_TIER_ENABLED: process.env.NEXT_PUBLIC_FEATURE_FLAG_TEAM_TIER_ENABLED || 'team_tier_enabled',
} as const;

type PostHogWindow = Window & {
  posthog?: {
    getFeatureFlag?: (flagKey: string) => boolean | undefined;
    getAllFlags?: () => Record<string, boolean | string> | null;
  };
};

/**
 * Check if a feature flag is enabled for the current user (client-side)
 * @param flagKey - The feature flag key from FEATURE_FLAGS enum
 * @returns Boolean indicating if the flag is enabled
 */
export function useFeatureFlag(flagKey: string): boolean {
  // This will be replaced with actual PostHog integration
  // For now, return false to disable all premium features during development
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Access PostHog from window object (initialized in layout)
    const posthog = (window as PostHogWindow).posthog;
    if (posthog && typeof posthog.getFeatureFlag === 'function') {
      const flag = posthog.getFeatureFlag(flagKey);
      return flag === true;
    }
  } catch (error) {
    console.error(`Error checking feature flag ${flagKey}:`, error);
  }

  return false;
}

/**
 * Get all feature flags for the current user
 * @returns Object with flag names as keys and boolean values
 */
export function useFeatureFlags(): Record<string, boolean | string> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    // Access PostHog from window object (initialized in layout)
    const posthog = (window as PostHogWindow).posthog;
    if (posthog && typeof posthog.getAllFlags === 'function') {
      return posthog.getAllFlags() || {};
    }
  } catch (error) {
    console.error('Error getting all feature flags:', error);
  }

  return {};
}

/**
 * Validate feature flag is enabled before using it
 * Useful for catching unexpected flag names early
 * @param flagKey - The feature flag key to validate
 * @returns True if the flag key is defined in FEATURE_FLAGS
 */
export function isValidFeatureFlag(flagKey: string): boolean {
  return Object.values(FEATURE_FLAGS).includes(flagKey);
}
