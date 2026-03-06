/**
 * Quick test script to verify API keys are working
 * Run with: node server/test-api-keys.js
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

console.log(`${colors.blue}🧪 Testing API Keys...${colors.reset}\n`);

// Test coordinates (Bangalore, India)
const testLat = 12.9716;
const testLon = 77.5946;

/**
 * Test OpenCage Geocoder API
 */
async function testOpenCage() {
  const apiKey = process.env.OPENCAGE_API_KEY;
  
  if (!apiKey) {
    console.log(`${colors.yellow}⚠️  OpenCage: No API key found${colors.reset}`);
    return false;
  }
  
  try {
    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${testLat}+${testLon}&key=${apiKey}`,
      { timeout: 10000 }
    );
    
    if (response.data.results && response.data.results.length > 0) {
      const location = response.data.results[0].components;
      console.log(`${colors.green}✅ OpenCage: Working!${colors.reset}`);
      console.log(`   Location: ${location.county}, ${location.state}, ${location.country}\n`);
      return true;
    }
  } catch (error) {
    console.log(`${colors.red}❌ OpenCage: Failed${colors.reset}`);
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

/**
 * Test WeatherAPI
 */
async function testWeatherAPI() {
  const apiKey = process.env.WEATHER_API_KEY;
  
  if (!apiKey) {
    console.log(`${colors.yellow}⚠️  WeatherAPI: No API key found${colors.reset}`);
    return false;
  }
  
  try {
    const response = await axios.get(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${testLat},${testLon}&days=7`,
      { timeout: 10000 }
    );
    
    if (response.data.current) {
      console.log(`${colors.green}✅ WeatherAPI: Working!${colors.reset}`);
      console.log(`   Temperature: ${response.data.current.temp_c}°C`);
      console.log(`   Condition: ${response.data.current.condition.text}\n`);
      return true;
    }
  } catch (error) {
    console.log(`${colors.red}❌ WeatherAPI: Failed${colors.reset}`);
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

/**
 * Test SoilGrids API (no key needed)
 */
async function testSoilGrids() {
  try {
    const response = await axios.get(
      `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${testLon}&lat=${testLat}&property=phh2o&property=nitrogen&property=soc&depth=0-5cm&value=mean`,
      { timeout: 15000 }
    );
    
    if (response.data.properties && response.data.properties.layers) {
      console.log(`${colors.green}✅ SoilGrids: Working!${colors.reset}`);
      console.log(`   No API key needed - Public API\n`);
      return true;
    }
  } catch (error) {
    console.log(`${colors.red}❌ SoilGrids: Failed${colors.reset}`);
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

/**
 * Test Planet.com API
 */
async function testPlanet() {
  const apiKey = process.env.PLANET_API_KEY;
  
  if (!apiKey) {
    console.log(`${colors.yellow}⚠️  Planet.com: No API key found${colors.reset}`);
    return false;
  }
  
  try {
    // Test authentication
    const response = await axios.get(
      'https://api.planet.com/auth/v1/experimental/public/my/subscriptions',
      {
        headers: { 'Authorization': `api-key ${apiKey}` },
        timeout: 10000
      }
    );
    
    console.log(`${colors.green}✅ Planet.com: Working!${colors.reset}`);
    console.log(`   Satellite imagery API authenticated\n`);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Planet.com: Failed${colors.reset}`);
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

/**
 * Test Crop Health API
 */
async function testCropHealth() {
  const apiKey = process.env.CROP_HEALTH_API_KEY;
  
  if (!apiKey) {
    console.log(`${colors.yellow}⚠️  Crop Health: No API key found${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.yellow}⚠️  Crop Health: API key present but endpoint may be placeholder${colors.reset}`);
  console.log(`   Will use mock data or NDVI calculations for now\n`);
  return true;
}

/**
 * Run all tests
 */
async function runTests() {
  const results = {
    opencage: await testOpenCage(),
    weather: await testWeatherAPI(),
    soilgrids: await testSoilGrids(),
    planet: await testPlanet(),
    crophealth: await testCropHealth()
  };
  
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  const working = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;
  
  console.log(`\n${colors.blue}📊 Summary: ${working}/${total} APIs working${colors.reset}\n`);
  
  if (working >= 3) {
    console.log(`${colors.green}🎉 Great! You have enough APIs to start testing the system!${colors.reset}`);
    console.log(`${colors.green}   Run 'npm run server' to start the backend${colors.reset}`);
    console.log(`${colors.green}   Run 'npm run dev' to start the frontend${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  You need at least 3 working APIs for full functionality${colors.reset}`);
    console.log(`${colors.yellow}   Check the errors above and verify your API keys${colors.reset}\n`);
  }
}

// Run the tests
runTests().catch(console.error);
