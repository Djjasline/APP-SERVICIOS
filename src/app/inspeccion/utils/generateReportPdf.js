import jsPDF from "jspdf";
import "jspdf-autotable";

// Logo (ruta pública)
const ASTAP_LOGO = "/astap-logo.jpg";

// Imágenes de estado del equipo
const ESTADO_IMAGEN = {
  hidro: "/estado-equipo.png",
  mantenimiento_hidro: "/estado-equipo.png",

  barredora: "/estado equipo barredora.png",
  mantenimiento_barredora: "/estado equipo barredora.png",

  camara: "/estado equipo camara.png",
};

// Colores corporativos
const COLORS = {
  sectionHeaderBg: [0, 59, 102],
  sectionHeaderText: [255, 255, 255],
};

export const generateReportPdf = (inspectionData) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginLeft = 14;
  let cursorY = 14;

  /* ================= ENCABEZADO ================= */
  pdf.addImage(ASTAP_LOGO, "JPEG", marginLeft, cursorY, 28, 16);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(
    "HOJA DE INSPECCIÓN",
    pageWidth / 2,
    cursorY + 10,
    { align: "center" }
  );

  cursorY += 22;

  pdf.autoTable({
    startY: cursorY,
    theme: "grid",
    styles: { fontSize: 8 },
    body: [
      ["Cliente", inspectionData.cliente?.nombre || ""],
      ["Dirección", inspectionData.cliente?.direccion || ""],
      ["Contacto", inspectionData.cliente?.contacto || ""],
      ["Fecha servicio", inspectionData.fechaServicio || ""],
    ],
  });

  cursorY = pdf.lastAutoTable.finalY + 6;

  /* ================= ESTADO DEL EQUIPO ================= */
  pdf.setFillColor(...COLORS.sectionHeaderBg);
  pdf.setTextColor(...COLORS.sectionHeaderText);
  pdf.rect(marginLeft, cursorY, pageWidth - 28, 7, "F");
  pdf.text("ESTADO DEL EQUIPO", marginLeft + 2, cursorY + 5);
  pdf.setTextColor(0, 0, 0);

  cursorY += 10;

  const tipo = inspectionData.tipoFormulario || "hidro";
  const estadoImgPath = ESTADO_IMAGEN[tipo];

  const imgWidth = pageWidth - 40;
  const imgHeight = 80;
  const imgX = 20;
  const imgY = cursorY;

  const puntos = inspectionData.estadoEquipoPuntos || [];

  if (estadoImgPath) {
    pdf.addImage(
      estadoImgPath,
      "PNG",
      imgX,
      imgY,
      imgWidth,
      imgHeight
    );

    // 🔴 Dibujar puntos
    puntos.forEach((pt, idx) => {
      const x = imgX + (pt.x / 100) * imgWidth;
      const y = imgY + (pt.y / 100) * imgHeight;

      pdf.setFillColor(220, 0, 0);
      pdf.circle(x, y, 2.2, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.text(String(idx + 1), x - 1, y + 1.5);
      pdf.setTextColor(0, 0, 0);
    });

    cursorY += imgHeight + 6;
  }

  /* ===== LISTA DE OBSERVACIONES DE PUNTOS ===== */
  if (puntos.length > 0) {
    pdf.autoTable({
      startY: cursorY,
      theme: "grid",
      styles: { fontSize: 8 },
      head: [["#", "Observación"]],
      body: puntos.map((pt, idx) => [
        idx + 1,
        pt.nota || "",
      ]),
    });

    cursorY = pdf.lastAutoTable.finalY + 6;
  }

  /* ================= CHECKLIST ================= */
  Object.entries(inspectionData.inspeccion || {}).forEach(
    ([titulo, lista]) => {
      pdf.setFillColor(...COLORS.sectionHeaderBg);
      pdf.setTextColor(...COLORS.sectionHeaderText);
      pdf.rect(marginLeft, cursorY, pageWidth - 28, 7, "F");
      pdf.text(titulo.toUpperCase(), marginLeft + 2, cursorY + 5);
      pdf.setTextColor(0, 0, 0);

      cursorY += 8;

      pdf.autoTable({
        startY: cursorY,
        theme: "grid",
        styles: { fontSize: 8 },
        head: [["Ítem", "Detalle", "Estado", "Observación"]],
        body: lista.map((it) => [
          it.codigo,
          it.detalle,
          it.estado || "",
          it.observacion || "",
        ]),
      });

      cursorY = pdf.lastAutoTable.finalY + 6;
    }
  );

  /* ================= OBSERVACIONES GENERALES ================= */
  if (inspectionData.observaciones) {
    pdf.autoTable({
      startY: cursorY,
      theme: "grid",
      styles: { fontSize: 8 },
      body: [["Observaciones generales", inspectionData.observaciones]],
    });

    cursorY = pdf.lastAutoTable.finalY + 6;
  }

  /* ================= FIRMAS ================= */
  const boxWidth = 70;
  const boxHeight = 30;

  if (inspectionData.firmas?.tecnico) {
    pdf.addImage(
      inspectionData.firmas.tecnico,
      "PNG",
      marginLeft,
      cursorY,
      boxWidth,
      boxHeight
    );
  }

  if (inspectionData.firmas?.cliente) {
    pdf.addImage(
      inspectionData.firmas.cliente,
      "PNG",
      marginLeft + boxWidth + 10,
      cursorY,
      boxWidth,
      boxHeight
    );
  }

  pdf.text(
    "Firma técnico",
    marginLeft + boxWidth / 2,
    cursorY + boxHeight + 5,
    { align: "center" }
  );
  pdf.text(
    "Firma cliente",
    marginLeft + boxWidth + 10 + boxWidth / 2,
    cursorY + boxHeight + 5,
    { align: "center" }
  );

  /* ================= GUARDAR ================= */
  pdf.save(
    `ASTAP_${inspectionData.tipoFormulario || "INSPECCION"}_${
      inspectionData.id || Date.now()
    }.pdf`
  );
};
