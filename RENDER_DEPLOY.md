# Render Deployment Guide — Astrava (Frontend + Backend)

## Overview
- **Backend**: Express API → Render Web Service (free)
- **Frontend**: React/Vite → Render Static Site (free)

---

## STEP 1 — Push Code to GitHub

First, push your code to GitHub (Render deploys from git).

```bash
git add .
git commit -m "Render deployment config"
git push origin main
```

If you don't have a GitHub repo yet:
1. Go to https://github.com/new
2. Create a new repo (e.g. `astrava-app`)
3. Then run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/astrava-app.git
git branch -M main
git push -u origin main
```

---

## STEP 2 — Deploy the Backend (API Server)

1. Go to **https://render.com** → Sign in → **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Field | Value |
|-------|-------|
| **Name** | `astrava-backend` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

4. Scroll down to **Environment Variables** → Add each one:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `SARVAM_API_KEY` | `sk_tatuarzp_Pu7EMEAJiRFSZVGMBzV3XtN9` |
| `OPENCAGE_API_KEY` | `8078bd5a3c514f97a9c4fdbe2c0958a7` |
| `WEATHER_API_KEY` | `1b94f0a935474840a8e103640260603` |
| `PLANET_API_KEY` | `PLAK77f7fd9c73964c5cb1fe12aa85412d85` |
| `CROP_HEALTH_API_KEY` | `hoY1rLxkLJgLvlocBpMKtiMqgK4MPhpoTAovovJXNFaoGXTYfC` |
| `GOV_INDIA_API_KEY` | `579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b` |
| `LANGBLY_API_KEY` | `XepXAGoDp96TaxjRsKf8BT` |
| `SOIL_CLASSIFY_API_URL` | *(your ngrok URL or ML endpoint)* |

5. Click **Create Web Service**
6. Wait for it to deploy (~3-5 minutes)
7. **Copy the URL** — it looks like: `https://astrava-backend.onrender.com`

✅ Test it: open `https://astrava-backend.onrender.com/health` — should return `{"status":"ok",...}`

---

## STEP 3 — Deploy the Frontend (React App)

1. Go to **https://render.com** → **New +** → **Static Site**
2. Connect the same GitHub repo
3. Configure:

| Field | Value |
|-------|-------|
| **Name** | `astrava-frontend` |
| **Root Directory** | *(leave empty — project root)* |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |
| **Plan** | Free |

4. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://astrava-backend.onrender.com/api` ← paste your backend URL + `/api` |
| `VITE_SARVAM_API_KEY` | `sk_tatuarzp_Pu7EMEAJiRFSZVGMBzV3XtN9` |
| `VITE_PORCUPINE_ACCESS_KEY` | *(your Porcupine key if you have one)* |

5. Click **Create Static Site**
6. Wait for build (~3-5 minutes)
7. Your app is live at: `https://astrava-frontend.onrender.com`

---

## STEP 4 — Verify Everything Works

1. Open `https://astrava-frontend.onrender.com`
2. You should see the **Astrava landing page**
3. Click **Launch App** → you're in the app
4. Test soil analysis (needs your ML model ngrok URL to be running)
5. Test market prices, weather analytics

---

## Troubleshooting

### Backend not starting?
- Check Render logs for errors
- Make sure all env vars are set in the dashboard

### Frontend shows blank page?
- Check browser console for CORS or network errors
- Make sure `VITE_API_URL` is set correctly (include `/api` at the end)
- Make sure it does NOT have a trailing slash

### API calls failing (CORS error)?
- The backend already allows all `.onrender.com` origins
- No changes needed

### Free tier sleep (important!)
- Render free tier spins down after 15 min of inactivity
- First request after sleep takes ~30 seconds (cold start)
- This is normal for free tier

---

## Free Tier Limits
- 750 hours/month of compute (enough for 1 service running 24/7)
- Static sites: unlimited
- No credit card required

## Your Live URLs
- **Frontend**: https://astrava-frontend.onrender.com
- **Backend API**: https://astrava-backend.onrender.com/api
- **Health Check**: https://astrava-backend.onrender.com/health
