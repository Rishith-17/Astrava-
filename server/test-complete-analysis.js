import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function testCompleteAnalysis() {
  console.log('🧪 Testing Complete Soil Analysis Flow\n');
  
  // Test location (Bangalore - urban area with no SoilGrids data)
  const latitude = 12.9716;
  const longitude = 77.5946;
  const language = 'en';
  
  console.log(`Test Location: ${latitude}, ${longitude}`);
  console.log(`Language: ${language}\n`);
  
  // Create a dummy image buffer (1x1 pixel PNG)
  const dummyImage = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  
  try {
    // Create form data
    const formData = new FormData();
    formData.append('image', dummyImage, {
      filename: 'test-soil.png',
      contentType: 'image/png'
    });
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('language', language);
    
    console.log('📤 Sending analysis request...\n');
    
    // Send request to local server
    const response = await axios.post('http://localhost:3001/api/analyze', formData, {
      headers: formData.getHeaders(),
      timeout: 60000 // 60 second timeout
    });
    
    const analysis = response.data;
    
    console.log('✅ Analysis Complete!\n');
    console.log('━━━ ML Model Results ━━━');
    console.log(`Soil Type: ${analysis.soil_type}`);
    console.log(`Confidence: ${(analysis.confidence * 100).toFixed(1)}%\n`);
    
    console.log('━━━ Location Data ━━━');
    if (analysis.location) {
      console.log(`District: ${analysis.location.district}`);
      console.log(`State: ${analysis.location.state}`);
      console.log(`Country: ${analysis.location.country}\n`);
    } else {
      console.log('Location data unavailable\n');
    }
    
    console.log('━━━ Soil Properties ━━━');
    console.log(`pH: ${analysis.ph}`);
    console.log(`Organic Carbon: ${analysis.organic_carbon}%`);
    console.log(`Clay: ${analysis.clay}%`);
    console.log(`Sand: ${analysis.sand}%\n`);
    
    console.log('━━━ Nutrient Status ━━━');
    if (analysis.ml_nutrient_status) {
      console.log(`Nitrogen: ${analysis.ml_nutrient_status.nitrogen}`);
      console.log(`Phosphorus: ${analysis.ml_nutrient_status.phosphorus}`);
      console.log(`Potassium: ${analysis.ml_nutrient_status.potassium}`);
      console.log(`Deficiencies: ${analysis.ml_nutrient_status.deficiencies.join(', ') || 'None'}\n`);
    }
    
    console.log('━━━ Recommendations ━━━');
    console.log(`Fertilizer: ${analysis.fertilizer}`);
    console.log(`Recommended Crops: ${analysis.recommended_crops.join(', ')}\n`);
    
    console.log('━━━ Weather Data ━━━');
    if (analysis.weather) {
      console.log(`Temperature: ${analysis.weather.temperature}°C`);
      console.log(`Humidity: ${analysis.weather.humidity}%`);
      console.log(`Rainfall (30d): ${analysis.weather.rainfall_30d}mm\n`);
    } else {
      console.log('Weather data unavailable\n');
    }
    
    console.log('━━━ Satellite Data ━━━');
    if (analysis.satellite) {
      console.log(`NDVI: ${analysis.satellite.ndvi}`);
      console.log(`Vegetation Stress: ${analysis.satellite.vegetation_stress}`);
      console.log(`Soil Moisture: ${analysis.satellite.soil_moisture}`);
      console.log(`Source: ${analysis.satellite.source}\n`);
    } else {
      console.log('Satellite data unavailable\n');
    }
    
    console.log('━━━ Data Sources ━━━');
    console.log(`ML Model: ${analysis.data_sources.ml_model ? '✅' : '❌'}`);
    console.log(`SoilGrids: ${analysis.data_sources.soilgrids ? '✅' : '❌'}`);
    console.log(`Weather: ${analysis.data_sources.weather ? '✅' : '❌'}`);
    console.log(`Satellite: ${analysis.data_sources.satellite ? '✅' : '❌'}`);
    console.log(`Location: ${analysis.data_sources.location ? '✅' : '❌'}\n`);
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testCompleteAnalysis();
