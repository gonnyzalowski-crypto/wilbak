const fs = require('fs');
const path = require('path');
const https = require('https');
const { parse } = require('csv-parse/sync');

function readCsv(filename) {
  // On Netlify: CSVs are bundled in the function's data/ directory
  // Locally: fall back to project root /shop/
  const candidates = [
    path.join(__dirname, 'data', filename),
    path.join(process.cwd(), 'shop', filename),
    path.join(process.cwd(), 'netlify', 'functions', 'data', filename)
  ];
  for (const filePath of candidates) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return parse(content, { columns: true, skip_empty_lines: true });
    } catch {}
  }
  throw new Error(`CSV not found: ${filename}`);
}

function readKeys() {
  // Check environment variables first (Netlify dashboard)
  const envToken = process.env.TELEGRAM_BOT_TOKEN;
  const envChatId = process.env.TELEGRAM_CHAT_ID;
  if (envToken && envChatId) {
    return { bot_token: envToken, chat_id: envChatId };
  }
  // Fall back to keys.csv for local dev
  try {
    return Object.fromEntries(
      readCsv('keys.csv').map(row => [row.key, row.value])
    );
  } catch {
    return {};
  }
}

async function sendTelegramMessage(text) {
  const keys = readKeys();
  const token = keys.bot_token;
  const chatId = keys.chat_id;
  if (!token || !chatId || token.startsWith('REPLACE')) {
    console.log('Telegram: skipping — no valid credentials');
    return false;
  }
  const payload = JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' });
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${token}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };
  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('Telegram: message sent successfully');
          resolve(true);
        } else {
          console.error('Telegram: API error', res.statusCode, body);
          resolve(false);
        }
      });
    });
    req.on('error', (e) => {
      console.error('Telegram: request failed', e.message);
      resolve(false);
    });
    req.write(payload);
    req.end();
  });
}

function parseProducts(rows) {
  return rows.map(row => {
    const price = parseFloat(row.price) || 0;
    const weight = parseFloat(row.weight_kg || '0') || 0;
    const rawConfigs = (row.configs || '').split(',').map(c => c.trim()).filter(Boolean);
    const configs = rawConfigs.map(c => {
      if (c.includes('|')) {
        const idx = c.indexOf('|');
        const name = c.substring(0, idx).trim();
        const adj = parseFloat(c.substring(idx + 1).trim()) || 0;
        return { name, price_adjustment: adj };
      }
      return { name: c, price_adjustment: 0 };
    });
    return {
      id: row.id,
      category: row.category || '',
      brand: row.brand || '',
      name: row.name || '',
      description: row.description || '',
      price,
      unit: row.unit || 'unit',
      weight_kg: weight,
      configs,
      features: row.features || '',
      in_stock: (row.in_stock || 'true').toLowerCase() === 'true',
      tier: row.tier || ''
    };
  });
}

function generateOrderId() {
  const chars = '0123456789ABCDEF';
  let id = 'ORD-';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

module.exports = { readCsv, readKeys, sendTelegramMessage, parseProducts, generateOrderId };
