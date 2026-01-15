/* ======================================================
   STORAGE PARA INSPECCIONES (HIDRO / BARREDORA / CAMARA)
====================================================== */

const STORAGE_KEY = "inspections";

/* ================= OBTENER TODO ================= */
export function getAllInspections() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/* ================= POR TIPO ================= */
export function getInspections(type) {
  return getAllInspections().filter((i) => i.type === type);
}

/* ================= POR ID ================= */
export function getInspectionById(id) {
  return getAllInspections().find(
    (i) => String(i.id) === String(id)
  );
}

/* ================= GUARDAR ================= */
function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ================= CREAR BORRADOR ================= */
export function createInspection(type) {
  const all = getAllInspections();

  const inspection = {
    id: Date.now(),
    type,                     // hidro | barredora | camara
    estado: "borrador",        // borrador | completada
    fecha: new Date().toISOString().slice(0, 10),
    data: {},
  };

  all.push(inspection);
  saveAll(all);

  return inspection.id;
}

/* ================= GUARDAR BORRADOR ================= */
export function saveInspectionDraft(type, id, data) {
  const all = getAllInspections().map((i) =>
    i.id === id
      ? { ...i, data, estado: "borrador" }
      : i
  );

  saveAll(all);
}

/* ================= COMPLETAR ================= */
export function markInspectionCompleted(type, id, data) {
  const all = getAllInspections().map((i) =>
    i.id === id
      ? { ...i, data, estado: "completada" }
      : i
  );

  saveAll(all);
}
