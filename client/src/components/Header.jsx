import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { INDIAN_LANGUAGES } from "../data/i18n.js";

export default function Header() {
  const { t, lang, setLang } = useApp();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const langDropdownRef = useRef(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    }
    if (isLangOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLangOpen]);

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

        {/* 7. Comprehensive 22 Scheduled Indian Languages Selector */}
        <div className="lang-selector-container" ref={langDropdownRef}>
          <button
            type="button"
            className="lang-picker-btn"
            onClick={() => setIsLangOpen((prev) => !prev)}
            aria-expanded={isLangOpen}
            aria-label="Select Language"
          >
            <span className="globe-icon">🌐</span>
            <span className="current-lang-native">{currentLangObj.native}</span>
            <span className="current-lang-label">({currentLangObj.label})</span>
            <span className="picker-arrow">{isLangOpen ? "▲" : "▼"}</span>
          </button>

          {isLangOpen && (
            <div className="lang-menu-dropdown">
              <div className="lang-menu-header">
                <span className="lang-menu-title">
                  22 Scheduled Languages of India
                </span>
                <button
                  type="button"
                  className="lang-close-btn"
                  onClick={() => setIsLangOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="lang-search-box">
                <input
                  type="text"
                  className="lang-filter-input"
                  placeholder="Filter languages (e.g., Telugu, Hindi, Tamil)..."
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Quick high-frequency tabs */}
              {!langSearch && (
                <div className="lang-popular-row">
                  {["en", "te", "hi", "ta", "bn", "kn", "gu"].map((code) => {
                    const l = INDIAN_LANGUAGES.find((item) => item.code === code);
                    if (!l) return null;
                    return (
                      <button
                        key={code}
                        type="button"
                        className={`lang-quick-chip ${lang === code ? "active" : ""}`}
                        onClick={() => {
                          setLang(code);
                          setIsLangOpen(false);
                        }}
                      >
                        {l.native}
                      </button>
                    );
                  })}
                </div>
              )}

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
                      {isSelected && <span className="lang-checkmark">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
