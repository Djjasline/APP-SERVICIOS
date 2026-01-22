/* ======================================================
   STORAGE PARA INSPECCIONES
   Tipos: hidro | barredora | camara
   Estados: borrador | completada
====================================================== */

const STORAGE_KEY = "inspections";

/* ================= UTIL ================= */
function loadAll() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId() {
  return new Date().getTime();
}

/* ================= GET ================= */
export function getAllInspections() {
  return loadAll();
}

export function getInspections(type) {
  return loadAll().filter(function (i) {
    return i.type === type;
  });
}

export function getInspectionById(type, id) {
  return loadAll().find(function (i) {
    return i.type === type && String(i.id) === String(id);
  });
}

/* ================= CREATE ================= */
export function createInspection(type) {
  var all = loadAll();

  var inspection = {
    id: generateId(),
    type: type,
    estado: "borrador",
    fecha: new Date().toISOString(),
    data: {},
  };

  all.push(inspection);
  saveAll(all);

  return inspection.id;
}

/* ================= SAVE ================= */
export function saveInspectionDraft(type, id, data) {
  var all = loadAll();
  var found = false;

  for (var i = 0; i < all.length; i++) {
    if (all[i].type === type && String(all[i].id) === String(id)) {
      all[i].data = data;
      all[i].estado = "borrador";
      all[i].updatedAt = new Date().toISOString(); // 🟢 NUEVO 
      found = true;
      break;
    }
  }

  if (!found) {
    all.push({
      id: id,
      type: type,
      estado: "borrador",
      fecha: new Date().toISOString(),
      updatedAt: new Date().toISOString(), 
      data: data,
    });
  }

  saveAll(all);
}

export function markInspectionCompleted(type, id, data) {
  var all = loadAll();
  var found = false;

  for (var i = 0; i < all.length; i++) {
    if (all[i].type === type && String(all[i].id) === String(id)) {
      all[i].data = data;
      all[i].estado = "completada";
      all[i].updatedAt = new Date().toISOString(); 
      found = true;
      break;
    }
  }

  if (!found) {
    all.push({
      id: generateId(),
      type: type,
      estado: "completada",
      fecha: new Date().toISOString(),
      updatedAt: new Date().toISOString(), 
      data: data,
    });
  }

  saveAll(all);
}

/* ================= DELETE ================= */
export function deleteInspection(type, id) {
  var all = loadAll().filter(function (i) {
    return !(i.type === type && String(i.id) === String(id));
  });

  saveAll(all);
}
