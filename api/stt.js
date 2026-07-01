import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'SARVAM_API_KEY not configured' });

    await runMiddleware(req, res, upload.single('file'));

    const audioBuffer = req.file?.buffer;
    if (!audioBuffer) return res.status(400).json({ error: 'No audio file provided' });

    const language = req.body.language_code || 'hi-IN';
    const mimeType = req.file.mimetype || 'audio/webm';
    let ext = 'webm';
    if (mimeType.includes('wav')) ext = 'wav';
    else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) ext = 'mp3';

    const formData = new FormData();
    formData.append('file', audioBuffer, { filename: `audio.${ext}`, contentType: mimeType.split(';')[0] });
    formData.append('language_code', language);
    formData.append('model', 'saaras:v3');

    const response = await axios.post('https://api.sarvam.ai/speech-to-text', formData, {
      headers: { ...formData.getHeaders(), 'API-Subscription-Key': apiKey },
      timeout: 30000
    });

    res.json({ transcript: response.data.transcript || '' });
  } catch (error) {
    res.status(500).json({ error: 'STT failed', details: error.response?.data || error.message });
  }
}
