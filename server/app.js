require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const ratesRouter = require("./routes/rates");
const preferencesRouter = require("./routes/preferences");

const app = express();

app.use(cors());
app.use(express.json());

// Health endpoint (supports both /api/health and /health)
app.get(["/api/health", "/health"], (req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection?.readyState === 1,
    mode: mongoose.connection?.readyState === 1 ? "mongodb" : "in-memory-fallback",
  });
});

// API Routes (supports both /api/rates and /rates for Vercel Serverless Function rewrites)
app.use(["/api/rates", "/rates"], ratesRouter);
app.use(["/api/preferences", "/preferences"], preferencesRouter);

// Mongoose / Database error middleware
app.use((err, req, res, next) => {
  if (
    err.name === "MongooseError" ||
    err.name === "MongoNetworkError" ||
    (err.message && err.message.includes("buffering timed out"))
  ) {
    console.warn("[AI Studio] Database offline — returning fallback response");
    if (req.method === "GET") {
      return res.json(req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {});
    }
    return res.status(503).json({ error: "Service temporarily unavailable (database offline)" });
  }
  next(err);
});

// Explicit 404 for unhandled API calls
app.use(["/api/*", "/*"], (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/rates") || req.path.startsWith("/preferences")) {
    return res.status(404).json({ error: "not_found" });
  }
  next();
});

module.exports = app;
