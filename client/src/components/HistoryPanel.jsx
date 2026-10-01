import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { CURRENCIES } from "../data/currencies.js";
import { fmt } from "../utils/format.js";
import { amountInWords } from "../utils/numberToWords.js";
import { speakText, stopSpeaking } from "../utils/speechAssistant.js";

export default function HistoryPanel({ onLoadConversion }) {
  const { t, history, deleteHistory, clearHistory, lang } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null); // id of conversion to delete
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  function handleSpeakHistory(id, words) {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }

    if (!words) return;
    speakText(words, lang, {
      onStart: () => setSpeakingId(id),
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  }

  // Filter history by search term across all fields: code, name, amount, result, date, day, time, words
  const filteredHistory = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return history;

    return history.filter((h) => {
      const fromStr = String(h.from || "").toLowerCase();
      const fromNameStr = String(h.fromName || CURRENCIES[h.from]?.name?.en || "").toLowerCase();
      const toStr = String(h.to || "").toLowerCase();
      const toNameStr = String(h.toName || CURRENCIES[h.to]?.name?.en || "").toLowerCase();
      const amtStr = String(h.amount || "");
      const resStr = String(h.result || "");
      const wordsStr = String(h.words || "").toLowerCase();
      const dateStr = String(h.date || "").toLowerCase();
      const dayStr = String(h.day || "").toLowerCase();
      const timeStr = String(h.time || "").toLowerCase();
      const fullTimeStr = String(h.fullTimestamp || "").toLowerCase();

      return (
        fromStr.includes(q) ||
        fromNameStr.includes(q) ||
        toStr.includes(q) ||
        toNameStr.includes(q) ||
        amtStr.includes(q) ||
        resStr.includes(q) ||
        wordsStr.includes(q) ||
        dateStr.includes(q) ||
        dayStr.includes(q) ||
        timeStr.includes(q) ||
        fullTimeStr.includes(q)
      );
    });
  }, [history, searchTerm]);

  function handleConfirmDelete() {
    if (itemToDelete) {
      deleteHistory(itemToDelete);
      setItemToDelete(null);
    }
  }

  function handleConfirmClearAll() {
    clearHistory();
    setShowClearConfirm(false);
  }

  return (
    <section className="panel active" id="panel-history">
      <div className="section-head history-head-flex">
        <div>
          <h2>{t("historyHeading")}</h2>
          <p>{t("historyDesc")}</p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            className="btn-clear-all"
            onClick={() => setShowClearConfirm(true)}
          >
            🗑 {t("clearHistory") || "Clear All History"}
          </button>
        )}
      </div>

      {/* 12. Search Box in History Page */}
      {history.length > 0 && (
        <div className="history-search-bar">
          <span className="search-glass">🔍</span>
          <input
            type="text"
            className="history-search-input"
            placeholder={t("searchHistoryPlaceholder") || "Search history by code, name, amount, date, day (e.g., USD, 4900, October)..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* History Ledger List */}
      <div className="ledger">
        {history.length === 0 ? (
          <div className="empty-note">{t("noHistory")}</div>
        ) : filteredHistory.length === 0 ? (
          <div className="empty-note">{t("noHistoryMatch") || "No history records match your search."}</div>
        ) : (
          filteredHistory.map((h, i) => {
            const id = h.id || h.rawDate || h.date || i;
            const fromFlag = CURRENCIES[h.from]?.flag || "🌐";
            const toFlag = CURRENCIES[h.to]?.flag || "🌐";
            const toSymbol = CURRENCIES[h.to]?.symbol || "";

            // Use recorded words or calculate dynamically
            const wordsDisplay = h.words || amountInWords(h.result, h.to, lang);

            // Stored permanent date, day, and time
            const fullTimestamp =
              h.fullTimestamp ||
              `${h.day || ""}, ${h.date || ""} — ${h.time || ""}`.replace(/^,\s*/, "");

            return (
              <div key={id} className="ledger-card">
                <div className="ledger-card-main">
                  {/* Pair header & flags */}
                  <div className="hist-pair-headline">
                    <span className="hist-flag">{fromFlag}</span>
                    <strong className="hist-orig-amt">
                      {fmt(h.amount)} {h.from}
                    </strong>
                    <span className="hist-arrow">→</span>
                    <span className="hist-flag">{toFlag}</span>
                    <strong className="hist-conv-amt">
                      {toSymbol} {fmt(h.result)} {h.to}
                    </strong>
                  </div>

                  {/* Amount in words */}
                  {wordsDisplay && (
                    <div className="hist-words-line">
                      "{wordsDisplay}"
                    </div>
                  )}

                  {/* 11. Stored Date, Day, and exact Time */}
                  <div className="hist-timestamp-badge">
                    <span className="clock-icon">🕒</span>
                    <span>{fullTimestamp}</span>
                  </div>
                </div>

                <div className="ledger-card-actions">
                  {wordsDisplay && (
                    <button
                      type="button"
                      className={`btn-outline hist-speak-btn ${speakingId === id ? "speaking" : ""}`}
                      onClick={() => handleSpeakHistory(id, wordsDisplay)}
                      title={speakingId === id ? "Stop speaking" : "Read aloud in selected language"}
                      aria-label="Read conversion aloud"
                    >
                      {speakingId === id ? "⏹ Stop" : "🔊 Listen"}
                    </button>
                  )}

                  {onLoadConversion && (
                    <button
                      type="button"
                      className="btn-outline hist-reload-btn"
                      onClick={() => onLoadConversion(h)}
                      title="Load into Converter"
                    >
                      {t("reload") || "Reload ↺"}
                    </button>
                  )}

                  {/* 3. Delete individual conversion button */}
                  <button
                    type="button"
                    className="hist-delete-btn"
                    onClick={() => setItemToDelete(id)}
                    title={t("delete") || "Delete this conversion"}
                    aria-label="Delete conversion"
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Confirmation Dialog for Individual Delete */}
      {itemToDelete !== null && (
        <div className="confirm-modal-overlay" onClick={() => setItemToDelete(null)}>
          <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon warning">⚠️</div>
            <h3>{t("confirmDeleteTitle") || "Delete Conversion"}</h3>
            <p className="modal-msg">
              {t("confirmDeleteMsg") || "Are you sure you want to delete this conversion?"}
            </p>
            <div className="modal-btn-row">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setItemToDelete(null)}
              >
                {t("cancel") || "Cancel"}
              </button>
              <button
                type="button"
                className="btn-modal-delete"
                onClick={handleConfirmDelete}
              >
                {t("delete") || "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. Confirmation Dialog for Clear All History */}
      {showClearConfirm && (
        <div className="confirm-modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon danger">🗑</div>
            <h3>{t("confirmClearTitle") || "Clear All History"}</h3>
            <p className="modal-msg">
              {t("confirmClearMsg") || "Are you sure you want to clear all conversion history? This action cannot be undone."}
            </p>
            <div className="modal-btn-row">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShowClearConfirm(false)}
              >
                {t("cancel") || "Cancel"}
              </button>
              <button
                type="button"
                className="btn-modal-delete"
                onClick={handleConfirmClearAll}
              >
                {t("clearHistory") || "Clear All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
