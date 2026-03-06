# Quick Setup Guide

## Installation

1. Install dependencies:
```bash
npm install
cd server
npm install
cd ..
```

2. Create environment file:
```bash
cp .env.example .env
```

3. (Optional) Add API keys to `.env`:
   - `SARVAM_API_KEY` - For regional language translation
   - `SOIL_CLASSIFY_API_URL` - For soil image classification

## Running the App

### Development Mode

Terminal 1 - Start backend:
```bash
npm run server
```

Terminal 2 - Start frontend:
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## Testing on Mobile

1. Find your local IP address:
   - Windows: `ipconfig`
   - Look for IPv4 Address (e.g., 192.168.1.100)

2. Update Vite config to allow network access:
   - The app is already configured for this

3. Start the dev server:
```bash
npm run dev -- --host
```

4. On your mobile device:
   - Connect to same WiFi network
   - Open browser and visit: `http://YOUR_IP:5173`
   - Example: `http://192.168.1.100:5173`

5. Install as PWA:
   - Chrome: Menu → "Add to Home Screen"
   - Safari: Share → "Add to Home Screen"

## API Integration

### Replace Mock Soil Classification

Edit `server/soilAnalyzer.js` and update the `analyzeSoilImage` function with your actual API endpoint.

### Add Sarvam AI Key

Add to `.env`:
```
SARVAM_API_KEY=your_actual_key_here
```

## Icon Setup

Replace placeholder icons in `public/` folder:
- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

Use a farming/soil related icon (🌾 or 🌱 themed).

## Troubleshooting

### GPS not working
- Ensure HTTPS or localhost
- Grant location permissions in browser
- App falls back to Bangalore coordinates if GPS fails

### API errors
- Check server is running on port 3001
- Verify CORS is enabled
- Check network connectivity

### PWA not installing
- Ensure HTTPS (or localhost for testing)
- Check manifest.webmanifest is accessible
- Verify service worker registration

## Next Steps

1. Test on actual mobile devices
2. Add real soil classification API
3. Configure Sarvam AI for translations
4. Deploy to production hosting
5. Set up HTTPS for PWA features
