import jsPDF from "jspdf";
import "jspdf-autotable";

const ASTAP_LOGO = "/astap-logo.jpg";

export function generateInspectionPdf(formData) {
  console.log("📄 PDF DATA:", formData);

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginLeft = 14;
  let y = 14;

  /* ========= ENCABEZADO ========= */
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

  /* ========= DATOS GENERALES ========= */
  pdf.autoTable({
    startY: y,
    theme: "grid",
    styles: { fontSize: 8 },
    body: [
      ["Cliente", formData.cliente?.nombre || ""],
      ["Equipo", formData.equipo?.descripcion || ""],
      ["Fecha", new Date().toLocaleDateString()],
      ["Estado final", formData.estadoEquipo || ""],
    ],
  });

  y = pdf.lastAutoTable.finalY + 6;

  /* ========= CHECKLISTS ========= */
  const secciones = [
    { titulo: "1. Pruebas de encendido", data: formData.inspeccion?.preServicio },
    { titulo: "A. Sistema hidráulico (Aceite)", data: formData.inspeccion?.sistemaHidraulicoAceite },
    { titulo: "B. Sistema hidráulico (Agua)", data: formData.inspeccion?.sistemaHidraulicoAgua },
    { titulo: "C. Sistema eléctrico / electrónico", data: formData.inspeccion?.sistemaElectrico },
    { titulo: "D. Sistema de succión", data: formData.inspeccion?.sistemaSuccion },
  ];

  secciones.forEach((seccion) => {
    if (!Array.isArray(seccion.data) || seccion.data.length === 0) return;

    pdf.setFont("helvetica", "bold");
    pdf.text(seccion.titulo, marginLeft, y);
    y += 4;

    const rows = seccion.data.map((item, index) => [
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

  /* ========= OBSERVACIONES ========= */
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

  /* ========= FIRMAS ========= */
  const boxW = 70;
  const boxH = 30;

  if (formData.firmas?.tecnico) {
    pdf.addImage(formData.firmas.tecnico, "PNG", marginLeft, y, boxW, boxH);
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

  pdf.save(`ASTAP_INSPECCION_HIDRO_${Date.now()}.pdf`);
}
