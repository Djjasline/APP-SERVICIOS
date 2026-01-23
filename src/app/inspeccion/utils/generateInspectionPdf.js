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
     CHECKLISTS
  ============================== */
  const secciones = [
    {
      titulo: "1. Pruebas de encendido",
      data: formData.inspeccion?.preServicio,
    },
    {
      titulo: "A. Sistema hidráulico (Aceite)",
      data: formData.inspeccion?.sistemaHidraulicoAceite,
    },
    {
      titulo: "B. Sistema hidráulico (Agua)",
      data: formData.inspeccion?.sistemaHidraulicoAgua,
    },
    {
      titulo: "C. Sistema eléctrico / electrónico",
      data: formData.inspeccion?.sistemaElectrico,
    },
    {
      titulo: "D. Sistema de succión",
      data: formData.inspeccion?.sistemaSuccion,
    },
  ];

  secciones.forEach((sec) => {
    if (!Array.isArray(sec.data) || sec.data.length === 0) return;

    pdf.setFont("helvetica", "bold");
    pdf.text(sec.titulo, marginLeft, y);
    y += 4;

    const rows = sec.data.map((item, index) => [
      index + 1,
      item.label || item.nombre || "Ítem",
      item.estado || "",
      item.observacion || "",
    ]);

    pdf.autoTable({
      startY: y,
      theme: "grid",
      styles: { fontSize: 8 },
      head: [["#", "Ítem", "Estado", "Observación"]],
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
      maxWidth: pa
