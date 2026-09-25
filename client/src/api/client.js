const BASE = "/api";

async function req(path, opts) {
  const res = await fetch(BASE + path, opts);
  if (!res.ok) {
    const err = new Error("request_failed");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export function getLatest(base, needed) {
  const q = new URLSearchParams({ base });
  if (needed && needed.length) q.set("needed", needed.join(","));
  return req(`/rates/latest?${q.toString()}`);
}

export function getHistorical(base, date, to) {
  const q = new URLSearchParams({ base, date });
  if (to) q.set("to", to);
  return req(`/rates/historical?${q.toString()}`);
}

export function getSeries(base, to, days) {
  const q = new URLSearchParams({ base, to, days: String(days || 30) });
  return req(`/rates/series?${q.toString()}`);
}

export function getPreferences(clientId) {
  return req(`/preferences/${clientId}`);
}

export function updatePreferences(clientId, patch) {
  return req(`/preferences/${clientId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

export function addHistoryEntry(clientId, entry) {
  return req(`/preferences/${clientId}/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
}

export function clearHistory(clientId) {
  return req(`/preferences/${clientId}/history`, { method: "DELETE" });
}
