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
    const cart = data.cart || [];
    const shipping = data.shipping || {};
    const payment = data.payment || {};
    const total = data.total || 0;
    const reason = data.reason || 'Amount exceeds permitted transaction limit';

    const itemsText = cart
      .map(item => `- ${item.qty || 1}x ${item.productId || 'item'} (config: ${item.config || '-'})`)
      .join('\n');

    const method = payment.method || 'unknown';
    const coin = payment.coin || '';
    const txId = payment.transactionId || 'N/A';
    const email = payment.email || 'N/A';
    const name = payment.name || 'N/A';
    const address = payment.address || 'N/A';
    const zipCode = payment.zip || 'N/A';
    const paymentLine = `${method.toUpperCase()}${coin ? ' (' + coin + ')' : ''} — TXN: ${txId}`;

    const shippingType = shipping.type || 'standard';
    const country = shipping.country || 'N/A';
    const receiver = shipping.receiverName || 'N/A';
    const shipAddress = shipping.receiverAddress || 'N/A';
    const shipZip = shipping.receiverZip || 'N/A';

    const message = [
      `<b>⚠️ WILBAK Payment Failed</b>`,
      `Reason: ${reason}`,
      `Attempted Total: $${Number(total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ``,
      `<b>Items</b>`,
      itemsText || 'No items',
      ``,
      `<b>Payment</b>`,
      paymentLine,
      `Payer: ${name} (${email})`,
      `Billing: ${address}, ${zipCode}`,
      ``,
      `<b>Shipping</b>`,
      `Type: ${shippingType}`,
      `Country: ${country}`,
      `Receiver: ${receiver}`,
      `Address: ${shipAddress}, ${shipZip}`
    ].join('\n');

    await sendTelegramMessage(message);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'reported', message: 'Payment failure reported' })
    };
  } catch (e) {
    console.error('Payment failed reporting failed:', e);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to report payment failure' })
    };
  }
};
