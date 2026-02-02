const STORAGE_KEYS = {
  "mantenimiento-hidro": "mantenimiento-hidro",
  "mantenimiento-barredora": "mantenimiento-barredora",
};

export function getMaintenances(tipo) {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS[tipo]) || "[]");
}

export function getMaintenanceById(tipo, id) {
  const list = getMaintenances(tipo);
  return list.find((i) => i.id === id);
}

export function saveMaintenance(tipo, record) {
  const list = getMaintenances(tipo);

  const index = list.findIndex((i) => i.id === record.id);
  if (index >= 0) {
    list[index] = record;
  } else {
    list.unshift(record);
  }

  localStorage.setItem(STORAGE_KEYS[tipo], JSON.stringify(list));
}

export function deleteMaintenance(tipo, id) {
  const list = getMaintenances(tipo).filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEYS[tipo], JSON.stringify(list));
}
