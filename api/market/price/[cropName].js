import marketPriceService from '../../../server/services/MarketPriceService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { cropName, state } = req.query;
    const result = await marketPriceService.getCropPrice(cropName, state);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market price' });
  }
}
