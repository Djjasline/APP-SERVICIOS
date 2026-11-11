const inspectionTypes = new Set(["hidro", "barredora", "barredora-road-wizard", "barredora-piquersa-ba-2300h", "camara"]);
const maintenanceTypes = new Set(["hidro", "barredora", "barredora-road-wizard", "barredora-piquersa-ba-2300h", "vcam"]);

// Only use routes guarded for viewing. Unknown record types are not edit links.
export function getDashboardRecordPreviewUrl(record) {
  if (!record?.id) return null;
  const id = encodeURIComponent(record.id);
  const area = String(record.area || "").toLowerCase();
  const type = String(record.tipo || "").toLowerCase();
  const subtype = String(record.subtipo || "").toLowerCase();

  if (area === "operaciones" && ["recepcion", "registro", "liberacion"].includes(type)) return `/operaciones/${type}/ver/${id}`;
  if (area === "operaciones" && type === "protocolo" && subtype === "hidrosuccionador-vactor") return `/operaciones/protocolos/vactor/ver/${id}`;
  if (area === "operaciones" && type === "protocolo" && subtype === "camara-vcam6") return `/operaciones/protocolos/vcam/ver/${id}`;
  if (area === "petroleo" && type === "visita_campo") return `/petroleo/visita-campo/ver/${id}`;
  if (area === "agua" && type === "informe" && subtype === "avance_epmaps") return `/agua/recorrido/informe/ver/${id}`;
  if (["agua", "industria", "petroleo"].includes(area) && type === "informe") return `/${area}/informe/ver/${id}`;
  if (area === "vehiculos" || !area) {
    if (type === "inspeccion" && inspectionTypes.has(subtype)) return `/vehiculos/inspeccion/${subtype}/ver/${id}`;
    if (type === "mantenimiento" && maintenanceTypes.has(subtype)) return `/vehiculos/mantenimiento/${subtype}/ver/${id}`;
    if (type === "protocolo" && subtype === "hidrosuccionador-vactor") return `/vehiculos/protocolos/vactor/ver/${id}`;
    if (type === "protocolo" && subtype === "camara-vcam6") return `/vehiculos/protocolos/vcam/ver/${id}`;
    if (type === "capacitacion") return `/vehiculos/capacitacion/ver/${id}`;
    if (type === "informe") return `/vehiculos/informe/ver/${id}`;
  }
  return null;
}
