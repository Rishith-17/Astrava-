import multer from 'multer';
import { analyzeSoilImage, generateAdvice } from '../server/soilAnalyzer.js';
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
} from '../server/services/index.js';
import { AgriculturalAdvisorService } from '../server/services/AgriculturalAdvisorService.js';
import translationService from '../server/services/TranslationService.js';

const advisorService = new AgriculturalAdvisorService();

// Parse multipart form data
const upload = multer({ storage: multer.memoryStorage() });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

function getEstimatedSoilProperties(soilType) {
  const s = soilType.toLowerCase();
  if (s.includes('black'))    return { soil_ph: 7.2, organic_carbon: 0.5, soil_clay_percentage: 50, soil_sand_percentage: 25, nitrogen_content: 0.05, cec: 35 };
  if (s.includes('red'))      return { soil_ph: 6.5, organic_carbon: 0.4, soil_clay_percentage: 30, soil_sand_percentage: 50, nitrogen_content: 0.04, cec: 15 };
  if (s.includes('alluvial')) return { soil_ph: 7.0, organic_carbon: 0.8, soil_clay_percentage: 35, soil_sand_percentage: 40, nitrogen_content: 0.08, cec: 25 };
  if (s.includes('laterite')) return { soil_ph: 5.5, organic_carbon: 0.3, soil_clay_percentage: 40, soil_sand_percentage: 35, nitrogen_content: 0.03, cec: 10 };
  return { soil_ph: 6.5, organic_carbon: 0.5, soil_clay_percentage: 35, soil_sand_percentage: 40, nitrogen_content: 0.05, cec: 20 };
}

function classifyNutrients(soilProps) {
  if (!soilProps) return { nitrogen: 'Unknown', phosphorus: 'Unknown', potassium: 'Unknown', deficiencies: [] };
  const deficiencies = [];
  let nitrogen = 'Medium';
  if (soilProps.organic_carbon < 1.0) { nitrogen = 'Low'; deficiencies.push('nitrogen'); }
  else if (soilProps.organic_carbon > 2.0) nitrogen = 'High';
  return { nitrogen, phosphorus: 'Medium', potassium: 'Medium', deficiencies, organic_carbon: soilProps.organic_carbon };
}

function formatFertilizerRecommendation(fertData) {
  const total = fertData.nitrogen_kg_per_acre + fertData.phosphorus_kg_per_acre + fertData.potassium_kg_per_acre;
  let rec = `Apply ${fertData.npk_ratio} fertilizer at ${total} kg per acre`;
  if (fertData.organic_amendments?.length > 0) rec += `. Organic options: ${fertData.organic_amendments.slice(0, 2).join(', ')}`;
  return rec;
}

function determineDeficiency(soilData, mlNutrientStatus = {}) {
  const { ph, organic_carbon } = soilData || {};
  const deficiencies = [];
  if (ph && ph < 5.5) deficiencies.push('Acidic soil - may need lime application');
  else if (ph && ph > 8.0) deficiencies.push('Alkaline soil - may need sulfur application');
  if (organic_carbon && organic_carbon < 1.0) deficiencies.push('Low organic matter - add compost');
  if (mlNutrientStatus.nitrogen === 'Low') deficiencies.push('Low nitrogen - needs nitrogen-rich fertilizer');
  if (mlNutrientStatus.phosphorus === 'Low') deficiencies.push('Low phosphorus - needs phosphate fertilizer');
  if (mlNutrientStatus.potassium === 'Low') deficiencies.push('Low potassium - needs potash fertilizer');
  return deficiencies.length > 0 ? deficiencies.join('. ') : 'Nutrient levels are adequate';
}

function recommendCrops(soilType, soilData, weatherData) {
  const s = soilType.toLowerCase();
  let crops = [];
  if (s.includes('black'))    crops = ['Cotton', 'Wheat', 'Sorghum', 'Sunflower'];
  else if (s.includes('red')) crops = ['Groundnut', 'Millets', 'Pulses', 'Oilseeds'];
  else if (s.includes('alluvial')) crops = ['Rice', 'Wheat', 'Sugarcane', 'Vegetables'];
  else if (s.includes('laterite')) crops = ['Cashew', 'Coconut', 'Tea', 'Coffee'];
  else crops = ['Rice', 'Wheat', 'Maize', 'Vegetables'];
  if (soilData?.sand > 60) crops.push('Millets', 'Groundnut');
  if (soilData?.clay > 50) crops.push('Rice', 'Sugarcane');
  if (soilData?.ph < 6.0) crops.push('Tea', 'Potato');
  return [...new Set(crops)].slice(0, 5);
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await runMiddleware(req, res, upload.single('image'));

    const { latitude, longitude, language } = req.body;
    const imageBuffer = req.file?.buffer;

    if (!imageBuffer) return res.status(400).json({ error: 'No image provided' });
    if (imageBuffer.length > 5 * 1024 * 1024) return res.status(400).json({ error: 'Image size exceeds 5MB limit' });

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    const mlResult = await analyzeSoilImage(imageBuffer);

    const [locationResult, soilPropsResult, weatherResult, satelliteResult, soilHealthResult, bhuvanMoistureResult, faoRecommendationsResult] = await Promise.all([
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
      const cropHealthResult = await cropHealthService.getCropHealth(lat, lon, satelliteData.ndvi);
      if (cropHealthResult.success) cropHealthData = cropHealthResult.data;
    }

    let fertilizerData = null;
    if (effectiveSoilProps && nutrientStatus) {
      const fertResult = await fertilizerService.getFertilizerRecommendation(mlResult.soil_type, nutrientStatus, 'general');
      if (fertResult.success) fertilizerData = fertResult.data;
    }

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
    res.status(500).json({ error: error.message, details: 'Failed to analyze soil image. Please try again.' });
  }
}
