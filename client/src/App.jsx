import React, { useMemo, useState } from "react";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import Header from "./components/Header.jsx";
import Tabs from "./components/Tabs.jsx";
import ConvertPanel from "./components/ConvertPanel.jsx";
import MultiConvertPanel from "./components/MultiConvertPanel.jsx";
import TrendsPanel from "./components/TrendsPanel.jsx";
import FeesPanel from "./components/FeesPanel.jsx";
import CurrenciesPanel from "./components/CurrenciesPanel.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import Footer from "./components/Footer.jsx";

const WATERMARK_SYMBOLS = [
  "$", "€", "£", "¥", "₹", "₩", "₺", "₪", "฿", "₱", "R$", "A$", "C$", "Fr", "zł", "kr",
];
const WATERMARK_POSITIONS = [
  [4, 6, 44], [18, 3, 30], [34, 9, 52], [52, 4, 34], [68, 7, 46], [85, 3, 30],
  [95, 12, 38], [8, 22, 30], [26, 26, 40], [46, 20, 28], [62, 24, 50], [78, 20, 32],
  [92, 28, 42], [3, 40, 36], [16, 45, 26], [30, 42, 48], [48, 46, 30], [64, 40, 40],
  [80, 44, 28], [95, 48, 34], [6, 60, 40], [20, 64, 30], [36, 60, 46], [54, 64, 28],
  [70, 60, 38], [86, 64, 30], [3, 78, 32], [18, 82, 44], [33, 78, 28], [50, 82, 36],
  [66, 78, 30], [82, 82, 42], [96, 80, 28], [10, 94, 36], [28, 92, 26], [44, 96, 40],
  [60, 92, 30], [76, 96, 34], [92, 94, 28],
];

function Watermark() {
  const spans = useMemo(
    () =>
      WATERMARK_POSITIONS.map((p, i) => ({
        symbol: WATERMARK_SYMBOLS[i % WATERMARK_SYMBOLS.length],
        left: p[0],
        top: p[1],
        fontSize: p[2],
        rotate: (i % 2 ? 1 : -1) * (6 + ((i * 7) % 18)),
      })),
    [],
  );
  return (
    <div id="watermark">
      {spans.map((s, i) => (
        <span
          key={i}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: `${s.fontSize}px`,
            transform: `rotate(${s.rotate}deg)`,
          }}
        >
          {s.symbol}
        </span>
      ))}
    </div>
  );
}

function Shell() {
  const [activeTab, setActiveTab] = useState("convert");
  const { loaded, setFrom, setTo, setAmount } = useApp();

  function openCodeInConvert(code) {
    // Sets as source currency and jumps to Convert tab
    setFrom(code);
    setActiveTab("convert");
  }

  function openAsTo(code) {
    // Sets as target currency and jumps to Convert tab
    setTo(code);
    setActiveTab("convert");
  }

  function loadConversion(h) {
    // Loads an entire historical conversion and jumps to Convert tab
    setFrom(h.from);
    setTo(h.to);
    setAmount(h.amount);
    setActiveTab("convert");
  }

  return (
    <div className="wrap">
      <Watermark />
      <div className="bg-grain" />
      <Header />
      <Tabs active={activeTab} onChange={setActiveTab} />

      {!loaded && (
        <div className="empty-note" style={{ marginBottom: 16 }}>
          Loading your saved preferences…
        </div>
      )}

      {activeTab === "convert" && <ConvertPanel />}
      {activeTab === "multi" && <MultiConvertPanel />}
      {activeTab === "trends" && <TrendsPanel />}
      {activeTab === "fees" && <FeesPanel />}
      {activeTab === "currencies" && (
        <CurrenciesPanel
          onOpenInConvert={openCodeInConvert}
          onOpenAsTo={openAsTo}
        />
      )}
      {activeTab === "history" && (
        <HistoryPanel onLoadConversion={loadConversion} />
      )}

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
