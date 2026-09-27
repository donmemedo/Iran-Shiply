# شیپلی ایران — Shiply Iran

A reverse-auction freight marketplace for Iran, built from the `21_Shiply` business plan in this folder:
shippers list a load, verified carriers bid on it, and the shipper picks the best offer.

| | |
|---|---|
| Frontend | Next.js 15 (App Router) · React 19 · Tailwind · Framer Motion · next-themes |
| Backend | FastAPI · SQLModel · SQLite · JWT auth |
| Languages | فارسی (RTL, default) and English (LTR) — `/fa` and `/en` |
| Theme | Light / Dark / System, fully responsive |

## Run with Docker (recommended)

```bash
docker compose up --build
```

- Web app → http://localhost:3021
- API docs → http://localhost:8021/docs

## Run locally

```bash
# backend
cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8021

# frontend (new terminal)
cd frontend && npm install && npm run dev      # http://localhost:3021
```

The database is seeded on first start with 12 loads, 6 carriers and 3 shippers.

## Demo accounts

| Phone | Role | Password |
|---|---|---|
| `09121000002` | carrier (رضا محمدی) | `shiply1234` |
| `09351000001` | shipper (سارا احمدی) | `shiply1234` |

## Features

- Landing page with animated bidding preview, live stats counters, corridor marquee
- Open loads with search, category / origin / destination filters and sorting
- Load detail with bid list, place/update bid, and accept-bid flow for the owner
- Post a load form, dashboard for “my loads” and “my bids”
- Phone + password auth (JWT), shipper & carrier roles
- Persian UX wording follows the Persian-vocabulary-in-UXwriting guide (پیش‌خوان، سفارش‌ها، رمز عبور …)

## API

`POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me`
`GET|POST /api/shipments` · `GET /api/shipments/{id}` · `POST /api/shipments/{id}/bids`
`POST /api/bids/{id}/accept` · `GET /api/my/shipments` · `GET /api/my/bids`
`GET /api/stats` · `GET /api/cities`

## Next steps (planned)

1. PWA: service worker + offline shell (manifest and icons are already in place)
2. Android APK / iOS IPA via Capacitor wrapping the same web app
3. Payments (escrow), notifications, tracking map
