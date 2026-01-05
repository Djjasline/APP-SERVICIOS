const STORAGE_KEY = "app_historial";

export function getHistory() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveHistory(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function upsertHistoryItem(item) {
  const history = getHistory();
  const index = history.findIndex((h) => h.id === item.id);

  if (index >= 0) {
    history[index] = item;
  } else {
    history.unshift(item);
  }

  saveHistory(history);
}

export function removeHistoryItem(id) {
  const history = getHistory().filter((h) => h.id !== id);
  saveHistory(history);
}
