# WILBAK Shop Checkout

A multi-step checkout for WILBAK Shop that loads products and cryptocurrency options from CSV files served by a small Flask server.

## Files

- `index.html` — Interactive checkout UI (Tailwind CSS + vanilla JS)
- `server.py` — Flask backend that reads CSVs and exposes JSON endpoints
- `products.csv` — Product catalog including hardware components, SBCs, mini PCs, monitors, networking, custom build computers, and peripherals with weights
- `crypto_details.csv` — Supported cryptocurrencies with rates and placeholder addresses
- `keys.csv` — Telegram bot token and chat ID (to be wiped after submission)
- `requirements.txt` — Python dependencies

## Run the server

```bash
pip install -r requirements.txt
python3 server.py
```

Open `http://127.0.0.1:5000` in your browser.

## API endpoints

- `GET /` — Serves the checkout HTML
- `GET /api/products` — Returns products as JSON
- `GET /api/crypto-details` — Returns cryptocurrency details
- `POST /api/order` — Accepts an order payload and forwards order details to Telegram
- `POST /api/support` — Forwards a support message to Telegram

## Notes

- Product prices and crypto rates are indicative values for demonstration.
- Custom Build Computers section offers 5 tiers (Entry, Professional, Creator, High-End, Enterprise) with 6 builds each (30 total).
- Custom builds are complete systems with CPU, GPU, RAM, SSD, case, PSU, monitor(s), networking, UPS, and peripherals.
- Product configurations affect price; CSV configs use `name|price_adjustment` format.
- Individual catalog includes Raspberry Pi 5, Orange Pi 6, small touchscreen monitors, RTX GPUs, CPUs, RAM, SSDs, cases, PSUs, networking, UPS, and audio/peripherals.
- The Product Builder and Custom Builds screens include live text search and sorting by price or name.
- Shipping options include Standard, Express, Overnight, Standard International, and Express International.
- Shipping cost is calculated with real-time formula: domestic = $12 base + $3.50/kg + speed multiplier; international = $75 base + $8.50/kg + 0.5% declared value + speed multiplier.
- Gadget Protection is calculated at 13% of the product subtotal.
- Payment processing shows 15 phases grouped into 5 named steps; each phase takes a randomized 2-7 seconds.
- The order receipt displays the processed payment timeline, order details, prices, shipping, and a print-to-PDF button.
- "Send Receipt to Email" prompts the user for an email address and submits an order payload; the backend forwards order and payment details to Telegram immediately.
- A support button in the header opens a modal to send name, email, and message to Telegram.
