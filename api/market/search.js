const CROPS = [
  'Wheat','Rice','Maize','Barley','Bajra','Jowar','Ragi',
  'Groundnut','Soybean','Sunflower','Mustard','Cotton',
  'Sugarcane','Potato','Onion','Tomato','Chilli',
  'Turmeric','Ginger','Garlic','Peas','Lentils',
  'Chickpea','Pigeon Pea','Moong','Urad','Arhar'
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const query = (req.query.query || '').toLowerCase();
  const crops = query
    ? CROPS.filter(c => c.toLowerCase().includes(query))
    : CROPS.slice(0, 10);
  res.json({ crops });
}
