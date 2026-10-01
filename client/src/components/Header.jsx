import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { INDIAN_LANGUAGES } from "../data/i18n.js";

export default function Header() {
  const { t, lang, setLang } = useApp();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const [liveTime, setLiveTime] = useState(new Date());

  // Live ticking clock updated every second
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time in Indian Standard Time (IST) where today is October 2, 2026
  const istDateString = liveTime.toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const istTimeString = liveTime.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const currentLangObj =
    INDIAN_LANGUAGES.find((l) => l.code === lang) || INDIAN_LANGUAGES[0];

  const filteredLangs = INDIAN_LANGUAGES.filter((l) => {
    const q = langSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      l.label.toLowerCase().includes(q) ||
      l.native.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* 1. Designed and Directed by Srinadh Kunchala Banner */}
      <div className="top-author-banner">
        <span className="author-sparkle">✦</span>
        <span className="author-text">Designed and Directed by Srinadh Kunchala</span>
        <span className="author-sparkle">✦</span>
      </div>

      <header className="top">
        <div className="brand">
          <div className="brand-mark">₹</div>
          <div>
            <h1>{t("appTitle")}</h1>
            <div className="tagline">{t("tagline")}</div>
          </div>
        </div>

        <div className="header-right-tools">
          {/* Live Date & Time Display (Ticking Live, Oct 2, 2026 IST) */}
          <div className="live-clock-badge" title="Live Indian Standard Time (IST)">
            <span className="live-pulse-dot" />
            <div className="clock-details">
              <div className="clock-date">📅 {istDateString}</div>
              <div className="clock-time">
                ⏰ {istTimeString} <span className="tz-tag">IST</span>
              </div>
            </div>
          </div>

          {/* 7. Language Selector Button */}
          <button
            type="button"
            className="lang-picker-btn"
            onClick={() => setIsLangOpen(true)}
            aria-expanded={isLangOpen}
            aria-label="Select Language"
          >
            <span className="globe-icon">🌐</span>
            <span className="current-lang-native">{currentLangObj.native}</span>
            <span className="current-lang-label">({currentLangObj.label})</span>
            <span className="picker-arrow">▼</span>
          </button>
        </div>
      </header>

      {/* 100% VISIBLE FULL-SCREEN LANGUAGE MODAL (All 22 Scheduled Indian Languages + English) */}
      {isLangOpen && (
        <div
          className="lang-modal-backdrop"
          onClick={() => setIsLangOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="lang-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="lang-modal-top">
              <div className="lang-modal-title-wrap">
                <span className="lang-modal-icon">🌐</span>
                <div>
                  <h3 className="lang-modal-title">Select App Language</h3>
                  <div className="lang-modal-subtitle">
                    22 Scheduled Languages of India • 22 భారతీయ భాషలు
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="lang-modal-close"
                onClick={() => setIsLangOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="lang-search-box">
              <span className="lang-search-icon">🔍</span>
              <input
                type="text"
                className="lang-filter-input"
                placeholder="Search language (e.g., Telugu, Hindi, Tamil, Kannada)..."
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                autoFocus
              />
              {langSearch && (
                <button
                  type="button"
                  className="lang-search-clear"
                  onClick={() => setLangSearch("")}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick high-frequency language tabs */}
            <div className="lang-popular-section">
              <span className="lang-pills-label">Quick select:</span>
              <div className="lang-popular-row">
                {[
                  { code: "en", label: "English" },
                  { code: "te", label: "తెలుగు (Telugu)" },
                  { code: "hi", label: "हिन्दी (Hindi)" },
                  { code: "ta", label: "தமிழ் (Tamil)" },
                  { code: "bn", label: "বাংলা (Bengali)" },
                  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
                  { code: "gu", label: "ગુજરાતી (Gujarati)" },
                  { code: "mr", label: "मराठी (Marathi)" },
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    className={`lang-quick-chip ${lang === item.code ? "active" : ""}`}
                    onClick={() => {
                      setLang(item.code);
                      setIsLangOpen(false);
                      setLangSearch("");
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Complete grid of all 22 languages */}
            <div className="lang-list-grid">
              {filteredLangs.map((l) => {
                const isSelected = l.code === lang;
                return (
                  <button
                    key={l.code}
                    type="button"
                    className={`lang-option-card ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setLang(l.code);
                      setIsLangOpen(false);
                      setLangSearch("");
                    }}
                  >
                    <div className="lang-option-native">{l.native}</div>
                    <div className="lang-option-eng">{l.label}</div>
                    {isSelected && <span className="lang-checkmark">✓ Selected</span>}
                  </button>
                );
              })}
            </div>

            <div className="lang-modal-footer">
              <button
                type="button"
                className="btn-modal-close-lang"
                onClick={() => setIsLangOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
