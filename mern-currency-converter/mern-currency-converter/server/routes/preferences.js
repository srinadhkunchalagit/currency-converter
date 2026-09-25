const express = require("express");
const UserPreference = require("../models/UserPreference");

const router = express.Router();

const DEFAULTS = {
  lang: "en",
  favorites: [],
  multiTargets: ["INR", "EUR", "GBP"],
  history: [],
};

async function findOrCreate(clientId) {
  let doc = await UserPreference.findOne({ clientId });
  if (!doc) {
    doc = await UserPreference.create({ clientId, ...DEFAULTS });
  }
  return doc;
}

// GET /api/preferences/:clientId
router.get("/:clientId", async (req, res) => {
  try {
    const doc = await findOrCreate(req.params.clientId);
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: "preferences_read_failed" });
  }
});

// PUT /api/preferences/:clientId  body: { lang?, favorites?, multiTargets? }
router.put("/:clientId", async (req, res) => {
  const { lang, favorites, multiTargets } = req.body || {};
  const update = {};
  if (lang !== undefined) update.lang = lang;
  if (Array.isArray(favorites)) update.favorites = favorites.slice(0, 8);
  if (Array.isArray(multiTargets)) update.multiTargets = multiTargets;
  try {
    const doc = await UserPreference.findOneAndUpdate(
      { clientId: req.params.clientId },
      { $set: update, $setOnInsert: DEFAULTS },
      { upsert: true, new: true },
    );
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: "preferences_update_failed" });
  }
});

// POST /api/preferences/:clientId/history  body: { from, to, amount, result, date? }
router.post("/:clientId/history", async (req, res) => {
  const { from, to, amount, result, date } = req.body || {};
  if (!from || !to || amount === undefined || result === undefined) {
    return res.status(400).json({ error: "invalid_history_entry" });
  }
  try {
    const doc = await findOrCreate(req.params.clientId);
    doc.history.unshift({
      from,
      to,
      amount,
      result,
      date: date ? new Date(date) : new Date(),
    });
    doc.history = doc.history.slice(0, 50);
    await doc.save();
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: "history_append_failed" });
  }
});

// DELETE /api/preferences/:clientId/history
router.delete("/:clientId/history", async (req, res) => {
  try {
    const doc = await UserPreference.findOneAndUpdate(
      { clientId: req.params.clientId },
      { $set: { history: [] } },
      { upsert: true, new: true },
    );
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: "history_clear_failed" });
  }
});

module.exports = router;
