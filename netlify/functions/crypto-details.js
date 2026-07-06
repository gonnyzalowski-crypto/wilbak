const { readCsv } = require('./_utils');

exports.handler = async (event) => {
  try {
    const rows = readCsv('crypto_details.csv');
    const details = rows.map(row => ({
      ...row,
      decimals: parseInt(row.decimals) || 0,
      rate_usd: parseFloat(row.rate_usd) || 0,
      confirmation_time_minutes: parseInt(row.confirmation_time_minutes) || 0
    }));
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details)
    };
  } catch (e) {
    console.error('Failed to load crypto details:', e);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to load crypto details' })
    };
  }
};
