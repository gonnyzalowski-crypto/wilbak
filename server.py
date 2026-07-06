import csv
import json
import os
import random
import urllib.request
from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder='site', static_url_path='')

SHOP_DIR = os.path.join(os.path.dirname(__file__), 'shop')


def read_keys():
    keys = {}
    try:
        for row in read_csv(os.path.join(SHOP_DIR, 'keys.csv')):
            keys[row['key']] = row['value']
    except Exception:
        pass
    return keys


def send_telegram_message(text):
    keys = read_keys()
    token = keys.get('bot_token')
    chat_id = keys.get('chat_id')
    if not token or not chat_id or token.startswith('REPLACE'):
        return False
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    payload = json.dumps({'chat_id': chat_id, 'text': text, 'parse_mode': 'HTML'}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception as e:
        print('Telegram send failed:', e)
        return False


def read_csv(path):
    rows = []
    with open(path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows


def parse_products(rows):
    out = []
    for row in rows:
        try:
            price = float(row['price'])
        except ValueError:
            price = 0.0
        try:
            weight = float(row.get('weight_kg', 0))
        except ValueError:
            weight = 0.0
        raw_configs = [c.strip() for c in row.get('configs', '').split(',') if c.strip()]
        configs = []
        for c in raw_configs:
            if '|' in c:
                name, _, adj = c.partition('|')
                try:
                    adj = float(adj)
                except ValueError:
                    adj = 0.0
            else:
                name = c
                adj = 0.0
            configs.append({'name': name, 'price_adjustment': adj})
        out.append({
            'id': row['id'],
            'category': row.get('category', ''),
            'brand': row.get('brand', ''),
            'name': row.get('name', ''),
            'description': row.get('description', ''),
            'price': price,
            'unit': row.get('unit', 'unit'),
            'weight_kg': weight,
            'configs': configs,
            'features': row.get('features', ''),
            'in_stock': row.get('in_stock', 'true').lower() == 'true',
            'tier': row.get('tier', '')
        })
    return out


# --- Main site routes ---
@app.route('/')
def index():
    return send_from_directory('site', 'index.html')


@app.route('/about.html')
def about():
    return send_from_directory('site', 'about.html')


@app.route('/contact.html')
def contact():
    return send_from_directory('site', 'contact.html')


@app.route('/projects.html')
def projects():
    return send_from_directory('site', 'projects.html')


@app.route('/privacy.html')
def privacy():
    return send_from_directory('site', 'privacy.html')


@app.route('/terms.html')
def terms():
    return send_from_directory('site', 'terms.html')


@app.route('/sla.html')
def sla():
    return send_from_directory('site', 'sla.html')


@app.route('/shop')
def shop():
    return send_from_directory('shop', 'index.html')


@app.route('/assets/<path:filename>')
def root_assets(filename):
    return send_from_directory(os.path.join(os.path.dirname(__file__), 'assets'), filename)


@app.route('/shop/assets/<path:filename>')
def shop_assets(filename):
    return send_from_directory(os.path.join(os.path.dirname(__file__), 'assets'), filename)


@app.route('/shop/css/<path:filename>')
def shop_css(filename):
    return send_from_directory(os.path.join(SHOP_DIR, 'css'), filename)


# --- Shop API routes ---
@app.route('/api/products')
def products():
    rows = read_csv(os.path.join(SHOP_DIR, 'products.csv'))
    return jsonify(parse_products(rows))


@app.route('/api/crypto-details')
def crypto_details():
    rows = read_csv(os.path.join(SHOP_DIR, 'crypto_details.csv'))
    for row in rows:
        try:
            row['decimals'] = int(row['decimals'])
            row['rate_usd'] = float(row['rate_usd'])
            row['confirmation_time_minutes'] = int(row['confirmation_time_minutes'])
        except (KeyError, ValueError):
            pass
    return jsonify(rows)


@app.route('/api/order', methods=['POST'])
def order():
    data = request.get_json(silent=True) or {}
    order_id = 'ORD-' + ''.join(random.choices('0123456789ABCDEF', k=8))
    cart = data.get('cart', [])
    shipping = data.get('shipping', {})
    payment = data.get('payment', {})
    total = data.get('total', 0)
    items_text = '\n'.join([f"- {item.get('qty', 1)}x {item.get('productId', 'item')} (config: {item.get('config', '-')})" for item in cart])
    method = payment.get('method', 'unknown')
    coin = payment.get('coin', '')
    tx_id = payment.get('transactionId', 'N/A')
    email = payment.get('email', 'N/A')
    name = payment.get('name', 'N/A')
    address = payment.get('address', 'N/A')
    zip_code = payment.get('zip', 'N/A')
    payment_line = f'{method.upper()}' + (f' ({coin})' if coin else '') + f' — TXN: {tx_id}'
    shipping_type = shipping.get('type', 'standard')
    country = shipping.get('country', 'N/A')
    receiver = shipping.get('receiverName', 'N/A')
    ship_address = shipping.get('receiverAddress', 'N/A')
    ship_zip = shipping.get('receiverZip', 'N/A')
    message = (
        f"<b>New WILBAK Order</b>\n"
        f"Order ID: {order_id}\n"
        f"Total: ${total:,.2f}\n\n"
        f"<b>Items</b>\n{items_text or 'No items'}\n\n"
        f"<b>Payment</b>\n{payment_line}\n"
        f"Payer: {name} ({email})\n"
        f"Billing: {address}, {zip_code}\n\n"
        f"<b>Shipping</b>\n"
        f"Type: {shipping_type}\n"
        f"Country: {country}\n"
        f"Receiver: {receiver}\n"
        f"Address: {ship_address}, {ship_zip}"
    )
    send_telegram_message(message)
    return jsonify({
        'status': 'received',
        'order_id': order_id,
        'message': 'Order received. Your receipt has been sent.'
    })


@app.route('/api/support', methods=['POST'])
def support():
    data = request.get_json(silent=True) or {}
    name = data.get('name', 'Unknown')
    email = data.get('email', 'N/A')
    message = data.get('message', '')
    text = f"<b>WILBAK Support Request</b>\nFrom: {name}\nEmail: {email}\n\n{message}"
    ok = send_telegram_message(text)
    return jsonify({'status': 'sent' if ok else 'failed'})


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
