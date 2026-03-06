/**
 * Test script for ML Model Integration
 * Run with: node server/test-ml-model.js
 */

import dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

console.log(`${colors.blue}🧪 Testing ML Model Integration${colors.reset}\n`);

/**
 * Test ML Model API endpoint
 */
async function testMLModelAPI() {
  const apiUrl = process.env.SOIL_CLASSIFY_API_URL;
  
  console.log(`${colors.cyan}━━━ ML Model API Configuration ━━━${colors.reset}`);
  console.log(`API URL: ${apiUrl || 'Not configured'}\n`);
  
  if (!apiUrl || apiUrl.includes('your-ngrok-url')) {
    console.log(`${colors.yellow}⚠️  ML Model API not configured${colors.reset}`);
    console.log(`   Set SOIL_CLASSIFY_API_URL in .env file`);
    console.log(`   Example: https://abc123.ngrok-free.app/predict-soil\n`);
    console.log(`${colors.yellow}   System will use mock data for now${colors.reset}\n`);
    return false;
  }
  
  try {
    // Create a test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const formData = new FormData();
    formData.append('image', testImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    
    console.log(`${colors.cyan}━━━ Testing ML Model Endpoint ━━━${colors.reset}`);
    console.log(`Sending test image to: ${apiUrl}\n`);
    
    const startTime = Date.now();
    
    const response = await axios.post(apiUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        'ngrok-skip-browser-warning': 'true'
      },
      timeout: 30000
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`${colors.green}✅ ML Model API: Success${colors.reset}`);
    console.log(`   Response time: ${duration}ms`);
    console.log(`   Status: ${response.status}\n`);
    
    // Validate response structure
    console.log(`${colors.cyan}━━━ Response Validation ━━━${colors.reset}`);
    
    const data = response.data;
    const validations = {
      'soil_type': data.soil_type !== undefined,
      'confidence': data.confidence !== undefined,
      'ph_level': data.ph_level !== undefined,
      'nutrient_status': data.nutrient_status !== undefined,
      'fertilizer_recommendation': data.fertilizer_recommendation !== undefined
    };
    
    for (const [field, isPresent] of Object.entries(validations)) {
      const icon = isPresent ? '✅' : '⚠️';
      const color = isPresent ? colors.green : colors.yellow;
      const status = isPresent ? 'Present' : 'Missing (optional)';
      console.log(`${color}${icon} ${field}: ${status}${colors.reset}`);
    }
    
    console.log(`\n${colors.cyan}━━━ Response Data ━━━${colors.reset}`);
    console.log(JSON.stringify(data, null, 2));
    console.log();
    
    // Check required field
    if (!data.soil_type) {
      console.log(`${colors.red}❌ Error: 'soil_type' field is required but missing${colors.reset}\n`);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.log(`${colors.red}❌ ML Model API: Failed${colors.reset}`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.log(`   Error: No response received`);
      console.log(`   Check if ngrok tunnel is active`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    
    console.log();
    return false;
  }
}

/**
 * Test mock data fallback
 */
async function testMockDataFallback() {
  console.log(`${colors.cyan}━━━ Testing Mock Data Fallback ━━━${colors.reset}`);
  
  try {
    const { analyzeSoilImage } = await import('./soilAnalyzer.js');
    
    // Create a test image buffer
    const testImageBuffer = Buffer.from('test');
    
    const result = await analyzeSoilImage(testImageBuffer);
    
    console.log(`${colors.green}✅ Mock Data: Working${colors.reset}`);
    console.log(`   Soil Type: ${result.soil_type}`);
    console.log(`   Confidence: ${result.confidence}`);
    console.log(`   pH Level: ${result.ph_level}`);
    console.log(`   Nitrogen: ${result.nutrient_status?.nitrogen}`);
    console.log(`   Phosphorus: ${result.nutrient_status?.phosphorus}`);
    console.log(`   Potassium: ${result.nutrient_status?.potassium}\n`);
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Mock Data: Failed${colors.reset}`);
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`${colors.blue}Starting ML Model Integration Tests...${colors.reset}\n`);
  
  const mlApiWorking = await testMLModelAPI();
  const mockDataWorking = await testMockDataFallback();
  
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`\n${colors.blue}📊 Test Summary${colors.reset}\n`);
  
  const mlIcon = mlApiWorking ? '✅' : '⚠️';
  const mlColor = mlApiWorking ? colors.green : colors.yellow;
  const mockIcon = mockDataWorking ? '✅' : '❌';
  const mockColor = mockDataWorking ? colors.green : colors.red;
  
  console.log(`${mlColor}${mlIcon} ML Model API${colors.reset}`);
  console.log(`${mockColor}${mockIcon} Mock Data Fallback${colors.reset}\n`);
  
  if (mlApiWorking) {
    console.log(`${colors.green}🎉 ML Model integration is working!${colors.reset}`);
    console.log(`${colors.green}   Your soil classification model is ready to use${colors.reset}\n`);
  } else if (mockDataWorking) {
    console.log(`${colors.yellow}⚠️  ML Model API not configured or not responding${colors.reset}`);
    console.log(`${colors.yellow}   System will use mock data as fallback${colors.reset}`);
    console.log(`${colors.yellow}   To use real ML model:${colors.reset}`);
    console.log(`${colors.yellow}   1. Start your ML model server${colors.reset}`);
    console.log(`${colors.yellow}   2. Expose with ngrok: ngrok http 5000${colors.reset}`);
    console.log(`${colors.yellow}   3. Add URL to .env: SOIL_CLASSIFY_API_URL=https://...${colors.reset}`);
    console.log(`${colors.yellow}   4. Restart server: npm run server${colors.reset}\n`);
  } else {
    console.log(`${colors.red}❌ Both ML Model API and mock data failed${colors.reset}`);
    console.log(`${colors.red}   Please check the errors above${colors.reset}\n`);
  }
}

// Run the tests
runTests().catch(console.error);
