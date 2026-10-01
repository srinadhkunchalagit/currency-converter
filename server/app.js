require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const ratesRouter = require("./routes/rates");
const preferencesRouter = require("./routes/preferences");

const app = express();

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "microphone=*");
  res.setHeader("Feature-Policy", "microphone *");
  next();
});

let ai = null;
try {
  const { GoogleGenAI } = require("@google/genai");
  ai = new GoogleGenAI({});
} catch (e) {
  console.warn("Could not initialize GoogleGenAI:", e.message);
}

// Server-side audio speech-to-currency endpoint powered by Gemini
app.post(["/api/voice-currency", "/voice-currency"], async (req, res) => {
  const { audioBase64, mimeType = "audio/webm", lang = "en" } = req.body || {};
  if (!audioBase64) {
    return res.status(400).json({ error: "audio_required" });
  }

  if (!ai) {
    return res.status(503).json({ error: "ai_unavailable" });
  }

  try {
    const cleanMime = (mimeType || "audio/webm").split(";")[0].trim();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          inlineData: {
            data: audioBase64,
            mimeType: cleanMime,
          },
        },
        `You are a speech-to-currency identifier for a world currency converter app.
The user spoke a currency name or country or code (possibly in English or an Indian language such as Telugu, Hindi, Tamil, Kannada, Bengali, etc.).
Examples:
- "Indian Rupee", "rupee", "రూపాయి", "रुपया", "টাকা", "ரூபாய்" -> "INR"
- "US Dollar", "dollar", "డాలర్", "डॉलर" -> "USD"
- "Euro", "యూరో", "यूरो" -> "EUR"
- "British Pound", "pound", "పౌండ్", "पाउंड" -> "GBP"
- "Japanese Yen", "yen", "యెన్", "येन" -> "JPY"
- "UAE Dirham", "dirham", "దిర్హామ్", "दिरहम" -> "AED"
- "Canadian Dollar" -> "CAD"
- "Australian Dollar" -> "AUD"
- "Saudi Riyal" -> "SAR"
- "Swiss Franc" -> "CHF"
- "Singapore Dollar" -> "SGD"
- "Kuwaiti Dinar" -> "KWD"
Return a JSON object containing:
{"code": "INR", "name": "Indian Rupee", "transcript": "recognized words"}`,
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text);
    return res.json(parsed);
  } catch (err) {
    console.warn("Gemini voice currency processing error:", err.message);
    return res.status(500).json({ error: "recognition_error" });
  }
});

// Health endpoint (supports both /api/health and /health)
app.get(["/api/health", "/health"], (req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection?.readyState === 1,
    mode: mongoose.connection?.readyState === 1 ? "mongodb" : "in-memory-fallback",
  });
});

// High-fidelity multilingual TTS audio stream endpoint
app.get(["/api/tts", "/tts"], async (req, res) => {
  const { text, lang } = req.query;
  if (!text) {
    return res.status(400).json({ error: "text_required" });
  }

  const speechLangMap = {
    te: "te", // Telugu
    hi: "hi", // Hindi
    ta: "ta", // Tamil
    bn: "bn", // Bengali
    kn: "kn", // Kannada
    gu: "gu", // Gujarati
    ml: "ml", // Malayalam
    mr: "mr", // Marathi
    pa: "pa", // Punjabi
    or: "or", // Odia
    ur: "ur", // Urdu
    as: "as", // Assamese
    ne: "ne", // Nepali
    sa: "sa", // Sanskrit
    mai: "hi", // Maithili (Devanagari phonetics)
    doi: "hi", // Dogri (Devanagari phonetics)
    kok: "mr", // Konkani (Marathi/Devanagari phonetics)
    brx: "hi", // Bodo
    mni: "bn", // Manipuri (Bengali script)
    sat: "hi", // Santali
    sd: "ur", // Sindhi (Perso-Arabic phonetics)
    ks: "ur", // Kashmiri
    en: "en-in", // Indian English
  };
  const targetLang = speechLangMap[lang] || lang || "en-in";

  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
      targetLang,
    )}&client=tw-ob&q=${encodeURIComponent(text)}`;
    const upstream = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: "tts_upstream_failed" });
    }

    res.set("Content-Type", "audio/mpeg");
    res.set("Cache-Control", "public, max-age=86400");
    const arrayBuffer = await upstream.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.warn("TTS proxy error:", err.message);
    return res.status(500).json({ error: "tts_error" });
  }
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
