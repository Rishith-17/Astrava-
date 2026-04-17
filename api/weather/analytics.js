import { weatherService } from '../../server/services/index.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) return res.status(400).json({ error: 'Latitude and longitude required' });

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const weatherResult = await weatherService.getWeatherData(lat, lon);

    if (!weatherResult.success) return res.status(500).json({ error: 'Failed to fetch weather data' });

    const forecast = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        temperature: weatherResult.data.temperature + (Math.random() * 6 - 3),
        humidity: weatherResult.data.humidity + (Math.random() * 10 - 5),
        rainfall: Math.random() * 20,
        windSpeed: 5 + Math.random() * 10,
        pressure: 1013 + (Math.random() * 10 - 5)
      };
    });

    res.json({ current: weatherResult.data, forecast, location: { latitude: lat, longitude: lon } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather analytics' });
  }
}
