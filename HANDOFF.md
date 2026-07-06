# Handoff — Wilbak Engineering Website + Shop

## Project Overview

Unified Flask application serving the Wilbak Engineering marketing website and the WILBAK Shop (multi-step checkout) from a single server at the project root.

- **Server:** `server.py` (Flask, port 5000)
- **Dependencies:** `requirements.txt` → `flask==3.0.3`
- **Run:** `python server.py` from project root → `http://127.0.0.1:5000`

## Architecture

```
WILBAKSHOP/
├── server.py              # Unified Flask server (main site + shop API)
├── requirements.txt       # Flask dependency
├── assets/
│   ├── logo.png           # Wilbak logo (used in global nav)
│   ├── 01.png             # Shop hero image
│   └── 02.png             # Shop custom builds banner
├── site/
│   ├── css/style.css      # Apple-inspired design system (shared)
│   ├── index.html         # Landing page
│   ├── about.html         # About page
│   ├── contact.html       # Contact page
│   ├── projects.html      # Projects page
│   ├── privacy.html       # Privacy policy
│   ├── terms.html         # Terms & conditions
│   └── sla.html           # Service level agreement
└── shop/
    ├── index.html         # Shop checkout (12 screens, vanilla JS)
    ├── css/shop.css       # Shop-specific styles (extends design system)
    ├── products.csv       # Product catalog (GPU, CPU, SBC, monitors, networking, custom PCs)
    ├── crypto_details.csv # Crypto payment options (BTC, USDT, ETH, SOL, etc.)
    ├── keys.csv           # Telegram bot token + chat ID
    └── build-specs.md     # Original build specification document
```

## Routes

### Main Site (static HTML)
| Route | File |
|-------|------|
| `/ | `site/index.html` |
| `/about.html` | `site/about.html` |
| `/contact.html` | `site/contact.html` |
| `/projects.html` | `site/projects.html` |
| `/privacy.html` | `site/privacy.html` |
| `/terms.html` | `site/terms.html` |
| `/sla.html` | `site/sla.html` |

### Shop
| Route | Purpose |
|-------|---------|
| `/shop` | Shop checkout UI (`shop/index.html`) |
| `/shop/css/<file>` | Shop CSS |
| `/assets/<file>` | Root-level assets (logo, shop images) |

### Shop API (Flask backend, CSV-driven)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/products` | GET | Returns product catalog from `products.csv` as JSON |
| `/api/crypto-details` | GET | Returns crypto payment options from `crypto_details.csv` |
| `/api/order` | POST | Receives order payload, sends Telegram message |
| `/api/support` | POST | Receives support message, sends Telegram message |

## Design System

- **Source of truth:** `site/css/style.css` — Apple-inspired minimal design
- **Shop extension:** `shop/css/shop.css` — extends design system with shop-specific components
- **Key tokens:** CSS custom properties (`--color-primary`, `--color-canvas`, `--color-ink`, etc.)
- **Dark mode:** Shop has `.dark` class toggle on `<html>`; main site is light-only
- **Typography:** SF Pro / system font stack
- **Components:** Pill buttons (`.btn-primary`, `.btn-secondary`, `.btn-pearl`), tiles, product cards, footer

## Shop Checkout Flow (12 screens)

1. **Landing** — Hero with "Start Your Order" / "Custom Builds" CTAs
2. **Custom Builds** — Tiered custom PC selection (5 tiers, 30 builds)
3. **Builder** — Product catalog with category filter, search, sort, qty controls, live cart sidebar
4. **Review** — Confirm selected items before configuration
5. **Summary** — Per-item config selection + shipping form + live totals with shipping breakdown
6. **Payment Method** — Choose Stripe or Crypto
7. **Stripe Form** — Card details with brand detection (Visa/MasterCard)
8. **Stripe Processing** — 15-phase animated progress with 5 step labels
9. **Crypto Coin Selection** — Modal with coin options from CSV
10. **Crypto Payment** — Address, amount, QR placeholder, payer details
11. **Crypto Waiting** — 15-phase animated progress with 5 step labels
12. **Confirmed** — Full receipt with timeline, items, shipping, totals, print/email actions

### State Management
- Single `state` object: `cart[]`, `payment{}`, `shipping{}`
- Navigation via `goTo(screenId)` with history stack for back button
- All calculations client-side: subtotal, weight-based shipping, 13% gadget protection, 8% tax

## Telegram Integration

- `keys.csv` contains `bot_token` and `chat_id`
- `/api/order` sends formatted order details (items, payment, shipping) to Telegram
- `/api/support` sends support request (name, email, message) to Telegram
- Falls back gracefully if keys are placeholder values

## What Was Done

1. Created Apple-inspired design system CSS (`site/css/style.css`)
2. Created 7 main site pages (landing, about, contact, projects, privacy, terms, SLA)
3. Created unified Flask server (`server.py`) serving both site and shop
4. Restyled shop from Tailwind CSS to Wilbak design system (`shop/css/shop.css`)
5. Preserved all shop JS logic (cart, shipping calc, payment flows, receipt)
6. Added Shop link to navigation across all pages
7. Added logo image (`/assets/logo.png`) to global nav on all pages
8. Removed Ortho'M8 external link from all footers

## Deployment

### Cannot deploy directly to Netlify
Flask backend requires a Python runtime. Netlify is static-only + serverless functions.

### Recommended: Railway or Render
Both support Python/Flask natively with zero code changes:
1. Push repo to GitHub
2. Connect to Railway/Render
3. Set start command: `python server.py`
4. Set environment variables if needed (or keep using `keys.csv`)

### Alternative: Netlify + Serverless Functions
Would require converting 4 Flask endpoints to Netlify Functions:
- `/api/products` → `netlify/functions/products.py`
- `/api/crypto-details` → `netlify/functions/crypto-details.py`
- `/api/order` → `netlify/functions/order.py`
- `/api/support` → `netlify/functions/support.py`
CSVs would need to be bundled with functions or moved to a data store.

## Pending / Future Work

- **Production WSGI:** Use `gunicorn` instead of Flask dev server for production
- **HTTPS:** Railway/Render provide this automatically
- `keys.csv` contains placeholder Telegram credentials — replace with real values before going live
- Shop dark mode toggle exists but main site pages are light-only
- No CMS — all content is hardcoded in HTML
- No analytics or SEO tooling beyond meta tags
- Product images in shop use placeholder assets (`01.png`, `02.png`) — may want real product photos
- Stripe payment is simulated (no real Stripe integration) — card form is for demonstration
- Crypto payment is simulated (no blockchain verification) — for demonstration
