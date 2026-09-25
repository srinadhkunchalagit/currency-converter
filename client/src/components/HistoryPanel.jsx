import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { CURRENCIES } from "../data/currencies.js";
import { fmt } from "../utils/format.js";

export default function HistoryPanel({ onLoadConversion }) {
  const { t, history, clearHistory } = useApp();
  const [confirmClear, setConfirmClear] = useState(false);

  function handleClear() {
    if (!confirmClear && history.length > 0) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearHistory();
    setConfirmClear(false);
  }

  return (
    <section className="panel active" id="panel-history">
      <div
        className="section-head"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <h2>{t("historyHeading")}</h2>
          <p>{t("historyDesc")}</p>
        </div>
        {history.length > 0 && (
          <button
            className="btn-outline"
            style={{
              borderColor: confirmClear ? "var(--rust)" : "var(--line-strong)",
              color: confirmClear ? "var(--rust)" : "var(--ink)",
            }}
            onClick={handleClear}
          >
            {confirmClear ? "Click again to confirm" : t("clearHistory")}
          </button>
        )}
      </div>

      <div className="ledger">
        {history.length === 0 && (
          <div className="empty-note">{t("noHistory")}</div>
        )}
        {history.slice(0, 50).map((h, i) => {
          const dt = new Date(h.date);
          return (
            <div
              className="ledger-row"
              key={i}
              style={{ cursor: onLoadConversion ? "pointer" : "default" }}
              onClick={() => {
                if (onLoadConversion) onLoadConversion(h);
              }}
            >
              <div className="hist-row" style={{ flex: 1 }}>
                <span className="flag">{CURRENCIES[h.from]?.flag || "🌐"}</span>
                <span>
                  <strong>{fmt(h.amount)}</strong> {h.from}
                </span>
                <span>→</span>
                <span className="flag">{CURRENCIES[h.to]?.flag || "🌐"}</span>
                <span className="hist-amt">
                  {CURRENCIES[h.to]?.symbol} {fmt(h.result)}
                </span>
                <span className="hist-time">
                  {dt.toLocaleDateString()}{" "}
                  {dt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {onLoadConversion && (
                <button
                  className="btn-outline"
                  style={{ padding: "4px 8px", fontSize: 11, marginLeft: 8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoadConversion(h);
                  }}
                  title="Load this conversion into Convert tab"
                >
                  Reload ↺
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
