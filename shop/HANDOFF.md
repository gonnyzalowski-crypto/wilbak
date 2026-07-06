# WILBAK Shop Checkout — Production Handoff

**Protocol name:** WILBAK Checkout Handoff Protocol  
**Alternative name:** WILBAK Production Continuity Brief  
**Project:** WILBAK Shop Checkout Prototype  
**Repository:** `/home/savi/Documents/STRULT`  
**Date/Time:** 2026-07-03 12:30 PM UTC-04:00  
**Status:** Ready for production integration review

---

## 1. Executive Summary

This is a Flask + CSV-driven HTML checkout prototype for WILBAK Shop. It is intended as a business proposal and is being prepared for production. The frontend is a single `index.html` file. The backend is a small Flask server (`server.py`) that reads CSV catalogs and forwards order/support messages to Telegram.

The repository is now cleaned of dead code. All unused endpoints, CSV files, and generated caches have been removed.

---

## 2. Completed Actions (Inception to Present)

### Branding & Content
- Replaced all "TechShop" and generic placeholder branding with **WILBAK Shop**.
- Removed all mock, fake, dummy, test, placeholder, Lorem Ipsum, and simulated language from the frontend.
- Replaced cartoon/placeholder custom build names with 30 professional business-tier names across 5 tiers (Entry, Professional, Creator, High-End, Enterprise).
- Added realistic component descriptions for every build (CPU, GPU, RAM, SSD, case, PSU, monitor, networking, UPS, peripherals).
- Added a professional landing-page hero image (`assets/01.png`) and a Custom Builds banner image (`assets/02.png`).

### Product Catalog
- Updated custom build price range to **$4,500–$18,000**.
- Added Orange Pi 6, Raspberry Pi 5 (16GB–64GB), small touchscreen monitors, servers, routers, cases, PSUs, and complete systems.
- Built **30 custom builds** (6 per tier) in `products.csv`.
- Product configurations use `name|price_adjustment` format in the CSV.
- Individual parts catalog includes GPUs, CPUs, RAM, SSDs, SBCs, monitors, networking, UPS, audio, and peripherals.

### UI / UX
- Replaced Lucide icons with **Font Awesome 6 Solid** icons.
- Removed the back button from the header.
- Added a **home button** in the header.
- Added **strategic back buttons** on each actionable screen (Custom Builds, Product Builder, Review, Summary, Payment, Stripe Card, Crypto Payment).
- Added a **support button** (headset icon) in the header that opens a contact modal.
- Implemented dark/light mode toggle.
- Made the layout fully responsive.

### Pricing & Financial Logic
- Renamed "Insurance" to **Gadget Protection** and set it to **13% of subtotal**.
- Set tax rate to **8%**.
- Implemented dynamic price updates on the summary screen when configurations change.
- Implemented real-time shipping calculation:
  - Domestic: `$12 base + $3.50/kg × speed multiplier`
  - International: `$75 base + $8.50/kg + 0.5% declared value × speed multiplier`
- Shipping options: Standard, Express, Overnight, Standard International, Express International.

### Payment Flow
- Added Stripe-style card form with card brand detection (Visa, MasterCard, Amex, Discover).
- Added crypto payment flow with coin selection (Bitcoin, USDT, ETH, Solana, Litecoin, Monero).
- Payment processing timeline shows **15 phases grouped into 5 named steps**.
- Each phase duration is randomized between **2 and 7 seconds**.
- Receipt screen shows order details, payment timeline, shipping, and totals with print-to-PDF and email-receipt actions.

### Search & Filter
- Added live text search and sorting to the **Product Builder** screen.
- Added live text search and sorting to the **Custom Builds** screen.
- Search covers names, brands, categories, descriptions, features, tiers, units, and configuration names.
- Sort options: Price Low-High, Price High-Low, Name A-Z.

### Telegram Integration
- Created `keys.csv` to store `bot_token` and `chat_id`.
- Backend reads `keys.csv` and sends messages via the Telegram Bot API using only the Python standard library (`urllib`).
- `/api/order` forwards full order + payment + shipping details to Telegram immediately after submission.
- `/api/support` forwards support requests (name, email, message) to Telegram.
- Support modal is accessible from the header on every screen.

### Cleanup & Production Readiness
- Removed unused backend endpoints: `/api/payment-methods`, `/api/stripe-details`.
- Removed unused CSV files: `payment_methods.csv`, `stripe_details.csv`.
- Removed generated `__pycache__` directory.
- Updated `README.md` and `build-specs.md` to reflect the current feature set and file inventory.
- Verified no `console.log`, `TODO`, `FIXME`, or commented-out dead code remains in the production files.
- Verified all JavaScript functions and variables are referenced.

---

## 3. Current Architecture

### Frontend
- **File:** `index.html`
- **Stack:** HTML5, Tailwind CSS (CDN), Font Awesome 6 Solid (CDN), vanilla JavaScript.
- **State:** Single `state` object holds cart, shipping, and payment state.
- **Navigation:** JS-driven `<section>` switching. History is tracked in a `history` array with `goTo`, `goBack`, and `goHome` helpers.
- **Screens:** Landing, Custom Builds, Product Builder, Review List, Order Summary, Payment Method, Stripe Card Form, Stripe Processing, Crypto Payment, Crypto Waiting, Order Receipt.

### Backend
- **File:** `server.py`
- **Stack:** Flask (only dependency in `requirements.txt`).
- **Routes:**
  - `GET /` — serves `index.html`
  - `GET /assets/<filename>` — serves static assets
  - `GET /api/products` — returns parsed `products.csv`
  - `GET /api/crypto-details` — returns parsed `crypto_details.csv`
  - `POST /api/order` — generates order ID and sends Telegram message
  - `POST /api/support` — sends support request to Telegram
- **Telegram helper:** `send_telegram_message()` reads `keys.csv` and posts to `https://api.telegram.org/bot<token>/sendMessage`.

### Data Files
- `products.csv` — product catalog (including custom builds and individual parts).
- `crypto_details.csv` — supported cryptocurrencies with rates and placeholder addresses.
- `keys.csv` — Telegram credentials. **Must be populated before Telegram integration works and wiped after submission.**
- `requirements.txt` — Flask dependency.

### Assets
- `assets/01.png` — landing page hero image.
- `assets/02.png` — Custom Builds banner image.

---

## 4. File Inventory

| File | Purpose | Notes |
|---|---|---|
| `index.html` | Frontend checkout UI | Contains all markup, styles, and JS |
| `server.py` | Flask backend | Reads CSVs, serves JSON, sends Telegram messages |
| `products.csv` | Product catalog | Custom builds + individual parts |
| `crypto_details.csv` | Crypto payment metadata | Rates, addresses, confirmation times |
| `keys.csv` | Telegram credentials | Replace placeholders; wipe after submission |
| `requirements.txt` | Python dependencies | Flask only |
| `README.md` | Quickstart guide | Updated to current state |
| `build-specs.md` | Build specification | Updated to current state |
| `HANDOFF.md` | This document | Continuity protocol for future agents |

---

## 5. Known Limitations / Production Notes

- **Stripe integration is simulated.** The card form collects details for demonstration only. No real payment is processed.
- **Crypto integration is simulated.** Wallet addresses are placeholders; no blockchain interaction occurs.
- **Product prices and crypto rates are indicative** for the proposal/demo.
- **Telegram credentials must be set** in `keys.csv` before the bot will send messages.
- **No persistent database** — orders are not stored server-side beyond the Telegram message.
- **Flask dev server** — for production deployment, replace with a production WSGI server (e.g., Gunicorn) behind a reverse proxy.

---

## 6. How to Continue (New Agent Instructions)

### Quickstart
1. Ensure Python 3 and pip are installed.
2. Install dependencies: `pip install -r requirements.txt`.
3. Start the server: `python3 server.py`.
4. Open `http://127.0.0.1:5000` in the browser.

### Before Telegram Testing
1. Create a Telegram bot via [@BotFather](https://t.me/botfather) and copy the token.
2. Get the chat ID by sending a message to the bot and calling `https://api.telegram.org/bot<TOKEN>/getUpdates`.
3. Edit `keys.csv`:
   ```
   key,value
   bot_token,<YOUR_BOT_TOKEN>
   chat_id,<YOUR_CHAT_ID>
   ```

### Common Extension Points
- **Add products:** append rows to `products.csv`. Configs use `name|price_adjustment`.
- **Change pricing logic:** edit helper functions in `index.html` (e.g., `getGadgetProtection`, `getShippingBreakdown`, `getTax`).
- **Add a new payment method:** add UI screen in `index.html` and a backend route in `server.py` if needed.
- **Persist orders:** replace the in-memory Telegram message with a database write in `/api/order`.
- **Real Stripe integration:** replace the simulated card form with Stripe Elements or Stripe Checkout.

### Testing Checklist
- [ ] Server starts without errors.
- [ ] `/api/products` and `/api/crypto-details` return valid JSON.
- [ ] Landing page loads with WILBAK branding and hero image.
- [ ] Custom Builds shows 5 tiers with 6 builds each.
- [ ] Search and sort work on Custom Builds and Product Builder.
- [ ] Category filter works on Product Builder.
- [ ] Adding items updates the selected list and totals live.
- [ ] Configuration changes update the summary total.
- [ ] Shipping options and international flag affect the shipping cost.
- [ ] Stripe and crypto flows reach the receipt screen with a unique transaction ID.
- [ ] Payment processing timeline shows 15 phases with randomized delays.
- [ ] Receipt includes print and email buttons.
- [ ] Support modal sends a message (or returns `failed` if keys are placeholders).
- [ ] Order submission sends order details (or returns `failed` if keys are placeholders).
- [ ] Light/dark mode toggle works.
- [ ] Home and back buttons navigate correctly.

---

## 7. Security Checklist

- [ ] `keys.csv` is populated only for testing and is wiped after project submission.
- [ ] No real payment secrets are hardcoded in source files.
- [ ] `payment_methods.csv` and `stripe_details.csv` were removed to eliminate unused data exposure.
- [ ] `__pycache__` was removed.
- [ ] Server runs on `127.0.0.1:5000` by default; bind to `0.0.0.0` only if deploying behind a firewall/proxy.

---

## 8. Handoff Protocol Definition

**Primary name:** WILBAK Checkout Handoff Protocol  
**Alternative name:** WILBAK Production Continuity Brief  

### Purpose
To transfer a complete, runnable checkout project from one development session to another with zero ambiguity about scope, state, and next steps.

### Structure for Future Reports
When continuing from this checkpoint, any new handoff should include:
1. **Header** — project name, protocol name, date/time, repository path, status.
2. **Executive Summary** — one-paragraph project description and current state.
3. **Completed Actions** — chronological or grouped list of changes since the last handoff.
4. **Current Architecture** — frontend, backend, data, and asset overview.
5. **File Inventory** — table of files with purposes and notes.
6. **Known Limitations / Production Notes** — what is simulated, out of scope, or requiring credentials.
7. **How to Continue** — quickstart, configuration steps, and extension points.
8. **Testing Checklist** — acceptance criteria for the current state.
9. **Security Checklist** — credential handling and exposed-surface review.

### Methodology for Context Transfer
- Read this `HANDOFF.md` first.
- Review `README.md` and `build-specs.md` for operational details.
- Start the server and run the Testing Checklist.
- Before making changes, grep for `TODO`, `FIXME`, `console.log`, and unused functions to keep the codebase clean.
- After changes, update this document and the acceptance criteria in `build-specs.md`.

---

End of handoff.
