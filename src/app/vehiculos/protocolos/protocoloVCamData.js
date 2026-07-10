export const PROTOCOLO_VCAM_INFO = {
  codigo: "PR-MTTO-VCAM6",
  version: "01",
  titulo: "PROTOCOLO PARA MANTENIMIENTO PREVENTIVO DE CÁMARA V-CAM6",
  descripcion:
    "Protocolo para pruebas, limpieza, inspección, repuestos y verificaciones funcionales del sistema de cámara de inspección V-CAM6.",
};

export const SEGURIDAD_ITEMS = [
  ["bloqueo", "Equipo apagado, desconectado de alimentación externa y asegurado antes de intervenir."],
  ["area", "Área de trabajo limpia, seca, iluminada y señalizada."],
  ["cable", "Cable desplegado de forma controlada, sin riesgo de tropiezos o atrapamientos."],
  ["humedad", "Cabezal, conectores y monitor protegidos de humedad durante el servicio."],
  ["residuos", "Equipo libre de residuos antes de limpieza e inspección."],
];

export const EPP_ITEMS = [
  ["guantes", "Guantes de protección"],
  ["gafas", "Gafas de seguridad"],
  ["botas", "Botas de seguridad"],
  ["overol", "Overol o ropa de trabajo"],
];

export const RIESGO_ITEMS = [
  ["electrico", "Riesgo eléctrico / batería"],
  ["humedad", "Humedad en conectores"],
  ["cable", "Atrapamiento o daño por cable"],
  ["tropiezo", "Tropiezos por cable desplegado"],
  ["ergonomico", "Manipulación manual del carrete"],
];

export const PRUEBAS_PREVIAS = [
  ["1.1", "Prueba de encendido general del equipo"],
  ["1.2", "Verificación de funcionamiento de controles principales"],
  ["1.3", "Verificación de pantalla / monitor"],
  ["1.4", "Verificación de iluminación LED del cabezal"],
  ["1.5", "Revisión de alarmas o mensajes de fallo"],
];

export const REPUESTOS_USADOS = [
  ["2.104.24.00006", "Kit base de terminación 12 mm"],
  ["3.02.01.000032", "Cordón de seguridad / lanyard usado en kits estándar de terminación 12 mm"],
  ["2.104.24.00004", "Ensamble de cable espiralado estándar 12 mm"],
  ["3.02.07.000014", "Resorte de terminación estándar 12 mm"],
];

export const CHECKLIST_SECCIONES = [
  {
    titulo: "3.1. SISTEMA DE CÁMARA Y CABEZAL",
    imagenReferencia: "/estado-equipo-camara.png",
    items: [
      ["3.1.1", "Cabezal de cámara", "Inspeccionar golpes, fisuras, humedad visible y estado general."],
      ["3.1.2", "Lente del cabezal", "Limpiar lente y verificar ausencia de rayones u opacidad."],
      ["3.1.3", "Iluminación LED", "Verificar encendido uniforme y control de intensidad."],
      ["3.1.4", "Calidad de imagen", "Confirmar imagen clara, centrada, sin interferencias ni pérdida de señal."],
      ["3.1.5", "Resorte de terminación", "Verificar deformación, corrosión, fijación y retorno flexible."],
      ["3.1.6", "Estanqueidad del cabezal", "Revisar sellos, uniones y evidencia de ingreso de agua."],
    ],
  },
  {
    titulo: "3.2. CABLE Y CARRETE",
    items: [
      ["3.2.1", "Cable de empuje 12 mm", "Inspeccionar cortes, dobleces, zonas planas, desgaste y exposición interna."],
      ["3.2.2", "Marcadores de longitud", "Verificar legibilidad, continuidad y referencia en monitor si aplica."],
      ["3.2.3", "Guía de enrollado", "Limpiar y verificar desplazamiento suave sin trabas."],
      ["3.2.4", "Carrete", "Verificar giro libre, alineación, freno o seguro y ausencia de deformaciones."],
      ["3.2.5", "Conectores eléctricos", "Inspeccionar pines, roscas, humedad, corrosión y ajuste."],
      ["3.2.6", "Limpieza exterior", "Limpiar carrete, cable y puntos de contacto antes de prueba final."],
    ],
  },
  {
    titulo: "3.3. MONITOR, CONTROL Y GRABACIÓN",
    items: [
      ["3.3.1", "Monitor", "Verificar encendido, brillo, contraste y visualización estable."],
      ["3.3.2", "Controles principales", "Probar teclado, joystick, perillas o botones disponibles."],
      ["3.3.3", "Grabación", "Confirmar inicio, pausa, detención y reproducción de video."],
      ["3.3.4", "Almacenamiento", "Verificar memoria disponible o medio de almacenamiento instalado."],
      ["3.3.5", "Fecha y hora", "Confirmar configuración correcta para trazabilidad de inspecciones."],
      ["3.3.6", "Alimentación / batería", "Verificar cargador, cable de poder, autonomía básica y estado de conexión."],
      ["3.3.7", "Versión de software", "Registrar versión instalada y confirmar arranque sin errores."],
    ],
  },
  {
    titulo: "3.4. ACCESORIOS Y TRANSPORTE",
    items: [
      ["3.4.1", "Guías y patines", "Verificar disponibilidad, desgaste, tornillería y ajuste al cabezal."],
      ["3.4.2", "Maleta / caja de transporte", "Inspeccionar bisagras, cierres, espuma interna y limpieza."],
      ["3.4.3", "Cargadores y cables", "Verificar estado físico, conectores y funcionamiento."],
      ["3.4.4", "Accesorios de limpieza", "Confirmar paños, cepillos suaves y elementos no abrasivos disponibles."],
      ["3.4.5", "Identificación del equipo", "Verificar placa, seriales y accesorios registrados."],
    ],
  },
];

export const PRUEBAS_FINALES = [
  ["encendido", "Encendido general posterior al mantenimiento"],
  ["imagen", "Verificación de imagen estable y centrada"],
  ["iluminacion", "Verificación de iluminación LED"],
  ["cable", "Verificación de avance y retroceso del cable"],
  ["controles", "Verificación de funcionamiento de controles"],
  ["grabacion", "Prueba de grabación y reproducción"],
  ["sistema", "Prueba final del sistema completo"],
];

export const HERRAMIENTAS = [
  "Juego de destornilladores de precisión",
  "Llaves Allen y herramientas manuales básicas",
  "Multímetro",
  "Linterna de inspección",
  "Paños de microfibra y cepillo suave",
  "Limpiador dieléctrico para conectores",
  "Aire comprimido controlado o soplador de baja presión",
  "Kit de limpieza para lente óptico",
];

export const INSUMOS = [
  "Limpiador dieléctrico para conectores",
  "Alcohol isopropílico para limpieza externa controlada",
  "Paños no abrasivos / microfibra",
  "Grasa dieléctrica en conectores si el fabricante lo permite",
  "Bolsas o recipientes para residuos de limpieza",
];

export const INSTRUCCIONES_OPERACION = [
  "No halar el cable desde el cabezal ni forzar dobleces menores al radio recomendado.",
  "No usar solventes agresivos sobre lente, monitor, sellos o cable.",
  "Proteger conectores y monitor de humedad antes, durante y después de la limpieza.",
  "Realizar pruebas con el cable desplegado de forma controlada y el carrete asegurado.",
  "Registrar cualquier pérdida de señal, intermitencia, humedad o daño físico antes de entregar el equipo.",
];

export const ESPECIFICACIONES = [
  ["Modelo de referencia", "V-CAM6"],
  ["Cable de empuje", "12 mm"],
  ["Condición de imagen", "Clara, estable y sin interferencias"],
  ["Iluminación", "LED operativa y uniforme"],
  ["Grabación", "Video reproducible posterior a la prueba"],
];

export function buildInitialBooleanMap(items) {
  return items.reduce((acc, [key]) => {
    acc[key] = false;
    return acc;
  }, {});
}

export function buildInitialStatusMap(items, includeCantidad = false) {
  return items.reduce((acc, [codigo]) => {
    acc[codigo] = includeCantidad ? { estado: "", cantidad: "", observacion: "" } : { estado: "", observacion: "" };
    return acc;
  }, {});
}

export function buildInitialChecklist() {
  return CHECKLIST_SECCIONES.reduce((acc, section) => {
    section.items.forEach(([codigo]) => {
      acc[codigo] = { estado: "", observacion: "" };
    });
    return acc;
  }, {});
}
