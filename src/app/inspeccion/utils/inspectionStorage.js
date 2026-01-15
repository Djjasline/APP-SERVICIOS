// src/utilidades/inspectionStorage.js

const STORAGE_KEY = "inspections";

/* ================================
   Obtener todas las inspecciones
================================ */
export function getAllInspections() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

/* ================================
   Obtener inspecciones por tipo
================================ */
export function getInspectionsByType(type) {
  return getAllInspections().filter(i => i.type === type);
}

/* ================================
   Guardar / actualizar inspección
================================ */
export function saveInspection(type, id, data, status = "borrador") {
  const all = getAllInspections();

  const inspection = {
    id: id || Date.now(),
    type,                 // hidro | barredora | camara
    status,               // borrador | completado
    createdAt: new Date().toISOString(),
    data,
  };

  const filtered = all.filter(
    i => !(i.id === inspection.id && i.type === type)
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...filtered, inspection])
  );

  return inspection.id;
}

/* ================================
   Marcar como completado
================================ */
export function markInspectionCompleted(type, id, data) {
  saveInspection(type, id, data, "completado");
}

/* ================================
   Eliminar inspección
================================ */
export function deleteInspection(type, id) {
  const all = getAllInspections().filter(
    i => !(i.type === type && i.id === id)
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
