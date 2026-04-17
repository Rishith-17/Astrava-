import sarvamTTSService from '../server/services/SarvamTTSService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text, language = 'en' } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });
    if (text.length > 500) return res.status(400).json({ error: 'Text exceeds 500 character limit.' });

    const languageCode = sarvamTTSService.getLanguageCode(language);
    const speaker = sarvamTTSService.getSpeaker(language);
    const audioBuffer = await sarvamTTSService.textToSpeech(text, languageCode, speaker);

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(audioBuffer);
  } catch (error) {
    console.error('TTS error:', error.message);
    res.status(500).json({ error: 'Text-to-speech conversion failed', message: error.message });
  }
}
