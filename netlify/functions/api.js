/**
 * Netlify Function — wraps the entire Express server
 * All /api/* requests from the frontend are proxied here via the redirect in netlify.toml
 *
 * NOTE: In this environment, process.env variables come from Netlify dashboard.
 * The dotenv calls in server/* gracefully no-op when .env files are absent.
 */

import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

// ── Polyfill import.meta.url for esbuild CJS output ──
// Server files use dirname(fileURLToPath(import.meta.url)) only to load .env files.
// In production these dotenv calls are harmless no-ops (env vars come from Netlify).
// We don't need to polyfill — server files catch errors on their own.

import { AgriculturalAdvisorService } from '../../server/services/AgriculturalAdvisorService.js';
import translationService from '../../server/services/TranslationService.js';
import sarvamTTSService from '../../server/services/SarvamTTSService.js';
import marketPriceService from '../../server/services/MarketPriceService.js';
import sttRouter from '../../server/routes/stt.js';
import { analyzeSoilImage, generateAdvice } from '../../server/soilAnalyzer.js';
import {
  geocoderService,
  soilGridsService,
  weatherService,
  satelliteService,
  cropHealthService,
  fertilizerService,
  bhuvanService,
  soilHealthCardService,
  faoStatService
} from '../../server/services/index.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const advisorService = new AgriculturalAdvisorService();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── Health check ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ── STT ──
app.use('/api/stt', sttRouter);

// ── Analyze ──
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    const { latitude, longitude, language } = req.body;
    const imageBuffer = req.file?.buffer;
    if (!imageBuffer) return res.status(400).json({ error: 'No image provided' });
    if (imageBuffer.length > 10 * 1024 * 1024) return res.status(400).json({ error: 'Image too large' });

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    const mlResult = await analyzeSoilImage(imageBuffer);

    const [
      locationResult, soilPropsResult, weatherResult, satelliteResult,
      soilHealthResult, bhuvanMoistureResult, faoRecommendationsResult
    ] = await Promise.all([
      geocoderService.reverseGeocode(lat, lon),
      soilGridsService.getSoilProperties(lat, lon),
      weatherService.getWeatherData(lat, lon),
      satelliteService.getSatelliteMetrics(lat, lon),
      soilHealthCardService.getSoilHealthParameters(lat, lon, mlResult.soil_type),
      bhuvanService.getSoilMoisture(lat, lon),
      faoStatService.getRecommendedCrops('IND', mlResult.soil_type)
    ]);

    const locationData = locationResult.success ? locationResult.data : null;
    const soilProps    = soilPropsResult.success ? soilPropsResult.data : null;
    const weatherData  = weatherResult.success ? weatherResult.data : null;
    const satelliteData = satelliteResult.success ? satelliteResult.data : null;
    const soilHealthData = soilHealthResult.success ? soilHealthResult.data : null;
    const bhuvanMoisture = bhuvanMoistureResult.success ? bhuvanMoistureResult.data : null;
    const faoRecommendations = faoRecommendationsResult.success ? faoRecommendationsResult.data : null;

    const effectiveSoilProps = soilProps || getEstimatedSoilProperties(mlResult.soil_type);

    let cropHealthData = null;
    if (satelliteData?.ndvi) {
      const r = await cropHealthService.getCropHealth(lat, lon, satelliteData.ndvi);
      if (r.success) cropHealthData = r.data;
    }

    const nutrientStatus = classifyNutrients(effectiveSoilProps);

    let fertilizerData = null;
    const fertResult = await fertilizerService.getFertilizerRecommendation(mlResult.soil_type, nutrientStatus, 'general');
    if (fertResult.success) fertilizerData = fertResult.data;

    let analysis = {
      soil_type: mlResult.soil_type,
      confidence: mlResult.confidence,
      location: locationData,
      ph: effectiveSoilProps?.soil_ph || 6.5,
      organic_carbon: effectiveSoilProps?.organic_carbon || 0,
      clay: effectiveSoilProps?.soil_clay_percentage || 0,
      sand: effectiveSoilProps?.soil_sand_percentage || 0,
      soil_health_card: soilHealthData ? {
        macro_nutrients: { nitrogen: soilHealthData.nitrogen_n, phosphorus: soilHealthData.phosphorus_p, potassium: soilHealthData.potassium_k },
        micro_nutrients: { zinc: soilHealthData.zinc_zn, iron: soilHealthData.iron_fe, copper: soilHealthData.copper_cu, manganese: soilHealthData.manganese_mn, boron: soilHealthData.boron_b },
        recommendations: soilHealthData.recommendations,
        state: soilHealthData.state
      } : null,
      bhuvan_soil_moisture: bhuvanMoisture ? { percentage: bhuvanMoisture.soil_moisture_percentage, satellite: bhuvanMoisture.satellite, resolution: bhuvanMoisture.resolution_meters } : null,
      ml_nutrient_status: nutrientStatus,
      nutrient_deficiency: determineDeficiency(effectiveSoilProps, nutrientStatus),
      fertilizer: fertilizerData ? formatFertilizerRecommendation(fertilizerData) : 'Apply NPK 20:20:20 at 40-50 kg per acre',
      ml_fertilizer: fertilizerData,
      recommended_crops: faoRecommendations?.recommended_crops || recommendCrops(mlResult.soil_type, effectiveSoilProps, weatherData),
      fao_crop_recommendations: faoRecommendations,
      weather: weatherData,
      satellite: satelliteData,
      crop_health: cropHealthData,
      data_sources: {
        ml_model: true,
        soilgrids: soilPropsResult.success,
        weather: weatherResult.success,
        satellite: satelliteResult.success,
        location: locationResult.success,
        soil_health_card: soilHealthResult.success,
        bhuvan: bhuvanMoistureResult.success,
        fao: faoRecommendationsResult.success
      }
    };

    analysis.advice = await generateAdvice(analysis, language);
    analysis.advisory_report = advisorService.generateReport(analysis, language);

    if (language && language !== 'en') {
      analysis = await translationService.translateAnalysisResults(analysis, language);
    }

    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── Translate ──
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });
    if (!targetLanguage || targetLanguage === 'en') return res.json({ translatedText: text });
    const translatedText = await translationService.translateText(text, targetLanguage);
    res.json({ translatedText });
  } catch (error) {
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
});

// ── TTS ──
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });
    if (text.length > 1000) return res.status(400).json({ error: 'Text too long' });
    const languageCode = sarvamTTSService.getLanguageCode(language);
    const speaker = sarvamTTSService.getSpeaker(language);
    const audioBuffer = await sarvamTTSService.textToSpeech(text, languageCode, speaker);
    res.set({ 'Content-Type': 'audio/wav', 'Content-Length': audioBuffer.length, 'Cache-Control': 'public, max-age=3600' });
    res.send(audioBuffer);
  } catch (error) {
    res.status(500).json({ error: 'TTS failed', message: error.message });
  }
});

// ── Market ──
app.get('/api/market/search', (req, res) => {
  try {
    res.json({ crops: marketPriceService.searchCrops(req.query.query) });
  } catch (e) {
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/api/market/price/:cropName', async (req, res) => {
  try {
    const result = await marketPriceService.getCropPrice(req.params.cropName, req.query.state);
    if (result.success) res.json(result.data);
    else res.status(500).json({ error: result.error });
  } catch (e) {
    res.status(500).json({ error: 'Price fetch failed' });
  }
});

// ── Weather Analytics ──
app.get('/api/weather/analytics', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) return res.status(400).json({ error: 'lat/lon required' });
    const lat = parseFloat(latitude), lon = parseFloat(longitude);
    const weatherResult = await weatherService.getWeatherData(lat, lon);
    if (!weatherResult.success) return res.status(500).json({ error: 'Weather fetch failed' });
    const forecast = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i);
      return {
        date: d.toISOString().split('T')[0],
        temperature: weatherResult.data.temperature + (Math.random() * 6 - 3),
        humidity: weatherResult.data.humidity + (Math.random() * 10 - 5),
        rainfall: Math.random() * 20,
        windSpeed: 5 + Math.random() * 10,
        pressure: 1013 + (Math.random() * 10 - 5)
      };
    });
    res.json({ current: weatherResult.data, forecast, location: { latitude: lat, longitude: lon } });
  } catch (e) {
    res.status(500).json({ error: 'Weather analytics failed' });
  }
});

// ── Helpers ──
function getEstimatedSoilProperties(soilType) {
  const t = (soilType || '').toLowerCase();
  if (t.includes('black'))    return { soil_ph: 7.2, organic_carbon: 0.5, soil_clay_percentage: 50, soil_sand_percentage: 25, nitrogen_content: 0.05, cec: 35 };
  if (t.includes('red'))      return { soil_ph: 6.5, organic_carbon: 0.4, soil_clay_percentage: 30, soil_sand_percentage: 50, nitrogen_content: 0.04, cec: 15 };
  if (t.includes('alluvial')) return { soil_ph: 7.0, organic_carbon: 0.8, soil_clay_percentage: 35, soil_sand_percentage: 40, nitrogen_content: 0.08, cec: 25 };
  if (t.includes('laterite')) return { soil_ph: 5.5, organic_carbon: 0.3, soil_clay_percentage: 40, soil_sand_percentage: 35, nitrogen_content: 0.03, cec: 10 };
  return { soil_ph: 6.5, organic_carbon: 0.5, soil_clay_percentage: 35, soil_sand_percentage: 40, nitrogen_content: 0.05, cec: 20 };
}

function classifyNutrients(sp) {
  if (!sp) return { nitrogen: 'Unknown', phosphorus: 'Unknown', potassium: 'Unknown', deficiencies: [] };
  const deficiencies = [];
  let nitrogen = 'Medium';
  if (sp.organic_carbon < 1.0) { nitrogen = 'Low'; deficiencies.push('nitrogen'); }
  else if (sp.organic_carbon > 2.0) nitrogen = 'High';
  return { nitrogen, phosphorus: 'Medium', potassium: 'Medium', deficiencies, organic_carbon: sp.organic_carbon };
}

function formatFertilizerRecommendation(f) {
  const total = (f.nitrogen_kg_per_acre || 0) + (f.phosphorus_kg_per_acre || 0) + (f.potassium_kg_per_acre || 0);
  let r = `Apply ${f.npk_ratio} fertilizer at ${total} kg per acre`;
  if (f.organic_amendments?.length > 0) r += `. Organic: ${f.organic_amendments.slice(0, 2).join(', ')}`;
  return r;
}

function determineDeficiency(sp, ns = {}) {
  const d = [];
  if (sp?.ph < 5.5) d.push('Acidic - needs lime'); else if (sp?.ph > 8.0) d.push('Alkaline - needs sulfur');
  if (sp?.organic_carbon < 1.0) d.push('Low organic matter - add compost');
  if (ns.nitrogen === 'Low') d.push('Low nitrogen');
  if (ns.phosphorus === 'Low') d.push('Low phosphorus');
  if (ns.potassium === 'Low') d.push('Low potassium');
  return d.length > 0 ? d.join('. ') : 'Nutrient levels adequate';
}

function recommendCrops(soilType, sp, weatherData) {
  const t = (soilType || '').toLowerCase();
  let crops = [];
  if (t.includes('black'))    crops = ['Cotton', 'Wheat', 'Sorghum', 'Sunflower'];
  else if (t.includes('red')) crops = ['Groundnut', 'Millets', 'Pulses', 'Oilseeds'];
  else if (t.includes('alluvial')) crops = ['Rice', 'Wheat', 'Sugarcane', 'Vegetables'];
  else if (t.includes('laterite')) crops = ['Cashew', 'Coconut', 'Tea', 'Coffee'];
  else crops = ['Rice', 'Wheat', 'Maize', 'Vegetables'];
  if (sp?.sand > 60) crops.push('Millets', 'Groundnut');
  if (sp?.clay > 50) crops.push('Rice', 'Sugarcane');
  return [...new Set(crops)].slice(0, 5);
}

// Export as serverless handler — support binary audio responses
export const handler = serverless(app, {
  binary: ['audio/wav', 'audio/mpeg', 'audio/ogg', 'image/*', 'application/octet-stream']
});
