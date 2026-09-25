import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { CURRENCIES, CODES } from "../data/currencies.js";
import { getLatest } from "../api/client.js";
import { fmt } from "../utils/format.js";

const PROVIDERS = [
  { name: "Wise", markup: 0.0055, type: "Digital Specialist", badge: "Lowest Fee" },
  { name: "Revolut (standard hours)", markup: 0.006, type: "Fintech App", badge: "Fast" },
  { name: "Western Union", markup: 0.028, type: "Cash & Wire", badge: "Cash Pickup" },
  { name: "High-street bank", markup: 0.035, type: "Traditional Bank", badge: "Standard Wire" },
  { name: "PayPal", markup: 0.042, type: "Online Gateway", badge: "Convenience" },
];

export default function FeesPanel() {
  const { t, from, setFrom, to, setTo, amount, setAmount, curName } = useApp();
  const [feeAmount, setFeeAmount] = useState(String(amount || 1000));
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);

  async function run() {
    setLoading(true);
    setErrored(false);
    const amt = parseFloat(feeAmount) || 0;
    try {
      const latest = await getLatest(from, [to]);
      const mid = from === to ? 1 : (latest.rates[to] || 1);
      const next = PROVIDERS.map((p) => {
        const effRate = mid * (1 - p.markup);
        const receive = amt * effRate;
        const totalFee = amt * mid * p.markup;
        return { ...p, effRate, receive, totalFee };
      }).sort((a, b) => b.receive - a.receive);
      setRows(next);
    } catch (e) {
      setErrored(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, feeAmount]);

  // Keep local input in sync if global amount changed
  useEffect(() => {
    if (amount) setFeeAmount(String(amount));
  }, [amount]);

  const bankRow = rows ? rows.find((r) => r.name === "High-street bank") : null;
  const bestRow = rows && rows.length ? rows[0] : null;
  const savings =
    bankRow && bestRow && bestRow.receive > bankRow.receive
      ? bestRow.receive - bankRow.receive
      : 0;

  return (
    <section className="panel active" id="panel-fees">
      <div className="section-head">
        <h2>{t("feesHeading")}</h2>
        <p>{t("feesDesc")}</p>
      </div>

      <div className="multi-top">
        <div className="field">
          <label>{t("amountLabel")}</label>
          <input
            type="text"
            inputMode="decimal"
            className="std-input"
            value={feeAmount}
            onChange={(e) => {
              setFeeAmount(e.target.value);
              const n = parseFloat(e.target.value);
              if (n > 0) setAmount(n);
            }}
          />
        </div>
        <div className="field">
          <label>{t("fromLabel")}</label>
          <select
            className="std-select"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          >
            {CODES.map((code) => (
              <option key={code} value={code}>
                {code} — {curName(code)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>{t("toLabel")}</label>
          <select
            className="std-select"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          >
            {CODES.map((code) => (
              <option key={code} value={code}>
                {code} — {curName(code)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {savings > 0 && (
        <div
          style={{
            background: "rgba(31, 93, 76, 0.08)",
            border: "1px solid var(--green)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 16,
            fontSize: 13,
            color: "var(--ink)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>💡</span>
          <span>
            You could receive up to <strong>{CURRENCIES[to]?.symbol} {fmt(savings)}</strong> more by choosing <strong>{bestRow?.name}</strong> instead of a traditional high-street bank!
          </span>
        </div>
      )}

      <table className="fees">
        <thead>
          <tr>
            <th>{t("provider")}</th>
            <th>{t("markup")}</th>
            <th>{t("effRate")}</th>
            <th>{t("youReceive")}</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={4} className="empty-note">
                {t("loading")}
              </td>
            </tr>
          )}
          {!loading && errored && (
            <tr>
              <td colSpan={4} className="empty-note">
                {t("errorFetch")}
              </td>
            </tr>
          )}
          {!loading &&
            !errored &&
            rows &&
            rows.map((r, i) => (
              <tr key={r.name}>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{r.type}</div>
                </td>
                <td>{(r.markup * 100).toFixed(2)}%</td>
                <td>{fmt(r.effRate, 4)}</td>
                <td className={i === 0 ? "best" : ""}>
                  <div style={{ fontWeight: 700 }}>
                    {CURRENCIES[to]?.symbol} {fmt(r.receive)}
                  </div>
                  {i === 0 && (
                    <span
                      style={{
                        fontSize: 10.5,
                        background: "rgba(31, 93, 76, 0.15)",
                        color: "var(--green)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontWeight: 700,
                      }}
                    >
                      Best Value
                    </span>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="fees-note">{t("feesNote")}</div>
    </section>
  );
}
