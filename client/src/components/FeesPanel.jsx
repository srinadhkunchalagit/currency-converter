import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { CURRENCIES } from "../data/currencies.js";
import { getLatest } from "../api/client.js";
import { fmt } from "../utils/format.js";

const PROVIDERS = [
  { name: "High-street bank", markup: 0.035 },
  { name: "PayPal", markup: 0.04 },
  { name: "Western Union", markup: 0.03 },
  { name: "Wise", markup: 0.006 },
  { name: "Revolut (standard hours)", markup: 0.005 },
];

export default function FeesPanel() {
  const { t, from, to, amount } = useApp();
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);

  async function run() {
    setLoading(true);
    setErrored(false);
    try {
      const latest = await getLatest(from, [to]);
      const mid = from === to ? 1 : latest.rates[to];
      const next = PROVIDERS.map((p) => {
        const effRate = mid * (1 - p.markup);
        const receive = amount * effRate;
        return { ...p, effRate, receive };
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
  }, [from, to, amount]);

  return (
    <section className="panel active" id="panel-fees">
      <div className="section-head">
        <h2>{t("feesHeading")}</h2>
        <p>{t("feesDesc")}</p>
      </div>
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
                <td>{r.name}</td>
                <td>{(r.markup * 100).toFixed(2)}%</td>
                <td>{fmt(r.effRate, 4)}</td>
                <td className={i === 0 ? "best" : ""}>
                  {CURRENCIES[to].symbol} {fmt(r.receive)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="fees-note">{t("feesNote")}</div>
    </section>
  );
}
