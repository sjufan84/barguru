# Monetization Plan for BarGuru

## Objectives
- Launch a paid offering within 4-6 weeks with minimal refactors.
- Enable recurring revenue via subscription tiers while allowing limited free usage to drive conversion.
- Support credit-card payments (Stripe) and optional corporate invoicing for bar/restaurant teams.
- Ensure compliance (PCI, GDPR, CCPA), telemetry, and experimentation infrastructure for data-driven iteration.

## Target Customer Segments
1. **Home Enthusiasts (B2C)**: Casual users seeking premium cocktail inspiration. Price sensitivity is moderate. Emphasize AI personalization, curated collections, and seasonal drops.
2. **Hospitality Professionals (Prosumer/B2B2C)**: Bartenders, bar managers, and F&B consultants needing rapid menu ideation and cost control. Focus on advanced features (batching, costing, multi-seat).
3. **Enterprises (B2B)**: Chains and hotels requiring collaboration, compliance, and dedicated support. Monetize via high-ACV annual contracts.

## Monetization Model
- **Freemium Core**: Maintain basic cocktail generation with limits (e.g., 10 requests/day, no image downloads, watermarked images).
- **Pro Subscription ($12.99/mo or $120/yr)**:
  - Unlimited cocktail generations with faster queue priority.
  - High-res image downloads, save/share collections, ingredient inventory, menu exports (PDF/CSV).
  - Prompt templates, seasonal drops, custom themes.
  - Basic cost calculator and ABV estimations.
- **Team Subscription ($39/mo per seat)**:
  - Pro features plus shared workspaces, real-time collaboration, batch export, inventory sync (CSV import/API), allergy compliance notes.
  - Admin console for role management, usage analytics, download audit logs.
- **Enterprise Custom**:
  - Dedicated account manager, SSO (SAML/SCIM), SLA, custom integrations (POS, procurement), private models.

## Pricing & Billing Infrastructure
- **Provider**: Stripe Billing + Customer Portal.
- **Offerings**: Monthly + annual plans, usage-based overage for batch image renders ($0.30 per extra render beyond quota).
- **Coupons/Trials**: 7-day trial for Pro, free seat for Team for first month.
- **Refund Handling**: Automate via Stripe's portal; edge cases escalate to support desk.

## High-Level Roadmap (4-6 Weeks)
1. **Week 1: Foundations**
   - Integrate feature flag system (LaunchDarkly or Supabase Edge Functions) for gated rollouts.
   - Set up analytics (PostHog + server events) and error tracking (Sentry).
   - Audit current data flows, ensure environment variable management for secrets.
2. **Week 2: Auth & User Model Enhancements**
   - Introduce Supabase Auth or Clerk (email/password, social logins, magic links).
   - Implement user profiles, plan status, usage tracking in database (Supabase Postgres or PlanetScale MySQL).
   - Build migration scripts and seed data for plans.
3. **Week 3: Payments & Paywall**
   - Create Stripe products/prices, webhook handler for subscription lifecycle (checkout.session.completed, invoice.paid, customer.subscription.updated).
   - Implement client-side checkout & customer portal entrypoints.
   - Add API middleware to enforce request quotas and plan entitlements.
4. **Week 4: Premium Feature Implementation**
   - Save/share collections, favorites, and history with plan-based limits.
   - High-res image pipeline (upgrade storage to Vercel Blob/S3) with watermark removal for paid tiers.
   - Cost calculator and ingredient inventory interface.
5. **Week 5: Team Collaboration & Enterprise Prep**
   - Workspace model, seat management, invitations, and role-based access control.
   - Activity feeds and audit logs.
   - Start SSO groundwork (SAML metadata endpoints).
6. **Week 6: Launch Readiness**
   - QA + security review, load testing, finalize pricing page.
   - Marketing site updates, onboarding emails, in-app upsell experiments.
   - Support documentation, FAQ, cancellation flows.

## Detailed Work Breakdown

### 1. Frontend Enhancements
- **Navigation & Layout**
  - Add persistent top navigation bar with pricing, dashboard, sign-in/out.
  - Implement responsive pricing page (`app/pricing/page.tsx`) describing tiers, feature matrix, testimonials.
  - Create onboarding wizard for new users (guided tour + sample prompts).
- **Paywall & Upsell Modals**
  - Introduce contextual paywall modals triggered by quota exhaustion, premium feature clicks.
  - Show countdown of remaining generations in header.
  - Implement inline upsell cards within results ("Unlock HD image" CTA).
- **Dashboard Pages**
  - `app/dashboard/page.tsx`: Summary of recent cocktails, usage stats, plan details, quick actions.
  - `app/dashboard/collections/page.tsx`: Saved cocktails with filters, tags, bulk export.
  - `app/dashboard/settings/page.tsx`: Billing, profile, team management, integrations.
- **Team Management UI**
  - Seat overview table, invite form, role dropdown (Owner/Admin/Contributor/Viewer).
  - Activity log view showing generated recipes and downloads.
- **Design System Updates**
  - Extend Tailwind theme with brand colors for monetization (e.g., "tequila-gold", "negroni-red").
  - Add `Button` variants for "Primary CTA", "Secondary", "Danger" consistent across app.
  - Introduce skeleton loaders and toasts for subscription actions.

### 2. Authentication & User Account Flow
- Select auth provider (Supabase Auth/Clerk) with server components compatibility.
- Update `app/layout.tsx` to wrap providers and gate routes via server-side session checks.
- Create middleware for route protection (`middleware.ts`): redirect unauthenticated users to login when accessing dashboard.
- Build `app/login`, `app/register`, `app/reset-password` pages with social login buttons.
- Store user metadata (plan, seats, trial end) in database; expose via `useUser` hook (React context).

### 3. Subscription Management
- **Backend**
  - Add `app/api/stripe/webhook/route.ts` to verify events using Stripe signature.
  - Create `lib/stripe.ts` for reusable Stripe client.
  - Persist subscription state in DB (`users`, `subscriptions`, `usage_logs` tables). Use Prisma or Drizzle ORM.
  - Implement scheduled job (cron via Vercel Cron/Bun cron worker) to reset monthly quotas and send usage alerts.
- **Frontend**
  - Buttons for "Upgrade", "Manage Billing" hitting `/api/stripe/create-checkout-session` and `/api/stripe/create-portal-session` routes.
  - Billing status card showing plan, renewal date, payment method.

### 4. Usage Metering & Entitlements
- Track each cocktail generation, image render, and export event in `usage_logs` table.
- Implement middleware layer wrapping API routes:
  - Check user plan, quota, and feature flags before invoking AI APIs.
  - Return structured error for paywall displays.
- Build admin console (internal) to adjust quotas, issue credits, view churn risk metrics.

### 5. AI Cost Optimization
- Cache generated cocktails per prompt (hash input) to reuse results for free users.
- Introduce tiered model usage: free tier uses cheaper model (Gemini Flash), paid tiers can toggle "Ultra" model with higher quality.
- Add concurrency limits to avoid overloading budgets.

### 6. Data Storage & Infrastructure
- Use Supabase Postgres for persistence (users, collections, teams, usage).
- Use Vercel Blob/S3 for storing images and exports. Paid users get private buckets; free users keep ephemeral storage.
- Implement background workers (Vercel Queue, Cloudflare Workers) for heavy tasks (batch renders, PDF generation).

### 7. Compliance & Security
- Ensure Stripe integration meets PCI SAQ-A (only Stripe.js handles card data).
- Update privacy policy, terms of service, cookie banner.
- Implement data deletion requests, allow users to export their data.
- Log admin actions, implement MFA for internal admin panel.

### 8. Analytics & Growth
- Instrument key events (signup, plan upgrade, generation, share) with PostHog.
- Run onboarding funnel A/B tests using LaunchDarkly flags.
- Integrate referral program (Rewardful or custom) encouraging sharing for credits.
- Add email lifecycle campaigns (ConvertKit/Braze) for trial conversion, churn prevention.

### 9. Support & Documentation
- In-app help center (Intercom or Zendesk widget).
- Knowledge base with FAQ, onboarding videos.
- SLA runbooks for enterprise clients.

## Engineering Deliverables Checklist
- [ ] Auth provider integrated with secure sessions and RLS policies.
- [ ] Database migrations for users, subscriptions, usage logs, collections, teams, audit events.
- [ ] Stripe products, prices, tax settings, webhook endpoints in prod/staging.
- [ ] API middleware enforcing quotas and entitlements.
- [ ] Pricing page, dashboard, settings, and paywall UI components.
- [ ] Analytics + error tracking instrumentation with documented event taxonomy.
- [ ] Playbooks for incident response, data exports, and customer support workflows.
- [ ] Launch checklist covering QA, compliance, marketing, and support alignment.

## Dependencies & Tooling
- **Stripe** for payments.
- **Supabase** (Auth + Postgres + Storage) or alternative managed database/auth.
- **Vercel** for hosting, Cron jobs, and Edge middleware.
- **Sentry** for monitoring, **PostHog** for analytics, **LaunchDarkly** for flags.
- **Email**: Resend for transactional emails (confirmations, invoices, receipts).
- **Communication**: Slack + Linear integration for support escalations.

## Risks & Mitigations
- **High AI Costs**: Implement caching, usage throttling, and upsell to higher tiers for heavy usage. Explore volume discounts with Google AI.
- **Churn from Limited Differentiation**: Rapidly ship premium features (collections, costing) and gather feedback via in-app surveys.
- **Compliance Delays**: Begin legal review early, reuse Stripe templates, document data flows.
- **Team Feature Complexity**: Launch as beta with manual onboarding, gradually automate seat management and SSO.

## Success Metrics
- **Activation**: 40% of new signups complete first cocktail within 10 minutes.
- **Conversion**: 8% free-to-paid conversion within 30 days of signup.
- **Retention**: <3% monthly churn for Pro, <1% for Team.
- **Revenue**: $10K MRR within 3 months post-launch.

## Post-Launch Iterations
- Add marketplace for branded cocktail packs (revenue share with mixologists).
- Offer API access for partners (recipe apps, beverage brands) with usage-based billing.
- Develop mobile app (React Native) once web funnel proves ROI.

