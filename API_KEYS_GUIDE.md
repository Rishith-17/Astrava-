# API Keys Setup Guide

## Priority Order for Getting API Keys

Start with the **essential APIs** first, then add optional ones later for enhanced features.

---

## 🔴 ESSENTIAL APIs (Start Here)

### 1. OpenCage Geocoder API ⭐ **START HERE**
**Purpose**: Converts GPS coordinates to location names (district, state, country)

**How to Get**:
1. Go to: https://opencagedata.com/
2. Click "Sign Up" (free tier available)
3. Free tier: 2,500 requests/day
4. After signup, go to Dashboard → API Keys
5. Copy your API key

**Add to .env**:
```
OPENCAGE_API_KEY=your_key_here
```

**Cost**: FREE for up to 2,500 requests/day

---

### 2. WeatherAPI.com ⭐ **SECOND PRIORITY**
**Purpose**: Current weather + 7-day forecast, rainfall data

**How to Get**:
1. Go to: https://www.weatherapi.com/
2. Click "Sign Up Free"
3. Free tier: 1 million calls/month
4. After signup, go to Dashboard
5. Copy your API key

**Add to .env**:
```
WEATHER_API_KEY=your_key_here
```

**Cost**: FREE for up to 1 million calls/month

---

## 🟡 IMPORTANT APIs (Add These Next)

### 3. ISRIC SoilGrids API ✅ **NO KEY NEEDED!**
**Purpose**: Global soil properties (pH, nitrogen, organic carbon, clay, sand)

**How to Use**:
- **No API key required!** 
- It's a free public API
- Just use the endpoint: https://rest.isric.org/soilgrids/v2.0
- Rate limit: Reasonable use (don't spam)

**Nothing to add to .env** - works out of the box!

---

### 4. Sentinel Hub API (Satellite Imagery)
**Purpose**: NDVI, vegetation stress, soil moisture from satellite

**How to Get**:
1. Go to: https://www.sentinel-hub.com/
2. Click "Try for Free" or "Sign Up"
3. Free trial: 30 days with limited requests
4. After signup, create an OAuth client:
   - Go to Dashboard → OAuth clients
   - Click "Create new OAuth client"
   - Copy Client ID and Client Secret

**Add to .env**:
```
SENTINEL_HUB_CLIENT_ID=your_client_id_here
SENTINEL_HUB_CLIENT_SECRET=your_client_secret_here
```

**Cost**: 
- Free trial: 30 days
- After trial: ~€0.01-0.05 per request (pay as you go)
- Can work without it initially (system will use cached/mock data)

---

## 🟢 OPTIONAL APIs (Can Add Later or Use Mock Data)

### 5. Crop Health API
**Status**: This is a placeholder - no real public API exists yet

**Options**:
1. **Use mock data** (recommended for now)
2. Build your own using NDVI calculations
3. Use agricultural research APIs if available in your region

**For now**: The system will generate crop health data from NDVI calculations

---

### 6. Fertilizer Dataset API
**Status**: This is a placeholder - no real public API exists yet

**Options**:
1. **Use built-in fertilizer database** (recommended)
2. Use agricultural extension service APIs if available
3. Build custom database from agricultural research

**For now**: The system will use a built-in fertilizer recommendation algorithm

---

## 📋 Quick Start Checklist

### Minimum to Start Testing (30 minutes):
- [ ] Get OpenCage API key (5 min)
- [ ] Get WeatherAPI key (5 min)
- [ ] Copy .env.example to .env
- [ ] Add both keys to .env
- [ ] Test with these 2 APIs + SoilGrids (no key needed)

### Full Setup (1-2 hours):
- [ ] Get OpenCage API key
- [ ] Get WeatherAPI key
- [ ] Get Sentinel Hub account (trial)
- [ ] Add all keys to .env
- [ ] Test complete system

---

## 🔧 Setting Up Your .env File

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit .env and add your keys**:
   ```bash
   # Minimum setup
   OPENCAGE_API_KEY=abc123xyz...
   WEATHER_API_KEY=def456uvw...
   
   # Optional (add later)
   SENTINEL_HUB_CLIENT_ID=your_id
   SENTINEL_HUB_CLIENT_SECRET=your_secret
   ```

3. **Keep the other settings as default**:
   ```bash
   PORT=3001
   API_TIMEOUT_MS=10000
   CACHE_WEATHER_HOURS=24
   CACHE_SOIL_DAYS=7
   CACHE_SATELLITE_DAYS=3
   MAX_HISTORICAL_REPORTS=50
   PARALLEL_API_REQUESTS=true
   ```

---

## 💰 Cost Summary

| API | Free Tier | Cost After Free Tier |
|-----|-----------|---------------------|
| OpenCage | 2,500 req/day | $50/month for 10K req/day |
| WeatherAPI | 1M req/month | $4/month for 1M calls |
| SoilGrids | Unlimited* | FREE forever |
| Sentinel Hub | 30-day trial | ~€0.01-0.05 per request |
| Crop Health | N/A (mock) | Build your own |
| Fertilizer | N/A (built-in) | Build your own |

*Reasonable use policy applies

---

## 🚀 Recommended Approach

### Phase 1: MVP (Start Here) ✅
**APIs needed**: OpenCage + WeatherAPI + SoilGrids (no key)
- Get basic location data
- Get weather and forecasts
- Get soil properties
- **Cost**: FREE (within limits)
- **Time to setup**: 30 minutes

### Phase 2: Enhanced Features
**Add**: Sentinel Hub (trial)
- Get satellite NDVI data
- Get soil moisture from space
- Get vegetation stress indicators
- **Cost**: FREE for 30 days
- **Time to setup**: +30 minutes

### Phase 3: Production
**Decide**: Keep Sentinel Hub or use alternatives
- Evaluate usage and costs
- Consider building custom crop health algorithms
- Optimize API calls with caching
- **Cost**: Variable based on usage

---

## 🔒 Security Notes

1. **Never commit .env file to git** (already in .gitignore)
2. **Keep API keys secret** - don't share them
3. **Rotate keys periodically** for security
4. **Monitor usage** to avoid unexpected charges
5. **Use environment variables** in production (not .env files)

---

## 🆘 Troubleshooting

### "API key invalid" error
- Double-check you copied the entire key
- Make sure no extra spaces before/after the key
- Verify the key is active in the provider's dashboard

### "Rate limit exceeded" error
- You've hit the free tier limit
- Wait for the limit to reset (usually daily/monthly)
- Consider upgrading or caching more aggressively

### "API timeout" error
- Check your internet connection
- The API might be down (check status page)
- Increase API_TIMEOUT_MS in .env if needed

---

## 📞 Support Links

- **OpenCage**: https://opencagedata.com/api#quickstart
- **WeatherAPI**: https://www.weatherapi.com/docs/
- **SoilGrids**: https://www.isric.org/explore/soilgrids/faq-soilgrids
- **Sentinel Hub**: https://docs.sentinel-hub.com/

---

## ✅ Ready to Test?

Once you have at least OpenCage and WeatherAPI keys:

1. Add them to `.env`
2. Restart your server: `npm run server`
3. Test the system with a soil image upload
4. Check the console for API call logs
5. Verify data is being fetched and cached

The system will work with partial API availability - it's designed to gracefully degrade!
