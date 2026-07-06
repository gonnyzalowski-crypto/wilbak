---
description: Build specs for the WILBAK CSV-driven HTML checkout
---

# WILBAK Shop Checkout — Build Specs

## Goal
Deliver a polished, multi-step checkout flow for WILBAK Shop. The checkout loads products and cryptocurrency details from CSV files via a small Flask backend, supports hardware components, SBCs, monitors, networking, and 30 professional custom build computers, includes weight-based shipping with gadget protection, and generates a detailed receipt. Order and support messages are forwarded to Telegram.

## Constraints
- **Proposal-ready data:** All products, prices, quantities, and payment outcomes are for demonstration purposes.
- **Simple backend:** Flask dev server reads CSVs and serves JSON endpoints.
- **Responsive:** Works on mobile, tablet, and desktop.
- **Theme:** Light and dark mode toggle.

## User Flow

1. **Entry / Landing**  
   User opens the shared link. Landing screen explains the order builder and provides a clear CTA.

2. **Custom Build Computers**  
   User chooses from 5 tiers (Entry, Professional, Creator, High-End, Enterprise), each with 6 pre-designed complete systems. Selecting a build adds it to the cart and advances to configuration. Prices range from ~$4,500 to ~$18,000. User can also switch to individual parts.

3. **Product Builder**  
   User selects items from the catalog, adjusts quantities, and sees a running total with estimated weight, shipping, insurance, and total. CTA: *Review List*.

4. **Review List**  
   Read-only summary of selected items. CTA: *Proceed to Configure*.

5. **Order Summary + Configuration**  
   Shows item, unit price, configuration, quantity, line total. Configuration choices affect the unit price. Collects receiver name, address, ZIP, shipping type, country, and international flag. Displays a live shipping/insurance cost breakdown. CTA: *Proceed to Payment*.

6. **Payment Method**  
   Two large cards: **Stripe** and **Crypto**. Selecting one advances the flow.

7. **Stripe Flow**  
   - Self-hosted card form (no real Stripe SDK).  
   - Card number input detects Visa or MasterCard based on IIN.  
   - Collects payer email, full name, billing address, ZIP, cardholder name, expiry, and CVC.  
   - CTA: *Pay Now*.  
   - Processing screen shows 15 phases grouped into 5 named steps (card verification, institution contact, validation, confirmation, receipt printing).  
   - Opens an order receipt with payment timeline, order details, prices, shipping, and total.  
   - Buttons: *Print Receipt to PDF* and *Send Receipt to Email*.

8. **Crypto Flow**  
   - Modal: choose **Bitcoin, USDT, ETH, Solana, Litecoin, or Monero**.  
   - Payment screen: amount, placeholder wallet address, QR placeholder, transaction ID, and payer email/name/address/ZIP.  
   - CTA: *Make Payment*.  
   - Waiting screen: 15 phases grouped into 5 named steps (broadcast, mempool, block, validation, receipt).  
   - Opens an order receipt with payment timeline, order details, prices, shipping, and total.  
   - Buttons: *Print Receipt to PDF* and *Send Receipt to Email*.

## Architecture

- **Frontend:** `index.html` contains markup, styles, and logic.
- **Backend:** `server.py` (Flask) reads CSVs and serves JSON endpoints.
- **Data:** CSV files for `products`, `crypto_details`, and `keys` (Telegram credentials).
- **Styling:** Tailwind CSS via CDN (`https://cdn.tailwindcss.com`).
- **Icons:** Font Awesome 6 Solid via CDN (`https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css`).
- **State:** Vanilla JS in a `state` object. Products are loaded from `/api/products`.
- **Navigation:** JS-driven view switching by showing/hiding `<section>` elements. No routing.
- **Theme toggle:** CSS class `dark` on `<html>` with Tailwind `dark:` variants.

## Backend Endpoints

- `GET /api/products` — Product catalog (hardware, services, audio, networking, mini PCs).
- `GET /api/crypto-details` — Supported coins with indicative rates and placeholder addresses.
- `POST /api/order` — Accepts an order payload and forwards details to Telegram.
- `POST /api/support` — Forwards a support request to Telegram.

## Data Model (CSV)

### products.csv
```
id,category,brand,name,description,price,unit,weight_kg,configs,features,in_stock,tier
h1,gpu,NVIDIA,GeForce RTX 4090,Flagship 24GB GPU...,1599.99,unit,1.8,"Founders Edition|0,ASUS ROG Strix|200",24GB GDDR6X; Ada Lovelace,true,
cb01,custom-pc,ProLine,Foundation Workstation,Intel i5 + RTX 4060 complete system...,4499.00,build,18.0,"Standard|0,Pro: 32GB RAM + 2TB SSD|500",Custom assembled and tested,true,Entry
```

### crypto_details.csv
```
id,name,symbol,network,address,decimals,rate_usd,color,confirmation_time_minutes,description
bitcoin,Bitcoin,BTC,on-chain,bc1q...,8,65000,orange-500,30,...
```

### Cart State
```json
{
  "cart": [{"productId": "h1", "qty": 1, "config": "Founders Edition"}],
  "shipping": {"type": "international", "country": "United States", "international": true, "receiverName": "", "receiverAddress": "", "receiverZip": ""},
  "payment": {"method": "stripe", "transactionId": "TXN-XXXXXXXX"}
}
```

## UI Components

- **Top bar:** Logo, home button, support button, theme toggle.
- **Navigation:** Strategic back buttons on each screen; header home button returns to landing.
- **Cards:** Product cards, custom build tier cards, summary rows, payment method cards.
- **Inputs:** Quantity steppers, configuration selects (with price adjustments), shipping/receiver fields, card form inputs, crypto payer fields.
- **Modals:** Crypto coin selection overlay and support request overlay.
- **Progress:** 15-phase processing with named milestones for Stripe and crypto.
- **Feedback:** Toast-like inline success messages; email prompt for receipt delivery.

## Card Brand Detection

| Prefix | Brand |
|---|---|
| 4 | Visa |
| 51-55 or 2221-2720 | MasterCard |
| Else | Unknown / Generic |

## Local Hosting

Run the Flask dev server:

```bash
pip install -r requirements.txt
python3 server.py
```

Open `http://127.0.0.1:5000`.

## Free Hosting Options

For a purely static version, the frontend HTML can still be deployed to:

1. **GitHub Pages** — push to a public repo, enable Pages.
2. **Netlify Drop** — drag and drop the HTML file.
3. **Cloudflare Pages** — upload or connect repo.

For the CSV backend, use free Python hosting (Render, Railway free tier) or run locally during demos.

## Deployment Steps

1. Install dependencies: `pip install -r requirements.txt`.
2. Run `python3 server.py`.
3. Open `http://127.0.0.1:5000` in the browser.

## Acceptance Criteria

- [ ] Server starts and all `/api/*` endpoints return JSON.
- [ ] HTML loads products from `/api/products` and displays them in the builder.
- [ ] Custom Build Computers section shows 5 tiers with 6 builds each (30 total), priced ~$4,500–$18,000.
- [ ] Product Builder supports live text search and sorting by price or name.
- [ ] Custom Builds supports live text search and sorting by price or name.
- [ ] Category filter works.
- [ ] Selected items list updates live as quantities change.
- [ ] Configuration choices change the product unit price.
- [ ] Shipping type, country, receiver details, and international flag are configurable.
- [ ] Shipping cost is calculated with real-time formula: domestic = $12 base + $3.50/kg + speed multiplier; international = $75 base + $8.50/kg + 0.5% declared value + speed multiplier.
- [ ] Gadget Protection is calculated at 13% of the subtotal.
- [ ] Order total includes subtotal, shipping, gadget protection, and tax.
- [ ] All screens/sections are navigable end-to-end.
- [ ] Light/dark mode toggle works across all screens.
- [ ] Stripe flow shows Visa/MasterCard detection and collects payer details.
- [ ] Payment processing shows 15 phases with 5 named steps; each phase takes a randomized 2-7 seconds.
- [ ] Crypto flow shows coin selection modal, payer details, payment screen, and 15-phase confirmation.
- [ ] Every confirmed payment displays a unique transaction ID and opens an order receipt.
- [ ] Receipt includes payment timeline, order details, prices, shipping, and total.
- [ ] Print-to-PDF and email-receipt buttons are present.
- [ ] Support button opens a modal and sends name, email, and message to Telegram.
- [ ] Layout is responsive on mobile, tablet, and desktop.

## Risks / Notes

- Real Stripe integration is out of scope for this proposal; card details are captured for demonstration only.
- Crypto payment is demonstrated without a live wallet connection or blockchain check.
- Product prices and crypto rates are indicative values for demonstration purposes.
- Use `alert()` or inline messaging for demonstration actions (e.g. "Order details sent").

## File Inventory

- `index.html` — full interactive frontend
- `server.py` — Flask backend
- `products.csv` — product catalog
- `crypto_details.csv` — cryptocurrency details
- `keys.csv` — Telegram bot token and chat ID (to be wiped after submission)
- `requirements.txt` — Python dependencies
- `build-specs.md` — this document
- `README.md` — quickstart guide
