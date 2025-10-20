'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PostHogProviderCore } from 'posthog-js/react';
import { initializeAnalytics } from '@/instrumentation-client';

export function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize analytics on client mount
    initializeAnalytics();
  }, []);

  return (
    <PostHogProviderCore client={posthog}>
      {children}
    </PostHogProviderCore>
  );
}
