import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { CURRENCIES, CODES } from "../data/currencies.js";

export default function CurrenciesPanel({ onOpenInConvert }) {
  const { t, curName, from, to, favorites, toggleFavorite } = useApp();
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const list = CODES.filter((code) => {
    if (!q) return true;
    return (
      code.toLowerCase().includes(q) || curName(code).toLowerCase().includes(q)
    );
  });

  return (
    <section className="panel active" id="panel-currencies">
      <div className="section-head">
        <h2>{t("currenciesHeading")}</h2>
        <p>{t("currenciesDesc")}</p>
      </div>
      <div className="search-row">
        <input
          type="text"
          className="std-input"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="cur-grid">
        {list.length === 0 && (
          <div className="empty-note">{t("noResults")}</div>
        )}
        {list.map((code) => {
          const isFav = favorites.some(
            (p) => p.startsWith(code + "_") || p.endsWith("_" + code),
          );
          return (
            <div className="cur-card" key={code}>
              <span className="flag">{CURRENCIES[code].flag}</span>
              <div
                className="meta"
                onClick={() => onOpenInConvert(code)}
                style={{ cursor: "pointer" }}
              >
                <strong>
                  {code} · {CURRENCIES[code].symbol}
                </strong>
                <span>{curName(code)}</span>
              </div>
              <button
                className={"star-btn" + (isFav ? " on" : "")}
                onClick={(e) => {
                  e.stopPropagation();
                  const key = code + "_" + (to === code ? from : to);
                  toggleFavorite(key);
                }}
              >
                ★
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
