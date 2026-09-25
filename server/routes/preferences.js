const express = require("express");
const mongoose = require("mongoose");
const UserPreference = require("../models/UserPreference");

const router = express.Router();

const DEFAULTS = {
  lang: "en",
  favorites: [],
  multiTargets: ["INR", "EUR", "GBP"],
  history: [],
};

// In-memory fallback store when MongoDB is offline
const memoryStore = new Map();

function getMemoryDoc(clientId) {
  if (!memoryStore.has(clientId)) {
    memoryStore.set(clientId, {
      clientId,
      lang: DEFAULTS.lang,
      favorites: [...DEFAULTS.favorites],
      multiTargets: [...DEFAULTS.multiTargets],
      history: [...DEFAULTS.history],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  return memoryStore.get(clientId);
}

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

async function findOrCreate(clientId) {
  let doc = await UserPreference.findOne({ clientId });
  if (!doc) {
    doc = await UserPreference.create({ clientId, ...DEFAULTS });
  }
  return doc;
}

// GET /api/preferences/:clientId
router.get("/:clientId", async (req, res) => {
  const { clientId } = req.params;
  if (isDbConnected()) {
    try {
      const doc = await findOrCreate(clientId);
      return res.json(doc);
    } catch (e) {
      console.warn("DB findOrCreate failed, falling back to memory store:", e.message);
    }
  }
  res.json(getMemoryDoc(clientId));
});

// PUT /api/preferences/:clientId  body: { lang?, favorites?, multiTargets? }
router.put("/:clientId", async (req, res) => {
  const { clientId } = req.params;
  const { lang, favorites, multiTargets } = req.body || {};
  const update = {};
  if (lang !== undefined) update.lang = lang;
  if (Array.isArray(favorites)) update.favorites = favorites.slice(0, 8);
  if (Array.isArray(multiTargets)) update.multiTargets = multiTargets;

  if (isDbConnected()) {
    try {
      const doc = await UserPreference.findOneAndUpdate(
        { clientId },
        { $set: update, $setOnInsert: DEFAULTS },
        { upsert: true, new: true },
      );
      return res.json(doc);
    } catch (e) {
      console.warn("DB update failed, falling back to memory store:", e.message);
    }
  }

  const mem = getMemoryDoc(clientId);
  if (update.lang !== undefined) mem.lang = update.lang;
  if (update.favorites !== undefined) mem.favorites = update.favorites;
  if (update.multiTargets !== undefined) mem.multiTargets = update.multiTargets;
  mem.updatedAt = new Date().toISOString();
  res.json(mem);
});

// POST /api/preferences/:clientId/history  body: { from, to, amount, result, date? }
router.post("/:clientId/history", async (req, res) => {
  const { clientId } = req.params;
  const { from, to, amount, result, date } = req.body || {};
  if (!from || !to || amount === undefined || result === undefined) {
    return res.status(400).json({ error: "invalid_history_entry" });
  }

  const newEntry = {
    from,
    to,
    amount,
    result,
    date: date ? new Date(date) : new Date(),
  };

  if (isDbConnected()) {
    try {
      const doc = await findOrCreate(clientId);
      doc.history.unshift(newEntry);
      doc.history = doc.history.slice(0, 50);
      await doc.save();
      return res.json(doc);
    } catch (e) {
      console.warn("DB history save failed, falling back to memory store:", e.message);
    }
  }

  const mem = getMemoryDoc(clientId);
  mem.history.unshift(newEntry);
  mem.history = mem.history.slice(0, 50);
  mem.updatedAt = new Date().toISOString();
  res.json(mem);
});

// DELETE /api/preferences/:clientId/history
router.delete("/:clientId/history", async (req, res) => {
  const { clientId } = req.params;
  if (isDbConnected()) {
    try {
      const doc = await UserPreference.findOneAndUpdate(
        { clientId },
        { $set: { history: [] } },
        { upsert: true, new: true },
      );
      return res.json(doc);
    } catch (e) {
      console.warn("DB clear history failed, falling back to memory store:", e.message);
    }
  }

  const mem = getMemoryDoc(clientId);
  mem.history = [];
  mem.updatedAt = new Date().toISOString();
  res.json(mem);
});

module.exports = router;
