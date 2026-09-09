export const PROTOCOLO_MAN_TIPO = "protocolo-man";
export const PROTOCOLO_MAN_BASE_PATH = "/operaciones/protocolo-man";

const GENERAL_FIELDS = [
  { key: "proyecto", label: "Proyecto / Contrato / OT" },
  { key: "cliente", label: "Cliente / Propietario" },
  { key: "proveedor", label: "Proveedor" },
  { key: "vehiculo", label: "Vehículo / Equipo" },
  { key: "marcaModelo", label: "Marca / Modelo" },
  { key: "placaVin", label: "Placa / VIN / Serie" },
  { key: "responsable", label: "Responsable" },
  { key: "supervisor", label: "Supervisor / Fiscalizador" },
];

const SIGNATURES = [
  { id: "proveedor", label: "Proveedor" },
  { id: "responsableProyecto", label: "Responsable del proyecto" },
  { id: "supervision", label: "Supervisión / Fiscalización" },
];

const VISUAL_ROWS = ["Carrocería", "Pintura", "Parabrisas y vidrios", "Espejos", "Luces", "Parachoques", "Guardafangos", "Neumáticos y ruedas", "Puertas / tapas", "Fugas visibles"];
const CABIN_ROWS = ["Tablero / testigos", "Asientos", "Tapicería", "Mandos y controles", "Radio / accesorios", "Aire acondicionado", "Elementos de seguridad", "Limpieza general", "Otros"];
const TECH_ROWS = ["Motor", "Transmisión", "Frenos", "Dirección", "Sistema eléctrico", "Sistema hidráulico", "Sistema neumático", "PTO / Transferencia", "Sistema de agua", "Sistema de vacío", "Equipos auxiliares", "Otros"];
const MATERIAL_ROWS = ["Llaves", "Control remoto", "Documentación", "Herramientas", "Gata", "Llanta de emergencia", "Mangueras / boquillas", "Accesorios especiales", "Otros"];
const COMPONENT_ROWS = ["Bomba alta presión", "Válvulas hidráulicas", "Mangueras y fittings", "Tanque de agua", "Sistema eléctrico", "Pintura y acabados"];
const ACTIVITY_ROWS = ["Desmontaje del equipo", "Fabricación de tanque", "Sistema hidráulico", "Sistema eléctrico", "Montaje general", "Pruebas funcionales", "Pintura y acabados", "Documentación", "Capacitación", "Entrega"];

function rows(values) {
  return values.map((label, index) => ({ id: String(index + 1).padStart(2, "0"), label }));
}

const statusColumn = { key: "estado", label: "Estado", type: "select", options: ["Conforme", "Pendiente", "Crítico", "No iniciado", "N/A"] };
const yesNoNaColumns = [
  { key: "ok", label: "OK", type: "checkbox" },
  { key: "novedad", label: "Novedad", type: "checkbox" },
  { key: "na", label: "N/A", type: "checkbox" },
  { key: "observaciones", label: "Observaciones", type: "text" },
];

export const PROTOCOLOS_MAN = [
  {
    id: "recepcion",
    code: "FR-MAN-001",
    title: "Registro / Checklist Recepción de Vehículos y Equipos",
    subtitle: "Este registro debe completarse antes de iniciar cualquier intervención en el vehículo o equipo.",
    badge: "Recepción",
    description: "Verificación inicial, inspección visual, niveles, inventario, novedades y conformidad de recepción.",
    sections: [
      { id: "fotosIniciales", title: "Registro fotográfico inicial", type: "photos", count: 8 },
      { id: "exterior", title: "Inspección visual exterior", type: "checklist", rows: rows(VISUAL_ROWS), columns: yesNoNaColumns },
      { id: "danos", title: "Diagrama de daños", type: "damage" },
      { id: "interior", title: "Inspección interior / cabina", type: "checklist", rows: rows(CABIN_ROWS), columns: yesNoNaColumns },
      { id: "sistemas", title: "Sistemas técnicos", type: "checklist", rows: rows(TECH_ROWS), columns: yesNoNaColumns },
      { id: "niveles", title: "Niveles y condición", type: "table", rows: rows(["Combustible", "Aceite motor", "Refrigerante", "Aceite hidráulico", "AdBlue / DEF", "Estado de batería", "Otros"]), columns: [{ key: "estado", label: "Estado", type: "select", options: ["Bajo", "Normal", "Alto"] }, { key: "observaciones", label: "Observaciones", type: "text" }] },
      { id: "inventario", title: "Inventario de elementos entregados", type: "table", rows: rows(MATERIAL_ROWS), columns: [{ key: "cantidad", label: "Cantidad", type: "text" }, statusColumn, { key: "observaciones", label: "Observaciones", type: "text" }] },
      { id: "pruebaRecepcion", title: "Prueba funcional de recepción", type: "checklist", rows: rows(["Arranque", "Ralenti", "Tablero / testigos", "Aceleración", "Dirección", "Frenos", "Transmisión", "Hidráulica", "Alta presión", "Vacío / soplador", "Cilindros", "Controles", "Interlocks / seguridades"]), columns: [{ key: "conforme", label: "Conforme", type: "checkbox" }, { key: "na", label: "N/A", type: "checkbox" }, { key: "resultado", label: "Resultado", type: "text" }] },
      { id: "novedades", title: "Novedades identificadas", type: "numbered", count: 5, columns: [{ key: "descripcion", label: "Novedad encontrada", type: "text" }, { key: "ubicacion", label: "Ubicación", type: "text" }, statusColumn, { key: "accion", label: "Acción / Observaciones", type: "text" }] },
      { id: "conformidad", title: "Conformidad de recepción", type: "result", options: ["Vehículo / equipo recibido", "Sujeto a verificación adicional"] },
      { id: "observaciones", title: "Observaciones generales", type: "notes" },
      { id: "firmas", title: "Firmas de validación", type: "signatures", signatures: SIGNATURES },
    ],
  },
  {
    id: "entrega",
    code: "FR-MAN-002",
    title: "Registro / Checklist Entrega de Vehículos y Equipos",
    subtitle: "Verificación final, pruebas y conformidad de entrega al cliente.",
    badge: "Entrega",
    description: "Control de alcance ejecutado, inspección final, pruebas, documentación, capacitación y conformidad de entrega.",
    sections: [
      { id: "fotosFinales", title: "Registro fotográfico final", type: "photos", count: 8 },
      { id: "alcance", title: "Verificación del alcance ejecutado", type: "numbered", count: 5, columns: [{ key: "trabajo", label: "Trabajo / actividad", type: "text" }, { key: "alcance", label: "Alcance", type: "text" }, { key: "ejecutado", label: "Ejecutado", type: "checkbox" }, statusColumn, { key: "observaciones", label: "Observaciones", type: "text" }] },
      { id: "exteriorFinal", title: "Inspección visual final exterior", type: "checklist", rows: rows(VISUAL_ROWS), columns: yesNoNaColumns },
      { id: "cabinaFinal", title: "Inspección interior / cabina", type: "checklist", rows: rows(CABIN_ROWS), columns: yesNoNaColumns },
      { id: "tecnicaFinal", title: "Verificación técnica final", type: "checklist", rows: rows(TECH_ROWS), columns: yesNoNaColumns },
      { id: "pruebasEntrega", title: "Pruebas funcionales de entrega", type: "checklist", rows: rows(["Arranque", "Ralenti", "Aceleración", "Tablero / testigos", "Dirección", "Frenos", "Transmisión", "PTO", "Sistema hidráulico", "Bomba alta presión", "Vacío / soplador", "Controles", "Alarmas / parada emergencia"]), columns: [{ key: "ok", label: "OK", type: "checkbox" }, { key: "na", label: "N/A", type: "checkbox" }, { key: "observaciones", label: "Observaciones", type: "text" }] },
      { id: "parametros", title: "Parámetros operativos", type: "table", rows: rows(["Presión agua (psi)", "Caudal agua (GPM)", "Vacío (inHg)", "RPM trabajo", "Temperatura hidráulica", "Otros"]), columns: [{ key: "requerido", label: "Requerido", type: "text" }, { key: "medido", label: "Medido", type: "text" }, { key: "resultado", label: "Resultado", type: "text" }] },
      { id: "fugas", title: "Control de fugas, fijaciones y terminaciones", type: "checklist", rows: rows(["Sin fugas de combustible", "Sin fugas de aceite motor", "Sin fugas hidráulicas", "Sin fugas de refrigerante", "Mangueras y abrazaderas", "Fijaciones y pernos", "Cableado y conectores", "Guardas instaladas", "Etiquetas / señalización", "Terminaciones generales"]), columns: yesNoNaColumns },
      { id: "inventarioEntrega", title: "Inventario de elementos entregados", type: "checklist", rows: rows(MATERIAL_ROWS), columns: [{ key: "recibido", label: "Recibido", type: "checkbox" }, { key: "entregado", label: "Entregado", type: "checkbox" }, { key: "observaciones", label: "Observaciones", type: "text" }] },
      { id: "documentacion", title: "Documentación entregada", type: "checklist", rows: rows(["Informe técnico final", "Orden de trabajo cerrada", "Reporte de pruebas", "Lista de repuestos instalados", "Manuales / diagramas", "Garantía", "Recomendaciones de mantenimiento", "Capacitación realizada", "Registro fotográfico", "Otros"]), columns: [{ key: "entregado", label: "Entregado", type: "checkbox" }] },
      { id: "pendientes", title: "Novedades y pendientes", type: "numbered", count: 5, columns: [{ key: "descripcion", label: "Descripción", type: "text" }, { key: "responsable", label: "Responsable", type: "text" }, { key: "fecha", label: "Fecha compromiso", type: "date" }, statusColumn] },
      { id: "capacitacion", title: "Capacitación / demostración", type: "checklist", rows: rows(["Operación del equipo", "Arranque / parada", "Controles y funciones", "Paradas de emergencia", "Mantenimiento básico", "Restricciones operativas", "Personal capacitado"]), columns: [{ key: "realizada", label: "Realizada", type: "checkbox" }, { key: "observaciones", label: "Observaciones", type: "text" }] },
      { id: "conformidadEntrega", title: "Conformidad de entrega", type: "result", options: ["Entrega conforme", "Entrega con observaciones", "Entrega no conforme"] },
      { id: "firmas", title: "Firmas de validación", type: "signatures", signatures: SIGNATURES },
    ],
  },
  {
    id: "semanal-proveedor",
    code: "FR-MAN-003",
    title: "Informe Semanal del Proveedor",
    subtitle: "Seguimiento del cronograma, actividades, avances, riesgos y próximos pasos.",
    badge: "Semanal",
    description: "Reporte semanal de avance del proveedor con resumen ejecutivo, hitos, riesgos, materiales y compromisos.",
    sections: [
      { id: "resumenSemana", title: "Resumen ejecutivo de la semana", type: "summary", cards: ["Avance planificado acumulado", "Avance real acumulado", "Desviación", "Actividades programadas", "Actividades terminadas", "Actividades retrasadas", "Riesgos activos", "Pendientes críticos"] },
      { id: "avance", title: "Avance de actividades", type: "table", rows: rows(ACTIVITY_ROWS.slice(0, 8)), columns: [{ key: "planSemanal", label: "Plan semanal", type: "text" }, { key: "realSemanal", label: "Real semanal", type: "text" }, { key: "planAcumulado", label: "Plan acumulado", type: "text" }, { key: "realAcumulado", label: "Real acumulado", type: "text" }, statusColumn] },
      { id: "hitos", title: "Hitos del proyecto", type: "numbered", count: 6, columns: [{ key: "hito", label: "Hito", type: "text" }, { key: "fechaPlan", label: "Fecha planificada", type: "date" }, { key: "fechaReal", label: "Fecha real / prevista", type: "date" }, statusColumn, { key: "observaciones", label: "Observaciones", type: "text" }] },
      { id: "ejecutadas", title: "Actividades ejecutadas esta semana", type: "numbered", count: 5, columns: [{ key: "actividad", label: "Actividad ejecutada", type: "text" }, { key: "resultado", label: "Resultado / Observaciones", type: "text" }, { key: "evidencia", label: "Evidencia", type: "text" }] },
      { id: "retrasadas", title: "Actividades no ejecutadas o retrasadas", type: "numbered", count: 3, columns: [{ key: "actividad", label: "Actividad", type: "text" }, { key: "motivo", label: "Motivo", type: "text" }, { key: "impacto", label: "Impacto", type: "select", options: ["Bajo", "Medio", "Alto"] }, { key: "accion", label: "Acción correctiva", type: "text" }, { key: "responsable", label: "Responsable", type: "text" }] },
      { id: "riesgos", title: "Riesgos y restricciones", type: "numbered", count: 4, columns: [{ key: "riesgo", label: "Riesgo / restricción", type: "text" }, { key: "probabilidad", label: "Prob.", type: "select", options: ["Baja", "Media", "Alta"] }, { key: "impacto", label: "Impacto", type: "select", options: ["Bajo", "Medio", "Alto"] }, statusColumn, { key: "accion", label: "Acción / Plan", type: "text" }] },
      { id: "componentes", title: "Estado de materiales y componentes críticos", type: "checklist", rows: rows(COMPONENT_ROWS), columns: [{ key: "requerido", label: "Requerido", type: "checkbox" }, { key: "disponible", label: "Disponible", type: "checkbox" }, { key: "pendiente", label: "Pendiente", type: "checkbox" }, { key: "fecha", label: "Fecha esperada", type: "date" }, { key: "observaciones", label: "Observaciones", type: "text" }] },
      { id: "fotosSemana", title: "Registro fotográfico de la semana", type: "photos", count: 6 },
      { id: "planSiguiente", title: "Plan de trabajo para la siguiente semana", type: "numbered", count: 5, columns: [{ key: "actividad", label: "Actividad programada", type: "text" }, { key: "responsable", label: "Responsable", type: "text" }, { key: "fecha", label: "Fecha prevista", type: "date" }, { key: "meta", label: "Meta", type: "text" }] },
      { id: "compromisos", title: "Acciones y compromisos", type: "numbered", count: 4, columns: [{ key: "accion", label: "Acción / compromiso", type: "text" }, { key: "responsable", label: "Responsable", type: "text" }, { key: "fecha", label: "Fecha límite", type: "date" }, statusColumn] },
      { id: "observaciones", title: "Observaciones generales", type: "notes" },
      { id: "firmas", title: "Firmas de validación", type: "signatures", signatures: SIGNATURES },
    ],
  },
  {
    id: "avance-cronograma",
    code: "FR-MAN-004",
    title: "Checklist de Avance Basado en Cronograma",
    subtitle: "Verificación física de los trabajos.",
    badge: "Avance",
    description: "Verificación física del avance contra cronograma, desviaciones, riesgos, materiales y fecha de entrega.",
    sections: [
      { id: "resumenAvance", title: "Resumen de avance", type: "summary", cards: ["Avance planificado acumulado", "Avance físico verificado", "Desviación", "Actividades verificadas", "Terminadas", "En ejecución", "Retrasadas", "Críticas afectadas"] },
      { id: "checklistAvance", title: "Checklist de avance de actividades", type: "table", rows: rows(ACTIVITY_ROWS), columns: [{ key: "peso", label: "Peso", type: "text" }, { key: "fechaInicio", label: "Fecha inicio", type: "date" }, { key: "fechaFin", label: "Fecha fin", type: "date" }, { key: "plan", label: "Plan %", type: "text" }, { key: "real", label: "Real %", type: "text" }, { key: "desviacion", label: "Desv.", type: "text" }, { key: "critica", label: "Crítica", type: "checkbox" }, statusColumn, { key: "observaciones", label: "Observaciones", type: "text" }] },
      { id: "detalleActividad", title: "Detalle de verificación por actividad", type: "checklist", rows: rows(["Trabajo físicamente ejecutado", "Corresponde al cronograma", "Material instalado / disponible", "Evidencia fotográfica", "Calidad preliminar conforme", "Sin retrabajos pendientes", "Actividad puede continuar"]), columns: [{ key: "si", label: "Sí", type: "checkbox" }, { key: "no", label: "No", type: "checkbox" }, { key: "na", label: "N/A", type: "checkbox" }, { key: "observaciones", label: "Observaciones", type: "text" }] },
      { id: "desviaciones", title: "Actividades con desviación", type: "numbered", count: 6, columns: [{ key: "actividad", label: "Actividad", type: "text" }, { key: "plan", label: "Plan %", type: "text" }, { key: "real", label: "Real %", type: "text" }, { key: "desv", label: "Desv. (pp)", type: "text" }, { key: "causa", label: "Causa principal", type: "text" }, { key: "impacto", label: "Impacto", type: "select", options: ["Bajo", "Medio", "Alto"] }] },
      { id: "riesgos", title: "Riesgos y restricciones", type: "numbered", count: 3, columns: [{ key: "riesgo", label: "Riesgo / restricción", type: "text" }, { key: "probabilidad", label: "Prob.", type: "select", options: ["Baja", "Media", "Alta"] }, { key: "impacto", label: "Impacto", type: "select", options: ["Bajo", "Medio", "Alto"] }, statusColumn, { key: "accion", label: "Acción / Plan", type: "text" }] },
      { id: "componentes", title: "Estado de materiales y componentes críticos", type: "checklist", rows: rows(COMPONENT_ROWS), columns: [{ key: "requerido", label: "Requerido", type: "checkbox" }, { key: "disponible", label: "Disponible", type: "checkbox" }, { key: "pendiente", label: "Pendiente", type: "checkbox" }, { key: "fecha", label: "Fecha esperada", type: "date" }, { key: "observaciones", label: "Observaciones", type: "text" }] },
      { id: "fotosAvance", title: "Registro fotográfico del avance", type: "photos", count: 6 },
      { id: "planSemana", title: "Plan de trabajo - siguiente semana", type: "numbered", count: 5, columns: [{ key: "actividad", label: "Actividad programada", type: "text" }, { key: "responsable", label: "Responsable", type: "text" }, { key: "fecha", label: "Fecha prevista", type: "date" }, { key: "meta", label: "Meta %", type: "text" }] },
      { id: "acciones", title: "Acciones correctivas / recuperación", type: "numbered", count: 4, columns: [{ key: "accion", label: "Acción", type: "text" }, { key: "responsable", label: "Responsable", type: "text" }, { key: "fecha", label: "Fecha límite", type: "date" }, statusColumn] },
      { id: "proyeccion", title: "Proyección de fecha de entrega", type: "projection" },
      { id: "resultado", title: "Resultado de la verificación", type: "result", options: ["Avance conforme", "Avance con desviaciones", "Avance crítico"] },
      { id: "observaciones", title: "Observaciones generales", type: "notes" },
      { id: "firmas", title: "Firmas de validación", type: "signatures", signatures: SIGNATURES },
    ],
  },
];

export const PROTOCOLO_MAN_BY_ID = PROTOCOLOS_MAN.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export { GENERAL_FIELDS };
