import React from "react";
import { useApp } from "../context/AppContext.jsx";

const LANGS = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు" },
  { code: "hi", label: "हिंदी" },
];

export default function Header() {
  const { t, lang, setLang } = useApp();
  return (
    <header className="top">
      <div className="brand">
        <div className="brand-mark">₹</div>
        <div>
          <h1>{t("appTitle")}</h1>
          <div className="tagline">{t("tagline")}</div>
        </div>
      </div>
      <div className="lang-switch" role="group" aria-label="Language">
        {LANGS.map((l) => (
          <button
            key={l.code}
            className={lang === l.code ? "active" : ""}
            onClick={() => setLang(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>
    </header>
  );
}
