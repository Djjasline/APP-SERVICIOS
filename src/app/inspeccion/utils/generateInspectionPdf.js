import jsPDF from "jspdf";
import "jspdf-autotable";

const ASTAP_LOGO = "/astap-logo.jpg";

export default function generateInspectionPdf(formData) {
  console.log("📄 PDF DATA:", formData);

  if (!formData) {
    alert("No hay datos para generar el PDF");
    return;
  }

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginLeft = 14;
  let y = 14;

  /* =============================
     ENCABEZADO
  ============================== */
  pdf.addImage(ASTAP_LOGO, "JPEG", marginLeft, y, 28, 16);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(
    "HOJA DE INSPECCIÓN HIDROSUCCIONADOR",
    pageWidth / 2,
    y + 10,
    { align: "center" }
  );

  y += 22;

  /* =============================
     DATOS GENERALES
  ============================== */
  pdf.autoTable({
    startY: y,
    theme: "grid",
    styles: { fontSize: 8 },
    body: [
      ["Cliente", formData.cliente?.nombre || "—"],
      ["Equipo", formData.equipo?.descripcion || "—"],
      ["Fecha", new Date().toLocaleDateString()],
      ["Estado final", formData.estadoEquipo || "—"],
    ],
  });

  y = pdf.lastAutoTable.finalY + 6;

  /* =============================
   CHECKLISTS (FORMATO REAL)
============================== */
const secciones = [
  { titulo: "1. Pruebas de encendido", key: "preServicio" },
  { titulo: "A. Sistema hidráulico (Aceite)", key: "sistemaHidraulicoAceite" },
  { titulo: "B. Sistema hidráulico (Agua)", key: "sistemaHidraulicoAgua" },
  { titulo: "C. Sistema eléctrico / electrónico", key: "sistemaElectrico" },
  { titulo: "D. Sistema de succión", key: "sistemaSuccion" },
];

secciones.forEach(({ titulo, key }) => {
  const lista = formData.inspeccion?.[key];
  if (!Array.isArray(lista) || lista.length === 0) return;

  pdf.setFont("helvetica", "bold");
  pdf.text(titulo, marginLeft, y);
  y += 4;

  const rows = lista.map((item, index) => [
    index + 1,
    item.nombre || item.label || item.descripcion || "Ítem",
    item.valor || item.estado || item.checked ? "OK" : "NO OK",
    item.observacion || "",
  ]);

  pdf.autoTable({
    startY: y,
    theme: "grid",
    styles: { fontSize: 8 },
    head: [["#", "Ítem", "Resultado", "Observación"]],
    body: rows,
  });

  y = pdf.lastAutoTable.finalY + 6;
});

  /* =============================
     OBSERVACIONES
  ============================== */
  if (formData.observaciones) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Observaciones generales", marginLeft, y);
    y += 4;

    pdf.setFont("helvetica", "normal");
    pdf.text(formData.observaciones, marginLeft, y, {
      maxWidth: pageWidth - marginLeft * 2,
    });

    y += 10;
  }

  /* =============================
     FIRMAS
  ============================== */
  const boxW = 70;
  const boxH = 30;

  if (formData.firmas?.tecnico) {
    pdf.addImage(
      formData.firmas.tecnico,
      "PNG",
      marginLeft,
      y,
      boxW,
      boxH
    );
  }

  if (formData.firmas?.cliente) {
    pdf.addImage(
      formData.firmas.cliente,
      "PNG",
      marginLeft + boxW + 10,
      y,
      boxW,
      boxH
    );
  }

  pdf.text("Firma técnico", marginLeft + boxW / 2, y + boxH + 5, {
    align: "center",
  });

  pdf.text(
    "Firma cliente",
    marginLeft + boxW + 10 + boxW / 2,
    y + boxH + 5,
    { align: "center" }
  );

  /* =============================
     👁️ VER + 📄 DESCARGAR
  ============================== */
  const pdfUrl = pdf.output("bloburl");
  window.open(pdfUrl, "_blank");

  setTimeout(() => {
    pdf.save(`ASTAP_INSPECCION_HIDRO_${Date.now()}.pdf`);
  }, 500);
}
