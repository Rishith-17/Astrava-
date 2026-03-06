# Farmer Soil Analyzer PWA

A Progressive Web App for farmers to analyze soil and get farming advice in regional languages.

## Features

- 📷 Upload soil photos from camera or gallery
- 🌍 GPS-based soil data analysis using SoilGrids API
- 🗣️ Multi-language support (12 Indian languages + English)
  - English, Hindi, Kannada, Tamil, Telugu
  - Marathi, Bengali, Gujarati, Punjabi
  - Malayalam, Odia, Assamese
- 🔊 Voice playback of farming advice
- 📱 Mobile-optimized with large buttons and clear icons
- 💾 Offline support and local storage of analysis history
- 🚀 Installable as a mobile app

## Tech Stack

- Frontend: React + Vite
- PWA: Workbox (service workers)
- Backend: Node.js + Express
- APIs: SoilGrids, Sarvam AI (optional)

## Setup

### 1. Install Dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Edit `.env`:
- Add `SARVAM_API_KEY` for language translation (optional)
- Add `SOIL_CLASSIFY_API_URL` for soil image classification (optional)

### 3. Run Development

Start the backend server:
```bash
npm run server
```

In another terminal, start the frontend:
```bash
npm run dev
```

Visit `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

Deploy the `dist` folder to your hosting service.

## API Integration

### Soil Classification API

Replace the mock implementation in `server/soilAnalyzer.js`:

```javascript
export async function analyzeSoilImage(imageBuffer) {
  const formData = new FormData();
  formData.append('image', imageBuffer);
  
  const response = await axios.post(
    process.env.SOIL_CLASSIFY_API_URL,
    formData
  );
  
  return response.data.soil_type;
}
```

### Sarvam AI Integration

Add your API key to `.env`:
```
SARVAM_API_KEY=your_key_here
```

The app will automatically use Sarvam AI for language translation.

## Usage

1. Open the app on your mobile device
2. Select your preferred language
3. Tap "Upload Soil Photo"
4. Take a photo or select from gallery
5. Tap "Analyze Soil"
6. View results with farming advice
7. Use "Listen to Advice" for voice playback

## PWA Installation

On mobile browsers:
- Chrome: Tap menu → "Add to Home Screen"
- Safari: Tap share → "Add to Home Screen"

## License

MIT
