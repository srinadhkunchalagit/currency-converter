import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { INDIAN_LANGUAGES } from "../data/i18n.js";

const REGION_CATEGORIES = {
  all: { label: "All (23)", filter: () => true },
  popular: {
    label: "Popular (8)",
    filter: (l) => ["en", "te", "hi", "ta", "bn", "kn", "gu", "mr"].includes(l.code),
  },
  south: {
    label: "South India (4)",
    filter: (l) => ["te", "ta", "kn", "ml"].includes(l.code),
  },
  north: {
    label: "North & Central (8)",
    filter: (l) => ["hi", "pa", "ur", "ne", "sa", "ks", "mai", "doi"].includes(l.code),
  },
  east: {
    label: "East & NE (6)",
    filter: (l) => ["bn", "or", "as", "mni", "brx", "sat"].includes(l.code),
  },
  west: {
    label: "West (4)",
    filter: (l) => ["gu", "mr", "kok", "sd"].includes(l.code),
  },
};

export default function Header() {
  const { t, lang, setLang } = useApp();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  const filteredLangs = useMemo(() => {
    const q = langSearch.trim().toLowerCase();
    const catMatcher = REGION_CATEGORIES[selectedCategory]?.filter || (() => true);

    return INDIAN_LANGUAGES.filter((l) => {
      const matchesCategory = q ? true : catMatcher(l);
      if (!matchesCategory) return false;

      if (!q) return true;
      return (
        l.label.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
      );
    });
  }, [langSearch, selectedCategory]);

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

          {/* Language Selector Button */}
          <button
            type="button"
            className="lang-picker-btn"
            onClick={() => setIsLangOpen(true)}
            aria-expanded={isLangOpen}
            aria-label="Select Language (23 available)"
          >
            <span className="globe-icon">🌐</span>
            <span className="current-lang-native">{currentLangObj.native}</span>
            <span className="current-lang-label">({currentLangObj.label})</span>
            <span className="lang-count-badge">23</span>
            <span className="picker-arrow">▼</span>
          </button>
        </div>
      </header>

      {/* MOBILE-FRIENDLY QUICK LANGUAGE BAR - Fully visible and accessible on mobile */}
      <nav className="mobile-lang-strip" aria-label="Language quick switcher">
        <div className="mobile-lang-strip-inner">
          <div className="mobile-lang-label">
            <span className="strip-globe">🌐</span>
            <span className="strip-text">Languages:</span>
          </div>
          <div className="mobile-lang-scroll">
            {INDIAN_LANGUAGES.map((item) => {
              const isActive = lang === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  className={`mobile-lang-chip ${isActive ? "active" : ""}`}
                  onClick={() => setLang(item.code)}
                  aria-pressed={isActive}
                  title={`${item.native} (${item.label})`}
                >
                  <span className="chip-native">{item.native}</span>
                  <span className="chip-sep">·</span>
                  <span className="chip-label">{item.label}</span>
                  {isActive && <span className="chip-active-dot">✓</span>}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="mobile-lang-viewall"
            onClick={() => setIsLangOpen(true)}
            aria-label="View all 23 languages in search dialog"
          >
            <span>All 23</span>
            <span className="viewall-arrow">▾</span>
          </button>
        </div>
      </nav>

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
                    22 Scheduled Indian Languages + English (All 23 Available)
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

            {/* Instant Search Bar */}
            <div className="lang-search-box">
              <span className="lang-search-icon">🔍</span>
              <input
                type="text"
                className="lang-filter-input"
                placeholder="Search by language (e.g. Telugu, తెలుగు, Hindi, हिन्दी, Tamil, Kannada)..."
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                autoFocus
              />
              {langSearch && (
                <button
                  type="button"
                  className="lang-search-clear"
                  onClick={() => setLangSearch("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Regional Filter Pills */}
            <div className="lang-filter-tabs">
              {Object.entries(REGION_CATEGORIES).map(([catKey, cat]) => (
                <button
                  key={catKey}
                  type="button"
                  className={`lang-tab-pill ${selectedCategory === catKey && !langSearch ? "active" : ""}`}
                  onClick={() => {
                    setSelectedCategory(catKey);
                    setLangSearch("");
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Language Count Status */}
            <div className="lang-count-row">
              <span>
                Showing <strong>{filteredLangs.length}</strong> of {INDIAN_LANGUAGES.length} languages
              </span>
              {langSearch && (
                <button
                  type="button"
                  className="lang-reset-search-btn"
                  onClick={() => setLangSearch("")}
                >
                  Show All 23
                </button>
              )}
            </div>

            {/* Complete grid of all 23 languages - Responsive & Fully Scrollable */}
            <div className="lang-list-grid">
              {filteredLangs.length === 0 ? (
                <div className="lang-no-results">
                  <p>No languages matched "{langSearch}".</p>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setLangSearch("");
                      setSelectedCategory("all");
                    }}
                  >
                    Reset Search (Show All 23)
                  </button>
                </div>
              ) : (
                filteredLangs.map((l) => {
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
                      aria-pressed={isSelected}
                    >
                      <div className="lang-option-left">
                        <span className="lang-code-badge">{l.code.toUpperCase()}</span>
                        <div className="lang-names">
                          <div className="lang-option-native">{l.native}</div>
                          <div className="lang-option-eng">{l.label}</div>
                        </div>
                      </div>
                      {isSelected ? (
                        <span className="lang-checkmark">✓ Active</span>
                      ) : (
                        <span className="lang-select-arrow">›</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="lang-modal-footer">
              <div className="lang-footer-hint">
                Current: <strong>{currentLangObj.native} ({currentLangObj.label})</strong>
              </div>
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

