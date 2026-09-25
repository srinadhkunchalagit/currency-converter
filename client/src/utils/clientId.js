// A lightweight per-device identifier, generated once and stored in
// localStorage, used only to keep favorites/history/language tied to this
// browser (there is no login in the original app either — this preserves
// that "just works on this device" feel while storing the data in MongoDB
// instead of localStorage).
const KEY = "cc-client-id";

export function getClientId() {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id =
      (crypto.randomUUID && crypto.randomUUID()) ||
      `cc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}
