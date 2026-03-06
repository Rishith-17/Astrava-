/**
 * Test script for all API services
 * Run with: node server/test-services.js
 */

import dotenv from 'dotenv';
import {
  geocoderService,
  soilGridsService,
  weatherService,
  satelliteService,
  cropHealthService,
  fertilizerService
} from './services/index.js';

dotenv.config();

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Test coordinates (Bangalore, India)
const testLat = 12.9716;
const testLon = 77.5946;

console.log(`${colors.blue}🧪 Testing Agricultural Intelligence Engine Services${colors.reset}\n`);
console.log(`Test Location: ${testLat}, ${testLon} (Bangalore, India)\n`);

/**
 * Test Geocoder Service
 */
async function testGeocoderService() {
  console.log(`${colors.cyan}━━━ Testing Geocoder Service ━━━${colors.reset}`);
  
  try {
    const result = await geocoderService.reverseGeocode(testLat, testLon);
    
    if (result.success) {
      console.log(`${colors.green}✅ Geocoder Service: Success${colors.reset}`);
      console.log(`   District: ${result.data.district}`);
      console.log(`   State: ${result.data.state}`);
      console.log(`   Country: ${result.data.country}`);
      console.log(`   Address: ${result.data.formatted_address}\n`);
      return true;
    } else {
      console.log(`${colors.red}❌ Geocoder Service: Failed${colors.reset}`);
      console.log(`   Error: ${result.error}\n`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Geocoder Service: Exception${colors.reset}`);
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

/**
 * Test SoilGrids Service
 */
async function testSoilGridsService() {
  console.log(`${colors.cyan}━━━ Testing SoilGrids Service ━━━${colors.reset}`);
  
  try {
    const result = await soilGridsService.getSoilProperties(testLat, testLon);
    
    if (result.success) {
      console.log(`${colors.green}✅ SoilGrids Service: Success${colors.reset}`);
      console.log(`   pH: ${result.data.soil_ph}`);
      console.log(`   Nitrogen: ${result.data.nitrogen_content}%`);
      console.log(`   Organic Carbon: ${result.data.organic_carbon}%`);
      console.log(`   Clay: ${result.data.soil_clay_percentage}%`);
      console.log(`   Sand: ${result.data.soil_sand_percentage}%`);
      console.log(`   CEC: ${result.data.cec}\n`);
      return result.data;
    } else {
      console.log(`${colors.red}❌ SoilGrids Service: Failed${colors.reset}`);
      console.log(`   Error: ${result.error}\n`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}❌ SoilGrids Service: Exception${colors.reset}`);
    console.log(`   Error: ${error.message}\n`);
    return null;
  }
}

/**
 * Test Weather Service
 */
async function testWeatherService() {
  console.log(`${colors.cyan}━━━ Testing Weather Service ━━━${colors.reset}`);
  
  try {
    const result = await weatherService.getWeatherData(testLat, testLon);
    
    if (result.success) {
      console.log(`${colors.green}✅ Weather Service: Success${colors.reset}`);
      console.log(`   Temperature: ${result.data.temperature}°C`);
      console.log(`   Humidity: ${result.data.humidity}%`);
      console.log(`   Rainfall (30d): ${result.data.rainfall_30d}mm`);
      console.log(`   7-day Forecast: ${result.data.weather_forecast_7_days.length} days\n`);
      return result.data;
    } else {
      console.log(`${colors.red}❌ Weather Service: Failed${colors.reset}`);
      console.log(`   Error: ${result.error}\n`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Weather Service: Exception${colors.reset}`);
    console.log(`   Error: ${error.message}\n`);
    return null;
  }
}

/**
 * Test Satellite Service
 */
async function testSatelliteService() {
  console.log(`${colors.cyan}━━━ Testing Satellite Service ━━━${colors.reset}`);
  
  try {
    const result = await satelliteService.getSatelliteMetrics(testLat, testLon);
    
    if (result.success) {
      console.log(`${colors.green}✅ Satellite Service: Success${colors.reset}`);
      console.log(`   NDVI: ${result.data.ndvi}`);
      console.log(`   Vegetation Stress: ${result.data.vegetation_stress_index}`);
      console.log(`   Soil Moisture: ${result.data.soil_moisture_index}`);
      console.log(`   Acquisition Date: ${result.data.acquisition_date}`);
      console.log(`   Cloud Coverage: ${result.data.cloud_coverage}%`);
      console.log(`   Source: ${result.source}\n`);
      return result.data;
    } else {
      console.log(`${colors.red}❌ Satellite Service: Failed${colors.reset}`);
      console.log(`   Error: ${result.error}\n`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Satellite Service: Exception${colors.reset}`);
    console.log(`   Error: ${error.message}\n`);
    return null;
  }
}

/**
 * Test Crop Health Service
 */
async function testCropHealthService(ndvi) {
  console.log(`${colors.cyan}━━━ Testing Crop Health Service ━━━${colors.reset}`);
  
  try {
    const result = await cropHealthService.getCropHealth(testLat, testLon, ndvi || 0.6);
    
    if (result.success) {
      console.log(`${colors.green}✅ Crop Health Service: Success${colors.reset}`);
      console.log(`   Health Score: ${result.data.health_score}/100`);
      console.log(`   Growth Stage: ${result.data.vegetation_growth_stage}`);
      console.log(`   Stress Indicators: ${result.data.crop_stress_indicators.join(', ') || 'None'}\n`);
      return result.data;
    } else {
      console.log(`${colors.red}❌ Crop Health Service: Failed${colors.reset}`);
      console.log(`   Error: ${result.error}\n`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Crop Health Service: Exception${colors.reset}`);
    console.log(`   Error: ${error.message}\n`);
    return null;
  }
}

/**
 * Test Fertilizer Service
 */
async function testFertilizerService(soilData) {
  console.log(`${colors.cyan}━━━ Testing Fertilizer Service ━━━${colors.reset}`);
  
  try {
    // Create mock nutrient levels for testing
    const nutrientLevels = {
      nitrogen_level: 'moderate',
      phosphorus_level: 'sufficient',
      potassium_level: 'deficient',
      deficiencies: ['potassium'],
      organic_carbon: soilData?.organic_carbon || 1.5
    };

    const result = await fertilizerService.getFertilizerRecommendation(
      'Loamy',
      nutrientLevels,
      'rice'
    );
    
    if (result.success) {
      console.log(`${colors.green}✅ Fertilizer Service: Success${colors.reset}`);
      console.log(`   NPK Ratio: ${result.data.npk_ratio}`);
      console.log(`   Nitrogen: ${result.data.nitrogen_kg_per_acre} kg/acre`);
      console.log(`   Phosphorus: ${result.data.phosphorus_kg_per_acre} kg/acre`);
      console.log(`   Potassium: ${result.data.potassium_kg_per_acre} kg/acre`);
      console.log(`   Application: ${result.data.application_method}`);
      console.log(`   Organic Options: ${result.data.organic_amendments.length} alternatives\n`);
      return result.data;
    } else {
      console.log(`${colors.red}❌ Fertilizer Service: Failed${colors.reset}`);
      console.log(`   Error: ${result.error}\n`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Fertilizer Service: Exception${colors.reset}`);
    console.log(`   Error: ${error.message}\n`);
    return null;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  const startTime = Date.now();
  
  // Test all services
  const geocoderResult = await testGeocoderService();
  const soilData = await testSoilGridsService();
  const weatherData = await testWeatherService();
  const satelliteData = await testSatelliteService();
  const cropHealthData = await testCropHealthService(satelliteData?.ndvi);
  const fertilizerData = await testFertilizerService(soilData);

  const duration = Date.now() - startTime;

  // Summary
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`\n${colors.blue}📊 Test Summary${colors.reset}\n`);

  const results = {
    'Geocoder': geocoderResult,
    'SoilGrids': soilData !== null,
    'Weather': weatherData !== null,
    'Satellite': satelliteData !== null,
    'Crop Health': cropHealthData !== null,
    'Fertilizer': fertilizerData !== null
  };

  let successCount = 0;
  for (const [service, success] of Object.entries(results)) {
    const icon = success ? '✅' : '❌';
    const color = success ? colors.green : colors.red;
    console.log(`${color}${icon} ${service}${colors.reset}`);
    if (success) successCount++;
  }

  console.log(`\n${colors.blue}Total: ${successCount}/6 services working${colors.reset}`);
  console.log(`${colors.blue}Duration: ${duration}ms${colors.reset}\n`);

  if (successCount >= 4) {
    console.log(`${colors.green}🎉 Great! Enough services are working to proceed with implementation!${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  Some services failed. Check the errors above.${colors.reset}\n`);
  }
}

// Run the tests
runAllTests().catch(console.error);
