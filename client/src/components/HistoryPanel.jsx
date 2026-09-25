import React from "react";
import { useApp } from "../context/AppContext.jsx";
import { CURRENCIES } from "../data/currencies.js";
import { fmt } from "../utils/format.js";

export default function HistoryPanel() {
  const { t, history, clearHistory } = useApp();

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
        <button className="btn-outline" onClick={clearHistory}>
          {t("clearHistory")}
        </button>
      </div>
      <div className="ledger">
        {history.length === 0 && (
          <div className="empty-note">{t("noHistory")}</div>
        )}
        {history.slice(0, 50).map((h, i) => {
          const dt = new Date(h.date);
          return (
            <div className="ledger-row" key={i}>
              <div className="hist-row">
                <span className="flag">{CURRENCIES[h.from]?.flag}</span>
                <span>
                  {fmt(h.amount)} {h.from}
                </span>
                <span>→</span>
                <span className="flag">{CURRENCIES[h.to]?.flag}</span>
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
