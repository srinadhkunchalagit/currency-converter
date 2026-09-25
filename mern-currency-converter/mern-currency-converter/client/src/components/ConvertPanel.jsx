import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { CURRENCIES, CODES } from "../data/currencies.js";
import { getLatest, getHistorical } from "../api/client.js";
import { fmt } from "../utils/format.js";

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
  const debounceRef = useRef(null);
  const lastLoggedRef = useRef(null);

  const pairKey = `${from}_${to}`;
  const isFav = favorites.includes(pairKey);

  async function runConvert() {
    setStatus((s) => ({ ...s, text: t("loading"), err: false }));
    const amt = parseFloat(amountInput) || 0;
    try {
      const latest = await getLatest(from, [to, "INR"]);
      const rate = from === to ? 1 : latest.rates[to];
      const converted = amt * rate;

      let inr = null;
      if (to !== "INR") {
        const inrRate = from === "INR" ? 1 : latest.rates["INR"];
        inr = amt * inrRate;
      }

      let changePct = null;
      let changeDir = "flat";
      try {
        const y = await getHistorical(from, "yesterday", to);
        const yRate = from === to ? 1 : y.rates[to];
        if (yRate) {
          const pct = ((rate - yRate) / yRate) * 100;
          changePct = Math.abs(pct);
          changeDir = pct > 0.005 ? "up" : pct < -0.005 ? "down" : "flat";
        }
      } catch (e) {
        /* ignore day-change failure, as in the original app */
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

  // Re-run whenever from/to changes, or amount settles after debounce.
  useEffect(() => {
    runConvert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, amount]);

  // Background auto-refresh every 60s + refresh on tab focus, like the original app.
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
          {result && to !== "INR" && result.inr !== null && (
            <div className="inr-badge" style={{ display: "flex" }}>
              <span className="coin">₹</span>
              <span className="val">₹ {fmt(result.inr)}</span>
            </div>
          )}
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
    </section>
  );
}
