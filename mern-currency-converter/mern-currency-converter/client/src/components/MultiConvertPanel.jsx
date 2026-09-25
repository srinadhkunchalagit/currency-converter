import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { CURRENCIES, CODES } from "../data/currencies.js";
import { getLatest } from "../api/client.js";
import { fmt } from "../utils/format.js";

export default function MultiConvertPanel() {
  const { t, curName, from, setFrom, multiTargets, toggleMultiTarget } =
    useApp();

  const [amountInput, setAmountInput] = useState("1000");
  const [amount, setAmount] = useState(1000);
  const [chipFilter, setChipFilter] = useState("");
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const debounceRef = useRef(null);

  async function run() {
    setLoading(true);
    setErrored(false);
    try {
      const latest = await getLatest(from, [...multiTargets, "INR"]);
      const inrRate = from === "INR" ? 1 : latest.rates["INR"];
      const next = multiTargets.map((code) => {
        const rate = code === from ? 1 : latest.rates[code];
        return {
          code,
          value: amount * (rate || 0),
          inr: amount * (inrRate || 0),
        };
      });
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
  }, [from, amount, multiTargets]);

  function onAmountChange(e) {
    const val = e.target.value;
    setAmountInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setAmount(parseFloat(val) || 0);
    }, 350);
  }

  const q = chipFilter.trim().toLowerCase();
  const selectedCodes = CODES.filter((c) => multiTargets.includes(c));
  const restCodes = CODES.filter((c) => {
    if (multiTargets.includes(c)) return false;
    if (!q) return true;
    return c.toLowerCase().includes(q) || curName(c).toLowerCase().includes(q);
  });
  const chipList = [...selectedCodes, ...restCodes];

  return (
    <section className="panel active" id="panel-multi">
      <div className="section-head">
        <h2>{t("multiHeading")}</h2>
        <p>{t("multiDesc")}</p>
      </div>
      <div className="multi-top">
        <div className="field">
          <label>{t("amountLabel")}</label>
          <input
            type="text"
            inputMode="decimal"
            className="std-input"
            value={amountInput}
            onChange={onAmountChange}
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
      </div>
      <div className="search-row">
        <input
          type="text"
          className="std-input"
          placeholder={t("searchPlaceholder")}
          value={chipFilter}
          onChange={(e) => setChipFilter(e.target.value)}
        />
      </div>
      <div className="chip-wrap">
        {chipList.length === 0 && (
          <div className="empty-note">{t("noResults")}</div>
        )}
        {chipList.map((code) => (
          <button
            key={code}
            className={
              "chip-toggle" + (multiTargets.includes(code) ? " on" : "")
            }
            title={curName(code)}
            onClick={() => toggleMultiTarget(code)}
          >
            {CURRENCIES[code].flag} {code}
          </button>
        ))}
      </div>
      <div className="ledger">
        {loading && <div className="empty-note">{t("loading")}</div>}
        {!loading && errored && (
          <div className="empty-note">{t("errorFetch")}</div>
        )}
        {!loading && !errored && rows && rows.length === 0 && (
          <div className="empty-note">{t("noResults")}</div>
        )}
        {!loading &&
          !errored &&
          rows &&
          rows.map((r) => (
            <div className="ledger-row" key={r.code}>
              <div className="multi-result-row">
                <span className="flag">{CURRENCIES[r.code].flag}</span>
                <div>
                  <div className="multi-result-amt">
                    {CURRENCIES[r.code].symbol} {fmt(r.value)}
                  </div>
                  <div className="multi-result-code">
                    {r.code} · {curName(r.code)}
                  </div>
                </div>
                {r.code !== "INR" && (
                  <div className="multi-result-inr">≈ ₹ {fmt(r.inr)}</div>
                )}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
