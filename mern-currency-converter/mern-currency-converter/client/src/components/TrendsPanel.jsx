import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { CODES } from "../data/currencies.js";
import { getLatest, getHistorical, getSeries } from "../api/client.js";
import { fmt } from "../utils/format.js";

function Sparkline({ values }) {
  if (!values || values.length < 2) {
    return (
      <svg
        className="spark"
        viewBox="0 0 400 70"
        preserveAspectRatio="none"
      />
    );
  }
  const w = 400,
    h = 70,
    pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - 2 * pad);
      const y = h - pad - ((v - min) / range) * (h - 2 * pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const up = values[values.length - 1] >= values[0];
  const color = up ? "#1F5D4C" : "#8C3B2E";
  return (
    <svg className="spark" viewBox="0 0 400 70" preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TrendsPanel() {
  const { t, curName, from: globalFrom, to: globalTo } = useApp();
  const [trendFrom, setTrendFrom] = useState(globalFrom);
  const [trendTo, setTrendTo] = useState(globalTo);
  const [cards, setCards] = useState(null);
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);

  async function run() {
    setLoading(true);
    setErrored(false);
    setSeries(null);
    try {
      const today = await getLatest(trendFrom, [trendTo]);
      const safeHist = (shorthand) =>
        getHistorical(trendFrom, shorthand, trendTo).catch(() => null);
      const [yest, week, month] = await Promise.all([
        safeHist("yesterday"),
        safeHist("week"),
        safeHist("month"),
      ]);
      const rToday = trendFrom === trendTo ? 1 : today.rates[trendTo];
      const rYest = trendFrom === trendTo ? 1 : yest && yest.rates[trendTo];
      const rWeek = trendFrom === trendTo ? 1 : week && week.rates[trendTo];
      const rMonth =
        trendFrom === trendTo ? 1 : month && month.rates[trendTo];

      setCards([
        { lbl: t("today"), rate: rToday, base: null },
        { lbl: t("yesterday"), rate: rYest, base: rToday },
        { lbl: t("weekAgo"), rate: rWeek, base: rToday },
        { lbl: t("monthAgo"), rate: rMonth, base: rToday },
      ]);

      try {
        const s = await getSeries(trendFrom, trendTo, 30);
        const dates = Object.keys(s.rates || {}).sort();
        const vals = dates
          .map((d) => (trendFrom === trendTo ? 1 : s.rates[d][trendTo]))
          .filter((v) => v !== undefined);
        setSeries(vals);
      } catch (e) {
        /* sparkline is optional */
      }
    } catch (e) {
      setErrored(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendFrom, trendTo]);

  return (
    <section className="panel active" id="panel-trends">
      <div className="section-head">
        <h2>{t("trendsHeading")}</h2>
        <p>{t("trendsDesc")}</p>
      </div>
      <div className="multi-top">
        <div className="field">
          <label>{t("fromLabel")}</label>
          <select
            className="std-select"
            value={trendFrom}
            onChange={(e) => setTrendFrom(e.target.value)}
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
            value={trendTo}
            onChange={(e) => setTrendTo(e.target.value)}
          >
            {CODES.map((code) => (
              <option key={code} value={code}>
                {code} — {curName(code)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="trend-grid">
        {loading && <div className="empty-note">{t("loading")}</div>}
        {!loading && errored && (
          <div className="empty-note">{t("errorFetch")}</div>
        )}
        {!loading &&
          !errored &&
          cards &&
          cards.map((c) => {
            let deltaCls = null;
            let arrow = null;
            let pct = null;
            if (c.base !== null && c.rate) {
              pct = ((c.base - c.rate) / c.rate) * 100;
              deltaCls = pct > 0.005 ? "up" : pct < -0.005 ? "down" : "flat";
              arrow = pct > 0.005 ? "▲" : pct < -0.005 ? "▼" : "●";
            }
            return (
              <div className="trend-card" key={c.lbl}>
                <div className="lbl">{c.lbl}</div>
                <div className="rate">{fmt(c.rate, 4)}</div>
                {deltaCls && (
                  <div className={`delta ${deltaCls}`}>
                    {arrow} {fmt(Math.abs(pct), 2)}%
                  </div>
                )}
              </div>
            );
          })}
      </div>
      <div className="ledger" style={{ padding: "16px 18px" }}>
        <Sparkline values={series} />
        <div className="fees-note">{t("trendChartNote")}</div>
      </div>
    </section>
  );
}
