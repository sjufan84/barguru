# BarGuru Infrastructure & Data Flow Audit

**Document Date:** October 2025  
**Purpose:** Week 1 Foundations - Infrastructure Assessment for Monetization  
**Status:** Active Development

---

## 1. Current Architecture Overview

### Technology Stack
- **Frontend:** Next.js 15.5.4 (App Router, React 19)
- **AI Models:** Google Gemini (2.0-flash-exp, 2.5-flash, 2.5-flash-image)
- **Analytics:** PostHog (client + server-side)
- **Error Tracking:** Sentry (client + server-side)
- **Package Manager:** Bun
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI, custom components

---

## 2. API Endpoints (Current)

### `POST /api/generate-cocktail`
**Purpose:** Generate a new cocktail recipe based on user inputs  
**Authentication:** None (currently open)  
**Rate Limiting:** None (currently open)  
**Monetization Impact:** ⭐ **PRIMARY - QUOTA GATING REQUIRED**

**Request Body:**
```json
{
  "primaryIngredient": "string",
  "type": "string",
  "theme": "string",
  "cuisine": "string?" (optional)
}
```

**Response:**
```json
{
  "name": "string",
  "description": "string",
  "ingredients": ["string"],
  "instructions": "string",
  "garnish": "string",
  "glass": "string",
  "tags": ["string"],
  "notes": "string"
}
```

**Metering Points:**
- ✅ Track event: `cocktail_generated`
- ✅ Property: `type`, `theme`, `cuisine`
- ✅ Cost: ~0.5 API credits per generation (Google Gemini)

---

### `POST /api/generate-cocktail-image`
**Purpose:** Generate a high-quality image of a cocktail  
**Authentication:** None (currently open)  
**Rate Limiting:** None (currently open)  
**Monetization Impact:** ⭐ **SECONDARY - HIGH-VALUE FEATURE FOR UPSELL**

**Request Body:**
```json
{
  "cocktail": {
    "name": "string",
    "description": "string",
    "ingredients": ["string"],
    "instructions": "string",
    "garnish": "string",
    "glass": "string",
    "tags": ["string"],
    "notes": "string"
  },
  "inputs": {
    "primaryIngredient": "string",
    "type": "string",
    "theme": "string",
    "cuisine": "string?"
  }
}
```

**Response:**
```json
{
  "imageUrl": "data:image/png;base64,..."
}
```

**Metering Points:**
- ✅ Track event: `cocktail_image_generated`
- ✅ Property: `image_type` (base64 = free tier, url = pro tier)
- ✅ Cost: ~1.0 API credits per image (Google Gemini Vision)
- ✅ Storage: Ephemeral (data URL) - should migrate to Vercel Blob for Pro tier

---

### `POST /api/chat`
**Purpose:** Stream chat responses about a specific cocktail  
**Authentication:** None (currently open)  
**Rate Limiting:** None (currently open)  
**Monetization Impact:** ⭐ **TERTIARY - ENGAGEMENT FEATURE**

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "string"
    }
  ],
  "cocktailName": "string?",
  "cocktailData": {
    "name": "string?",
    "description": "string?",
    "ingredients": ["string?"],
    "instructions": "string?",
    "garnish": "string?",
    "glass": "string?",
    "tags": ["string?"],
    "notes": "string?"
  }
}
```

**Response:** Streaming text response  

**Metering Points:**
- ✅ Track event: `chat_message_sent`
- ✅ Property: `message_length`, `response_time`
- ✅ Cost: Variable based on model and token usage

---

## 3. Current Data Flows

### Client → Server Flow (No Auth)
```
HomePage (Client)
    ↓
CocktailRequestForm (Input)
    ↓
[POST] /api/generate-cocktail (Server)
    ↓
Google Gemini API (External)
    ↓
GeneratedCocktailCard (Display)
    ↓ (User clicks "Generate Image")
[POST] /api/generate-cocktail-image (Server)
    ↓
Google Gemini Vision API (External)
    ↓
Display base64 image
```

### Missing Elements for Monetization
- ❌ User authentication / identification
- ❌ Usage tracking & quotas
- ❌ Feature flag checks
- ❌ Billing information
- ❌ Request authorization
- ❌ Data persistence

---

## 4. Environment Variables (Week 1 Setup)

### Configured
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog project key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog API host
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking (optional)
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google AI API key
- `NODE_ENV` - Development/production environment
- `NEXT_PUBLIC_APP_URL` - Application URL

### Feature Flags (PostHog)
- `FEATURE_FLAG_MONETIZATION_ENABLED` - Master switch for premium features
- `FEATURE_FLAG_PRO_TIER_ENABLED` - Pro subscription features
- `FEATURE_FLAG_TEAM_TIER_ENABLED` - Team collaboration features

---

## 5. Instrumentation Setup (Week 1 Complete)

### Server-Side (instrumentation.ts)
- ✅ Sentry initialization with error tracking
- ✅ PostHog Node SDK initialization
- ✅ Global instance for API routes
- ✅ Automatic event flushing every 30s

### Client-Side (instrumentation-client.ts)
- ✅ PostHog JS SDK initialization
- ✅ Exception capturing enabled
- ✅ Session recording (privacy-masked)
- ✅ Sentry client integration
- ✅ Auto page view tracking

### Utilities Created
- ✅ `lib/posthog-server.ts` - Server-side event tracking functions
- ✅ `lib/feature-flags.ts` - Feature flag checking utilities
- ✅ `app/providers.tsx` - PostHog React provider

---

## 6. Critical Events for Monetization Tracking

### User Activity Events
```typescript
// Events to track in PostHog
'cocktail_generated'       // When user submits form
'cocktail_image_generated' // When image is created
'chat_message_sent'        // When user sends chat message
'user_signed_up'           // When user creates account
'user_plan_viewed'         // When user views pricing
'subscription_started'     // When user subscribes
'subscription_cancelled'   // When user cancels
```

### Properties to Attach
- `user_id` - Anonymous or authenticated ID
- `plan_type` - 'free', 'pro', 'team'
- `timestamp` - ISO 8601 format
- `error_occurred` - Boolean for failures
- `api_cost_credits` - Estimated cost

---

## 7. Next Steps (Week 2-3)

### Authentication & User Model
- [ ] Integrate Supabase Auth or Clerk
- [ ] Create user profile table
- [ ] Implement session middleware
- [ ] Add user context to requests

### API Middleware
- [ ] Create quota checking middleware
- [ ] Add feature flag guards to endpoints
- [ ] Implement usage tracking in middleware
- [ ] Add request authentication layer

### Data Storage
- [ ] Set up Supabase Postgres tables:
  - `users` - User profiles and plan info
  - `usage_logs` - Event tracking and quotas
  - `cocktails` - Saved user cocktails
  - `teams` - Team workspace data

---

## 8. Security & Privacy Considerations

### Current Gaps
- ❌ No API authentication
- ❌ No rate limiting
- ❌ No CORS restrictions
- ❌ No request validation middleware
- ❌ Secrets in environment (OK for now, needs rotation)

### Immediate Improvements (Week 1)
- ✅ Environment variables documented
- ✅ Error tracking operational
- ✅ Analytics capturing (privacy-masked)

### Pre-Launch Requirements (Week 6)
- [ ] API key authentication
- [ ] Rate limiting per user/IP
- [ ] Request signing
- [ ] Privacy policy & terms update
- [ ] PCI compliance review for Stripe
- [ ] Data retention policies

---

## 9. Cost Analysis

### Current Monthly Costs (Estimated)
- **Google Gemini API**: ~$0-5/month (free tier active)
- **PostHog**: Free tier (up to 1M events)
- **Sentry**: Free tier (up to 5K events)
- **Vercel Hosting**: $0-20/month (Pro plan)

### Projected Costs at Scale
- **Google Gemini**: 10K generations/month × $0.00015 = ~$1.50
- **PostHog**: 1M+ events → $450/month (Pro plan)
- **Sentry**: Error tracking → $99/month (Pro plan)
- **Database (Supabase)**: $0-25/month (usage-based)

---

## 10. Checklist: Week 1 Foundations ✅

- [x] Environment variables configured
- [x] PostHog server + client initialized
- [x] Sentry error tracking set up
- [x] Feature flag system in place
- [x] Server utilities for event tracking created
- [x] Data flow audit completed
- [x] API endpoints documented
- [x] Instrumentation working

---

## Quick Reference: Using the New Utilities

### Track an Event (Server)
```typescript
import { trackServerEvent } from '@/lib/posthog-server';

await trackServerEvent('user@example.com', 'cocktail_generated', {
  type: 'margarita',
  theme: 'tropical',
});
```

### Check Feature Flag (Server)
```typescript
import { getFeatureFlag } from '@/lib/posthog-server';

const proEnabled = await getFeatureFlag('user@example.com', 'pro_tier_enabled');
if (!proEnabled) {
  return NextResponse.json({ error: 'Feature not available' }, { status: 403 });
}
```

### Track Event (Client)
```typescript
import { usePostHog } from 'posthog-js/react';

const posthog = usePostHog();
posthog.capture('button_clicked', { button_name: 'submit' });
```

---

**Next Review:** End of Week 2 after auth integration
