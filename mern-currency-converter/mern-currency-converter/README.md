# World Currency Converter — MERN Stack

A full MERN (MongoDB, Express, React, Node.js) rebuild of the original
single-file HTML currency converter. Same features — live conversion,
multi-currency conversion, rate trends with a sparkline, provider-fee
comparison, a searchable currency directory, and conversion history — now
split into a React frontend and an Express + MongoDB backend.

## What changed vs. the original

- **Rates**: the browser used to call the exchange-rate APIs
  (open.er-api.com, api.frankfurter.app/.dev) directly. Now the **Express
  server** calls them, with the same 3-tier fallback chain (live API →
  live API → live API → bundled offline snapshot) and 60-second caching, so
  every visitor benefits from one shared cache instead of hitting the
  providers individually.
- **Favorites / history / language**: the original used `localStorage`
  (or `window.storage` in some environments). Now they're stored in
  **MongoDB**, keyed by a random per-device ID that's generated once and
  kept in the browser's `localStorage` — no login required, same
  "just works on this device" feel, but the data now lives in a real
  database and survives a cleared browser cache.
- **UI**: rebuilt as React components (one per tab) sharing state through
  a small `AppContext`, instead of one big vanilla-JS script manipulating
  the DOM directly. Visual design, copy, and the English/Telugu/Hindi
  translations are unchanged.

## Project layout

```
mern-currency-converter/
├── server/              Express API + MongoDB models
│   ├── data/            Currency list, translations, offline rate snapshot
│   ├── models/          Mongoose schema (favorites/history/lang per device)
│   ├── routes/          /api/rates/*  and  /api/preferences/*
│   ├── utils/           Rate-provider fallback + caching logic
│   └── server.js
├── client/              React app (Vite)
│   └── src/
│       ├── api/         fetch() wrapper for the backend
│       ├── components/  One component per tab/panel
│       ├── context/     Shared app state (AppContext)
│       ├── data/        Currency list + translations (mirrors server/data)
│       └── utils/       Formatting + device-id helpers
└── package.json         Convenience scripts to run both at once
```

## Prerequisites

- **Node.js 18+** (needed for the built-in `fetch` used by the server)
- **MongoDB** running locally, or a connection string to a hosted instance
  (e.g. [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)

## Quick start

```bash
# 1. Install dependencies for the root, server, and client
npm install
npm run install-all

# 2. Configure the server
cp server/.env.example server/.env
# edit server/.env if your MongoDB isn't on the default local port

# 3. Run both the API and the React dev server together
npm run dev
```

This starts:
- the API at **http://localhost:5000**
- the React app at **http://localhost:5173** (Vite proxies `/api/*` to the
  server automatically — see `client/vite.config.js`)

Open **http://localhost:5173** in your browser.

## Running the two apps separately

If you'd rather run them in two terminals instead of using `npm run dev`:

```bash
# terminal 1
cd server
npm install
cp .env.example .env
npm run dev        # or: npm start

# terminal 2
cd client
npm install
npm run dev
```

## No MongoDB handy?

The app still runs without it — the rate conversion, multi-convert, trends,
fees, and currency directory tabs all work immediately, since they only
depend on the Express rates API. Only **favorites, history, and your
language choice won't be saved** between visits until MongoDB is reachable
(the server logs a warning on startup if it can't connect, and keeps
serving everything else).

## Building for production

```bash
npm run build:client     # outputs client/dist — serve it with any static host
cd server && npm start   # run the API (point it at your production MongoDB)
```

In production, either serve `client/dist` from a static host / CDN and
set `CLIENT_ORIGIN` in `server/.env` to that origin (for CORS), or add a
reverse proxy (nginx, etc.) that routes `/api/*` to the Express server and
everything else to the built client files.

## Environment variables (`server/.env`)

| Variable        | Default                                              | Purpose                          |
| --------------- | ----------------------------------------------------- | --------------------------------- |
| `PORT`          | `5000`                                                | Port the Express API listens on   |
| `MONGODB_URI`   | `mongodb://127.0.0.1:27017/currency_converter`        | MongoDB connection string         |
| `CLIENT_ORIGIN` | `http://localhost:5173`                               | Allowed CORS origin for the API   |
