require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const ratesRouter = require("./routes/rates");
const preferencesRouter = require("./routes/preferences");

const app = express();
const PORT = 3000;
const HOST = "0.0.0.0";
const MONGODB_URI = process.env.MONGODB_URI || "";

app.use(cors());
app.use(express.json());

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1,
    mode: mongoose.connection.readyState === 1 ? "mongodb" : "in-memory-fallback",
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

// General server error middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "server_error" });
});

async function start() {
  // Database connection (non-blocking)
  mongoose.set("bufferCommands", false);
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      console.log("Connected to MongoDB at", MONGODB_URI);
    } catch (e) {
      console.warn("MongoDB connection failed, running with in-memory preferences fallback:", e.message);
    }
  } else {
    console.log("MONGODB_URI not provided — running with in-memory preferences fallback");
  }

  // Frontend serving setup
  const clientDir = path.resolve(__dirname, "../client");
  const clientDist = path.resolve(clientDir, "dist");
  const isDev = process.env.NODE_ENV !== "production";

  if (!isDev && fs.existsSync(clientDist)) {
    console.log("Serving static client from:", clientDist);
    app.use(express.static(clientDist));
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  } else {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        root: clientDir,
        server: {
          middlewareMode: true,
          hmr: false,
          allowedHosts: true,
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Mounted Vite dev middleware from:", clientDir);
    } catch (e) {
      console.warn("Could not mount Vite dev middleware:", e.message);
      if (fs.existsSync(clientDist)) {
        app.use(express.static(clientDist));
        app.get("*", (req, res) => {
          res.sendFile(path.join(clientDist, "index.html"));
        });
      } else {
        app.get("*", (req, res) => {
          res.status(503).send("Client build not found and Vite dev server failed.");
        });
      }
    }
  }

  app.listen(PORT, HOST, () => {
    console.log(`Currency Converter server listening on http://${HOST}:${PORT}`);
  });
}

start();
