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

function generateId() {
  return Date.now();
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
export function createInspection(type) {
  const all = loadAll();

  const newInspection = {
    id: generateId(),
    type,
    estado: "borrador",
    fecha: new Date().toISOString(),
    data: {},
  };

  all.push(newInspection);
  saveAll(all);

  return newInspection.id;
}

/* ================= SAVE ================= */
export function saveInspectionDraft(type, id, data) {
  const all = loadAll();
  const index = all.findIndex(
    i => i.type === type && String(i.id) === String(id)
  );

  if (index === -1) {
    // Si no existe, se crea
    all.push({
      id,
      type,
      estado: "borrador",
      fecha: new Date().toISOString(),
      data,
    });
  } else {
    all[index] = {
      ...all[index],
      data,
      estado: "borrador",
    };
  }

  saveAll(all);
}

export function markInspectionCompleted(type, id, data) {
  const all = loadAll();
  const index = all.findIndex(
    i => i.type ===
