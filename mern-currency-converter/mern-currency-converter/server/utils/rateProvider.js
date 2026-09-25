// Ported from the original client-side logic: tries a live provider first,
// falls back to a second live provider, then a third, then an offline
// reference snapshot bundled with the app. Runs server-side now so the
// browser never talks to these third-party APIs directly, and so results
// can be cached once and reused across every visitor.

const { OFFLINE_SNAPSHOT } = require("../data/offlineSnapshot");

const API = "https://api.frankfurter.app";
const API_V2 = "https://api.frankfurter.dev/v2";
const API_ALT = "https://open.er-api.com/v6/latest";
const FETCH_TIMEOUT_MS = 7000;
const LATEST_CACHE_TTL_MS = 60 * 1000; // 60s, matches the original app

const latestCache = new Map(); // base -> { t, data, live }
const historicalCache = new Map(); // key -> { t, data }

function todayStr(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

async function fetchTimeout(url, ms) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms || FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

function hasNeeded(data, base, neededCodes) {
  if (!neededCodes || neededCodes.length === 0) return true;
  return neededCodes.every(
    (code) => code === base || (data.rates && data.rates[code] !== undefined),
  );
}

function rebaseSnapshot(base) {
  const usdRates = OFFLINE_SNAPSHOT.rates;
  if (base === "USD") return { ...usdRates };
  const baseRate = usdRates[base];
  if (!baseRate) return { ...usdRates };
  const out = {};
  Object.keys(usdRates).forEach((code) => {
    out[code] = usdRates[code] / baseRate;
  });
  return out;
}

async function getLatest(base, neededCodes) {
  const cached = latestCache.get(base);
  if (cached && Date.now() - cached.t < LATEST_CACHE_TTL_MS) {
    if (hasNeeded(cached.data, base, neededCodes)) {
      return { ...cached.data, live: cached.live };
    }
  }

  // Source 1: open.er-api (frequent live market updates across 160+ currencies)
  try {
    const res = await fetchTimeout(`${API_ALT}/${base}`);
    if (!res.ok) throw new Error("open.er-api not ok");
    const json = await res.json();
    if (json.result !== "success") throw new Error("open.er-api error result");
    const data = {
      base,
      date: (json.time_last_update_utc || "").slice(0, 16) || todayStr(0),
      rates: json.rates,
    };
    if (!hasNeeded(data, base, neededCodes))
      throw new Error("open.er-api missing needed codes");
    latestCache.set(base, { t: Date.now(), data, live: true });
    return { ...data, live: true };
  } catch (e) {
    /* fall through to Frankfurter */
  }

  // Source 2: Frankfurter v1 (ECB fallback)
  try {
    const res = await fetchTimeout(`${API}/latest?from=${base}`);
    if (!res.ok) throw new Error("frankfurter v1 not ok");
    const data = await res.json();
    if (!hasNeeded(data, base, neededCodes))
      throw new Error("frankfurter v1 missing needed codes");
    latestCache.set(base, { t: Date.now(), data, live: true });
    return { ...data, live: true };
  } catch (e) {
    /* fall through */
  }

  // Source 3: Frankfurter v2
  try {
    const res = await fetchTimeout(`${API_V2}/rates?base=${base}`);
    if (!res.ok) throw new Error("frankfurter v2 not ok");
    const rows = await res.json();
    const rates = {};
    rows.forEach((r) => {
      rates[r.quote] = r.rate;
    });
    const data = { base, date: rows[0]?.date || todayStr(0), rates };
    if (!hasNeeded(data, base, neededCodes))
      throw new Error("frankfurter v2 missing needed codes");
    latestCache.set(base, { t: Date.now(), data, live: true });
    return { ...data, live: true };
  } catch (e) {
    /* fall through */
  }

  // Fallback: bundled offline snapshot
  const snap = {
    base,
    date: OFFLINE_SNAPSHOT.date,
    rates: rebaseSnapshot(base),
  };
  latestCache.set(base, { t: Date.now(), data: snap, live: false });
  return { ...snap, live: false };
}

async function getHistorical(base, dateStr, to) {
  const cacheKey = base + ":" + dateStr + (to ? ":" + to : "");
  const cached = historicalCache.get(cacheKey);
  if (cached) return cached.data;

  try {
    const url = `${API}/${dateStr}?from=${base}` + (to ? `&to=${to}` : "");
    const res = await fetchTimeout(url);
    if (!res.ok) throw new Error("frankfurter v1 historical not ok");
    const data = await res.json();
    historicalCache.set(cacheKey, { t: Date.now(), data });
    return data;
  } catch (e) {
    /* try v2 */
  }
  try {
    const url =
      `${API_V2}/rates?base=${base}&date=${dateStr}` +
      (to ? `&quotes=${to}` : "");
    const res = await fetchTimeout(url);
    if (!res.ok) throw new Error("frankfurter v2 historical not ok");
    const rows = await res.json();
    const rates = {};
    rows.forEach((r) => {
      rates[r.quote] = r.rate;
    });
    const data = { base, date: rows[0]?.date || dateStr, rates };
    historicalCache.set(cacheKey, { t: Date.now(), data });
    return data;
  } catch (e) {
    throw new Error("historical unavailable");
  }
}

async function getSeries(base, to, startDate, endDate) {
  const res = await fetchTimeout(
    `${API}/${startDate}..${endDate}?from=${base}&to=${to}`,
  );
  if (!res.ok) throw new Error("series unavailable");
  return res.json();
}

module.exports = { getLatest, getHistorical, getSeries, todayStr };
