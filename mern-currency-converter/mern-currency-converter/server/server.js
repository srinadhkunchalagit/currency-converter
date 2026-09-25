require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const ratesRouter = require("./routes/rates");
const preferencesRouter = require("./routes/preferences");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/currency_converter";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use("/api/rates", ratesRouter);
app.use("/api/preferences", preferencesRouter);

app.use((req, res) => {
  res.status(404).json({ error: "not_found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "server_error" });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB at", MONGODB_URI);
  } catch (e) {
    console.error(
      "Could not connect to MongoDB — preferences/history/favorites will fail until it's reachable.",
      e.message,
    );
  }
  app.listen(PORT, () => {
    console.log(`Currency converter API listening on http://localhost:${PORT}`);
  });
}

start();
