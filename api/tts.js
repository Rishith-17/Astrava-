const LANGUAGE_CODES = {
  en:'en-IN', hi:'hi-IN', kn:'kn-IN', ta:'ta-IN', te:'te-IN',
  mr:'mr-IN', gu:'gu-IN', bn:'bn-IN', ml:'ml-IN', pa:'pa-IN',
  or:'or-IN', as:'as-IN', ur:'ur-IN'
};
const SPEAKERS = { hi:'meera', kn:'neel', ta:'amol', te:'meera', mr:'meera', default:'ratan' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, language = 'en' } = req.body || {};
  if (!text) return res.status(400).json({ error: 'No text provided' });
  if (text.length > 500) return res.status(400).json({ error: 'Text too long' });

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'SARVAM_API_KEY not configured' });

  try {
    const { default: axios } = await import('axios');
    const languageCode = LANGUAGE_CODES[language] || 'en-IN';
    const speaker = SPEAKERS[language] || SPEAKERS.default;

    const response = await axios.post('https://api.sarvam.ai/text-to-speech', {
      inputs: [text],
      target_language_code: languageCode,
      speaker,
      pitch: 0, pace: 1.0, loudness: 1.0,
      speech_sample_rate: 22050,
      enable_preprocessing: false,
      model: 'bulbul:v1'
    }, {
      headers: { 'api-subscription-key': apiKey, 'Content-Type': 'application/json' },
      timeout: 15000
    });

    const base64Audio = response.data?.audios?.[0];
    if (!base64Audio) throw new Error('No audio in response');

    const audioBuffer = Buffer.from(base64Audio, 'base64');
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(audioBuffer);
  } catch (error) {
    console.error('TTS error:', error.message);
    res.status(500).json({ error: 'TTS failed', message: error.message });
  }
}
