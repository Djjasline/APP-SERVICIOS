console.log("🚨 EJECUTANDO generateInspectionPdf.js");

/* ================= CHECKLIST (SI / NO) ================= */

// 1. PRUEBAS PREVIAS
pdf.setFillColor(...COLORS.headerBg);
pdf.setTextColor(...COLORS.headerText);
pdf.rect(marginLeft, cursorY, pageWidth - 28, 7, "F");
pdf.text(
  "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS",
  marginLeft + 2,
  cursorY + 5
);
pdf.setTextColor(0, 0, 0);

cursorY += 8;

pdf.autoTable({
  startY: cursorY,
  theme: "grid",
  styles: { fontSize: 8 },
  head: [["Ítem", "Detalle", "Estado", "Observación"]],
  body: [
    ["1.1", "Prueba de encendido general del equipo",
      inspectionData.items?.["1.1"]?.estado || "",
      inspectionData.items?.["1.1"]?.observacion || ""
    ],
    ["1.2", "Verificación de funcionamiento de controles principales",
      inspectionData.items?.["1.2"]?.estado || "",
      inspectionData.items?.["1.2"]?.observacion || ""
    ],
    ["1.3", "Revisión de alarmas o mensajes de fallo",
      inspectionData.items?.["1.3"]?.estado || "",
      inspectionData.items?.["1.3"]?.observacion || ""
    ],
  ],
});

cursorY = pdf.lastAutoTable.finalY + 6;

// 2. EVALUACIÓN DE COMPONENTES
const seccionesPdf = [
  {
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico (mangueras - acoples - bancos)"],
      ["A.2", "Nivel de aceite del soplador"],
      ["A.3", "Nivel de aceite hidráulico"],
    ],
  },
  // puedes seguir agregando B, C, D igual
];

seccionesPdf.forEach((sec) => {
  pdf.setFillColor(...COLORS.headerBg);
  pdf.setTextColor(...COLORS.headerText);
  pdf.rect(marginLeft, cursorY, pageWidth - 28, 7, "F");
  pdf.text(sec.titulo, marginLeft + 2, cursorY + 5);
  pdf.setTextColor(0, 0, 0);

  cursorY += 8;

  pdf.autoTable({
    startY: cursorY,
    theme: "grid",
    styles: { fontSize: 8 },
    head: [["Ítem", "Detalle", "Estado", "Observación"]],
    body: sec.items.map(([codigo, texto]) => [
      codigo,
      texto,
      inspectionData.items?.[codigo]?.estado || "",
      inspectionData.items?.[codigo]?.observacion || "",
    ]),
  });

  cursorY = pdf.lastAutoTable.finalY + 6;
});
