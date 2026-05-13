# CreatorOS AI

An AI-powered creator operating system — a premium SaaS platform for content creators to generate viral titles, hooks, scripts, content ideas, and full workflow pipelines using AI.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/creator-os run dev` — run the frontend (port 18152)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `VITE_SUPABASE_URL` — Supabase project URL
- Required env: `VITE_SUPABASE_ANON_KEY` — Supabase anon key
- Required env: `AI_INTEGRATIONS_OPENAI_BASE_URL` — Replit AI proxy base URL
- Required env: `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI proxy key

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Framer Motion
- State: Zustand (auth store + user/credits/XP store)
- Auth + User DB: Supabase (signUp, signInWithPassword, onAuthStateChange)
- API: Express 5 with structured pino logging
- AI: OpenAI via Replit AI Integrations proxy (no user API key needed)
- DB: PostgreSQL + Drizzle ORM (conversations, messages, profiles, projects)
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Drizzle schema (conversations, messages, profiles, projects)
- `lib/api-client-react/src/generated/` — Generated React Query hooks
- `lib/api-zod/src/generated/` — Generated Zod validators for server
- `lib/integrations-openai-ai-server/` — OpenAI server client (chat, image, audio)
- `lib/integrations-openai-ai-react/` — OpenAI React hooks (voice)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/creator-os/src/` — React frontend (pages, components, stores)

## Architecture decisions

- Supabase handles auth and user profile data (niche, platforms, onboarding). Express handles AI generation and conversation history.
- Credits and XP are managed client-side via Zustand (userStore) for instant feedback; persisted to Supabase profiles table.
- AI tools use streaming where appropriate (chat), but generation endpoints (titles, hooks, scripts) return JSON for simplicity.
- OpenAI is accessed via Replit's managed proxy — no API key required from the user.
- DB stores conversation history for the AI chat feature; projects are stored both in DB and Supabase.

## Product

CreatorOS AI features:
- **Landing Page** — Hero, features, pricing (Free/$20/$50), testimonials, CTA
- **Auth** — Signup, login, verify email, forgot password (all via Supabase)
- **Onboarding** — 4-step wizard (niche, platforms, goals, content style)
- **Dashboard** — XP/level bar, credit balance, streak, analytics charts, quick actions
- **AI Tools** — Title Generator, Hook Generator, Script Generator, Idea Generator
- **Workflow Pipeline** — Chained AI workflow: Idea → Hook → Title → Script → CTA → Caption → Hashtags
- **Projects** — Save, search, and manage all generated content
- **Credits** — Free (100), Basic ($20/mo, 2000), Pro ($50/mo, unlimited)
- **Paywall** — Upgrade modal gates advanced features

## User preferences

- Dark luxury aesthetic: deep charcoal backgrounds, electric violet accents, glassmorphism
- No emojis in the UI
- Premium animations via Framer Motion throughout

## Gotchas

- After any OpenAPI spec change, always run `pnpm --filter @workspace/api-spec run codegen` before building
- Supabase credentials are stored as shared env vars (VITE_ prefix for frontend access)
- The `conversations` and `messages` DB tables are created by the OpenAI integration template (not named with `Table` suffix)
- Credits and XP are frontend-only state on first load; sync to Supabase on important actions

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Supabase auth uses `supabase.auth.onAuthStateChange` in `authStore.ts`
- OpenAI integration: `import { openai } from "@workspace/integrations-openai-ai-server"`
