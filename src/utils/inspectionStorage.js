/* ======================================================
   STORAGE PARA INSPECCIONES
   Tipos: hidro | barredora | camara
   Estados: borrador | completada
====================================================== */

const STORAGE_KEY = "inspections";

/* ===============================
   Helpers internos
================================ */
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

/* ===============================
   Obtener TODAS las inspecciones
================================ */
export function getAllInspections() {
  return loadAll();
}

/* ===============================
   Obtener inspecciones por tipo
================================ */
export function getInspections(type) {
  return loadAll().filter((i) => i.type === type);
}

/* ===============================
   Obtener inspección por ID
================================ */
export function getInspectionById(id) {
  return loadAll().find((i) => String(i.id) === String(id));
}

/* ===============================
   Crear inspección (BORRADOR)
================================ */
export function createInspection(type) {
  const all = loadAll();

  const inspection = {
    id: Date.now(),
    type,                 // hidro | barredora | camara
    estado: "borrador",   // borrador | completada
    fecha: new Date().toISOString().slice(0, 10),
    data: {},
  };

  all.push(inspection);
  saveAll(all);

  return inspection.id;
}

/* ===============================
   Guardar borrador
================================ */
export function saveInspectionDraft(type, id, data) {
  const all = loadAll().map((i) =>
    String(i.id) === String(id)
      ? { ...i, data, estado: "borrador" }
      : i
  );

  saveAll(all);
}

/* ===============================
   Marcar como COMPLETADA
================================ */
export function markInspectionCompleted(type, id, data) {
  const all = loadAll().map((i) =>
    String(i.id) === String(id)
      ? { ...i, data, estado: "completada" }
      : i
  );

  saveAll(all);
}

/* ===============================
   Eliminar inspección
================================ */
export function deleteInspection(id) {
  const all = loadAll().filter(
    (i) => String(i.id) !== String(id)
  );
  saveAll(all);
}
