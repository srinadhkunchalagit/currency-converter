require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const ratesRouter = require("./routes/rates");
const preferencesRouter = require("./routes/preferences");

const app = express();

app.use(cors());
app.use(express.json());

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection?.readyState === 1,
    mode: mongoose.connection?.readyState === 1 ? "mongodb" : "in-memory-fallback",
  });
});

// API Routes
app.use("/api/rates", ratesRouter);
app.use("/api/preferences", preferencesRouter);

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

// Explicit 404 for unhandled /api calls
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "not_found" });
});

module.exports = app;
