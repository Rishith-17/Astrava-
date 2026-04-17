import marketPriceService from '../../server/services/MarketPriceService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { query } = req.query;
    const crops = marketPriceService.searchCrops(query);
    res.json({ crops });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search crops' });
  }
}
