# Scam-Link Sentinel — PRD

## Original Problem Statement
Create a high-conversion landing page for 'Scam-Link Sentinel' — a 'No-Brainer' mobile security tool (Telegram/WhatsApp bot) that protects crypto users from phishing, fake 'AI-investment' dashboards, and malicious withdrawal-lock scams. Core props: Forward to Check, Zero-Trust Scanner, Sovereignty First. Dark theme + Guardian imagery. Waitlist for $4.99/mo Founding Member beta. Reference DeFi Guardian brand and Alpha-Sentinel logic.

## User Choices (Locked)
- Visual: **Obsidian black + neon cyan/electric blue (primary) + magenta/purple (secondary)**, futuristic cyber-security dashboard aesthetic, glowing borders, grid overlays, technical schematic style. (PIVOT from amber/gold)
- Hero visual: 3D glowing Sentinel Shield pulsing with data
- Tagline: "The Guardian for the Swipe Generation. Spot the invisible threats they don't want you to see."
- Waitlist: MongoDB storage only (Resend skipped)
- Payments: **Stripe Checkout** for $4.99/mo Founding Member (test key `sk_test_emergent`)
- Interactive demo: live "Forward to Check" scanner widget with animated SAFE/DANGER verdict

## User Personas
- **Crypto Newcomer ("Swipe Generation")** — receives DMs/airdrops, can't tell scam from real. Wants a no-brainer second-opinion bot.
- **DeFi Power User** — wants withdrawal-lock + fake-APY heuristics before depositing.
- **Founding Member** — sovereignty-minded, willing to pay $4.99 to lock lifetime rate + influence roadmap.

## Architecture
- Backend: FastAPI + MongoDB (`waitlist`, `payment_transactions` collections); Stripe via `emergentintegrations.payments.stripe.checkout`
- Frontend: React 19 + Tailwind + shadcn (Accordion, Sonner), framer-motion, react-fast-marquee, lucide-react
- Routes: `/` (landing), `/success` (Stripe return polling)

## Implemented (2025-12)
- Hero (cyber-grid bg, animated sentinel shield, HUD readouts, inline waitlist form)
- Live Threats marquee (red/danger tagged URLs)
- Interactive "Forward to Check" scanner with 4 example chips + animated scan log + SAFE/WARNING/DANGER verdict + threat & analysis breakdown
- 3 core feature modules (Forward to Check / Zero-Trust Scanner / Sovereignty First) with neon-bordered schematic cards
- "How it works" 3-step flow with connecting gradient line
- Stats panel with count-up animation (scams blocked / users protected / links scanned / funds saved)
- Pricing card with Stripe checkout ($4.99/mo founding member) + perks list
- FAQ accordion (6 questions)
- Final CTA strip + footer waitlist form
- Success page with payment status polling + DB fallback when Stripe lookup fails

## Backend Endpoints
- `GET /api/` health
- `POST /api/waitlist` — idempotent email capture
- `GET /api/waitlist/count` — public count with +2847 baseline
- `POST /api/scan` — MYTHOS heuristic engine (mock; 1,247 heuristics narrative)
- `GET /api/threats/recent` — live threat feed (mock)
- `GET /api/stats` — trust signal numbers (mock)
- `POST /api/checkout/session` — Stripe checkout, server-defined $4.99 USD price
- `GET /api/checkout/status/{session_id}` — Stripe poll w/ DB fallback
- `POST /api/webhook/stripe` — webhook
- All routes prefixed with `/api` per ingress rules

## Mocked / To Productionize
- **MYTHOS scan engine**: deterministic keyword/pattern heuristics (no real ML or on-chain calls)
- **Stats numbers**: static
- **Threat feed**: static list
- **Email confirmations**: not wired (Resend skipped per user)
- **Telegram/WhatsApp bot itself**: doesn't exist yet — landing page is pre-launch

## Backlog (P0/P1/P2)
- P0: Wire Resend (or another provider) for waitlist confirmation emails
- P0: Real Telegram bot integration (`/forward` command → /api/scan)
- P1: Admin dashboard to view waitlist + Stripe revenue
- P1: Webhook signature verification + idempotent founding-member upgrade on payment success
- P1: Replace mock scan engine with real threat-feed APIs (URLhaus, PhishTank, on-chain forensic providers)
- P2: i18n (esp. Telugu/Hindi/Spanish for "swipe generation" markets)
- P2: A/B test the hero copy and pricing anchor
- P2: Sora 2 hero video instead of static shield

## Next Action Items
- User to test Stripe checkout flow end-to-end (test card 4242 4242 4242 4242)
- Decide whether to add Resend confirmation emails now
- Decide on launch waitlist target before opening public access
