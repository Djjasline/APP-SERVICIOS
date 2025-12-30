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

export function addInspection(tipo, data) {
  const history = getInspectionHistory();

  history[tipo].unshift({
    id: crypto.randomUUID(),
    fecha: new Date().toISOString().slice(0, 10),
    estado: "borrador",
    ...data,
  });

  saveInspectionHistory(history);
}
