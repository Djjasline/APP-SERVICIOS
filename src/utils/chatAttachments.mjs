const PDF_LABEL_BY_SUBTYPE = {
  general: "General",
  bomba: "Bomba",
  valvula: "Válvula",
  avance_epmaps: "Recorrido EPMAPS",
  hidro: "Hidrosuccionador",
  barredora: "Barredora",
  "barredora-road-wizard": "Barredora Road Wizard",
  "barredora-piquersa-ba-2300h": "Barredora Piquersa BA 2300H",
  camara: "Cámara",
  vcam: "VCam",
  "hidrosuccionador-vactor": "Protocolo Vactor",
  "camara-vcam6": "Protocolo VCam",
  control_vehicular: "Recepción vehicular",
  herramienta: "Registro herramientas",
  flowserve: "Visita de campo",
};

export const COMPLETED_RECORD_PDF_CONFIGS = [
  { area: "vehiculos", tipo: "informe", subtipo: "general", label: "Informe vehículos", path: (id) => `/vehiculos/informe/pdf/${id}` },
  { area: "vehiculos", tipo: "capacitacion", subtipo: "general", label: "Informe capacitación", path: (id) => `/vehiculos/capacitacion/pdf/${id}` },
  { area: "agua", tipo: "informe", subtipo: "bomba", label: "Informe agua", path: (id) => `/agua/informe/pdf/${id}` },
  { area: "agua", tipo: "informe", subtipo: "valvula", label: "Informe agua", path: (id) => `/agua/informe/pdf/${id}` },
  { area: "agua", tipo: "informe", subtipo: "avance_epmaps", label: "Informe recorrido agua", path: (id) => `/agua/recorrido/informe/pdf/${id}` },
  { area: "industria", tipo: "informe", subtipo: "bomba", label: "Informe industria", path: (id) => `/industria/informe/pdf/${id}` },
  { area: "industria", tipo: "informe", subtipo: "valvula", label: "Informe industria", path: (id) => `/industria/informe/pdf/${id}` },
  { area: "petroleo", tipo: "informe", subtipo: "bomba", label: "Informe petróleo", path: (id) => `/petroleo/informe/pdf/${id}` },
  { area: "petroleo", tipo: "informe", subtipo: "valvula", label: "Informe petróleo", path: (id) => `/petroleo/informe/pdf/${id}` },
  { area: "petroleo", tipo: "visita_campo", subtipo: "flowserve", label: "Visita de campo", path: (id) => `/petroleo/visita-campo/${id}/pdf` },
  { area: "vehiculos", tipo: "inspeccion", subtipo: "hidro", label: "Inspección vehículos", path: (id) => `/vehiculos/inspeccion/hidro/${id}/pdf` },
  { area: "vehiculos", tipo: "inspeccion", subtipo: "barredora", label: "Inspección vehículos", path: (id) => `/vehiculos/inspeccion/barredora/${id}/pdf` },
  { area: "vehiculos", tipo: "inspeccion", subtipo: "barredora-road-wizard", label: "Inspección vehículos", path: (id) => `/vehiculos/inspeccion/barredora-road-wizard/${id}/pdf` },
  { area: "vehiculos", tipo: "inspeccion", subtipo: "barredora-piquersa-ba-2300h", label: "Inspección vehículos", path: (id) => `/vehiculos/inspeccion/barredora-piquersa-ba-2300h/${id}/pdf` },
  { area: "vehiculos", tipo: "inspeccion", subtipo: "camara", label: "Inspección vehículos", path: (id) => `/vehiculos/inspeccion/camara/${id}/pdf` },
  { area: "vehiculos", tipo: "mantenimiento", subtipo: "hidro", label: "Mantenimiento vehículos", path: (id) => `/vehiculos/mantenimiento/hidro/${id}/pdf` },
  { area: "vehiculos", tipo: "mantenimiento", subtipo: "barredora", label: "Mantenimiento vehículos", path: (id) => `/vehiculos/mantenimiento/barredora/${id}/pdf` },
  { area: "vehiculos", tipo: "mantenimiento", subtipo: "barredora-road-wizard", label: "Mantenimiento vehículos", path: (id) => `/vehiculos/mantenimiento/barredora-road-wizard/${id}/pdf` },
  { area: "vehiculos", tipo: "mantenimiento", subtipo: "barredora-piquersa-ba-2300h", label: "Mantenimiento vehículos", path: (id) => `/vehiculos/mantenimiento/barredora-piquersa-ba-2300h/${id}/pdf` },
  { area: "vehiculos", tipo: "mantenimiento", subtipo: "vcam", label: "Mantenimiento vehículos", path: (id) => `/vehiculos/mantenimiento/vcam/${id}/pdf` },
  { area: "operaciones", tipo: "protocolo", subtipo: "hidrosuccionador-vactor", label: "Protocolo operaciones", path: (id) => `/operaciones/protocolos/vactor/${id}/pdf` },
  { area: "operaciones", tipo: "protocolo", subtipo: "camara-vcam6", label: "Protocolo operaciones", path: (id) => `/operaciones/protocolos/vcam/${id}/pdf` },
  { area: "operaciones", tipo: "recepcion", subtipo: "control_vehicular", label: "Recepción", path: (id) => `/operaciones/recepcion/${id}/pdf` },
  { area: "operaciones", tipo: "registro", subtipo: "herramienta", label: "Registro", path: (id) => `/operaciones/registro/pdf/${id}` },
  { area: "operaciones", tipo: "liberacion", subtipo: "general", label: "Liberación", path: (id) => `/operaciones/liberacion/pdf/${id}` },
];

export function normalizeChatAttachments(attachments = []) {
  return (Array.isArray(attachments) ? attachments : [])
    .map((attachment) => ({
      type: String(attachment?.type || "link").trim() || "link",
      title: String(attachment?.title || "Adjunto").trim() || "Adjunto",
      url: String(attachment?.url || "").trim(),
      description: String(attachment?.description || "").trim(),
      record_id: attachment?.record_id ? String(attachment.record_id) : undefined,
      area: attachment?.area ? String(attachment.area) : undefined,
      tipo: attachment?.tipo ? String(attachment.tipo) : undefined,
      subtipo: attachment?.subtipo ? String(attachment.subtipo) : undefined,
    }))
    .filter((attachment) => attachment.url);
}

export function getRecordAttachmentSearchText(attachment) {
  return [attachment?.title, attachment?.description, attachment?.area, attachment?.tipo, attachment?.subtipo]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function buildCompletedRecordPdfAttachment(record, config) {
  if (!record?.id || !config) return null;

  const data = record.data || {};
  const code = data.codInf || data.codigo || data.pedidoDemanda || data.referenciaContrato || record.id;
  const client = data.cliente || data.conductor || data.equipo || data.ubicacion || "Sin referencia";
  const subtypeLabel = PDF_LABEL_BY_SUBTYPE[record.subtipo || config.subtipo] || record.subtipo || config.subtipo;
  const title = `${config.label} - ${subtypeLabel}`;

  return {
    type: "completed_record_pdf",
    title,
    description: `${client} · ${code}`,
    url: config.path(record.id),
    record_id: record.id,
    area: record.area || config.area,
    tipo: record.tipo || config.tipo,
    subtipo: record.subtipo || config.subtipo,
  };
}
