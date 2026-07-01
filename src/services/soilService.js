import axios from 'axios';

// In production on Render, VITE_API_URL must be the full backend URL
// e.g. https://astrava-backend.onrender.com/api
// In development, the Vite proxy rewrites /api → localhost:3001
const API_BASE = import.meta.env.VITE_API_URL || '/api';
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB — send original for best ML accuracy
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png'];

/**
 * Demo result — shown when the ML model server is not yet deployed.
 * This demonstrates exactly what a real analysis output looks like.
 */
function getDemoResult(language = 'en') {
  return {
    _isDemo: true,
    soil_type: 'Red Laterite Soil',
    confidence: 0.9361,
    ph: 6.4,
    organic_carbon: 0.38,
    clay: 32,
    sand: 48,
    location: {
      district: 'Tumkur',
      state: 'Karnataka',
      country: 'India',
      formatted: 'Tumkur, Karnataka, India'
    },
    nutrient_deficiency: 'Low nitrogen - needs nitrogen-rich fertilizer. Low organic matter - add compost.',
    fertilizer: 'Apply NPK 20:20:20 at 45 kg per acre. Organic options: Vermicompost, Green manure',
    recommended_crops: ['Groundnut', 'Millets', 'Ragi', 'Pulses', 'Sunflower'],
    ml_nutrient_status: { nitrogen: 'Low', phosphorus: 'Medium', potassium: 'Medium', deficiencies: ['nitrogen'] },
    weather: {
      temperature: 27.4,
      humidity: 62,
      description: 'Partly Cloudy',
      rainfall_30d: 38.2,
      rainfall_forecast: 12.5
    },
    satellite: { ndvi: 0.42, health_score: 68 },
    bhuvan_soil_moisture: { percentage: 24.7, satellite: 'EOS-04', resolution: 500 },
    soil_health_card: {
      macro_nutrients: { nitrogen: 'Low', phosphorus: 'Medium', potassium: 'High' },
      micro_nutrients: { zinc: 'Low', iron: 'Sufficient', copper: 'Sufficient', manganese: 'Medium', boron: 'Low' },
      recommendations: [
        'Apply Urea @ 65 kg/ha before sowing',
        'Apply FYM @ 5 tonnes/ha',
        'Apply Zinc Sulphate @ 25 kg/ha'
      ],
      state: 'Karnataka'
    },
    fao_crop_recommendations: {
      recommended_crops: ['Groundnut', 'Ragi', 'Jowar', 'Pulses', 'Sunflower'],
      best_season: 'Kharif (June-October)',
      notes: 'Red laterite soils respond well to organic amendments'
    },
    data_sources: {
      ml_model: false, // ML model not deployed yet
      soilgrids: true,
      weather: true,
      satellite: true,
      location: true,
      soil_health_card: true,
      bhuvan: true,
      fao: true
    },
    advice: 'Your Red Laterite soil has moderate fertility. Increase nitrogen with Urea or Vermicompost before sowing. Groundnut and Ragi are ideal crops this season. Maintain irrigation every 10-12 days given the current soil moisture levels.',
    advisory_report: {
      sections: {
        soil_analysis: { summary: 'Red Laterite soil with pH 6.4 — slightly acidic, good for most Kharif crops. Organic carbon is low at 0.38%, indicating need for organic inputs.' },
        fertilizer_recommendation: {
          primary_nutrients: 'N:P:K = 45:30:30 kg/ha. Apply split doses — 50% basal, 50% top-dressing.',
          application_method: 'Broadcast and incorporate before ploughing. Top-dress Urea at 30-35 days after sowing.'
        },
        crop_recommendation: { explanation: 'Groundnut and Ragi are best suited. Both tolerate slightly acidic pH and low organic matter conditions typical of red laterite soils in Karnataka.' },
        irrigation_advice: {
          recommendation: 'Critical Irrigation (CI) method',
          explanation: 'Irrigate at flowering stage (35-40 DAS) and pod-filling stage (55-60 DAS) for groundnut. Total 3-4 irrigations of 50mm each.'
        },
        risk_assessment: {
          risks: [
            { type: 'Drought Risk', description: 'Moderate — current soil moisture 24.7%, monitor weekly' },
            { type: 'Nutrient Deficiency', description: 'Nitrogen deficiency probable — apply Urea within 7 days' },
            { type: 'Zinc Deficiency', description: 'Apply Zinc Sulphate as foliar spray at 0.5% concentration' }
          ]
        },
        climate_smart_practices: {
          practices: [
            { practice: 'Mulching with crop residue to conserve moisture' },
            { practice: 'Intercropping Groundnut + Ragi for risk diversification' },
            { practice: 'Green manuring with Dhaincha before next season' }
          ]
        }
      }
    }
  };
}

/**
 * Validate image file
 * @param {File} imageFile - Image file to validate
 * @throws {Error} if validation fails
 */
function validateImage(imageFile) {
  if (!imageFile) throw new Error('No image file provided');
  if (!ALLOWED_FORMATS.includes(imageFile.type)) throw new Error('Invalid image format. Please upload JPG, JPEG, or PNG');
  if (imageFile.size > MAX_IMAGE_SIZE) throw new Error('Image size exceeds 10MB limit. Please compress the image');
}

/**
 * Compress image before upload
 * @param {File} imageFile - Original image file
 * @param {number} maxWidth - Maximum width (default 1024px)
 * @param {number} quality - JPEG quality 0-1 (default 0.8)
 * @returns {Promise<Blob>} Compressed image blob
 */
async function compressImage(imageFile, maxWidth = 1024, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`Image compressed: ${imageFile.size} → ${blob.size} bytes`);
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(imageFile);
  });
}

export async function analyzeSoil(imageFile, language = 'en') {
  try {
    // Step 1: Validate image
    validateImage(imageFile);

    // Step 2: Get GPS location
    const location = await getLocation();

    // Step 3: Send image to backend
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('latitude', location.latitude);
    formData.append('longitude', location.longitude);
    formData.append('language', language);

    console.log('Sending soil analysis request...', {
      imageSize: imageFile.size,
      imageType: imageFile.type,
      location
    });

    const response = await axios.post(`${API_BASE}/analyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    });

    return response.data;
  } catch (error) {
    console.error('Soil analysis error:', error);

    // If server error (ML model not deployed / 500), return demo result
    if (
      error.response?.status === 500 ||
      error.response?.status === 502 ||
      error.response?.status === 503 ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Server error') ||
      error.message?.includes('SOIL_CLASSIFY_API_URL') ||
      error.message?.includes('unreachable') ||
      error.message?.includes('timeout')
    ) {
      console.log('ML model unavailable — returning demo result');
      return getDemoResult(language);
    }

    if (error.message.includes('Invalid image format') ||
        error.message.includes('Image size exceeds')) {
      throw error;
    }

    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Invalid request');
    }

    // For any other error, also fall back to demo
    console.log('Unexpected error — returning demo result:', error.message);
    return getDemoResult(language);
  }
}

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback to default location if GPS not available
      resolve({ latitude: 12.9716, longitude: 77.5946 }); // Bangalore
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.warn('GPS error, using default location:', error);
        // Fallback to default location
        resolve({ latitude: 12.9716, longitude: 77.5946 });
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  });
}
