export const defaultVisitaCampoData = {
  codigoDocumento: "D-12752",
  revision: "002",
  fecha: "2026-06-09",
  cliente: "EP PETROECUADOR",
  modelos: "Durco, United Pump, Ingersoll Rand",
  ubicacion: "Bloque 60 Sacha",
  marca: "Flowserve",
  titulo: "Informe técnico de visita en campo",
  antecedentes:
    "En el Bloque 60 de EP Petroecuador, ubicado en el cantón La Joya de los Sachas, se llevó a cabo una inspección técnica con el objetivo de recopilar información detallada sobre las bombas centrífugas de la marca Flowserve (modelos: Durco, United Pump e Ingersoll Rand). Estos equipos se encuentran operativos en las estaciones Sacha Central, PAD 470, Sacha Norte 1, Pozo 65, Pozo 192 y Sacha Norte 2, Sacha Sur, Pad 380, Pad 198, Pad 410 y Pad 310.\n\nEsta visita técnica, realizada como parte del soporte brindado por ASTAP Cía. Ltda., tuvo la finalidad de analizar las condiciones operativas de los equipos y determinar sus componentes críticos. Todo el proceso se desarrolló bajo el marco de las Buenas Prácticas de Ingeniería (BPI) y en cumplimiento con los lineamientos de las normas API 610 y ANSI B73.1.",
  objetivos: [
    "Realizar el levantamiento técnico de las bombas centrífugas Flowserve operativas en las estaciones del Bloque 60 de EP Petroecuador, mediante el registro fotográfico y el contraste de la data de campo con la documentación preexistente, con el fin de establecer una trazabilidad de los activos y actualizar su base de datos técnica.",
    "Identificar las especificaciones técnicas de cada equipo, incluyendo modelo, número de serie, dimensiones y naturaleza del fluido procesado, para asegurar la correcta catalogación de los activos.",
    "Evaluar la integridad física y la condición operativa de cada unidad, identificando desgastes prematuros en los materiales o componentes con potencial de optimización para mejorar su funcionamiento.",
    "Definir los intervalos de sustitución para componentes críticos, fundamentados en los criterios de las normas API 610 y ANSI B73.1, en conjunto con los lineamientos técnicos del fabricante Flowserve.",
  ],
  descripcionLugar:
    "Las bombas centrífugas se encuentran instaladas en las estaciones de EP Petroecuador, dentro del Bloque 60, donde coexisten unidades en operación y equipos fuera de servicio. Durante la visita técnica, se ejecutaron diversas actividades orientadas a la inspección, verificación y levantamiento de información de ambos estados.",
  actividades: [
    {
      titulo: "Inspección visual",
      detalle:
        "Se llevó a cabo una inspección visual de cada bomba centrífuga, con el objetivo de evaluar el estado físico y mecánico de sus principales componentes, incluyendo la carcasa, sellos mecánicos, acoplamientos y placas base.",
    },
    {
      titulo: "Registro fotográfico",
      detalle:
        "Cada equipo de la marca Flowserve y sus líneas asociadas fue referenciado y documentado mediante registro fotográfico, priorizando las placas de identificación, para asegurar la trazabilidad de los activos.",
    },
    {
      titulo: "Levantamiento de datos operativos",
      detalle:
        "Se registraron los principales parámetros de diseño y operación a partir de las placas de identificación, incluyendo caudal, presiones de succión y descarga, temperatura del fluido, potencia del motor y velocidad de rotación.",
    },
    {
      titulo: "Identificación de repuestos críticos",
      detalle:
        "Con base en la documentación del fabricante y los requerimientos de las normas API 610 y ANSI B73.1, se definió el listado de repuestos críticos para asegurar la continuidad operativa de los equipos.",
    },
  ],
  equiposIntro:
    "A continuación, se presenta el detalle de los equipos existentes en las distintas estaciones. En el cuadro se especifican el número de serie, el modelo de la bomba y el grupo funcional al que pertenece cada unidad.",
  equiposTabla:
    "ESTACIÓN\tGRUPO DE BOMBA\tMODELO DE BOMBA\tSERIE\tTOTAL\nSACHA NORTE 1\t2\t2K6x4-13RV\t0508-8900 C, 1209-3290B, 0208-4617B, 418744, 0208-4617C\t5\nSACHA NORTE 1\t2\t6X4-13A\t258661, 260357\t2\nSACHA NORTE 1\t3\t3K8x6-14ARV\t456300, 442430\t2\nSACHA NORTE 2\t3\t3K8x6-14A\t427913, N/D\t2\nSACHA CENTRAL\t1\t1Kx1.5\t427841\t1\nSACHA CENTRAL\tMM\t10x14x20 MM\t95SH1772\t1\nPAD 470\t2\t2K6x4-13ARV\t0508-8899D, N/D\t2\nPOZO 65\t2\t2K3x2-10RV\t0508-8895C\t1\nSACHA SUR\t3\t2K4X3-10\t401035, 0508-8898 G\t2\nPAD 310\tGT\t3GT\tN/D, N/D\t2",
  partesIntro:
    "A partir de la documentación técnica de Flowserve para la línea Durco y los resultados operativos de la inspección, es recomendable la gestión de un inventario de repuestos críticos. Esta medida busca asegurar la máxima disponibilidad y confiabilidad de los equipos, para que de esa manera se garantice una acción inmediata frente a un mantenimiento preventivo o correctivo.",
  repuestos: [
    {
      titulo: "Durco Grupo 1",
      caption: "Tabla 1: Repuestos recomendados para bomba Durco MK3 - Grupo 1.",
      rows:
        "Ítem\tDescripción\tRef.\tN/P\tCódigo EPP\tCant.\n1\tIMPELLER 1K 3X2-62 RV\t2200\tMY50729A62-CD4M\t0000088990-1\t1\n5\tGASKET IMPELLER GP1K\t4590.2\tAY51803A-TFR\t0000088992-1\t3\n6\tSHAFT GP1K SOLID\t2100\tCY50682AA-316\tN/D\t3\n8\tBEARING IB 1K OIL\t3011\tAY50719A-SR\t0000015395-1\t3",
      esquema: "",
    },
    {
      titulo: "Durco Grupo 2",
      caption: "Tabla 2: Repuestos recomendados para bomba Durco MK3 - Grupo 2.",
      rows:
        "Ítem\tDescripción\tRef.\tN/P\tCódigo EPP\tCant.\n1\tIMPELLER 2K3X2-82 RV\t2200\tMY53316A82\t\t1\n2\tIMPELLER 2K3X2-10A RV\t2200\tMY53320A100\t\t2\n8\tGASKET IMPELLER GP2 STD\t4590.2\tSA3210AA00-TFR\t0000073835-1\t4\n11\tBEARING IB GP2/2K/2V OIL\t3011\tY21963A-SR\t0000015417-1\t3",
      esquema: "",
    },
    {
      titulo: "Bomba 3GT",
      caption: "Tabla 4: Repuestos recomendados para bomba Flowserve modelo 3GT.",
      rows:
        "Ítem\tDescripción\tRef.\tN/P\tCódigo EPP\tCant.\n1\tIMPELLER 10.75MD 1ST STG\t3A\t60178605\tPor catalogar\t1\n5\tPUMP SHAFT\t10\t60043338\tPor catalogar\t1\n21\tBRG DUPLEX PAIR\t-\t95215380\tPor catalogar\t1",
      esquema: "",
    },
    {
      titulo: "Bomba DVS",
      caption: "Tabla 6: Repuestos recomendados para bomba United Pump modelo DVS.",
      rows:
        "Ítem\tDescripción\tRef.\tN/P\tCódigo EPP\tCant.\n1\tKEY IMPELLER\t10A\t-\tPor catalogar\t1\n4\tINTERMEDIATE SHAFT SLEEVES\t9\t-\tPor catalogar\t2\n17\tBEARING BALL THRUST\t31A\tFRVB7310BECBM\tPor catalogar\t2",
      esquema: "",
    },
  ],
  intervalosIntro:
    "Bajo los criterios de confiabilidad operacional, y alineado a los estándares de las normativas API 610 y ANSI B73.1, para bombas centrífugas, se definen las siguientes frecuencias mínimas de reemplazo preventivo. Estos intervalos se han calculado para mantener al máximo la vida útil del activo y así garantizar la integridad mecánica bajo condiciones nominales de operatividad.",
  intervalosTabla:
    "Parte\tAPI 610\tANSI B73.1\nCojinetes / rodamientos\t8.000 - 12.000 horas (1 - 1.5 años)\t17.500 - 25.000 horas (2 - 3 años)\nSellos mecánicos\t12.000 - 16.000 horas (1.5 - 2 años). Depende las condiciones del fluido, temperatura\t12.000 - 18.000 horas (1.5 - 2 años). Depende del tipo de fluido\nAnillos de desgaste\t8.000 - 16.000 horas (1 - 2 años)\tInspección anual / cambio por holgura. Si tiene anillos, deben cambiarse cuando la holgura exceda el doble de la original\nImpulsor\tInspección cada 12.000 a 24.000 horas. Reemplazo según desgaste\tCondicional (3 - 5 años). Se reemplaza cuando el desgaste erosivo impide el ajuste de la luz frontal\nEjes y camisas de eje\tInspección cada 12.000 a 24.000 horas. Reemplazo según condición\tCada 2 cambios de sello. La deflexión máxima del eje debe ser de 0.002 pulgadas en la cara del sello",
  notaIntervalos:
    "Nota: La periodicidad de los intervalos de mantenimiento se encuentra intrínsecamente ligada a la severidad del servicio, las propiedades fisicoquímicas del fluido y la estabilidad operativa de cada equipo. Asimismo, la ejecución de un plan de mantenimiento preventivo adecuado y el cumplimiento de los estándares de instalación son determinantes para extender el tiempo medio entre fallas (MTBF).\n\nLos periodos de reemplazo recomendados se establecen con base en la experiencia operativa en bombas centrífugas y en las buenas prácticas de mantenimiento. Los valores presentados son de carácter referencial y deberán ajustarse conforme a las condiciones reales de servicio, el historial de fallas y los resultados obtenidos mediante el monitoreo de condición de cada activo.\n\nBajo este criterio, la norma API 610 define un criterio de alta integridad para servicios críticos o pesados, donde los intervalos de mantenimiento preventivo se extienden gracias a su diseño robusto que prioriza la persistencia operativa. En estas máquinas rotativas, el enfoque de reemplazo de elementos se orienta a maximizar el tiempo entre reparaciones (MTBF), donde es requerido tolerancias estrictas en componentes dinámicos para aminorar vibraciones y fatiga mecánica en condiciones extremas de presión y temperatura.\n\nPor el contrario, para la normativa ANSI B73.1, el enfoque se centra en la versatilidad de procesos químicos de servicio medio, donde la frecuencia de reemplazo de componentes responde mayoritariamente a la corrosión y al ajuste hidráulico del impulsor. De igual forma, se deberá preservar la integridad de la cámara de sellado y la estabilidad del conjunto rotativo ante el desgaste operativo.",
  conclusiones: [
    "Se consolidó el levantamiento de las unidades Flowserve, alcanzando la trazabilidad completa a través del contraste de data de campo y registros fotográficos.",
    "La evaluación física reveló que las unidades están operando bajo servicios severos, con fluidos abrasivos o con sólidos, por lo que presentan desgaste acelerado.",
    "Se evidenció una brecha crítica en la disponibilidad de repuestos en bodega para los modelos de la marca Flowserve.",
    "Los intervalos de sustitución para componentes críticos deben ser dinámicos y alineados con API 610, ANSI B73.1 y los manuales de Flowserve.",
  ],
  recomendaciones: [
    "Implementar en inventario las partes críticas detalladas en el acápite de lista de partes recomendadas.",
    "Fortalecer el programa de monitoreo de condición mediante análisis trimestral de vibraciones y termografía infrarroja.",
    "Establecer un programa de capacitación técnica especializada para procedimientos de alineación, montaje de sellos mecánicos y ajuste de holguras.",
    "Programar inspecciones internas intrusivas cada dos años, o en menor tiempo cuando las condiciones del fluido sean abrasivas o corrosivas.",
  ],
  realizadoPor: "Sebastián Patiño\nDiv. Gas y Petróleo\nASTAP Cía. Ltda.",
  revisadoPor: "Jorge Astudillo\nLíder de la Div. Gas y Petróleo\nASTAP Cía. Ltda.",
  recibidoPor: "Carlos Luna/Hólger Jimenez\nSupervisor Mecánico\nEP Petroecuador",
};

export function createEmptyVisitaCampoData() {
  return JSON.parse(JSON.stringify(defaultVisitaCampoData));
}
