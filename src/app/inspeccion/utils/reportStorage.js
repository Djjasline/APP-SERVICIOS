const KEY = "serviceRecords";

/* ===========================
   BASE
=========================== */
function getAll() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}

function saveAll(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

/* ===========================
   OBTENER
=========================== */
export function getRecords({ module, type }) {
  return getAll().filter(
    r => r.module === module && r.type === type
  );
}

export function getRecordById(id) {
  return getAll().find(r => r.id === Number(id));
}

/* ===========================
   CREAR
=========================== */
export function createRecord({ module, type, data }) {
  const record = {
    id: Date.now(),
    module,
    type,
    status: "borrador",
    createdAt: new Date().toISOString(),
    data,
  };

  saveAll([...getAll(), record]);
  return record.id;
}

/* ===========================
   ACTUALIZAR
=========================== */
export function updateRecord(id, updates) {
  const updated = getAll().map(r =>
    r.id === Number(id) ? { ...r, ...updates } : r
  );
  saveAll(updated);
}

/* ===========================
   ELIMINAR
=========================== */
export function deleteRecord(id) {
  saveAll(getAll().filter(r => r.id !== Number(id)));
}
