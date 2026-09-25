import React from "react";
import { useApp } from "../context/AppContext.jsx";

const TABS = [
  { key: "convert", i18n: "tabConvert" },
  { key: "multi", i18n: "tabMulti" },
  { key: "trends", i18n: "tabTrends" },
  { key: "fees", i18n: "tabFees" },
  { key: "currencies", i18n: "tabCurrencies" },
  { key: "history", i18n: "tabHistory" },
];

export default function Tabs({ active, onChange }) {
  const { t } = useApp();
  return (
    <nav className="tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={"tab-btn" + (active === tab.key ? " active" : "")}
          onClick={() => onChange(tab.key)}
        >
          {t(tab.i18n)}
        </button>
      ))}
    </nav>
  );
}
