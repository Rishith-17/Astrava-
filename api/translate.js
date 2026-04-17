import translationService from '../server/services/TranslationService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text, targetLanguage } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });
    if (!targetLanguage || targetLanguage === 'en') return res.json({ translatedText: text });

    const translatedText = await translationService.translateText(text, targetLanguage);
    res.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
}
