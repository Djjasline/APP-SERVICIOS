console.log("🚨 EJECUTANDO generateReportPdf.js");

import jsPDF from "jspdf";
import "jspdf-autotable";

/* ======================================================
   CONFIG
====================================================== */
const ASTAP_LOGO = "/astap-logo.jpg";

const ESTADO_IMAGEN = {
  hidro: "/estado-equipo.png",
};

const COLORS = {
  headerBg: [0, 59, 102],
  headerText: [255, 255, 255],
};

/* ======================================================
   HELPER IMAGEN BASE64
====================================================== */
const loadImageAsBase64 = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

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
   PDF INSPECCIÓN (FUNCIÓN FINAL)
====================================================== */
export const generateInspectionPdf = async (inspectionData) => {
  console.log("📄 PDF DATA RECIBIDA:", inspectionData);

  // 🔑 NORMALIZAR DATOS (CLAVE)
  const data = inspectionData;

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginLeft = 14;
  let cursorY = 14;

  /* ================= ENCABEZADO ================= */
  pdf.addImage(ASTAP_LOGO, "JPEG", marginLeft, cursorY, 28, 16);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("HOJA DE INSPECCIÓN HIDROSUCCIONADOR", pageWidth / 2, cursorY + 10, {
    align: "center",
  });

  cursorY += 22;

  pdf.autoTable({
    startY: cursorY,
    theme: "grid",
    styles: { fontSize: 8 },
    body: [
      ["Cliente", data.cliente || ""],
      ["Dirección", data.direccion || ""],
      ["Contacto", data.contacto || ""],
      ["Fecha servicio", data.fechaServicio || ""],
    ],
  });

  cursorY = pdf.lastAutoTable.finalY + 6;

  /* ================= ESTADO DEL EQUIPO ================= */
  const imgSrc = ESTADO_IMAGEN.hidro;
  const puntos = data.estadoEquipoPuntos || [];

  if (imgSrc) {
    pdf.setFillColor(...COLORS.headerBg);
    pdf.setTextColor(...COLORS.headerText);
    pdf.rect(marginLeft, cursorY, pageWidth - 28, 7, "F");
    pdf.text("ESTADO DEL EQUIPO", marginLeft + 2, cursorY + 5);
    pdf.setTextColor(0, 0, 0);

    cursorY += 10;

    const base64Img = await loadImageAsBase64(imgSrc);

    const imgWidth = pageWidth - 40;
    const imgHeight = 80;
    const imgX = 20;

    pdf.addImage(base64Img, "PNG", imgX, cursorY, imgWidth, imgHeight);

    puntos.forEach((pt, i) => {
      const x = imgX + (pt.x / 100) * imgWidth;
      const y = cursorY + (pt.y / 100) * imgHeight;

      pdf.setFillColor(220, 0, 0);
      pdf.circle(x, y, 2.2, "F");

      pdf.setFontSize(7);
      pdf.setTextColor(255, 255, 255);
      pdf.text(String(i + 1), x - 1, y + 1.5);
      pdf.setTextColor(0, 0, 0);
    });

    cursorY += imgHeight + 6;
  }

  /* ================= CHECKLIST (EL PROBLEMA) ================= */
  const items =
  data.items ||
  data.formData?.items ||
  {};

  if (Object.keys(items).length > 0) {
    pdf.setFillColor(...COLORS.headerBg);
    pdf.setTextColor(...COLORS.headerText);
    pdf.rect(marginLeft, cursorY, pageWidth - 28, 7, "F");
    pdf.text(
      "1–2. CHECKLIST DE INSPECCIÓN",
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
      body: Object.entries(items).map(([codigo, item]) => [
        codigo,
        item.estado === "SI" ? "SI" : item.estado === "NO" ? "NO" : "",
        item.observacion || "",
      ]),
    });

    cursorY = pdf.lastAutoTable.finalY + 6;
  }

  /* ================= FIRMAS ================= */
  const boxWidth = 70;
  const boxHeight = 30;

  if (data.firmas?.tecnico) {
    pdf.addImage(
      data.firmas.tecnico,
      "PNG",
      marginLeft,
      cursorY,
      boxWidth,
      boxHeight
    );
  }

  if (data.firmas?.cliente) {
    pdf.addImage(
      data.firmas.cliente,
      "PNG",
      marginLeft + boxWidth + 10,
      cursorY,
      boxWidth,
      boxHeight
    );
  }

  pdf.text("Firma técnico", marginLeft + boxWidth / 2, cursorY + boxHeight + 5, {
    align: "center",
  });

  pdf.text(
    "Firma cliente",
    marginLeft + boxWidth + 10 + boxWidth / 2,
    cursorY + boxHeight + 5,
    { align: "center" }
  );

  /* ================= GUARDAR ================= */
  pdf.save(`ASTAP_INSPECCION_${Date.now()}.pdf`);
};
