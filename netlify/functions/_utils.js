const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

function readCsv(filename) {
  const filePath = path.join(process.cwd(), 'shop', filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return parse(content, { columns: true, skip_empty_lines: true });
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
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(10000)
    });
    return res.status === 200;
  } catch (e) {
    console.error('Telegram send failed:', e);
    return false;
  }
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
