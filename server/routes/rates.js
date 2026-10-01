const express = require("express");
const { getLatest, getHistorical, getSeries, todayStr } = require("../utils/rateProvider");

const router = express.Router();

function parseNeeded(q) {
  if (!q) return [];
  return String(q)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// GET /api/rates/latest?base=USD&needed=INR,EUR
router.get("/latest", async (req, res) => {
  const base = (req.query.base || "USD").toUpperCase();
  const needed = parseNeeded(req.query.needed);
  try {
    const data = await getLatest(base, needed);
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: "rates_unavailable" });
  }
});

// GET /api/rates/historical?base=USD&date=2026-09-24&to=INR
// `date` may also be one of: yesterday | week | month, as shorthand.
router.get("/historical", async (req, res) => {
  const base = (req.query.base || "USD").toUpperCase();
  const to = req.query.to ? String(req.query.to).toUpperCase() : undefined;
  let dateStr = req.query.date;
  const shorthand = { yesterday: 1, week: 7, month: 30 };
  if (dateStr && shorthand[dateStr] !== undefined) {
    dateStr = todayStr(shorthand[dateStr]);
  }
  if (!dateStr) {
    return res.status(400).json({ error: "date_required" });
  }
  try {
    const data = await getHistorical(base, dateStr, to);
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: "historical_unavailable" });
  }
});

// GET /api/rates/series?base=USD&to=INR&days=30
router.get("/series", async (req, res) => {
  const base = (req.query.base || "USD").toUpperCase();
  const to = (req.query.to || "INR").toUpperCase();
  const days = parseInt(req.query.days, 10) || 30;
  try {
    const data = await getSeries(base, to, todayStr(days), todayStr(0));
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: "series_unavailable" });
  }
});

module.exports = router;
