/* ======================================================
   STORAGE PARA INSPECCIONES
   Tipos: hidro | barredora | camara
   Estados: borrador | completada
====================================================== */

const STORAGE_KEY = "inspections";

/* ================= UTIL ================= */
function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ================= GET ================= */
export function getAllInspections() {
  return loadAll();
}

export function getInspections(type) {
  return loadAll().filter(i => i.type === type);
}

export function getInspectionById(type, id) {
  return loadAll().find(
    i => i.type === type && String(i.id) === String(id)
  );
}

/* ================= CREATE ================= */
export function createInspection(type, id) {
  const all = loadAll();

  const exists = all.some(
    i => i.type === type && String(i.id) === String(id)
  );
  if (exists) return;

  all.push({
    id,
    type,
    estado: "borrador",
    fecha: new Date().toISOString(),
    data: {},
  });

  saveAll(all);
}

/* ================= SAVE ================= */
export function saveInspectionDraft(type, id, data) {
  const all = loadAll().map(i =>
    i.type === type && String(i.id) === String(id)
      ? { ...i, data, estado: "borrador" }
      : i
  );

  saveAll(all);
}

export function markInspectionCompleted(type, id, data) {
  const all = loadAll().map(i =>
    i.type === type && String(i.id) === String(id)
      ? { ...i, data, estado: "completada" }
      : i
  );

  saveAll(all);
}
