import React, { useState, useRef, useEffect } from "react";
import { parseSpokenAmount } from "../utils/voiceParser.js";

export { parseSpokenAmount };

export default function VoiceInputButton({
  onAmountRecognized,
  t,
  lang = "en",
  fieldLabel = "Amount",
}) {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const recognitionRef = useRef(null);

  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          /* ignore */
        }
      }
    };
  }, []);

  function startListening() {
    setErrorMessage("");
    if (!SpeechRecognition) {
      setErrorMessage(
        t("voiceUnsupported") || "Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.",
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;

      // Locale mapping for the selected language so speech recognition listens in that language
      const langTagMap = {
        te: "te-IN",
        hi: "hi-IN",
        ta: "ta-IN",
        bn: "bn-IN",
        kn: "kn-IN",
        gu: "gu-IN",
        ml: "ml-IN",
        mr: "mr-IN",
        pa: "pa-IN",
        or: "or-IN",
        ur: "ur-IN",
        as: "as-IN",
        ne: "ne-NP",
        sa: "sa-IN",
        ks: "ks-IN",
        kok: "kok-IN",
        mai: "mai-IN",
        doi: "doi-IN",
        brx: "brx-IN",
        mni: "mni-IN",
        sat: "sat-IN",
        sd: "sd-IN",
        en: "en-IN",
      };

      recognition.lang = langTagMap[lang] || "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || "";
        const parsed = parseSpokenAmount(transcript);
        if (parsed !== null && parsed > 0) {
          onAmountRecognized(parsed);
          setIsListening(false);
        } else {
          setErrorMessage(
            `"${transcript}" — Could not detect a valid number. Please speak an amount (e.g., 4900 or 4900.32).`,
          );
          setIsListening(false);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setErrorMessage(
            t("voicePermission") ||
              "Microphone permission was denied. Please allow microphone access in your browser settings to use voice input.",
          );
        } else if (event.error !== "no-speech") {
          setErrorMessage(`Voice recognition: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      setErrorMessage(e.message || "Failed to start microphone.");
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        /* ignore */
      }
      setIsListening(false);
    }
  }

  return (
    <div className="voice-input-wrapper">
      <button
        type="button"
        className={`voice-mic-btn ${isListening ? "listening" : ""}`}
        onClick={isListening ? stopListening : startListening}
        title={
          isListening
            ? t("stopReading") || "Stop listening"
            : `${t("voiceInputTitle") || "Voice Input"} (${fieldLabel})`
        }
        aria-label={`Voice input for ${fieldLabel}`}
      >
        <span className="mic-icon">{isListening ? "🔴" : "🎙"}</span>
      </button>

      {/* Clearly visible Listening state overlay */}
      {isListening && (
        <div className="listening-toast">
          <div className="listening-waves">
            <span className="wave" />
            <span className="wave" />
            <span className="wave" />
          </div>
          <span className="listening-text">
            {t("voiceListening") || "🎙 Listening..."} Speak amount ({fieldLabel})
          </span>
          <button
            type="button"
            className="listening-cancel"
            onClick={stopListening}
          >
            ⏹ Stop
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="voice-error-toast" onClick={() => setErrorMessage("")}>
          <span>{errorMessage}</span>
          <button type="button" className="toast-dismiss">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
