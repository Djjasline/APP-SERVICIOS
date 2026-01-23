import jsPDF from "jspdf";
import "jspdf-autotable";

const ASTAP_LOGO = "/astap-logo.jpg";

export function generateInspectionPdf(formData) {
  alert("🔥 ESTA FUNCIÓN SÍ SE EJECUTA");

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
      ["Cliente", formData.cliente || ""],
      ["Dirección", formData.direccion || ""],
      ["Contacto", formData.contacto || ""],
      ["Fecha", formData.fechaServicio || ""],
    ],
  });

  y = pdf.lastAutoTable.finalY + 6;

  /* ========= CHECKLIST ========= */
  const items = formData.items;

  console.log("📋 CHECKLIST:", items);

  if (items && typeof items === "object" && Object.keys(items).length > 0) {
    const rows = Object.entries(items).map(([codigo, item]) => [
      codigo,
      item.estado || "",
      item.observacion || "",
    ]);

    pdf.setFont("helvetica", "bold");
    pdf.text("CHECKLIST DE INSPECCIÓN", marginLeft, y);
    y += 4;

    pdf.autoTable({
      startY: y,
      theme: "grid",
      styles: { fontSize: 8 },
      head: [["Ítem", "Estado", "Observación"]],
      body: rows,
    });

    y = pdf.lastAutoTable.finalY + 6;
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

  pdf.save(`ASTAP_INSPECCION_${Date.now()}.pdf`);
}
