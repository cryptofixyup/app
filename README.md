# Scam-Link Sentinel

**The Guardian for the Swipe Generation.**

An independent investigation project by [@CryptoFixYup](https://x.com/CryptoFixYup) documenting the active crypto-scam playbook. Scam-Link Sentinel is a Telegram/WhatsApp bot (in private beta) that scans links, offers, and DMs against a heuristic engine built from real, documented investigations — returning a `SAFE`, `WARNING`, or `DANGER` verdict with a risk score and threat breakdown.

**Marketing site**: this repo. Bot itself: in private testing — join the waitlist on the landing page.

---

## Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI · MongoDB (motor) · Stripe (via `emergentintegrations`) · JWT auth |
| Frontend | React 19 · Tailwind · shadcn/ui · framer-motion · i18next (6 languages) |
| Deploy | Any container platform (backend supervised on `0.0.0.0:8001`, frontend on `3000`) |

## Features

- **Interactive scanner preview** — paste any URL, see a heuristic verdict
- **6 languages** — EN / PL / RU / DE / ES / FR with hreflang matrix + per-locale SEO meta
- **Mythos Guard section** — messaging-security beta (separate waitlist)
- **Admin dashboard** at `/admin` — metrics, signup table, CSV export (JWT-protected)
- **Sitemap.xml + robots.txt** — `/admin` and `/success` are `noindex`ed

## Local setup

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # then edit .env with your values
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend
```bash
cd frontend
yarn install
cp .env.example .env      # point REACT_APP_BACKEND_URL at your backend
yarn start                # opens http://localhost:3000
```

### Required env values

**backend/.env**
- `MONGO_URL`, `DB_NAME` — MongoDB connection
- `STRIPE_API_KEY` — Stripe secret key (checkout endpoints require this)
- `JWT_SECRET` — 64-char hex string for admin JWT signing
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — seeds the single founder account on startup

**frontend/.env**
- `REACT_APP_BACKEND_URL` — public URL of the backend (no trailing slash, no `/api`)

## API surface (public)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/waitlist` | Add email to waitlist (idempotent) |
| GET  | `/api/waitlist/count` | Public counter |
| POST | `/api/scan` | Heuristic verdict on a URL |
| GET  | `/api/threats/recent` | Category feed |
| GET  | `/api/stats` | Static trust-signal numbers |
| POST | `/api/checkout/session` | Create Stripe session (unused in beta UI) |
| GET  | `/api/checkout/status/{id}` | Poll Stripe (DB-fallback resilient) |
| POST | `/api/webhook/stripe` | Stripe webhook |

## Admin API (JWT-required)

`POST /api/admin/login` → returns `{access_token}`. Send `Authorization: Bearer <token>` on:

- `GET /api/admin/me`
- `GET /api/admin/metrics` — signup + revenue rollups
- `GET /api/admin/signups?search=&limit=&offset=`
- `GET /api/admin/signups.csv?search=` — CSV export

## Contact

- X: [@CryptoFixYup](https://x.com/CryptoFixYup)
- GitHub: [cryptofixyup](https://github.com/cryptofixyup)
- Telegram: [@cryptofixyuup](https://t.me/cryptofixyuup)
- Email: kpiotr210@gmail.com

## License

Proprietary — investigation content and heuristic rules are not licensed for redistribution.
