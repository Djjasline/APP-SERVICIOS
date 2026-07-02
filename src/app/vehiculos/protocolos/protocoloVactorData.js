export const PROTOCOLO_VACTOR_INFO = {
  codigo: "PR-MTTO-VAC-2100PD",
  version: "01",
  titulo: "PROTOCOLO PARA MANTENIMIENTO SEMESTRAL Y ANUAL DE HIDROSUCCIONADORES VACTOR SERIE 2100 PD",
  descripcion:
    "Protocolo para procedimientos, insumos y verificaciones necesarias para realizar el mantenimiento preventivo semestral y anual de hidrosuccionadores Vactor Serie 2100 PD.",
};

export const EPP_SECTION_IMAGE = "/epp.png";

export const EPP_SECTION_MARKS = {
  seguridad: [
    ["bloqueo", 3.45, 16.4],
    ["pto", 3.45, 31.0],
    ["calzos", 3.45, 43.6],
    ["area", 3.45, 55.6],
    ["residuos", 3.45, 67.4],
    ["extintor", 3.45, 79.8],
  ],
  epp: [
    ["guantes", 52.2, 31.0],
    ["gafas", 61.3, 31.0],
    ["casco", 70.0, 31.0],
    ["proteccionAuditiva", 78.8, 31.0],
    ["overol", 87.5, 31.0],
    ["botas", 96.0, 31.0],
  ],
  riesgos: [
    ["altaPresion", 52.2, 77.2],
    ["vacio", 61.3, 77.2],
    ["partesMovimiento", 71.5, 77.2],
    ["temperaturas", 81.8, 77.2],
    ["riesgoQuimico", 95.0, 77.2],
  ],
};

export const EPP_SECTION_TEXTS = {
  seguridad: [
    ["bloqueo", "Antes de iniciar el proceso de mantenimiento verifique que el camión este estacionado en superficie nivelada, apagado, con freno de parqueo y sistema de bloqueo/seguridad aplicado.", 14.4, 12.0, 30.0],
    ["pto", "Desactive los sistemas del módulo siguiendo el proceso del fabricante. PTO desactivado, marcha en neutral, motor apagado y llave retirada del switch.", 14.4, 29.2, 30.0],
    ["calzos", "Coloque calzos en las ruedas.", 14.4, 43.5, 30.0],
    ["area", "Área de trabajo limpia, iluminada y señalizada.", 14.4, 55.3, 30.0],
    ["residuos", "Revise que el equipo esté limpio y sin residuos sueltos, especialmente en tanque de desechos.", 14.4, 66.2, 30.0],
    ["extintor", "Extintor disponible y kit antiderrames accesible.", 14.4, 77.0, 30.0],
  ],
  epp: [
    ["guantes", "Guantes", 51.8, 21.9, 5.8],
    ["gafas", "Gafas", 60.8, 21.9, 5.8],
    ["casco", "Casco", 69.6, 21.9, 5.8],
    ["proteccionAuditiva", "Protección auditiva", 78.6, 21.4, 6.4],
    ["overol", "Overol", 87.2, 21.9, 5.8],
    ["botas", "Botas de seguridad", 96.0, 21.4, 6.4],
  ],
  riesgos: [
    ["altaPresion", "Alta presión de agua", 51.8, 67.4, 6.5],
    ["vacio", "Vacío / succión de material", 61.0, 67.4, 6.7],
    ["partesMovimiento", "Partes en movimiento", 71.5, 67.4, 6.5],
    ["temperaturas", "Temperaturas elevadas", 81.8, 67.4, 6.5],
    ["riesgoQuimico", "Riesgo químico", 95.0, 67.4, 6.5],
  ],
};

export const SEGURIDAD_ITEMS = [
  ["bloqueo", "Antes de iniciar el proceso de mantenimiento verifique que el camión esté estacionado en superficie nivelada, apagado, con freno de parqueo y sistema de bloqueo/seguridad aplicado."],
  ["pto", "Desactive los sistemas del módulo siguiendo el proceso del fabricante. PTO desactivado, marcha en neutral, motor apagado y llave retirada."],
  ["calzos", "Coloque calzos en las ruedas."],
  ["area", "Área de trabajo limpia, iluminada y señalizada."],
  ["residuos", "Revise que el equipo esté limpio y sin residuos sueltos, especialmente en tanque de desechos."],
  ["extintor", "Extintor disponible y kit antiderrames accesible."],
];

export const EPP_ITEMS = [
  ["guantes", "Guantes"],
  ["gafas", "Gafas"],
  ["casco", "Casco"],
  ["proteccionAuditiva", "Protección auditiva"],
  ["overol", "Overol"],
  ["botas", "Botas de seguridad"],
];

export const RIESGO_ITEMS = [
  ["altaPresion", "Alta presión de agua"],
  ["vacio", "Vacío / succión de material"],
  ["partesMovimiento", "Partes en movimiento"],
  ["temperaturas", "Temperaturas elevadas"],
  ["riesgoQuimico", "Riesgo químico"],
];

export const CHECKLIST_SECCIONES = [
  {
    titulo: "3.1 SISTEMA DE VACÍO / BLOWER",
    imagenReferencia: "/sistema-de-vacio.png",
    items: [
      ["3.1.1", "Nivel de aceite del blower", "Verificar nivel de aceite en mirilla."],
      ["3.1.2", "Fugas de aceite", "Revisar fugas en conexiones y carcasa."],
      ["3.1.3", "Estado de bandas o acople", "Verificar tensión y estado."],
      ["3.1.4", "Conjunto indicador de filtro", "Revisar estado y limpiar."],
      ["3.1.5", "Respirador del blower", "Limpiar y verificar libre."],
      ["3.1.6", "Cambio de aceite del blower", "Drenar y reemplazar aceite según especificación."],
      ["3.1.7", "Vacío máximo alcanzado", "Verificar vacío. Objetivo: 15 - 16 inHg."],
      ["3.1.8", "Válvula de alivio de vacío", "Verificar funcionamiento (vacuum relief)."],
    ],
  },
  {
    titulo: "3.2 SISTEMA HIDRÁULICO",
    imagenReferencia: "/sistema-hidraulico.png",
    items: [
      ["3.2.1", "Nivel de aceite hidráulico", "Verificar nivel en tanque."],
      ["3.2.2", "Fugas en mangueras y conexiones", "Revisar fugas visibles."],
      ["3.2.3", "Estado de mangueras", "Revisar grietas, desgaste y abrazaderas."],
      ["3.2.4", "Indicador de saturación del filtro", "Revisar indicador de aceite."],
      ["3.2.5", "Elemento del filtro hidráulico", "Reemplazar elemento del filtro."],
      ["3.2.6", "Diálisis / filtración del aceite", "Realizar diálisis según programa."],
      ["3.2.7", "Respiradero del tanque hidráulico", "Limpiar respiradero."],
      ["3.2.8", "Drene lubricante", "Use el lubricante recomendado."],
    ],
  },
  {
    titulo: "3.3 SISTEMA DE AGUA A ALTA PRESIÓN (RODDER PUMP)",
    imagenReferencia: "/sistema-de-agua.png",
    items: [
      ["3.3.1", "Fugas en bomba", "Revisar fugas en conexiones y sellos."],
      ["3.3.2", "Filtros y strainer (Y 3\")", "Limpiar canastillas y reemplazar O-ring."],
      ["3.3.3", "Válvulas check (2\" x 3\")", "Limpiar y rearmar sus elementos."],
      ["3.3.4", "Fugas en bomba luego de servicio", "Revisar fugas en conexiones y sellos."],
      ["3.3.5", "Sensor de proximidad", "Verificar funcionamiento visual (luz testigo)."],
      ["3.3.6", "Presión de operación", "Verificar presión. Máx. 2000 PSI."],
      ["3.3.7", "Caudal de agua", "Verificar caudal. Objetivo: 60 GPM."],
    ],
  },
  {
    titulo: "3.4 TRANSFER CASE Y PTO",
    items: [
      ["3.4.1", "Nivel de aceite del transfer case", "Verificar nivel."],
      ["3.4.2", "Fugas en transfer case", "Revisar fugas."],
      ["3.4.3", "Cambio de aceite transfer case", "Drenar y reemplazar aceite."],
      ["3.4.4", "Estado de cardanes", "Revisar crucetas y lubricar."],
      ["3.4.5", "Alineación del cardán", "Verificar alineación."],
      ["3.4.6", "PTO", "Verificar funcionamiento y fugas."],
    ],
  },
];

export const PRUEBAS_FINALES = [
  ["blower", "Prueba de vacío en blower (15 - 16 inHg)"],
  ["presionAgua", "Prueba de presión de agua (máx. 2000 PSI)"],
  ["caudalAgua", "Prueba de caudal de agua (60 GPM)"],
  ["funciones", "Prueba de funciones generales del equipo"],
];

export const LUBRICANTES = [
  "Aceite Blower Roots ISO 220",
  "Aceite Transfer Case SAE 80W-90 EP",
  "Aceite Hidráulico ISO 46 AW 46",
  "Grasa Multipropósito NLGI 2",
];

export const ESPECIFICACIONES = [
  ["Vacío máximo", "15 - 16 inHg"],
  ["Presión máxima Rodder Pump", "2000 PSI"],
  ["Caudal de agua", "60 GPM"],
  ["Temperatura hidráulica máx.", "70 °C"],
  ["Temperatura aceite blower máx.", "90 °C"],
];

export function buildInitialChecklist() {
  return CHECKLIST_SECCIONES.reduce((acc, section) => {
    section.items.forEach(([codigo]) => {
      acc[codigo] = { estado: "", observacion: "" };
    });
    return acc;
  }, {});
}

export function buildInitialBooleanMap(items) {
  return items.reduce((acc, [key]) => {
    acc[key] = false;
    return acc;
  }, {});
}
