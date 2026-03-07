# Astrava - Agricultural Intelligence Platform 🌾

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

A comprehensive soil analysis and agricultural advisory platform for Indian farmers, combining Machine Learning, satellite imagery, weather data, and government standards to provide actionable farming guidance.

## 🌟 Features

### Core Capabilities
- **ML-Powered Soil Classification**: Analyze soil images with 93%+ accuracy
- **9 Integrated Data Sources**: Real-time data from multiple agricultural APIs
- **Comprehensive Advisory Reports**: Detailed farming guidance in 13 Indian languages
- **Multi-Language Support**: Hindi, Kannada, Tamil, Telugu, Marathi, and more
- **Voice Assistant**: Sarvam AI-powered voice interaction
- **Wake Word Detection**: Hands-free activation with "Porcupine" or "Computer"
- **Offline Support**: PWA with service worker for offline access

### Data Sources
1. **ML Model** - Soil type classification via ngrok
2. **OpenCage Geocoder** - Location identification
3. **SoilGrids (ISRIC)** - Global soil properties
4. **WeatherAPI** - Current weather + 7-day forecast
5. **Planet.com** - Satellite imagery and NDVI
6. **ISRO Bhuvan** - Indian satellite soil moisture data
7. **Soil Health Card** - Government of India standards
8. **FAO** - Global agricultural best practices
9. **Crop Health Service** - NDVI-based health monitoring

### Advisory System
- **Soil Analysis**: Type, texture, fertility, pH, organic matter
- **Nutrient Status**: N, P, K deficiency detection
- **Fertilizer Recommendations**: NPK ratios, dosage (kg/ha), application schedule
- **Crop Recommendations**: Top 5 suitable crops with reasoning
- **Irrigation Advice**: Timing, frequency, method, water requirements
- **Risk Assessment**: Drought, nutrient deficiency, pH imbalance
- **Climate-Smart Practices**: 6 sustainable farming methods

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/MrSloopyCoder/Astrava.git
cd Astrava
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

3. **Configure environment variables**
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API keys
# Required keys:
# - OPENCAGE_API_KEY
# - WEATHER_API_KEY
# - PLANET_API_KEY
# - CROP_HEALTH_API_KEY
# - SOIL_CLASSIFY_API_URL (your ngrok URL)
# - VITE_SARVAM_API_KEY (for voice features)
```

4. **Start the development servers**
```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start backend
npm run server
```

5. **Open the app**
Navigate to `http://localhost:5173` in your browser

## 📁 Project Structure

```
Astrava/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   │   ├── HomeScreen.jsx        # Landing page
│   │   ├── UploadScreen.jsx      # Image upload
│   │   ├── ResultScreen.jsx      # Analysis results
│   │   ├── AdvisoryReport.jsx    # Detailed advisory report
│   │   └── VoiceAssistant.jsx    # Voice interaction
│   ├── services/                 # Frontend services
│   │   ├── soilService.js        # API client
│   │   └── sarvamVoiceService.js # Voice service
│   └── styles/                   # CSS styles
│
├── server/                       # Backend Node.js server
│   ├── services/                 # API service classes
│   │   ├── BaseAPIService.js     # Resilience framework
│   │   ├── GeocoderService.js    # OpenCage integration
│   │   ├── SoilGridsService.js   # ISRIC integration
│   │   ├── WeatherService.js     # Weather API
│   │   ├── SatelliteService.js   # Planet.com
│   │   ├── BhuvanService.js      # ISRO Bhuvan
│   │   ├── SoilHealthCardService.js # Govt standards
│   │   ├── FAOStatService.js     # FAO data
│   │   ├── CropHealthService.js  # NDVI-based
│   │   ├── FertilizerService.js  # Recommendations
│   │   └── AgriculturalAdvisorService.js # Expert system
│   ├── utils/                    # Utilities
│   │   └── logger.js             # Winston logging
│   ├── index.js                  # Main server
│   └── soilAnalyzer.js           # ML model integration
│
├── public/                       # Static assets
├── .env.example                  # Environment variables template
└── package.json                  # Dependencies
```

## 🔑 API Keys Setup

### Required APIs

1. **OpenCage Geocoder** (Free tier available)
   - Sign up: https://opencagedata.com/
   - Get API key
   - Add to `.env`: `OPENCAGE_API_KEY=your_key`

2. **WeatherAPI** (Free tier: 1M calls/month)
   - Sign up: https://www.weatherapi.com/
   - Get API key
   - Add to `.env`: `WEATHER_API_KEY=your_key`

3. **Planet.com** (Trial available)
   - Sign up: https://www.planet.com/
   - Get API key
   - Add to `.env`: `PLANET_API_KEY=your_key`

4. **Crop Health API**
   - Contact provider for API key
   - Add to `.env`: `CROP_HEALTH_API_KEY=your_key`

5. **ML Model (ngrok)**
   - Run your soil classification model
   - Expose via ngrok: `ngrok http 5000`
   - Add to `.env`: `SOIL_CLASSIFY_API_URL=https://your-url.ngrok-free.dev/predict`

6. **Sarvam AI** (For voice features)
   - Sign up: https://www.sarvam.ai/
   - Get API key
   - Add to `.env`: `VITE_SARVAM_API_KEY=your_key`

7. **Porcupine Wake Word** (Optional - for hands-free voice)
   - Sign up: https://console.picovoice.ai/
   - Get access key (free tier available)
   - Add to `.env`: `VITE_PORCUPINE_ACCESS_KEY=your_key`
   - See [PORCUPINE_WAKE_WORD_SETUP.md](./PORCUPINE_WAKE_WORD_SETUP.md) for details

### Optional APIs (No keys needed)
- **SoilGrids**: Public API
- **ISRO Bhuvan**: Public data (estimated values)
- **Soil Health Card**: Government standards (estimated values)
- **FAO**: Public datasets

## 📊 Data Flow

```
User uploads soil image
    ↓
ML Model analyzes → "Red soil" (93.61%)
    ↓
GPS extracted → 12.9716, 77.5946
    ↓
9 Parallel API Calls:
    ├─ OpenCage → Location
    ├─ SoilGrids → Soil properties
    ├─ Weather → Current + forecast
    ├─ Planet → Satellite NDVI
    ├─ Crop Health → Health score
    ├─ Fertilizer → NPK recommendations
    ├─ Bhuvan → Soil moisture
    ├─ Soil Health Card → 12 parameters
    └─ FAO → Crop recommendations
    ↓
Agricultural Advisory Report Generated
    ↓
Display to User (with voice support)
```

## 🌍 Supported Languages

- English (en)
- Hindi (hi)
- Kannada (kn)
- Tamil (ta)
- Telugu (te)
- Marathi (mr)
- Bengali (bn)
- Gujarati (gu)
- Punjabi (pa)
- Malayalam (ml)
- Odia (or)
- Assamese (as)
- Urdu (ur)

## 📱 Progressive Web App

The application is a fully functional PWA:
- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Service worker caches essential resources
- **Responsive**: Works on desktop, tablet, and mobile
- **Fast**: Optimized loading and performance

## 🧪 Testing

```bash
# Test all services
cd server
node test-services.js

# Test Indian government services
node test-indian-services.js

# Test complete analysis flow
node test-complete-analysis.js
```

## 📖 Documentation

Comprehensive documentation available in the repository:

- **[AGRICULTURAL_ADVISORY_SYSTEM.md](./AGRICULTURAL_ADVISORY_SYSTEM.md)** - Expert system details
- **[INDIAN_GOV_FAO_INTEGRATION.md](./INDIAN_GOV_FAO_INTEGRATION.md)** - Government data integration
- **[COMPLETE_INTEGRATION_SUMMARY.md](./COMPLETE_INTEGRATION_SUMMARY.md)** - Full system overview
- **[API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md)** - API setup instructions
- **[SETUP.md](./SETUP.md)** - Detailed setup guide

## 🎯 Use Cases

### For Farmers
- Upload soil image from field
- Get instant soil type classification
- Receive fertilizer recommendations in local language
- Learn about suitable crops for their soil
- Get irrigation advice based on weather
- Understand farming risks and mitigation

### For Agricultural Extension Officers
- Provide data-driven advice to farmers
- Generate detailed reports for multiple farms
- Track soil health over time
- Share best practices

### For Researchers
- Access comprehensive soil and weather data
- Analyze agricultural patterns
- Study crop suitability across regions

## 🔒 Security & Privacy

- API keys stored in environment variables
- No user data stored on servers
- Image processing happens server-side
- HTTPS recommended for production
- No tracking or analytics by default

## 🚧 Roadmap

### Phase 1 (Current)
- ✅ ML soil classification
- ✅ 9 data source integration
- ✅ Agricultural advisory system
- ✅ Multi-language support
- ✅ Voice assistant

### Phase 2 (Planned)
- [ ] Historical analysis tracking
- [ ] PDF report export
- [ ] Market price integration
- [ ] Crop insurance data
- [ ] Community features

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Offline ML model
- [ ] Blockchain for data integrity
- [ ] IoT sensor integration
- [ ] Drone imagery support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Astrava Team** - Agricultural AI Platform

## 🙏 Acknowledgments

- **ISRO** - For Bhuvan satellite data
- **Ministry of Agriculture, Govt of India** - For Soil Health Card standards
- **FAO** - For global agricultural datasets
- **ISRIC** - For SoilGrids global soil data
- **Sarvam AI** - For multi-language voice support
- **OpenCage, WeatherAPI, Planet.com** - For API services

## 📞 Support

For support, email astrava@agricultural-ai.com or open an issue in the repository.

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

**Built with ❤️ for Indian Farmers**

*Empowering agriculture through AI and data science*
