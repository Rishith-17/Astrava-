import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { analyzeSoilImage, getSoilData, generateAdvice } from './soilAnalyzer.js';
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
} from './services/index.js';
import { AgriculturalAdvisorService } from './services/AgriculturalAdvisorService.js';

// Load environment variables from parent directory
dotenv.config({ path: '.env' });

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const advisorService = new AgriculturalAdvisorService();

app.use(cors());
app.use(express.json());

app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    const { latitude, longitude, language } = req.body;
    const imageBuffer = req.file?.buffer;

    if (!imageBuffer) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Validate image size (5MB max)
    if (imageBuffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image size exceeds 5MB limit' });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    console.log(`Analyzing soil image (${imageBuffer.length} bytes) for location: ${lat}, ${lon}`);

    // Step 1: Classify soil from image using ML model
    const mlResult = await analyzeSoilImage(imageBuffer);
    console.log('ML Model Result:', mlResult);

    // Step 2: Get REAL data from all agricultural APIs in parallel
    console.log('Fetching real agricultural data from APIs...');
    
    const [
      locationResult,
      soilPropsResult,
      weatherResult,
      satelliteResult,
      soilHealthResult,
      bhuvanMoistureResult,
      faoRecommendationsResult
    ] = await Promise.all([
      geocoderService.reverseGeocode(lat, lon),
      soilGridsService.getSoilProperties(lat, lon),
      weatherService.getWeatherData(lat, lon),
      satelliteService.getSatelliteMetrics(lat, lon),
      soilHealthCardService.getSoilHealthParameters(lat, lon, mlResult.soil_type),
      bhuvanService.getSoilMoisture(lat, lon),
      faoStatService.getRecommendedCrops('IND', mlResult.soil_type)
    ]);

    // Extract data from results
    const locationData = locationResult.success ? locationResult.data : null;
    const soilProps = soilPropsResult.success ? soilPropsResult.data : null;
    const weatherData = weatherResult.success ? weatherResult.data : null;
    const satelliteData = satelliteResult.success ? satelliteResult.data : null;
    const soilHealthData = soilHealthResult.success ? soilHealthResult.data : null;
    const bhuvanMoisture = bhuvanMoistureResult.success ? bhuvanMoistureResult.data : null;
    const faoRecommendations = faoRecommendationsResult.success ? faoRecommendationsResult.data : null;

    console.log('Location Data:', locationData);
    console.log('Soil Properties:', soilProps);
    console.log('Weather Data:', weatherData);
    console.log('Satellite Data:', satelliteData);
    console.log('Soil Health Card Data:', soilHealthData);
    console.log('Bhuvan Soil Moisture:', bhuvanMoisture);
    console.log('FAO Recommendations:', faoRecommendations);

    // If SoilGrids has no data, use estimated values based on soil type
    let effectiveSoilProps = soilProps;
    if (!soilProps) {
      console.log('SoilGrids data unavailable, using estimated values based on soil type');
      effectiveSoilProps = getEstimatedSoilProperties(mlResult.soil_type);
    }

    // Step 3: Get crop health based on NDVI
    let cropHealthData = null;
    if (satelliteData && satelliteData.ndvi) {
      const cropHealthResult = await cropHealthService.getCropHealth(lat, lon, satelliteData.ndvi);
      if (cropHealthResult.success) {
        cropHealthData = cropHealthResult.data;
      }
    }

    // Step 4: Classify nutrient levels based on soil properties
    const nutrientStatus = classifyNutrients(effectiveSoilProps);
    console.log('Nutrient Status:', nutrientStatus);

    // Step 5: Get fertilizer recommendations
    let fertilizerData = null;
    if (effectiveSoilProps && nutrientStatus) {
      const fertResult = await fertilizerService.getFertilizerRecommendation(
        mlResult.soil_type,
        nutrientStatus,
        'general'
      );
      if (fertResult.success) {
        fertilizerData = fertResult.data;
      }
    }

    // Step 6: Combine all data into comprehensive analysis
    const analysis = {
      // ML Model predictions
      soil_type: mlResult.soil_type,
      confidence: mlResult.confidence,
      
      // Location data
      location: locationData,
      
      // Real soil properties from SoilGrids (or estimated)
      ph: effectiveSoilProps?.soil_ph || 6.5,
      organic_carbon: effectiveSoilProps?.organic_carbon || 0,
      clay: effectiveSoilProps?.soil_clay_percentage || 0,
      sand: effectiveSoilProps?.soil_sand_percentage || 0,
      
      // Soil Health Card parameters (Indian government standards)
      soil_health_card: soilHealthData ? {
        macro_nutrients: {
          nitrogen: soilHealthData.nitrogen_n,
          phosphorus: soilHealthData.phosphorus_p,
          potassium: soilHealthData.potassium_k
        },
        micro_nutrients: {
          zinc: soilHealthData.zinc_zn,
          iron: soilHealthData.iron_fe,
          copper: soilHealthData.copper_cu,
          manganese: soilHealthData.manganese_mn,
          boron: soilHealthData.boron_b
        },
        recommendations: soilHealthData.recommendations,
        state: soilHealthData.state
      } : null,
      
      // ISRO Bhuvan soil moisture
      bhuvan_soil_moisture: bhuvanMoisture ? {
        percentage: bhuvanMoisture.soil_moisture_percentage,
        satellite: bhuvanMoisture.satellite,
        resolution: bhuvanMoisture.resolution_meters
      } : null,
      
      // Real nutrient status
      ml_nutrient_status: nutrientStatus,
      nutrient_deficiency: determineDeficiency(effectiveSoilProps, nutrientStatus),
      
      // Real fertilizer recommendations
      fertilizer: fertilizerData ? formatFertilizerRecommendation(fertilizerData) : 'Apply NPK 20:20:20 at 40-50 kg per acre',
      ml_fertilizer: fertilizerData,
      
      // Crop recommendations (combined from FAO and local data)
      recommended_crops: faoRecommendations?.recommended_crops || recommendCrops(mlResult.soil_type, effectiveSoilProps, weatherData),
      fao_crop_recommendations: faoRecommendations,
      
      // Real weather data
      weather: weatherData,
      
      // Real satellite data
      satellite: satelliteData,
      
      // Crop health from NDVI
      crop_health: cropHealthData,
      
      // Data sources used
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

    // Step 7: Generate localized advice
    const advice = await generateAdvice(analysis, language);
    analysis.advice = advice;

    // Step 8: Generate comprehensive agricultural advisory report
    console.log('Generating agricultural advisory report...');
    const advisoryReport = advisorService.generateReport(analysis, language);
    analysis.advisory_report = advisoryReport;

    console.log('Analysis complete:', {
      soil_type: analysis.soil_type,
      confidence: analysis.confidence,
      ph: analysis.ph,
      data_sources: analysis.data_sources,
      report_generated: true
    });

    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to analyze soil image. Please try again.'
    });
  }
});

/**
 * Get estimated soil properties based on soil type
 * Used as fallback when SoilGrids has no data
 */
function getEstimatedSoilProperties(soilType) {
  const soilTypeLower = soilType.toLowerCase();
  
  // Typical properties for different Indian soil types
  if (soilTypeLower.includes('black')) {
    return {
      soil_ph: 7.2,
      organic_carbon: 0.5,
      soil_clay_percentage: 50,
      soil_sand_percentage: 25,
      nitrogen_content: 0.05,
      cec: 35
    };
  } else if (soilTypeLower.includes('red')) {
    return {
      soil_ph: 6.5,
      organic_carbon: 0.4,
      soil_clay_percentage: 30,
      soil_sand_percentage: 50,
      nitrogen_content: 0.04,
      cec: 15
    };
  } else if (soilTypeLower.includes('alluvial')) {
    return {
      soil_ph: 7.0,
      organic_carbon: 0.8,
      soil_clay_percentage: 35,
      soil_sand_percentage: 40,
      nitrogen_content: 0.08,
      cec: 25
    };
  } else if (soilTypeLower.includes('laterite')) {
    return {
      soil_ph: 5.5,
      organic_carbon: 0.3,
      soil_clay_percentage: 40,
      soil_sand_percentage: 35,
      nitrogen_content: 0.03,
      cec: 10
    };
  } else {
    // Default values
    return {
      soil_ph: 6.5,
      organic_carbon: 0.5,
      soil_clay_percentage: 35,
      soil_sand_percentage: 40,
      nitrogen_content: 0.05,
      cec: 20
    };
  }
}

/**
 * Classify nutrient levels based on soil properties
 */
function classifyNutrients(soilProps) {
  if (!soilProps) {
    return {
      nitrogen: 'Unknown',
      phosphorus: 'Unknown',
      potassium: 'Unknown',
      deficiencies: []
    };
  }

  const deficiencies = [];
  
  // Classify nitrogen based on organic carbon (proxy)
  let nitrogen = 'Medium';
  if (soilProps.organic_carbon < 1.0) {
    nitrogen = 'Low';
    deficiencies.push('nitrogen');
  } else if (soilProps.organic_carbon > 2.0) {
    nitrogen = 'High';
  }
  
  // Classify phosphorus (simplified - would need actual P data)
  const phosphorus = 'Medium';
  
  // Classify potassium (simplified - would need actual K data)
  const potassium = 'Medium';
  
  return {
    nitrogen,
    phosphorus,
    potassium,
    deficiencies,
    organic_carbon: soilProps.organic_carbon
  };
}

/**
 * Format fertilizer recommendation for display
 */
function formatFertilizerRecommendation(fertData) {
  const parts = [];
  
  parts.push(`Apply ${fertData.npk_ratio} fertilizer at ${fertData.nitrogen_kg_per_acre + fertData.phosphorus_kg_per_acre + fertData.potassium_kg_per_acre} kg per acre`);
  
  if (fertData.organic_amendments && fertData.organic_amendments.length > 0) {
    parts.push(`Organic options: ${fertData.organic_amendments.slice(0, 2).join(', ')}`);
  }
  
  return parts.join('. ');
}

function determineDeficiency(soilData, mlNutrientStatus = {}) {
  const { ph, organic_carbon } = soilData || {};
  const deficiencies = [];
  
  // Check pH levels
  if (ph && ph < 5.5) {
    deficiencies.push('Acidic soil - may need lime application');
  } else if (ph && ph > 8.0) {
    deficiencies.push('Alkaline soil - may need sulfur application');
  }
  
  // Check organic matter
  if (organic_carbon && organic_carbon < 1.0) {
    deficiencies.push('Low organic matter - add compost');
  }
  
  // Include ML model nutrient predictions if available
  if (mlNutrientStatus.nitrogen === 'Low') {
    deficiencies.push('Low nitrogen - needs nitrogen-rich fertilizer');
  }
  if (mlNutrientStatus.phosphorus === 'Low') {
    deficiencies.push('Low phosphorus - needs phosphate fertilizer');
  }
  if (mlNutrientStatus.potassium === 'Low') {
    deficiencies.push('Low potassium - needs potash fertilizer');
  }
  
  return deficiencies.length > 0 ? deficiencies.join('. ') : 'Nutrient levels are adequate';
}

function recommendCrops(soilType, soilData, weatherData) {
  const crops = [];
  
  // Base recommendations on soil type
  const soilTypeLower = soilType.toLowerCase();
  
  if (soilTypeLower.includes('black')) {
    crops.push('Cotton', 'Wheat', 'Sorghum', 'Sunflower');
  } else if (soilTypeLower.includes('red')) {
    crops.push('Groundnut', 'Millets', 'Pulses', 'Oilseeds');
  } else if (soilTypeLower.includes('alluvial')) {
    crops.push('Rice', 'Wheat', 'Sugarcane', 'Vegetables');
  } else if (soilTypeLower.includes('laterite')) {
    crops.push('Cashew', 'Coconut', 'Tea', 'Coffee');
  } else {
    crops.push('Rice', 'Wheat', 'Maize', 'Vegetables');
  }
  
  // Adjust based on soil properties
  if (soilData) {
    const { clay, sand, ph } = soilData;
    
    // Sandy soil - add drought-resistant crops
    if (sand > 60) {
      crops.push('Millets', 'Groundnut');
    }
    
    // Clay soil - add water-loving crops
    if (clay > 50) {
      crops.push('Rice', 'Sugarcane');
    }
    
    // Acidic soil
    if (ph < 6.0) {
      crops.push('Tea', 'Potato');
    }
  }
  
  // Remove duplicates and return top 5
  return [...new Set(crops)].slice(0, 5);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
