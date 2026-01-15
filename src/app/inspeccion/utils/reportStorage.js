/* ======================================================
   STORAGE GENERAL PARA INSPECCIONES Y REPORTES
   Usa localStorage
====================================================== */

const STORAGE_KEY = "inspections";

/* ======================================================
   OBTENER TODO
====================================================== */
export function getAllInspections() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (err) {
    console.error("Error leyendo inspections:", err);
    return [];
  }
}

/* ======================================================
   OBTENER POR TIPO (hidro | barredora | camara)
====================================================== */
export function getInspectionsByType(type) {
  return getAllInspections().filter(
    (i) => i.type === type
  );
}

/* ======================================================
   OBTENER UNA INSPECCIÓN POR ID
====================================================== */
export function getInspectionById(id) {
  return getAllInspections().find(
    (i) => String(i.id) === String(id)
  );
}

/* ======================================================
   GUARDAR / ACTUALIZAR INSPECCIÓN
====================================================== */
export function saveInspection(type, inspection) {
  const all = getAllInspections();

  const index = all.findIndex(
    (i) => String(i.id) === String(inspection.id)
  );

  const payload = {
    ...inspection,
    type,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    all[index] = payload;
  } else {
    all.push({
      ...payload,
      createdAt: new Date().toISOString(),
      status: inspection.status || "borrador",
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/* ======================================================
   CREAR BORRADOR NUEVO
====================================================== */
export function createInspection(type) {
  const inspection = {
    id: Date.now(),
    type,
    status: "borrador",
    data: {},
    createdAt: new Date().toISOString(),
  };

  saveInspection(type, inspection);
  return inspection.id;
}

/* ======================================================
   GUARDAR BORRADOR (CONTINUAR)
====================================================== */
export function saveInspectionDraft(type, id, data) {
  saveInspection(type, {
    id,
    data,
    status: "borrador",
  });
}

/* ======================================================
   MARCAR COMO COMPLETADO
====================================================== */
export function markInspectionCompleted(type, id, data) {
  saveInspection(type, {
    id,
    data,
    status: "completado",
  });
}

/* ======================================================
   ELIMINAR INSPECCIÓN
====================================================== */
export function deleteInspection(id) {
  const filtered = getAllInspections().filter(
    (i) => String(i.id) !== String(id)
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
