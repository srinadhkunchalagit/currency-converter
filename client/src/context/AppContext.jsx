import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CURRENCIES } from "../data/currencies.js";
import { I18N } from "../data/i18n.js";
import { getClientId } from "../utils/clientId.js";
import {
  getPreferences,
  updatePreferences,
  addHistoryEntry as apiAddHistoryEntry,
  clearHistory as apiClearHistory,
} from "../api/client.js";

const AppContext = createContext(null);

const DEFAULT_MULTI_TARGETS = ["INR", "EUR", "GBP"];
const STORAGE_KEY = "ledger_prefs_v1";

function readLocalInit() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function AppProvider({ children }) {
  const [clientId] = useState(getClientId);
  const [loaded, setLoaded] = useState(true);

  const init = readLocalInit();
  const [lang, setLang] = useState(init.lang || "en");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [amount, setAmount] = useState(100);
  const [favorites, setFavorites] = useState(Array.isArray(init.favorites) ? init.favorites : []);
  const [multiTargets, setMultiTargets] = useState(
    Array.isArray(init.multiTargets) && init.multiTargets.length
      ? init.multiTargets
      : DEFAULT_MULTI_TARGETS,
  );
  const [history, setHistory] = useState(Array.isArray(init.history) ? init.history : []);

  // Sync preferences with backend asynchronously
  useEffect(() => {
    let cancelled = false;
    getPreferences(clientId)
      .then((prefs) => {
        if (cancelled || !prefs) return;
        if (prefs.lang) setLang(prefs.lang);
        if (Array.isArray(prefs.favorites)) setFavorites(prefs.favorites);
        if (Array.isArray(prefs.multiTargets) && prefs.multiTargets.length)
          setMultiTargets(prefs.multiTargets);
        if (Array.isArray(prefs.history)) setHistory(prefs.history);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const setLangPersist = useCallback(
    (next) => {
      setLang(next);
      updatePreferences(clientId, { lang: next }).catch(() => {});
    },
    [clientId],
  );

  const toggleFavorite = useCallback(
    (pairKey) => {
      setFavorites((prev) => {
        const idx = prev.indexOf(pairKey);
        const next =
          idx >= 0
            ? prev.filter((p) => p !== pairKey)
            : [pairKey, ...prev].slice(0, 8);
        updatePreferences(clientId, { favorites: next }).catch(() => {});
        return next;
      });
    },
    [clientId],
  );

  const toggleMultiTarget = useCallback(
    (code) => {
      setMultiTargets((prev) => {
        const next = prev.includes(code)
          ? prev.filter((c) => c !== code)
          : [...prev, code];
        updatePreferences(clientId, { multiTargets: next }).catch(() => {});
        return next;
      });
    },
    [clientId],
  );

  const addHistory = useCallback(
    (entry) => {
      setHistory((prev) => {
        const last = prev[0];
        if (
          last &&
          last.from === entry.from &&
          last.to === entry.to &&
          Math.abs(last.amount - entry.amount) < 0.0001
        ) {
          return prev;
        }
        return [entry, ...prev].slice(0, 50);
      });
      apiAddHistoryEntry(clientId, entry).catch(() => {});
    },
    [clientId],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    apiClearHistory(clientId).catch(() => {});
  }, [clientId]);

  const t = useCallback(
    (key) => (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key,
    [lang],
  );

  const curName = useCallback(
    (code) => {
      const entry = CURRENCIES[code];
      if (!entry) return code;
      return entry.name[lang] || entry.name.en;
    },
    [lang],
  );

  const value = useMemo(
    () => ({
      clientId,
      loaded,
      lang,
      setLang: setLangPersist,
      from,
      setFrom,
      to,
      setTo,
      amount,
      setAmount,
      favorites,
      toggleFavorite,
      multiTargets,
      toggleMultiTarget,
      history,
      addHistory,
      clearHistory,
      t,
      curName,
    }),
    [
      clientId,
      loaded,
      lang,
      setLangPersist,
      from,
      to,
      amount,
      favorites,
      toggleFavorite,
      multiTargets,
      toggleMultiTarget,
      history,
      addHistory,
      clearHistory,
      t,
      curName,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
