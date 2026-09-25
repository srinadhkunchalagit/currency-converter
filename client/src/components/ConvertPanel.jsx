import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { CURRENCIES, CODES } from "../data/currencies.js";
import { getLatest, getHistorical } from "../api/client.js";
import { fmt } from "../utils/format.js";

const POPULAR_PAIRS = [
  "USD_INR",
  "EUR_USD",
  "GBP_INR",
  "EUR_INR",
  "AED_INR",
  "CAD_INR",
  "AUD_INR",
  "USD_EUR",
];

export default function ConvertPanel() {
  const {
    t,
    curName,
    from,
    setFrom,
    to,
    setTo,
    amount,
    setAmount,
    favorites,
    toggleFavorite,
    addHistory,
  } = useApp();

  const [amountInput, setAmountInput] = useState(String(amount));
  const [status, setStatus] = useState({ text: t("loading"), err: false });
  const [result, setResult] = useState(null); // { converted, rateLine, inr }
  const [copied, setCopied] = useState(false);
  const [quickRates, setQuickRates] = useState({});
  const debounceRef = useRef(null);
  const lastLoggedRef = useRef(null);

  const pairKey = `${from}_${to}`;
  const isFav = favorites.includes(pairKey);

  async function runConvert() {
    setStatus((s) => ({ ...s, text: t("loading"), err: false }));
    const amt = parseFloat(amountInput) || 0;
    try {
      const latest = await getLatest(from, [to, "INR"]);
      const rate = from === to ? 1 : (latest.rates[to] || 1);
      const converted = amt * rate;

      let inr = null;
      if (to !== "INR") {
        const inrRate = from === "INR" ? 1 : (latest.rates["INR"] || 1);
        inr = amt * inrRate;
      }

      let changePct = null;
      let changeDir = "flat";
      try {
        const y = await getHistorical(from, "yesterday", to);
        const yRate = from === to ? 1 : (y.rates && y.rates[to]);
        if (yRate) {
          const pct = ((rate - yRate) / yRate) * 100;
          changePct = Math.abs(pct);
          changeDir = pct > 0.005 ? "up" : pct < -0.005 ? "down" : "flat";
        }
      } catch (e) {
        /* day-change failure is non-blocking */
      }

      setResult({ converted, rate, inr, changePct, changeDir });

      if (latest.live) {
        setStatus({ text: `${t("today")}: ${latest.date}`, err: false });
      } else {
        setStatus({ text: t("offlineNote"), err: true });
      }

      if (amt > 0) {
        const key = `${from}|${to}|${amt.toFixed(4)}`;
        if (lastLoggedRef.current !== key) {
          lastLoggedRef.current = key;
          addHistory({
            from,
            to,
            amount: amt,
            result: converted,
            date: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      setStatus({ text: t("errorFetch"), err: true });
    }
  }

  // Fetch benchmark quick rates
  useEffect(() => {
    let cancelled = false;
    getLatest("USD", ["INR", "EUR", "GBP", "AED", "CAD", "AUD"])
      .then((data) => {
        if (cancelled || !data || !data.rates) return;
        setQuickRates((prev) => ({ ...prev, USD: data.rates }));
      })
      .catch(() => {});
    getLatest("EUR", ["USD", "INR"])
      .then((data) => {
        if (cancelled || !data || !data.rates) return;
        setQuickRates((prev) => ({ ...prev, EUR: data.rates }));
      })
      .catch(() => {});
    getLatest("GBP", ["INR"])
      .then((data) => {
        if (cancelled || !data || !data.rates) return;
        setQuickRates((prev) => ({ ...prev, GBP: data.rates }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-run whenever from/to changes, or amount settles after debounce.
  useEffect(() => {
    runConvert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, amount]);

  // Keep input synchronized if amount changed externally (e.g. from history load)
  useEffect(() => {
    setAmountInput(String(amount));
  }, [amount]);

  // Background auto-refresh every 60s + refresh on tab focus
  useEffect(() => {
    const interval = setInterval(runConvert, 60000);
    const onFocus = () => runConvert();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  function onAmountChange(e) {
    const val = e.target.value;
    setAmountInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setAmount(parseFloat(val) || 0);
    }, 350);
  }

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function copyResult() {
    if (!result) return;
    const text = `${amountInput} ${from} = ${fmt(result.converted)} ${to} (1 ${from} = ${fmt(result.rate, 4)} ${to})`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  // Combined unique pairs list
  const combinedPairs = Array.from(
    new Set([...favorites, ...POPULAR_PAIRS]),
  ).filter((pair) => {
    const [f, tt] = pair.split("_");
    return CURRENCIES[f] && CURRENCIES[tt];
  });

  return (
    <section className="panel active" id="panel-convert">
      <div className="hero">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div className="fav-row" style={{ marginBottom: 0 }}>
            {favorites.map((pair) => {
              const [f, tt] = pair.split("_");
              if (!CURRENCIES[f] || !CURRENCIES[tt]) return null;
              return (
                <button
                  key={pair}
                  className="fav-chip"
                  onClick={() => {
                    setFrom(f);
                    setTo(tt);
                  }}
                >
                  {CURRENCIES[f].flag} {f} → {CURRENCIES[tt].flag} {tt}
                </button>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11.5,
              color: "rgba(237, 230, 211, 0.8)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: status.err ? "#F0BBAF" : "#8FD9A0",
                display: "inline-block",
              }}
            />
            <span>{status.err ? t("statusOffline") : t("statusLive")}</span>
          </div>
        </div>

        <div className="convert-grid">
          <div className="field">
            <label>{t("fromLabel")}</label>
            <div className="cur-select">
              <span className="flag">{CURRENCIES[from].flag}</span>
              <select value={from} onChange={(e) => setFrom(e.target.value)}>
                {CODES.map((code) => (
                  <option key={code} value={code}>
                    {code} — {curName(code)}
                  </option>
                ))}
              </select>
              <button
                className={"star-btn" + (isFav ? " on" : "")}
                title="Save as favorite pair"
                onClick={() => toggleFavorite(pairKey)}
              >
                ★
              </button>
            </div>
            <input
              type="text"
              inputMode="decimal"
              className="amount-input"
              value={amountInput}
              onChange={onAmountChange}
            />
          </div>

          <button className="swap-btn" title="Swap currencies" onClick={swap}>
            ⇄
          </button>

          <div className="field">
            <label>{t("toLabel")}</label>
            <div className="cur-select">
              <span className="flag">{CURRENCIES[to].flag}</span>
              <select value={to} onChange={(e) => setTo(e.target.value)}>
                {CODES.map((code) => (
                  <option key={code} value={code}>
                    {code} — {curName(code)}
                  </option>
                ))}
              </select>
              <span style={{ width: 26 }} />
            </div>
            <div className="amount-input" style={{ opacity: 0.85 }}>
              {result ? `${CURRENCIES[to].symbol} ${fmt(result.converted)}` : "—"}
            </div>
          </div>
        </div>

        <div className="result-block">
          <div>
            <div className="result-figure">
              {result ? `${CURRENCIES[to].symbol} ${fmt(result.converted)}` : "—"}
            </div>
            <div className="result-currency-name">{curName(to)}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {result && (
              <button
                className={"copy-btn" + (copied ? " copied" : "")}
                onClick={copyResult}
                title="Copy conversion result"
              >
                {copied ? "✓ Copied" : "📋 Copy"}
              </button>
            )}
            {result && to !== "INR" && result.inr !== null && (
              <div className="inr-badge" style={{ display: "flex" }}>
                <span className="coin">₹</span>
                <span className="val">₹ {fmt(result.inr)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rate-line">
          {result && (
            <>
              <span>
                {t("rateSentence")(1, from, fmt(result.rate, 4), to)}
              </span>
              {result.changePct !== null && (
                <>
                  {" "}
                  <span
                    className={
                      "chg-pill " +
                      (result.changeDir === "up"
                        ? "chg-up"
                        : result.changeDir === "down"
                          ? "chg-down"
                          : "chg-flat")
                    }
                  >
                    {result.changeDir === "up"
                      ? "▲"
                      : result.changeDir === "down"
                        ? "▼"
                        : "●"}{" "}
                    {fmt(result.changePct, 2)}%
                  </span>{" "}
                  <span style={{ fontSize: 12 }}>
                    {result.changeDir === "up"
                      ? t("moreThan")
                      : result.changeDir === "down"
                        ? t("lessThan")
                        : t("flatChange")}
                  </span>
                </>
              )}
            </>
          )}
        </div>
        <div className={"status-msg" + (status.err ? " err" : "")}>
          {status.text}
          {status.err && (
            <button
              className="btn-outline"
              style={{ padding: "3px 9px", fontSize: 11.5, marginLeft: 6 }}
              onClick={runConvert}
            >
              {t("retry")}
            </button>
          )}
        </div>
      </div>

      <div className="section-head">
        <h2>{t("quickFavHeading")}</h2>
        <p>{t("quickFavDesc")}</p>
      </div>

      <div className="quick-pair-grid">
        {combinedPairs.map((pair) => {
          const [f, tt] = pair.split("_");
          const isCurrent = from === f && to === tt;
          const pairIsFav = favorites.includes(pair);
          const rateVal =
            f === from && tt === to && result
              ? result.rate
              : quickRates[f] && quickRates[f][tt]
                ? quickRates[f][tt]
                : null;

          return (
            <div
              key={pair}
              className={"quick-pair-card" + (isCurrent ? " active-pair" : "")}
              onClick={() => {
                setFrom(f);
                setTo(tt);
              }}
            >
              <div className="quick-pair-info">
                <div className="quick-pair-names">
                  <span>{CURRENCIES[f].flag} {f}</span>
                  <span>→</span>
                  <span>{CURRENCIES[tt].flag} {tt}</span>
                </div>
                <div className="quick-pair-rate">
                  {rateVal ? `1 ${f} ≈ ${fmt(rateVal, 4)} ${tt}` : `${curName(f)} → ${curName(tt)}`}
                </div>
              </div>
              <button
                className={"star-btn" + (pairIsFav ? " on" : "")}
                title="Toggle favorite"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(pair);
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
