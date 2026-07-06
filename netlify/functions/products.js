const { readCsv, parseProducts } = require('./_utils');

exports.handler = async (event) => {
  try {
    const rows = readCsv('products.csv');
    const products = parseProducts(rows);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products)
    };
  } catch (e) {
    console.error('Failed to load products:', e);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to load products' })
    };
  }
};
