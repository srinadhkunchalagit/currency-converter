# Ledger — World Currency Converter (MERN Stack)

A production-ready full-stack currency converter featuring live mid-market exchange rates, multi-currency conversion, historical rate trends with interactive sparklines, provider fee estimation, a world currency directory, and persistent conversion history.

Works out of the box in development (with an automatic in-memory fallback) and is 100% ready to deploy to **Vercel** with serverless functions or any Node.js hosting platform.

---

## Features

1. **Live Currency Converter**:
   - Real-time mid-market exchange rates with multi-tier live providers (`open.er-api.com` and `Frankfurter`) plus bundled offline reference snapshots.
   - Dual-figure display (converted currency + automatic Indian Rupees ₹ equivalent).
   - Invert / Swap currency pair (`⇄`) in one click.
   - One-click **Copy Result** button (`📋 Copy`).
   - Interactive star favoriting.
   - **Frequently Used & Popular Pairs Grid**: Quick benchmark cards with live rates (USD/EUR, EUR/USD, USD/INR, GBP/INR, AED/INR, CAD/INR, AUD/INR).

2. **Multi-Currency Converter**:
   - Convert one source currency into multiple target currencies at the same time.
   - Instant search and chip toggles to add or remove currencies dynamically.
   - Dual-figure calculation with automatic Rupee estimation.

3. **Rate Trends & Sparklines**:
   - Compare today's rate against yesterday, 1 week ago, and 1 month ago with percentage change indicators.
   - Interactive timeframe toggling: **7 Days (7D)**, **30 Days (30D)**, and **90 Days (90D)**.
   - High, Low, and Period Average statistical breakdown.
   - Smooth SVG sparkline visualization with trend coloring (green for appreciation, rust for depreciation).
   - Works across all 160+ world currencies with intelligent historical fallback estimation.

4. **Provider Fee Comparison**:
   - Compares typical markups from **Wise**, **Revolut**, **Western Union**, **High-street Banks**, and **PayPal**.
   - Custom live amount and currency inputs directly inside the fee calculator.
   - Calculates effective rate, net amount received, and **estimated savings vs traditional high-street banks**.

5. **World Currency Directory**:
   - Search across all supported world currencies by code, country name, or symbol.
   - One-click actions: "As From", "As To", and "+ Multi" directly from each card.
   - Real-time counter of matching currencies.

6. **Conversion History**:
   - Automatically logs conversions on this device.
   - Reload button (`Reload ↺`): Click any past conversion to load its source, target, and amount right back into the converter.
   - Safe clear history with confirmation protection.

7. **Multilingual (i18n)**:
   - Full native localization in **English**, **తెలుగు (Telugu)**, and **हिंदी (Hindi)**.

---

## Project Structure

```
.
├── api/
│   └── index.js              # Vercel Serverless Function entrypoint (exports Express app)
├── client/                   # React frontend SPA (Vite)
│   ├── index.html            # Entry HTML with meta and font preconnects
│   ├── vite.config.js        # Vite configuration
│   └── src/
│       ├── api/client.js     # API client fetching from /api/*
│       ├── components/       # Panel components (Convert, Multi, Trends, Fees, Currencies, History)
│       ├── context/          # AppContext managing state & preferences
│       ├── data/             # Currencies catalog & i18n dictionaries
│       ├── utils/            # Decimal formatting and client ID generation
│       └── App.jsx           # Root layout with watermark, grain, header, tabs & panels
├── server/                   # Express backend
│   ├── app.js                # Modular Express application (API routes, error handling, health check)
│   ├── server.js             # HTTP server entrypoint for local dev & production Node.js
│   ├── routes/               # Express routers (/api/rates and /api/preferences)
│   ├── models/               # Mongoose UserPreference schema
│   └── utils/                # Rate provider with multi-tier failover & 60s cache
├── vercel.json               # Vercel configuration for static build + serverless functions
└── package.json              # Unified npm workspaces configuration
```

---

## Deploy to Vercel (Step-by-Step)

The project includes pre-configured `vercel.json` and `/api/index.js` serverless routing.

### Method 1: Deploy via Vercel Dashboard (Zero Config)

1. Push this repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to [vercel.com](https://vercel.com/) and click **"Add New Project"**.
3. Import your repository.
4. Vercel will automatically read `vercel.json`:
   - **Framework Preset**: Other (or Vite)
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
5. *(Optional)* Add environment variables under **Settings → Environment Variables**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/dbname`). If omitted, preferences persist in-memory automatically.
6. Click **Deploy**. Your app and serverless API endpoints will be live immediately!

### Method 2: Deploy using Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Login to your Vercel account
vercel login

# 3. Deploy to preview
vercel

# 4. Deploy to production
vercel --prod
```

---

## Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The Express server serves `/api/*` and mounts Vite dev middleware.

### 3. Build for Production
```bash
npm run build
```
Builds the optimized React client into `client/dist`.

---

## API Endpoints

- `GET /api/health` — Service health and database connection status
- `GET /api/rates/latest?base=USD&needed=EUR,INR` — Live exchange rates with caching
- `GET /api/rates/historical?base=USD&date=yesterday&to=INR` — Historical rate lookup
- `GET /api/rates/series?base=USD&to=INR&days=30` — Daily rate series for sparklines (supports 7, 30, 90 days)
- `GET /api/preferences/:clientId` — Retrieve device saved preferences and history
- `PUT /api/preferences/:clientId` — Update language, favorites, or multi-convert targets
- `POST /api/preferences/:clientId/history` — Append conversion entry
- `DELETE /api/preferences/:clientId/history` — Clear conversion history
