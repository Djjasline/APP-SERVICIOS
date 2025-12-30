const STORAGE_KEY = "inspectionHistory";

function emptyHistory() {
  return {
    hidro: [],
    barredora: [],
    camara: [],
  };
}

export function getInspectionHistory() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const data = emptyHistory();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }
  return JSON.parse(raw);
}

export function getInspections(type) {
  const history = getInspectionHistory();
  return history[type] || [];
}

export function createInspection(type) {
  const history = getInspectionHistory();

  const newInspection = {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString().slice(0, 10),
    estado: "borrador",
    cliente: "",
    data: {},
  };

  history[type].unshift(newInspection);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

  return newInspection;
}

export function markInspectionCompleted(type, id) {
  const history = getInspectionHistory();

  history[type] = history[type].map((i) =>
    i.id === id ? { ...i, estado: "completado" } : i
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}
