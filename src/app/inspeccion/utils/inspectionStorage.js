const STORAGE_KEY = "inspectionHistory";

function getEmptyHistory() {
  return {
    hidro: [],
    barredora: [],
    camara: [],
  };
}

export function getInspectionHistory() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getEmptyHistory()));
    return getEmptyHistory();
  }
  return JSON.parse(raw);
}

export function saveInspectionHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function markInspectionCompleted(tipo, id) {
  const history = getInspectionHistory();

  history[tipo] = history[tipo].map((item) =>
    item.id === id
      ? { ...item, estado: "completado" }
      : item
  );

  saveInspectionHistory(history);
}
