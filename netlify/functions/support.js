const { sendTelegramMessage } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const name = data.name || 'Unknown';
    const email = data.email || 'N/A';
    const message = data.message || '';

    const text = `<b>WILBAK Support Request</b>\nFrom: ${name}\nEmail: ${email}\n\n${message}`;
    const ok = await sendTelegramMessage(text);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: ok ? 'sent' : 'failed' })
    };
  } catch (e) {
    console.error('Support send failed:', e);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to send support message' })
    };
  }
};
