import React, { useState, useMemo, useRef, useEffect } from "react";
import { CURRENCIES, CODES } from "../data/currencies.js";

// Common country & alternative query mappings to currencies
const COUNTRY_MAP = {
  INR: ["india", "bharat", "hindustan", "rupee", "inr"],
  USD: ["united states", "usa", "america", "us", "dollar", "usd"],
  GBP: ["united kingdom", "uk", "britain", "england", "scotland", "wales", "pound", "sterling", "gbp"],
  EUR: ["europe", "european union", "eu", "germany", "france", "italy", "spain", "netherlands", "belgium", "ireland", "austria", "portugal", "greece", "euro", "eur"],
  JPY: ["japan", "tokyo", "yen", "jpy"],
  CAD: ["canada", "canadian", "cad"],
  AUD: ["australia", "aussie", "sydney", "melbourne", "aud"],
  AED: ["united arab emirates", "uae", "dubai", "abu dhabi", "dirham", "aed"],
  SAR: ["saudi arabia", "riyadh", "riyal", "sar"],
  SGD: ["singapore", "sgd"],
  CHF: ["switzerland", "swiss", "zurich", "geneva", "franc", "chf"],
  CNY: ["china", "chinese", "beijing", "yuan", "renminbi", "cny"],
  HKD: ["hong kong", "hkd"],
  NZD: ["new zealand", "kiwi", "auckland", "nzd"],
  KRW: ["south korea", "korea", "seoul", "won", "krw"],
  THB: ["thailand", "thai", "bangkok", "baht", "thb"],
  MYR: ["malaysia", "kuala lumpur", "ringgit", "myr"],
  IDR: ["indonesia", "jakarta", "rupiah", "idr"],
  PHP: ["philippines", "manila", "peso", "php"],
  PKR: ["pakistan", "pakistani", "islamabad", "karachi", "pkr"],
  BDT: ["bangladesh", "dhaka", "taka", "bdt"],
  LKR: ["sri lanka", "colombo", "rupee", "lkr"],
  NPR: ["nepal", "kathmandu", "nepalese", "npr"],
  RUB: ["russia", "russian", "moscow", "ruble", "rub"],
  TRY: ["turkey", "turkish", "istanbul", "lira", "try"],
  BRL: ["brazil", "brazilian", "real", "brl"],
  ZAR: ["south africa", "rand", "zar"],
  MXN: ["mexico", "mexican", "peso", "mxn"],
  QAR: ["qatar", "doha", "riyal", "qar"],
  KWD: ["kuwait", "dinar", "kwd"],
  BHD: ["bahrain", "dinar", "bhd"],
  OMR: ["oman", "rial", "omr"],
};

export default function SearchableCurrencySelect({
  value,
  onChange,
  label = "Select Currency",
  curName,
  t,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  // Filtered list
  const filteredCodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CODES;

    return CODES.filter((code) => {
      // 1. Match code
      if (code.toLowerCase().includes(q)) return true;

      // 2. Match localized name or English name
      const localized = (curName ? curName(code) : "").toLowerCase();
      if (localized.includes(q)) return true;
      const engName = (CURRENCIES[code]?.name?.en || "").toLowerCase();
      if (engName.includes(q)) return true;

      // 3. Match country synonyms
      const synonyms = COUNTRY_MAP[code];
      if (synonyms && synonyms.some((syn) => syn.includes(q))) return true;

      return false;
    });
  }, [search, curName]);

  const selectedCurr = CURRENCIES[value] || { flag: "🌐", symbol: "" };
  const localizedTitle = curName ? curName(value) : CURRENCIES[value]?.name?.en || value;

  return (
    <div className="searchable-cur-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="cur-select-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={label}
      >
        <span className="cur-flag">{selectedCurr.flag}</span>
        <div className="cur-info">
          <span className="cur-code">{value}</span>
          <span className="cur-name-inline">{localizedTitle}</span>
        </div>
        <span className="cur-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="cur-dropdown-backdrop" onClick={() => setIsOpen(false)}>
          <div className="cur-dropdown-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cur-dropdown-header">
              <div className="cur-search-bar">
                <span className="search-icon">🔍</span>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="cur-search-input"
                  placeholder={t("searchCurrenciesPlaceholder") || "Search currencies (INR, USD, India)..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => setSearch("")}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="button"
                className="cur-dropdown-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Quick popular shortcuts if search is empty */}
            {!search && (
              <div className="cur-quick-pills">
                {["INR", "USD", "EUR", "GBP", "AED", "CAD", "AUD", "JPY", "SGD"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`cur-quick-pill ${c === value ? "active" : ""}`}
                    onClick={() => {
                      onChange(c);
                      setIsOpen(false);
                    }}
                  >
                    {CURRENCIES[c]?.flag} {c}
                  </button>
                ))}
              </div>
            )}

            <div className="cur-list-scroll">
              {filteredCodes.length === 0 ? (
                <div className="cur-no-results">
                  {t("noResults") || "No currencies match your search."}
                </div>
              ) : (
                filteredCodes.map((code) => {
                  const item = CURRENCIES[code] || {};
                  const isSelected = code === value;
                  const name = curName ? curName(code) : item.name?.en || code;
                  return (
                    <button
                      key={code}
                      type="button"
                      className={`cur-list-item ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        onChange(code);
                        setIsOpen(false);
                      }}
                    >
                      <span className="item-flag">{item.flag || "🌐"}</span>
                      <div className="item-details">
                        <div className="item-line1">
                          <strong className="item-code">{code}</strong>
                          <span className="item-symbol">{item.symbol}</span>
                        </div>
                        <div className="item-line2">{name}</div>
                      </div>
                      {isSelected && <span className="item-check">✓</span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
