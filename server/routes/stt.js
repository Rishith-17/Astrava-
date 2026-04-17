/**
 * Speech-to-Text endpoint
 * Accepts audio/webm from browser, forwards to Sarvam AI STT
 */
import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'SARVAM_API_KEY not configured' });

    const audioBuffer = req.file?.buffer;
    if (!audioBuffer) return res.status(400).json({ error: 'No audio file provided' });

    const language = req.body.language_code || 'hi-IN';
    const mimeType = req.file.mimetype || 'audio/webm';

    // Determine file extension from mime type
    let ext = 'webm';
    if (mimeType.includes('wav')) ext = 'wav';
    else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) ext = 'mp3';
    else if (mimeType.includes('ogg')) ext = 'ogg';
    else if (mimeType.includes('mp4')) ext = 'mp4';

    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: `audio.${ext}`,
      contentType: mimeType.split(';')[0] // strip codec params
    });
    formData.append('language_code', language);
    formData.append('model', 'saaras:v3');

    console.log(`[STT] Forwarding ${audioBuffer.length} bytes (${mimeType}) to Sarvam, lang: ${language}`);

    const response = await axios.post(
      'https://api.sarvam.ai/speech-to-text',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'API-Subscription-Key': apiKey
        },
        timeout: 30000
      }
    );

    console.log('[STT] Sarvam response:', response.data);
    res.json({ transcript: response.data.transcript || '' });

  } catch (error) {
    console.error('[STT] Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Speech-to-text failed',
      details: error.response?.data || error.message
    });
  }
});

export default router;
