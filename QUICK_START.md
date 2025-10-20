# BarGuru Week 1 - Quick Start Guide

**For developers who need to understand the new infrastructure quickly.**

---

## TL;DR - What's New?

We've set up PostHog for analytics, feature flags, and error tracking. Everything is in place to start implementing monetization.

---

## 🚀 Key Files You Need to Know

### Configuration
- `.env.local` - Your development secrets (PostHog key, Sentry DSN, etc.)
- `.env.example` - Template of all variables you need

### Infrastructure
- `instrumentation.ts` - Server initialization (don't edit)
- `instrumentation-client.ts` - Client initialization (don't edit)
- `app/providers.tsx` - React wrapper (don't edit)

### Utilities (Import These!)
- `lib/posthog-server.ts` - Use for server-side tracking
- `lib/feature-flags.ts` - Use for feature flag checks
- `INFRASTRUCTURE.md` - Complete technical documentation
- `WEEK1_SUMMARY.md` - Detailed implementation summary

---

## 📊 Tracking Events (Most Common)

### Server-Side (API Routes, Server Components)
```typescript
import { trackServerEvent } from '@/lib/posthog-server';

// Example: Track when user generates cocktail
await trackServerEvent('user123', 'cocktail_generated', {
  type: 'margarita',
  theme: 'tropical',
});
```

### Client-Side (React Components)
```typescript
'use client';
import { usePostHog } from 'posthog-js/react';

export function MyButton() {
  const posthog = usePostHog();
  
  return (
    <button onClick={() => {
      posthog.capture('button_clicked', {
        button_id: 'generate_btn',
      });
    }}>
      Generate
    </button>
  );
}
```

---

## 🚩 Feature Flags (Gating Premium Features)

### Check on Server
```typescript
import { getFeatureFlag } from '@/lib/posthog-server';

const isPro = await getFeatureFlag('user123', 'pro_tier_enabled');
if (!isPro) {
  return NextResponse.json({ error: 'Pro only' }, { status: 403 });
}
```

### Check on Client
```typescript
import { useFeatureFlag, FEATURE_FLAGS } from '@/lib/feature-flags';

export function PricingButton() {
  const proEnabled = useFeatureFlag(FEATURE_FLAGS.PRO_TIER_ENABLED);
  
  if (!proEnabled) return null;
  
  return <a href="/pricing">See Plans</a>;
}
```

---

## ❌ Error Tracking

### Errors are automatically tracked by Sentry
Just throw errors and they'll be captured:

```typescript
if (!cocktailData) {
  throw new Error('Cocktail data is required');
  // ✅ Automatically sent to Sentry
}
```

---

## 📋 Common Tasks Checklist

### Task: Add event tracking to API endpoint
```
1. Import: import { trackServerEvent } from '@/lib/posthog-server';
2. Call trackServerEvent() before response
3. Include relevant properties
✅ Done!
```

### Task: Gate feature behind pro tier
```
1. Import: import { getFeatureFlag } from '@/lib/posthog-server';
2. Call getFeatureFlag() at start of request
3. Check response and return 403 if denied
✅ Done!
```

### Task: Show/hide UI based on feature flag
```
1. Import: import { useFeatureFlag, FEATURE_FLAGS } from '@/lib/feature-flags';
2. Call useFeatureFlag() in component
3. Conditionally render based on result
✅ Done!
```

---

## 🔗 API Endpoints That Need Tracking

These 3 endpoints are key for monetization:

### 1. POST /api/generate-cocktail
Currently in: `app/api/generate-cocktail/route.ts`
- Track: `cocktail_generated`
- Future: Add quota check

### 2. POST /api/generate-cocktail-image  
Currently in: `app/api/generate-cocktail-image/route.ts`
- Track: `cocktail_image_generated`
- Future: Add quota check, remove watermark for pro

### 3. POST /api/chat
Currently in: `app/api/chat/route.ts`
- Track: `chat_message_sent`
- Future: Add quota check

---

## 📚 Documentation Structure

```
INFRASTRUCTURE.md     ← Read this for technical details
WEEK1_SUMMARY.md      ← Read this for implementation details
QUICK_START.md        ← You are here (practical examples)
MONETIZATION_PLAN.md  ← Read for business context
```

---

## ⚙️ Environment Setup

### First Time Setup
1. Copy `.env.example` values to `.env.local`
2. Get PostHog API key from posthog.com
3. (Optional) Get Sentry DSN from sentry.io
4. Run `bun run dev`

### Verify It's Working
1. Open browser console
2. Should see: `✅ Client analytics initialized (PostHog + Sentry)`
3. Try: `window.posthog?.capture('test', {})`
4. Check PostHog dashboard in 30-60 seconds

---

## 🆘 Troubleshooting

### PostHog events not appearing?
- [ ] Check `.env.local` has POSTHOG_KEY
- [ ] Check Network tab in DevTools
- [ ] Wait 60 seconds (batching delay)
- [ ] Check PostHog project is correct

### Feature flags always returning false?
- [ ] Verify flag name in `.env.local`
- [ ] Check PostHog dashboard has flag created
- [ ] Check user is identified in PostHog

### Build is broken?
- [ ] Run `bun install`
- [ ] Run `bun run build` to see detailed errors
- [ ] Check all imports are correct

---

## 📞 Next Steps

**Ready to move to Week 2?**
- [ ] Read INFRASTRUCTURE.md completely
- [ ] Try adding an event to one of the 3 API endpoints
- [ ] Create feature flags in PostHog dashboard
- [ ] Set up authentication (Supabase/Clerk)

**Questions?**
- Check WEEK1_SUMMARY.md for more details
- Review code comments in utility files
- See INFRASTRUCTURE.md section "Quick Reference"

---

## Key Functions Reference

| Function | Where | Use For |
|----------|-------|---------|
| `trackServerEvent()` | `lib/posthog-server.ts` | Log events from server |
| `getFeatureFlag()` | `lib/posthog-server.ts` | Check flag on server |
| `identifyUser()` | `lib/posthog-server.ts` | Identify user on server |
| `useFeatureFlag()` | `lib/feature-flags.ts` | Check flag in client component |
| `usePostHog()` | `posthog-js/react` | Track events in client |

---

**You're all set! 🎉 Let's build Week 2!**
