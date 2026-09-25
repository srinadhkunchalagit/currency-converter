import React from "react";
import { useApp } from "../context/AppContext.jsx";

export default function Footer() {
  const { t } = useApp();
  return (
    <footer className="foot">
      <span>{t("footNote")}</span>
    </footer>
  );
}
