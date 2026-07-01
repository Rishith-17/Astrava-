export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, targetLanguage } = req.body || {};
  if (!text) return res.status(400).json({ error: 'No text provided' });
  if (!targetLanguage || targetLanguage === 'en') return res.json({ translatedText: text });

  const LANGUAGE_MAP = {
    hi:'hi-IN', kn:'kn-IN', ta:'ta-IN', te:'te-IN', mr:'mr-IN',
    gu:'gu-IN', bn:'bn-IN', ml:'ml-IN', pa:'pa-IN', or:'or-IN',
    as:'as-IN', ur:'ur-IN', en:'en-IN'
  };

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) return res.json({ translatedText: text });

  try {
    const { default: axios } = await import('axios');
    const chunks = text.length > 900 ? text.match(/.{1,900}(\s|$)/g) || [text] : [text];
    const translated = [];

    for (const chunk of chunks) {
      const response = await axios.post('https://api.sarvam.ai/translate', {
        input: chunk,
        source_language_code: 'en-IN',
        target_language_code: LANGUAGE_MAP[targetLanguage] || 'hi-IN',
        speaker_gender: 'Male',
        mode: 'formal',
        enable_preprocessing: false
      }, {
        headers: { 'api-subscription-key': apiKey, 'Content-Type': 'application/json' },
        timeout: 10000
      });
      translated.push(response.data.translated_text || chunk);
    }
    res.json({ translatedText: translated.join(' ') });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.json({ translatedText: text }); // fallback to original
  }
}
