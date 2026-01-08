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
    const empty = getEmptyHistory();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
    return empty;
  }
  return JSON.parse(raw);
}

export function saveInspectionHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getInspections(tipo) {
  const history = getInspectionHistory();
  return history[tipo] || [];
}

export function addInspection(tipo, data = {}) {
  const history = getInspectionHistory();

  history[tipo].unshift({
    id: crypto.randomUUID(),
    fecha: new Date().toISOString().slice(0, 10),
    estado: "borrador",
    datos: data, // puede venir vacío
  });

  saveInspectionHistory(history);
}

/* ✅ COMPLETAR INSPECCIÓN (GUARDA TODO EL FORMULARIO) */
export function markInspectionCompleted(tipo, id, formData) {
  const history = getInspectionHistory();

  history[tipo] = history[tipo].map((item) =>
    item.id === id
      ? {
          ...item,
          estado: "completada",
          datos: formData, // 🔴 AQUÍ SE GUARDA TODO
          fechaCompletada: new Date().toISOString(),
        }
      : item
  );

  saveInspectionHistory(history);
}

/* 🆕 Obtener una inspección puntual (para PDF / lectura) */
export function getInspectionById(tipo, id) {
  const history = getInspectionHistory();
  return history[tipo]?.find((i) => i.id === id) || null;
}
