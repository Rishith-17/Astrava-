/**
 * Netlify Function — wraps the entire Express server
 * Lives inside server/ so all relative imports resolve correctly
 */

import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

import { analyzeSoilImage, generateAdvice } from '../soilAnalyzer.js';
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
} from '../services/index.js';
import { AgriculturalAdvisorService } from '../services/AgriculturalAdvisorService.js';
import translationService from '../services/TranslationService.js';
import sarvamTTSService from '../services/SarvamTTSService.js';
import marketPriceService from '../services/MarketPriceService.js';
import sttRouter from '../routes/stt.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const advisorService = new AgriculturalAdvisorService();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// STT
app.use('/api/stt', sttRouter);

// Analyze
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    const { latitude, longitude, language } = req.body;
    const imageBuffer = req.file?.buffer;
    if (!imageBuffer) return res.status(400).json({ error: 'No image provided' });

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
    const soilProps = soilPropsResult.success ? soilPropsResult.data : null;
    const weatherData = weatherResult.success ? weatherResult.data : null;
    const satelliteData = satelliteResult.success ? satelliteResult.data : null;
    const soilHealthData = soilHealthResult.success ? soilHealthResult.data : null;
    const bhuvanMoisture = bhuvanMoistureResult.success ? bhuvanMoistureResult.data : null;
    const faoRecommendations = faoRecommendationsResult.success ? faoRecommendationsResult.data : null;

    const effectiveSoilProps = soilProps || getEstimatedSoilProperties(mlResult.soil_type);
    const nutrientStatus = classifyNutrients(effectiveSoilProps);

    let cropHealthData = null;
    if (satelliteData?.ndvi) {
      const r = await cropHealthService.getCropHealth(lat, lon, satelliteData.ndvi);
      if (r.success) cropHealthData = r.data;
    }

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
      bhuvan_soil_moisture: bhuvanMoisture ? { percentage: bhuvanMoisture.soil_moisture_percentage, satellite: bhuvanMoisture.satellite } : null,
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

// Translate
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text) return res.status(400).json({ error: 'No text' });
    if (!targetLanguage || targetLanguage === 'en') return res.json({ translatedText: text });
    const translatedText = await translationService.translateText(text, targetLanguage);
    res.json({ translatedText });
  } catch (error) {
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
});

// TTS
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;
    if (!text) return res.status(400).json({ error: 'No text' });
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

// Market
app.get('/api/market/search', (req, res) => {
  try { res.json({ crops: marketPriceService.searchCrops(req.query.query) }); }
  catch (e) { res.status(500).json({ error: 'Search failed' }); }
});

app.get('/api/market/price/:cropName', async (req, res) => {
  try {
    const result = await marketPriceService.getCropPrice(req.params.cropName, req.query.state);
    if (result.success) res.json(result.data);
    else res.status(500).json({ error: result.error });
  } catch (e) { res.status(500).json({ error: 'Price failed' }); }
});

// Weather analytics
app.get('/api/weather/analytics', async (req, res) => {
  try {
    const lat = parseFloat(req.query.latitude), lon = parseFloat(req.query.longitude);
    if (isNaN(lat) || isNaN(lon)) return res.status(400).json({ error: 'lat/lon required' });
    const weatherResult = await weatherService.getWeatherData(lat, lon);
    if (!weatherResult.success) return res.status(500).json({ error: 'Weather failed' });
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
  } catch (e) { res.status(500).json({ error: 'Weather analytics failed' }); }
});

// Helpers
function getEstimatedSoilProperties(t = '') {
  t = t.toLowerCase();
  if (t.includes('black')) return { soil_ph: 7.2, organic_carbon: 0.5, soil_clay_percentage: 50, soil_sand_percentage: 25 };
  if (t.includes('red')) return { soil_ph: 6.5, organic_carbon: 0.4, soil_clay_percentage: 30, soil_sand_percentage: 50 };
  if (t.includes('alluvial')) return { soil_ph: 7.0, organic_carbon: 0.8, soil_clay_percentage: 35, soil_sand_percentage: 40 };
  if (t.includes('laterite')) return { soil_ph: 5.5, organic_carbon: 0.3, soil_clay_percentage: 40, soil_sand_percentage: 35 };
  return { soil_ph: 6.5, organic_carbon: 0.5, soil_clay_percentage: 35, soil_sand_percentage: 40 };
}
function classifyNutrients(sp) {
  if (!sp) return { nitrogen: 'Unknown', phosphorus: 'Unknown', potassium: 'Unknown', deficiencies: [] };
  const d = []; let n = 'Medium';
  if (sp.organic_carbon < 1.0) { n = 'Low'; d.push('nitrogen'); } else if (sp.organic_carbon > 2.0) n = 'High';
  return { nitrogen: n, phosphorus: 'Medium', potassium: 'Medium', deficiencies: d };
}
function formatFertilizerRecommendation(f) {
  const t = (f.nitrogen_kg_per_acre || 0) + (f.phosphorus_kg_per_acre || 0) + (f.potassium_kg_per_acre || 0);
  let r = `Apply ${f.npk_ratio} at ${t} kg/acre`;
  if (f.organic_amendments?.length) r += `. Organic: ${f.organic_amendments.slice(0, 2).join(', ')}`;
  return r;
}
function determineDeficiency(sp, ns = {}) {
  const d = [];
  if (sp?.ph < 5.5) d.push('Acidic - needs lime'); else if (sp?.ph > 8) d.push('Alkaline - needs sulfur');
  if (sp?.organic_carbon < 1) d.push('Low organic matter');
  if (ns.nitrogen === 'Low') d.push('Low nitrogen');
  return d.length ? d.join('. ') : 'Nutrients adequate';
}
function recommendCrops(soilType = '', sp, _w) {
  const t = soilType.toLowerCase();
  let c = t.includes('black') ? ['Cotton','Wheat','Sorghum'] : t.includes('red') ? ['Groundnut','Millets','Pulses'] : t.includes('alluvial') ? ['Rice','Wheat','Sugarcane'] : t.includes('laterite') ? ['Cashew','Coconut','Tea'] : ['Rice','Wheat','Maize'];
  return [...new Set(c)].slice(0, 5);
}

export const handler = serverless(app, {
  binary: ['audio/wav', 'audio/mpeg', 'audio/ogg', 'image/*']
});
