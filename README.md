# Wilbak Engineering — Website + Shop

Production-ready static site with Netlify Functions for the WILBAK Shop API.

## Tech Stack

- **Frontend:** Static HTML/CSS (Apple-inspired design system)
- **Backend:** Netlify Functions (Node.js)
- **Data:** CSV files (products, crypto details, Telegram keys)
- **Hosting:** Netlify

## Project Structure

```
├── netlify/
│   └── functions/
│       ├── _utils.js          # Shared utilities (CSV reader, Telegram, parsers)
│       ├── products.js        # GET /api/products
│       ├── crypto-details.js  # GET /api/crypto-details
│       ├── order.js           # POST /api/order
│       └── support.js         # POST /api/support
├── site/                      # Main website (static HTML)
│   ├── css/style.css
│   └── *.html
├── shop/                      # Shop frontend + data
│   ├── css/shop.css
│   ├── index.html
│   ├── products.csv
│   ├── crypto_details.csv
│   └── keys.csv
├── assets/                    # Images (logo, shop hero)
├── netlify.toml               # Netlify config (redirects, functions)
├── package.json
└── server.py                  # Legacy Flask server (for local dev only)
```

## Local Development

### Option 1: Netlify CLI (recommended)
```bash
npm install
npm run dev
```
This starts the Netlify dev server with functions at `http://localhost:8888`.

### Option 2: Flask (legacy)
```bash
pip install flask
python server.py
```
Runs at `http://127.0.0.1:5000`.

## Deploy to Netlify

### Option 1: Git-based (recommended)
1. Push this repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → "Add new site" → "Import from Git"
3. Select your repo — Netlify auto-detects `netlify.toml`
4. Click "Deploy"

### Option 2: CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## Configuration

### Telegram Keys
Edit `shop/keys.csv` with your bot token and chat ID:
```csv
key,value
bot_token,YOUR_REAL_BOT_TOKEN
chat_id,YOUR_REAL_CHAT_ID
```

Or set environment variables in Netlify dashboard:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products` | GET | Product catalog from CSV |
| `/api/crypto-details` | GET | Crypto payment options from CSV |
| `/api/order` | POST | Submit order → Telegram notification |
| `/api/support` | POST | Submit support message → Telegram notification |

## License

© 2026 Wilbak Engineering Group. All rights reserved.
