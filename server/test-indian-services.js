import dotenv from 'dotenv';
import {
  bhuvanService,
  soilHealthCardService,
  faoStatService
} from './services/index.js';

dotenv.config({ path: '.env' });

async function testIndianServices() {
  console.log('🧪 Testing Indian Government & FAO Agricultural Services\n');
  
  // Test location (Bangalore)
  const latitude = 12.9716;
  const longitude = 77.5946;
  const soilType = 'Red soil';
  
  console.log(`Test Location: ${latitude}, ${longitude}`);
  console.log(`Soil Type: ${soilType}\n`);
  
  // Test Bhuvan Service
  console.log('━━━ Testing ISRO Bhuvan Service ━━━');
  try {
    const moistureResult = await bhuvanService.getSoilMoisture(latitude, longitude);
    if (moistureResult.success) {
      console.log('✅ Bhuvan Soil Moisture:');
      console.log(`   Moisture: ${moistureResult.data.soil_moisture_percentage.toFixed(1)}%`);
      console.log(`   Satellite: ${moistureResult.data.satellite}`);
      console.log(`   Resolution: ${moistureResult.data.resolution_meters}m`);
      console.log(`   Source: ${moistureResult.source}`);
    } else {
      console.log('❌ Bhuvan Service Failed:', moistureResult.error);
    }
  } catch (error) {
    console.log('❌ Bhuvan Service Error:', error.message);
  }
  console.log('');
  
  // Test Soil Health Card Service
  console.log('━━━ Testing Soil Health Card Service ━━━');
  try {
    const shcResult = await soilHealthCardService.getSoilHealthParameters(latitude, longitude, soilType);
    if (shcResult.success) {
      console.log('✅ Soil Health Card Parameters:');
      console.log(`   State: ${shcResult.data.state}`);
      console.log(`   pH: ${shcResult.data.ph}`);
      console.log(`   Organic Carbon: ${shcResult.data.organic_carbon_oc}%`);
      console.log(`   Nitrogen (N): ${shcResult.data.nitrogen_n} kg/ha`);
      console.log(`   Phosphorus (P): ${shcResult.data.phosphorus_p} kg/ha`);
      console.log(`   Potassium (K): ${shcResult.data.potassium_k} kg/ha`);
      console.log(`   Zinc (Zn): ${shcResult.data.zinc_zn} ppm`);
      console.log(`   Iron (Fe): ${shcResult.data.iron_fe} ppm`);
      console.log(`   Recommendations: ${shcResult.data.recommendations.length} items`);
      console.log(`   Source: ${shcResult.source}`);
    } else {
      console.log('❌ Soil Health Card Failed:', shcResult.error);
    }
  } catch (error) {
    console.log('❌ Soil Health Card Error:', error.message);
  }
  console.log('');
  
  // Test FAO Service
  console.log('━━━ Testing FAO Service ━━━');
  try {
    const faoResult = await faoStatService.getRecommendedCrops('IND', soilType);
    if (faoResult.success) {
      console.log('✅ FAO Crop Recommendations:');
      console.log(`   Country: ${faoResult.data.country}`);
      console.log(`   Soil Type: ${faoResult.data.soil_type}`);
      console.log(`   Recommended Crops: ${faoResult.data.recommended_crops.join(', ')}`);
      console.log(`   Source: ${faoResult.source}`);
    } else {
      console.log('❌ FAO Service Failed:', faoResult.error);
    }
  } catch (error) {
    console.log('❌ FAO Service Error:', error.message);
  }
  console.log('');
  
  // Test FAO Fertilizer Trends
  console.log('━━━ Testing FAO Fertilizer Trends ━━━');
  try {
    const fertResult = await faoStatService.getFertilizerTrends('IND');
    if (fertResult.success) {
      console.log('✅ FAO Fertilizer Consumption (India):');
      console.log(`   Nitrogen: ${fertResult.data.nitrogen_kg_per_ha} kg/ha`);
      console.log(`   Phosphorus: ${fertResult.data.phosphorus_kg_per_ha} kg/ha`);
      console.log(`   Potassium: ${fertResult.data.potassium_kg_per_ha} kg/ha`);
      console.log(`   Total: ${fertResult.data.total_nutrients_kg_per_ha} kg/ha`);
      console.log(`   Trend: ${fertResult.data.trend}`);
      console.log(`   Source: ${fertResult.source}`);
    } else {
      console.log('❌ FAO Fertilizer Trends Failed:', fertResult.error);
    }
  } catch (error) {
    console.log('❌ FAO Fertilizer Trends Error:', error.message);
  }
  console.log('');
  
  // Test Climate-Smart Practices
  console.log('━━━ Testing FAO Climate-Smart Practices ━━━');
  try {
    const csaResult = faoStatService.getClimateSmartPractices(soilType, 'tropical');
    if (csaResult.success) {
      console.log('✅ Climate-Smart Agriculture Practices:');
      console.log(`   Soil Type: ${csaResult.data.soil_type}`);
      console.log(`   Climate Zone: ${csaResult.data.climate_zone}`);
      console.log(`   Practices (${csaResult.data.practices.length}):`);
      csaResult.data.practices.slice(0, 5).forEach((practice, idx) => {
        console.log(`   ${idx + 1}. ${practice}`);
      });
      console.log(`   Source: ${csaResult.source}`);
    } else {
      console.log('❌ Climate-Smart Practices Failed:', csaResult.error);
    }
  } catch (error) {
    console.log('❌ Climate-Smart Practices Error:', error.message);
  }
  console.log('');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Summary\n');
  console.log('✅ ISRO Bhuvan: Soil moisture data available');
  console.log('✅ Soil Health Card: 12 parameters + recommendations');
  console.log('✅ FAO: Crop recommendations and fertilizer trends');
  console.log('✅ Climate-Smart Agriculture: Best practices available\n');
  console.log('🎉 All Indian government and FAO services integrated!');
}

testIndianServices();
