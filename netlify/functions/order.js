const PDFDocument = require('pdfkit');
const { sendTelegramMessage, sendTelegramDocument, generateOrderId } = require('./_utils');

function buildReceiptPdf(orderId, data) {
  const cart = data.cart || [];
  const shipping = data.shipping || {};
  const payment = data.payment || {};
  const total = data.total || 0;

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));

  const left = 50;
  let y = 50;

  doc.fontSize(24).font('Helvetica-Bold').text('WILBAK', left, y);
  y += 32;
  doc.fontSize(14).font('Helvetica-Bold').text('Order Receipt', left, y);
  y += 24;
  doc.fontSize(10).font('Helvetica').text(`Order ID: ${orderId}`, left, y);
  y += 16;
  doc.text(`Date: ${new Date().toLocaleString()}`, left, y);
  y += 28;

  doc.moveTo(left, y).lineTo(545, y).stroke();
  y += 16;

  doc.fontSize(12).font('Helvetica-Bold').text('Customer', left, y);
  y += 18;
  doc.fontSize(10).font('Helvetica').text(`Name: ${payment.name || 'N/A'}`, left, y);
  y += 14;
  doc.text(`Email: ${payment.email || 'N/A'}`, left, y);
  y += 14;
  doc.text(`Billing: ${payment.address || 'N/A'}, ${payment.zip || 'N/A'}`, left, y);
  y += 28;

  doc.fontSize(12).font('Helvetica-Bold').text('Items', left, y);
  y += 18;
  doc.fontSize(10).font('Helvetica');
  if (cart.length === 0) {
    doc.text('No items', left, y);
    y += 14;
  } else {
    cart.forEach(item => {
      doc.text(`${item.qty || 1}x ${item.productId || 'item'} (${item.config || '-'})`, left, y);
      y += 14;
    });
  }
  y += 14;

  doc.fontSize(12).font('Helvetica-Bold').text('Payment', left, y);
  y += 18;
  doc.fontSize(10).font('Helvetica').text(`Method: ${(payment.method || 'unknown').toUpperCase()}`, left, y);
  y += 14;
  if (payment.coin) {
    doc.text(`Coin: ${payment.coin}`, left, y);
    y += 14;
  }
  doc.text(`Transaction ID: ${payment.transactionId || 'N/A'}`, left, y);
  y += 28;

  doc.fontSize(12).font('Helvetica-Bold').text('Shipping', left, y);
  y += 18;
  doc.fontSize(10).font('Helvetica').text(`Type: ${shipping.type || 'standard'}`, left, y);
  y += 14;
  doc.text(`Country: ${shipping.country || 'N/A'}`, left, y);
  y += 14;
  doc.text(`Receiver: ${shipping.receiverName || 'N/A'}`, left, y);
  y += 14;
  doc.text(`Address: ${shipping.receiverAddress || 'N/A'}, ${shipping.receiverZip || 'N/A'}`, left, y);
  y += 28;

  doc.moveTo(left, y).lineTo(545, y).stroke();
  y += 16;
  doc.fontSize(14).font('Helvetica-Bold').text(`Total: $${Number(total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, left, y);

  doc.end();
  return Buffer.concat(chunks);
}

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
    const orderId = generateOrderId();
    const cart = data.cart || [];
    const shipping = data.shipping || {};
    const payment = data.payment || {};
    const total = data.total || 0;

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
      `<b>New WILBAK Order</b>`,
      `Order ID: ${orderId}`,
      `Total: $${Number(total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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

    const pdfBuffer = buildReceiptPdf(orderId, data);
    await sendTelegramDocument(pdfBuffer, `receipt-${orderId}.pdf`, `Receipt for ${orderId}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'received',
        order_id: orderId,
        message: 'Order received. Your receipt has been sent.'
      })
    };
  } catch (e) {
    console.error('Order processing failed:', e);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to process order' })
    };
  }
};
