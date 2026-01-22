alert("🔥 PDF INSPECCIÓN EJECUTADO");
console.log("🔥 generateReportPdf INSPECCION CARGADO");
import jsPDF from "jspdf";
import "jspdf-autotable";

// Logo
const ASTAP_LOGO = "/astap-logo.jpg";

// Imágenes reales del proyecto (public)
const ESTADO_IMAGEN = {
  hidro: "/estado-equipo.png",
  mantenimiento_hidro: "/estado-equipo.png",

  barredora: "/estado equipo barredora.png",
  mantenimiento_barredora: "/estado equipo barredora.png",

  camara: "/estado equipo camara.png",
};

// Colores corporativos
const COLORS = {
  headerBg: [0, 59, 102],
  headerText: [255, 255, 255],
};

/* ======================================================
   Helper: cargar imagen y convertirla a Base64
====================================================== */
const loadImageAsBase64 = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = encodeURI(src);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = reject;
  });

/* ======================================================
   FUNCIÓN PRINCIPAL
====================================================== */
export const generateInspectionPdf = async (inspectionData) => {
  console.log("PDF inspectionData:", inspectionData);
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
  const tipo = inspectionData.tipoFormulario || "hidro";
  const imgSrc = ESTADO_IMAGEN[tipo];
  const puntos = inspectionData.estadoEquipoPuntos || [];

  if (imgSrc) {
    // Título
    pdf.setFillColor(...COLORS.headerBg);
    pdf.setTextColor(...COLORS.headerText);
    pdf.rect(marginLeft, cursorY, pageWidth - 28, 7, "F");
    pdf.text("ESTADO DEL EQUIPO", marginLeft + 2, cursorY + 5);
    pdf.setTextColor(0, 0, 0);

    cursorY += 10;

    // 🔑 Imagen base64 (CLAVE)
    const base64Img = await loadImageAsBase64(imgSrc);

    const imgWidth = pageWidth - 40;
    const imgHeight = 80;
    const imgX = 20;
    const imgY = cursorY;

    pdf.addImage(base64Img, "PNG", imgX, imgY, imgWidth, imgHeight);

    // 🔴 PUNTOS ROJOS
    puntos.forEach((pt, idx) => {
      const x = imgX + (pt.x / 100) * imgWidth;
      const y = imgY + (pt.y / 100) * imgHeight;

      pdf.setFillColor(220, 0, 0);
      pdf.circle(x, y, 2.2, "F");

      pdf.setFontSize(7);
      pdf.setTextColor(255, 255, 255);
      pdf.text(String(idx + 1), x - 1, y + 1.5);
      pdf.setTextColor(0, 0, 0);
    });

    cursorY += imgHeight + 6;

    // 📝 OBSERVACIONES DE CADA PUNTO
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
  }
/* ================= CHECKLIST ================= */
const items = inspectionData.items || {};

if (Object.keys(items).length > 0) {
  pdf.setFillColor(...COLORS.headerBg);
  pdf.setTextColor(...COLORS.headerText);
  pdf.rect(marginLeft, cursorY, pageWidth - 28, 7, "F");
  pdf.text(
    "PRUEBAS DE ENCENDIDO Y EVALUACIÓN DE SISTEMAS",
    marginLeft + 2,
    cursorY + 5
  );
  pdf.setTextColor(0, 0, 0);

  cursorY += 8;

  pdf.autoTable({
    startY: cursorY,
    theme: "grid",
    styles: { fontSize: 8 },
    head: [["Ítem", "Estado", "Observación"]],
    body: Object.entries(items).map(([codigo, data]) => [
      codigo,
      data.estado === "SI" ? "SI" : data.estado === "NO" ? "NO" : "",
      data.observacion || "",
    ]),
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
