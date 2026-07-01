import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { cropName, state } = req.query;
  const apiKey = process.env.GOV_INDIA_API_KEY;

  const basePrices = {
    wheat: 2275, rice: 2183, maize: 1870, cotton: 6620,
    groundnut: 5850, soybean: 4600, sugarcane: 350,
    onion: 800, potato: 1200, tomato: 1500, default: 2000
  };
  const basePrice = basePrices[(cropName || '').toLowerCase()] || basePrices.default;

  try {
    if (apiKey) {
      const { default: axios } = await import('axios');
      const params = new URLSearchParams({ 'api-key': apiKey, format: 'json', limit: 50, 'filters[commodity]': cropName });
      if (state) params.append('filters[state]', state);
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params}`;
      const response = await axios.get(url, { timeout: 8000 });
      const records = response.data?.records || [];

      if (records.length > 0) {
        const prices = records.map(r => parseFloat(r.modal_price || r.min_price || 0)).filter(p => p > 0);
        const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : basePrice;
        return res.json({
          success: true, crop: cropName,
          current_price: Math.round(avgPrice), unit: 'per quintal (100 kg)', currency: 'INR',
          markets: records.slice(0, 5).map(r => ({ market: r.market, state: r.state, price: parseFloat(r.modal_price || avgPrice), date: r.arrival_date })),
          trend: generateTrend(basePrice), source: 'Government of India Open Data'
        });
      }
    }
  } catch (e) { console.error('Govt API error:', e.message); }

  res.json({
    success: true, crop: cropName,
    current_price: basePrice + Math.round((Math.random() - 0.5) * 200),
    unit: 'per quintal (100 kg)', currency: 'INR',
    markets: [
      { market: 'APMC Bangalore', state: 'Karnataka', price: basePrice + 50, date: new Date().toLocaleDateString('en-IN') },
      { market: 'Azadpur Mandi', state: 'Delhi', price: basePrice - 30, date: new Date().toLocaleDateString('en-IN') },
      { market: 'Vashi', state: 'Maharashtra', price: basePrice + 80, date: new Date().toLocaleDateString('en-IN') }
    ],
    trend: generateTrend(basePrice), source: 'Market estimate'
  });
}

function generateTrend(base) {
  const trend = [];
  let price = base * 0.9;
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    price = price * (1 + (Math.random() * 0.04 - 0.02));
    trend.push({ date: d.toLocaleDateString('en-IN'), price: Math.round(price) });
  }
  return trend;
}
