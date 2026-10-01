import React, { useState, useRef, useEffect } from "react";
import { matchCurrencyFromVoice } from "../utils/currencyVoiceMatcher.js";
import { CURRENCIES } from "../data/currencies.js";
import { requestStartupMicrophonePermission } from "../utils/microphonePermission.js";

/**
 * CurrencyVoiceButton
 *
 * Compact, highly reliable voice button for selecting From or To currency.
 * Conforms strictly to requirements:
 * - Touch area: 44–48px (compact, easy to tap, does not break layout)
 * - Icon size: ~24–28px
 * - States:
 *     Before: 🎤
 *     While listening: 🎤 Listening...
 *     After successful recognition: returns to normal
 * - Supports 2–3 letter inputs ("INR", "ind", "USD", "dol", "GBP", "EUR", "JPY", "AED"),
 *   partial words, aliases, fuzzy matching, and all 22 Indian languages.
 * - Robust Chrome desktop & Chrome Android event handling with proper cleanup.
 */
export default function CurrencyVoiceButton({
  onCurrencyDetected,
  lang = "en",
  fieldLabel = "Currency",
  currentCode = "USD",
  t = (k) => k,
}) {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);

  const recognitionRef = useRef(null);
  const activeSessionRef = useRef(false);
  const isMountedRef = useRef(true);

  // Chrome / WebKit SpeechRecognition
  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      activeSessionRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          /* ignore */
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  // 22 Scheduled Indian languages speech recognition locale mapping
  const langTagMap = {
    te: "te-IN", // Telugu
    hi: "hi-IN", // Hindi
    ta: "ta-IN", // Tamil
    bn: "bn-IN", // Bengali
    kn: "kn-IN", // Kannada
    gu: "gu-IN", // Gujarati
    ml: "ml-IN", // Malayalam
    mr: "mr-IN", // Marathi
    pa: "pa-IN", // Punjabi
    or: "or-IN", // Odia
    ur: "ur-IN", // Urdu
    as: "as-IN", // Assamese
    ne: "ne-NP", // Nepali
    sa: "sa-IN", // Sanskrit
    ks: "ks-IN", // Kashmiri
    kok: "kok-IN", // Konkani
    mai: "mai-IN", // Maithili
    doi: "doi-IN", // Dogri
    brx: "brx-IN", // Bodo
    mni: "mni-IN", // Manipuri
    sat: "sat-IN", // Santali
    sd: "sd-IN", // Sindhi
    en: "en-IN", // Indian English
  };

  async function startListening() {
    setErrorMessage("");
    setShowPermissionBanner(false);

    if (!SpeechRecognition) {
      setErrorMessage("Voice recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    // Stop any previous active recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        /* ignore */
      }
      recognitionRef.current = null;
    }

    // Check & request permission via startup manager
    const permResult = await requestStartupMicrophonePermission();
    if (permResult.status === "denied") {
      setShowPermissionBanner(true);
      setErrorMessage(
        "Microphone access is blocked. In Chrome, please tap the lock icon 🔒 beside the website address and set Microphone to Allow.",
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      activeSessionRef.current = true;

      // Chrome Android stability requirements:
      // continuous must be false on Android to avoid freezing
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;
      recognition.lang = langTagMap[lang] || "en-IN";

      recognition.onstart = () => {
        if (isMountedRef.current) {
          setIsListening(true);
        }
      };

      recognition.onresult = (event) => {
        if (!isMountedRef.current) return;
        activeSessionRef.current = false;
        setIsListening(false);

        if (!event.results || event.results.length === 0) {
          setErrorMessage("No speech heard. Tap the microphone and speak a currency name.");
          return;
        }

        // Iterate through top alternatives to catch variations like "in our" -> "INR"
        const resultItem = event.results[0];
        let matched = null;
        let spokenText = "";

        for (let i = 0; i < resultItem.length; i++) {
          const transcript = resultItem[i].transcript || "";
          if (!spokenText) spokenText = transcript;
          const m = matchCurrencyFromVoice(transcript, lang);
          if (m && m.code) {
            matched = m;
            spokenText = transcript;
            break;
          }
        }

        if (matched && matched.code) {
          // Update the currency immediately
          onCurrencyDetected(matched.code);
          // Recognition succeeded; returns to normal state
        } else {
          setErrorMessage(
            `"${spokenText}" — Could not detect a currency. Try saying: "Dollar", "INR", "Euro", "Pound", "Dirham", "Yen", or "India".`,
          );
        }
      };

      recognition.onerror = (event) => {
        if (!isMountedRef.current) return;
        activeSessionRef.current = false;
        setIsListening(false);

        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setShowPermissionBanner(true);
          setErrorMessage(
            "Microphone permission was denied. In Chrome, tap the lock/tune icon beside the address bar and allow Microphone access.",
          );
        } else if (event.error === "no-speech") {
          setErrorMessage("No speech heard. Please tap the mic and try again.");
        } else if (event.error !== "aborted") {
          setErrorMessage(`Voice note: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (!isMountedRef.current) return;
        activeSessionRef.current = false;
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      if (!isMountedRef.current) return;
      activeSessionRef.current = false;
      setIsListening(false);
      console.warn("SpeechRecognition start error:", err);
      if (err.name === "NotAllowedError" || err.message?.includes("not-allowed")) {
        setShowPermissionBanner(true);
        setErrorMessage(
          "Microphone permission is blocked. Please allow microphone access in Chrome site settings.",
        );
      } else {
        setErrorMessage(err.message || "Failed to start microphone.");
      }
    }
  }

  function stopListening() {
    activeSessionRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        /* ignore */
      }
    }
    setIsListening(false);
  }

  return (
    <div className="compact-voice-btn-wrap">
      <button
        type="button"
        className={`compact-currency-mic-btn ${isListening ? "listening" : ""}`}
        onClick={isListening ? stopListening : startListening}
        title={
          isListening
            ? "Listening... Tap to stop"
            : `Voice Input for ${fieldLabel}: Tap and say a currency (e.g. Dollar, INR, Euro)`
        }
        aria-label={`Voice input for ${fieldLabel}`}
      >
        <span className="compact-mic-icon">{isListening ? "🔴" : "🎤"}</span>
        {isListening && <span className="listening-label">Listening...</span>}
      </button>

      {/* Inline / Floating Error or Permission Alert */}
      {errorMessage && (
        <div className={`compact-error-popup ${showPermissionBanner ? "permission-alert" : ""}`}>
          <span className="popup-icon">{showPermissionBanner ? "🔒" : "⚠️"}</span>
          <span className="popup-text">{errorMessage}</span>
          <button
            type="button"
            className="popup-dismiss"
            onClick={() => {
              setErrorMessage("");
              setShowPermissionBanner(false);
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
