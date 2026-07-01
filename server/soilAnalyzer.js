import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Safe dotenv loading — no-ops in production where env vars come from the platform
try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: join(__dirname, '.env') });
  dotenv.config({ path: join(__dirname, '../.env') });
} catch (_) { /* bundled/production environment — env vars already set */ }

/**
 * Analyze soil image using ML model via ngrok endpoint
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} Soil analysis result
 */
export async function analyzeSoilImage(imageBuffer) {
  const SOIL_API_URL = process.env.SOIL_CLASSIFY_API_URL;

  if (!SOIL_API_URL) {
    throw new Error('SOIL_CLASSIFY_API_URL is not configured in .env');
  }

  try {
    console.log(`[ML] Sending image to FastAPI: ${SOIL_API_URL} (${imageBuffer.length} bytes)`);
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'soil.jpg',
      contentType: 'image/jpeg'
    });

    const response = await axios.post(SOIL_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        'ngrok-skip-browser-warning': 'true'
      },
      timeout: 30000,
      maxContentLength: 5 * 1024 * 1024,
      maxBodyLength: 5 * 1024 * 1024
    });

    if (!response.data || !response.data.soil_type) {
      throw new Error(`Invalid response from ML model: ${JSON.stringify(response.data)}`);
    }

    console.log(`[ML] FastAPI result: ${response.data.soil_type} (confidence: ${response.data.confidence})`);

    return {
      soil_type: response.data.soil_type,
      confidence: response.data.confidence || 0.0,
      ph_level: response.data.ph_level || null,
      nutrient_status: response.data.nutrient_status || {},
      fertilizer_recommendation: response.data.fertilizer_recommendation || null
    };

  } catch (error) {
    if (error.response) {
      console.error('ML API Response Status:', error.response.status);
      console.error('ML API Response Data:', error.response.data);
      throw new Error(`Soil classification API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error('Soil classification API is unreachable. Check your ngrok URL and ML model server.');
    }
    throw error;
  }
}

// Get soil data from SoilGrids API
export async function getSoilData(latitude, longitude) {
  try {
    const properties = ['phh2o', 'ocd', 'clay', 'sand', 'silt'];
    const depth = '0-5cm';
    
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query`;
    const params = {
      lon: longitude,
      lat: latitude,
      property: properties,
      depth: depth,
      value: 'mean'
    };

    const response = await axios.get(url, { params, timeout: 10000 });
    const data = response.data;

    return {
      ph: extractValue(data, 'phh2o') / 10, // pH is in pH*10
      organic_carbon: extractValue(data, 'ocd') / 10, // g/kg to %
      clay: extractValue(data, 'clay') / 10, // g/kg to %
      sand: extractValue(data, 'sand') / 10,
      silt: extractValue(data, 'silt') / 10
    };
  } catch (error) {
    console.error('SoilGrids API error:', error.message);
    // Return default values if API fails
    return {
      ph: 6.5,
      organic_carbon: 1.5,
      clay: 25,
      sand: 40,
      silt: 35
    };
  }
}

function extractValue(data, property) {
  try {
    const layer = data.properties.layers.find(l => l.name === property);
    return layer?.depths[0]?.values?.mean || 0;
  } catch {
    return 0;
  }
}

// Generate localized advice using Sarvam AI
export async function generateAdvice(analysis, language) {
  try {
    const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
    
    if (!SARVAM_API_KEY) {
      return generateFallbackAdvice(analysis, language);
    }

    const prompt = `Soil Type: ${analysis.soil_type}
pH: ${analysis.ph}
Nutrient Status: ${analysis.nutrient_deficiency}
Fertilizer: ${analysis.fertilizer}
Recommended Crops: ${analysis.recommended_crops.join(', ')}

Provide simple farming advice for a farmer in 2-3 sentences.`;

    const response = await axios.post(
      'https://api.sarvam.ai/translate',
      {
        input: prompt,
        source_language_code: 'en-IN',
        target_language_code: getLanguageCode(language),
        speaker_gender: 'Male',
        mode: 'formal'
      },
      {
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return response.data.translated_text || generateFallbackAdvice(analysis, language);
  } catch (error) {
    console.error('Sarvam AI error:', error.message);
    return generateFallbackAdvice(analysis, language);
  }
}

function generateFallbackAdvice(analysis, language) {
  const advice = `Your soil is ${analysis.soil_type} with pH ${analysis.ph}. ${analysis.fertilizer}. Best crops: ${analysis.recommended_crops.join(', ')}.`;
  return advice;
}

function getLanguageCode(lang) {
  const map = {
    'hi': 'hi-IN',
    'kn': 'kn-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'en': 'en-IN',
    'mr': 'mr-IN',
    'bn': 'bn-IN',
    'gu': 'gu-IN',
    'pa': 'pa-IN',
    'ml': 'ml-IN',
    'or': 'or-IN',
    'as': 'as-IN'
  };
  return map[lang] || 'en-IN';
}