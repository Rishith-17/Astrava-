import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png'];

/**
 * Full demo result — identical structure to what the real ML pipeline produces.
 * Every field used by ResultScreen, AdvisoryReport, and the download function is populated.
 * The only difference from a real result is _isDemo:true and data_sources.ml_model:false.
 */
function getDemoResult() {
  return {
    _isDemo: true,

    // ── Core ML output ──────────────────────────────────────────
    soil_type: 'Red Laterite Soil',
    confidence: 0.9361,
    ph: 6.4,
    organic_carbon: 0.38,
    clay: 32,
    sand: 48,

    // ── Location (OpenCage) ──────────────────────────────────────
    location: {
      latitude: 13.3409,
      longitude: 77.1000,
      district: 'Tumkur',
      state: 'Karnataka',
      country: 'India',
      formatted: 'Tumkur, Karnataka, India'
    },

    // ── Nutrient analysis ────────────────────────────────────────
    ml_nutrient_status: {
      nitrogen: 'Low',
      phosphorus: 'Medium',
      potassium: 'High',
      deficiencies: ['nitrogen'],
      organic_carbon: 0.38
    },
    nutrient_deficiency: 'Low nitrogen — needs nitrogen-rich fertilizer. Low organic matter — add compost or FYM.',
    fertilizer: 'Apply NPK 30:15:15 at 150 kg/ha Nitrogen, 60 kg/ha Phosphorus, 40 kg/ha Potassium. Organic options: Farmyard manure @ 10–15 tons/ha, Vermicompost @ 2–3 tons/ha',

    // ── Crops ───────────────────────────────────────────────────
    recommended_crops: ['Groundnut', 'Ragi', 'Millets', 'Pulses', 'Cotton'],

    // ── Weather (WeatherAPI) ─────────────────────────────────────
    weather: {
      temperature: 27.4,
      humidity: 62,
      description: 'Partly Cloudy',
      rainfall_30d: 38.2,
      rainfall_forecast: 12.5,
      forecast: [
        { date: '2026-07-01', rainfall_mm: 2, temperature: 27 },
        { date: '2026-07-02', rainfall_mm: 4, temperature: 28 },
        { date: '2026-07-03', rainfall_mm: 0, temperature: 29 },
        { date: '2026-07-04', rainfall_mm: 3, temperature: 27 },
        { date: '2026-07-05', rainfall_mm: 1, temperature: 26 },
        { date: '2026-07-06', rainfall_mm: 2, temperature: 27 },
        { date: '2026-07-07', rainfall_mm: 0, temperature: 28 }
      ]
    },

    // ── Satellite data (Planet.com) ──────────────────────────────
    satellite: {
      ndvi: 0.42,
      health_score: 68,
      source: 'Planet.com',
      soil_moisture_index: 0.247,
      vegetation_stress_index: 0.31
    },

    // ── ISRO Bhuvan soil moisture ────────────────────────────────
    bhuvan_soil_moisture: {
      percentage: 24.7,
      satellite: 'EOS-04',
      resolution: 500
    },

    // ── Govt Soil Health Card (12 parameters) ───────────────────
    soil_health_card: {
      macro_nutrients: {
        nitrogen: 'Low',
        phosphorus: 'Medium',
        potassium: 'High'
      },
      micro_nutrients: {
        zinc: 'Low',
        iron: 'Sufficient',
        copper: 'Sufficient',
        manganese: 'Medium',
        boron: 'Low'
      },
      recommendations: [
        'Apply Urea @ 65 kg/ha before sowing',
        'Apply FYM @ 5 tonnes/ha to improve organic carbon',
        'Apply Zinc Sulphate @ 25 kg/ha as foliar spray at 0.5% concentration'
      ],
      state: 'Karnataka'
    },

    // ── FAO crop recommendations ─────────────────────────────────
    fao_crop_recommendations: {
      recommended_crops: ['Groundnut', 'Ragi', 'Jowar', 'Pulses', 'Sunflower'],
      best_season: 'Kharif (June–October)',
      notes: 'Red laterite soils in Karnataka respond well to organic amendments and split NPK application'
    },

    // ── Data source availability flags ───────────────────────────
    data_sources: {
      ml_model: false,   // Not deployed yet — pending seed funding
      soilgrids: true,
      weather: true,
      satellite: true,
      location: true,
      soil_health_card: true,
      bhuvan: true,
      fao: true
    },

    // ── Quick advice (used by Listen button and agentic TTS) ─────
    advice: 'Your Red Laterite soil has moderate fertility with slightly acidic pH of 6.4. Nitrogen levels are low — apply Urea @ 65 kg/ha before sowing. Groundnut and Ragi are the ideal Kharif crops for your Tumkur location. Soil moisture is at 24.7% — plan irrigation within 2–3 days. Add Vermicompost @ 2 tons/ha to improve organic carbon over the season.',

    // ── Full advisory report — exact same structure as AgriculturalAdvisorService.structureReport() ──
    advisory_report: {
      language: 'en',
      sections: {

        farm_location: {
          title: 'Farm Location',
          content: 'Tumkur, Karnataka, India'
        },

        soil_analysis: {
          title: 'Soil Analysis',
          soil_type: 'Red Laterite Soil',
          texture: 'Sandy Clay Loam',
          confidence: '93.6% (high confidence)',
          fertility: 'low',
          ph_status: 'pH 6.4 - slightly_acidic',
          organic_matter: '0.38% - low',
          interpretation: 'Your soil is Red Laterite Soil with Sandy Clay Loam texture. Soil is slightly acidic (pH 6.4) — suitable for most Kharif crops but benefits from lime application. Organic carbon is critically low at 0.38%; adding FYM or Vermicompost will significantly improve fertility and water retention.'
        },

        nutrient_status: {
          title: 'Nutrient Status',
          deficiencies: ['Nitrogen', 'Zinc (micro-nutrient)'],
          explanation: 'Your soil is deficient in Nitrogen and the micro-nutrient Zinc. Nitrogen deficiency is the primary concern — it will directly reduce crop yield by 20–30% if not corrected before sowing. Zinc deficiency causes inter-veinal chlorosis and is common in red laterite soils of Karnataka.'
        },

        fertilizer_recommendation: {
          title: 'Fertilizer Recommendation',
          npk_ratio: '30:15:15',
          dosage: {
            nitrogen: '150 kg/ha',
            phosphorus: '60 kg/ha',
            potassium: '40 kg/ha'
          },
          schedule: [
            'Basal dose (at sowing): Apply 75 kg N + 60 kg P + 40 kg K per hectare — mix into top 10 cm of soil',
            'First top dressing (30 DAS): Apply 37.5 kg N per hectare as Urea broadcast after light irrigation',
            'Second top dressing (60 DAS): Apply 37.5 kg N per hectare at flower initiation stage'
          ],
          organic_options: [
            'Farmyard manure (FYM) @ 10–15 tons/ha — incorporate 3 weeks before sowing',
            'Vermicompost @ 2–3 tons/ha — apply in furrows at sowing time',
            'Green manure crop (Dhaincha / Sunhemp) — grow 45 days, incorporate before main crop',
            'Neem cake @ 200–300 kg/ha — use as N source, also controls soil-borne pests'
          ],
          specific_recommendations: [
            'Apply Urea @ 65 kg/ha as split doses (2 equal applications)',
            'Apply FYM @ 5 tonnes/ha to raise organic carbon above 0.75%',
            'Apply Zinc Sulphate @ 25 kg/ha or foliar spray at 0.5% concentration at 30 DAS',
            'Use boronated SSP for dual P + B correction in one application'
          ]
        },

        crop_recommendation: {
          title: 'Crop Recommendation',
          top_crops: [
            {
              name: 'Groundnut (Arachis hypogaea)',
              reason: 'Best fit for well-drained red laterite soil of Tumkur. High oil yield (46–50%), fixes atmospheric nitrogen reducing next season\'s fertilizer need. Recommended variety: TMV-2 or Kadiri-6.'
            },
            {
              name: 'Ragi / Finger Millet (Eleusine coracana)',
              reason: 'Karnataka staple crop — thrives in slightly acidic red soil with minimal inputs. Highly nutritious, drought-tolerant, and fetches premium price in local markets. Recommended variety: GPU-45 or MR-6.'
            },
            {
              name: 'Pearl Millet / Bajra (Pennisetum glaucum)',
              reason: 'Drought-tolerant Kharif crop ideal for low-organic-matter red soils. Short duration (75–80 days), good fodder value. Use as intercrop with Groundnut for income diversification.'
            },
            {
              name: 'Tur / Pigeon Pea (Cajanus cajan)',
              reason: 'Fixes 40–80 kg N/ha naturally, improving soil nitrogen for next season. Long-duration crop (180–200 days) with consistent MSP support. Suitable as sole crop or intercrop.'
            },
            {
              name: 'Cotton (Gossypium hirsutum)',
              reason: 'Red soil of Tumkur is suitable for Bt Cotton with drip irrigation. High value crop with established local market. Requires proper nitrogen and irrigation management.'
            }
          ],
          explanation: 'Based on Red Laterite Soil characteristics, slightly acidic pH, low organic matter, and current Kharif season conditions in Tumkur, Karnataka, the following crops are most suitable. Groundnut-Ragi rotation is the recommended strategy for soil health improvement and income stability.'
        },

        irrigation_advice: {
          title: 'Irrigation Advice',
          current_moisture: 'Soil moisture: 24.7% — low (EOS-04 satellite, 500m resolution)',
          timing: 'Irrigate within 2–3 days — do not delay past 4 days',
          frequency: 'Every 5–7 days during vegetative stage; every 4–5 days during flowering and pod-fill',
          method: 'Drip irrigation (most efficient for well-drained red laterite soil) — saves 35–40% water vs flood irrigation',
          water_requirement: '25–30 mm per irrigation for Groundnut; 20–25 mm for Ragi',
          tips: [
            'Irrigate early morning (before 8 AM) or evening (after 6 PM) to minimize evaporation losses',
            'Check soil moisture at 15 cm depth — if dry to touch, irrigate immediately',
            'Avoid over-irrigation — red laterite soil drains quickly but nutrients leach with excess water',
            'Apply mulch (paddy straw / black plastic) to retain moisture between irrigations',
            'Critical irrigation stages for Groundnut: pre-sowing, pegging (35–40 DAS), pod development (55–70 DAS)',
            'Rainfall of 12.5 mm expected in 7 days — account for this in your next irrigation schedule'
          ],
          explanation: 'Soil moisture at 24.7% is below the field capacity of 35–40% for red laterite soil in Tumkur. Combined with only 38.2 mm rainfall in the past 30 days (below seasonal average), irrigation is required soon to avoid early crop stress.'
        },

        risk_assessment: {
          title: 'Risk Assessment',
          risks: [
            {
              type: 'Nitrogen Deficiency',
              severity: 'High',
              description: 'Soil nitrogen is critically Low — without immediate N application, crop yield losses of 25–35% are expected. Apply Urea before or at sowing, not after crop establishment.'
            },
            {
              type: 'Drought Stress',
              severity: 'Medium',
              description: 'Soil moisture at 24.7% is below field capacity. With 38.2mm rainfall in past 30 days and forecast of only 12.5mm, irrigation is needed within 48–72 hours to prevent crop establishment failure.'
            },
            {
              type: 'Low Organic Matter',
              severity: 'Medium',
              description: 'Organic carbon at 0.38% is critically low (ideal: 0.75–1.5%). This reduces water-holding capacity by 20%, nutrient buffering, and microbial activity — compounding other risk factors.'
            },
            {
              type: 'Zinc Micronutrient Deficiency',
              severity: 'Low',
              description: 'Zinc deficiency confirmed by Soil Health Card. Will manifest as inter-veinal chlorosis (yellowing between leaf veins) 3–4 weeks after emergence. Early foliar spray prevents yield loss.'
            }
          ],
          mitigation: [
            'Apply Urea @ 65 kg/ha immediately — this is the highest priority action before sowing',
            'Install drip irrigation or plan 3–4 border irrigations of 30mm each for the season',
            'Incorporate Vermicompost @ 2 tons/ha to improve organic matter over 2–3 seasons',
            'Apply Zinc Sulphate @ 25 kg/ha at sowing or as 0.5% foliar spray at 30 days after sowing',
            'Select drought-tolerant varieties: Groundnut TMV-2, Ragi GPU-45',
            'Practice mulching with paddy straw (3–4 tons/ha) to retain soil moisture'
          ],
          explanation: 'Four risk factors have been identified for your farm based on soil analysis, satellite data, and weather forecast. Nitrogen deficiency is the most urgent — address it before or at sowing time. Other risks are manageable with the mitigation steps provided.'
        },

        climate_smart_practices: {
          title: 'Climate-Smart Farming Practices',
          explanation: 'These six practices are recommended for red laterite soils in Karnataka\'s semi-arid Tumkur district to improve soil health, conserve water, and build long-term resilience to climate variability.',
          practices: [
            {
              practice: 'Conservation Tillage',
              benefit: 'Reduces soil erosion by 35–40% and improves water infiltration in red laterite soil',
              implementation: 'Limit tillage depth to 10–12 cm using chisel plough. Leave previous crop stubble (5–8 cm) standing to protect against rain impact. Avoid deep ploughing in successive years.'
            },
            {
              practice: 'Groundnut–Ragi Crop Rotation',
              benefit: 'Groundnut fixes 40–60 kg N/ha naturally, reducing next season\'s urea requirement by 30%. Rotation breaks soil-borne pest cycles.',
              implementation: 'Year 1 Kharif: Groundnut. Year 1 Rabi: Ragi or Chickpea. Year 2 Kharif: Tur/Pulses. Follow this 2–3 year rotation for optimal results.'
            },
            {
              practice: 'Integrated Nutrient Management (INM)',
              benefit: 'Reduces chemical fertilizer cost by 25–30% while maintaining or improving yield over 3 years',
              implementation: 'Apply FYM @ 5 tons/ha as base + 50% of recommended chemical NPK. Top-dress remaining 50% NPK in split doses. Supplement with micro-nutrients (Zinc, Boron) as needed.'
            },
            {
              practice: 'Drip Irrigation with Fertigation',
              benefit: 'Saves 35–40% water compared to flood irrigation. Fertilizer efficiency improves by 20–25% when applied through drip.',
              implementation: 'Install drip lines at 60 cm spacing for Groundnut. Connect fertigation unit. Inject water-soluble NPK (19:19:19) at 2–3 kg/day during active growth phase.'
            },
            {
              practice: 'Green Manuring with Dhaincha',
              benefit: 'Adds 80–100 kg N/ha and 2–3 tonnes organic matter per hectare in a single pre-crop cycle',
              implementation: 'Sow Dhaincha (Sesbania bispinosa) 45–50 days before main crop sowing. Irrigate once. Incorporate at flowering stage by ploughing in. Wait 15 days before planting main crop.'
            },
            {
              practice: 'Lime Application for pH Correction',
              benefit: 'Raises soil pH from current 6.4 toward optimal 6.8–7.2, improving availability of N, P, and micro-nutrients by 15–20%',
              implementation: 'Apply agricultural lime (calcium carbonate) @ 500 kg/ha once every 2–3 years during pre-monsoon soil preparation. Broadcast evenly and incorporate by light tilling. Do not mix with fertilizers.'
            }
          ]
        },

        vegetation_status: {
          title: 'Current Vegetation Status',
          ndvi: '0.42',
          health: 'fair',
          advice: 'Vegetation index (NDVI) of 0.42 indicates moderate/sparse vegetation cover — typical of a field being prepared for Kharif sowing or with recently germinated crops. If field is bare, this is expected. If a standing crop exists, NDVI 0.42 suggests mild stress — check for nitrogen deficiency or moisture stress as primary causes.'
        }

      }
    }
  };
}

function validateImage(imageFile) {
  if (!imageFile) throw new Error('No image file provided');
  if (!ALLOWED_FORMATS.includes(imageFile.type)) throw new Error('Invalid image format. Please upload JPG, JPEG, or PNG');
  if (imageFile.size > MAX_IMAGE_SIZE) throw new Error('Image size exceeds 10MB limit. Please compress the image');
}

export async function analyzeSoil(imageFile, language = 'en') {
  try {
    validateImage(imageFile);
    const location = await getLocation();

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('latitude', location.latitude);
    formData.append('longitude', location.longitude);
    formData.append('language', language);

    console.log('Sending soil analysis request...', { imageSize: imageFile.size, location });

    const response = await axios.post(`${API_BASE}/analyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
      onUploadProgress: (e) => console.log(`Upload: ${Math.round((e.loaded * 100) / e.total)}%`)
    });

    return response.data;

  } catch (error) {
    console.error('Soil analysis error:', error);

    // Always fall back to demo when server/ML is unavailable
    const isServerError =
      error.response?.status === 500 ||
      error.response?.status === 502 ||
      error.response?.status === 503 ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('SOIL_CLASSIFY_API_URL') ||
      error.message?.includes('unreachable') ||
      error.message?.includes('timeout') ||
      error.message?.includes('network');

    if (isServerError) {
      console.log('ML model unavailable — returning full demo result');
      return getDemoResult();
    }

    // Validation errors — re-throw so the UI can show them
    if (error.message?.includes('Invalid image format') || error.message?.includes('Image size exceeds')) {
      throw error;
    }

    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Invalid request');
    }

    // Any other unexpected error — fall back to demo
    console.log('Unexpected error — returning demo result:', error.message);
    return getDemoResult();
  }
}

function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ latitude: 12.9716, longitude: 77.5946 }); // Bangalore fallback
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve({ latitude: 12.9716, longitude: 77.5946 }),
      { timeout: 10000, enableHighAccuracy: false }
    );
  });
}
