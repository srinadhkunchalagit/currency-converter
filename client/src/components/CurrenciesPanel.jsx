import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { CURRENCIES, CODES } from "../data/currencies.js";

export default function CurrenciesPanel({ onOpenInConvert, onOpenAsTo }) {
  const { t, curName, from, to, favorites, toggleFavorite, multiTargets, toggleMultiTarget } = useApp();
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const list = CODES.filter((code) => {
    if (!q) return true;
    const cur = CURRENCIES[code];
    return (
      code.toLowerCase().includes(q) ||
      curName(code).toLowerCase().includes(q) ||
      (cur && cur.symbol && cur.symbol.toLowerCase().includes(q))
    );
  });

  return (
    <section className="panel active" id="panel-currencies">
      <div className="section-head">
        <h2>{t("currenciesHeading")}</h2>
        <p>{t("currenciesDesc")}</p>
      </div>
      <div className="search-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <input
          type="text"
          className="std-input"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
          Showing <strong>{list.length}</strong> of {CODES.length} currencies
        </div>
      </div>

      <div className="cur-grid">
        {list.length === 0 && (
          <div className="empty-note">{t("noResults")}</div>
        )}
        {list.map((code) => {
          const cur = CURRENCIES[code];
          const isFrom = from === code;
          const isTo = to === code;
          const isFav = favorites.some(
            (p) => p.startsWith(code + "_") || p.endsWith("_" + code),
          );
          const isMulti = multiTargets.includes(code);

          return (
            <div
              className={"cur-card" + (isFrom || isTo ? " active-pair" : "")}
              key={code}
              onClick={() => onOpenInConvert(code)}
            >
              <span className="flag">{cur.flag}</span>
              <div className="meta" style={{ flex: 1 }}>
                <strong>
                  {code} · {cur.symbol}
                </strong>
                <span>{curName(code)}</span>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <button
                    className="btn-outline"
                    style={{ padding: "2px 6px", fontSize: 10.5 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenInConvert(code);
                    }}
                    title="Set as source currency"
                  >
                    As From
                  </button>
                  <button
                    className="btn-outline"
                    style={{ padding: "2px 6px", fontSize: 10.5 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenAsTo) onOpenAsTo(code);
                    }}
                    title="Set as target currency"
                  >
                    As To
                  </button>
                  <button
                    className={"btn-outline" + (isMulti ? " active" : "")}
                    style={{
                      padding: "2px 6px",
                      fontSize: 10.5,
                      background: isMulti ? "var(--green)" : "#fff",
                      color: isMulti ? "var(--paper)" : "var(--ink)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMultiTarget(code);
                    }}
                    title="Toggle in Multi-convert list"
                  >
                    {isMulti ? "✓ Multi" : "+ Multi"}
                  </button>
                </div>
              </div>
              <button
                className={"star-btn" + (isFav ? " on" : "")}
                title="Star favorite"
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
