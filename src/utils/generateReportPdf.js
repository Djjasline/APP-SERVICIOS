import jsPDF from "jspdf";
import "jspdf-autotable";

const ASTAP_LOGO = "/astap-logo.jpg";

export const generateReportPdf = async (inspectionData) => {
  console.log("🔥 PDF EJECUTADO - DATA:", inspectionData);

  const data = inspectionData.data || inspectionData; // 🔑 CLAVE

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginLeft = 14;
  let y = 14;

  /* ===== ENCABEZADO ===== */
  pdf.addImage(ASTAP_LOGO, "JPEG", marginLeft, y, 28, 16);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    "HOJA DE INSPECCIÓN HIDROSUCCIONADOR",
    pageWidth / 2,
    y + 10,
    { align: "center" }
  );
  y += 22;

  pdf.autoTable({
    startY: y,
    theme: "grid",
    styles: { fontSize: 8 },
    body: [
      ["Cliente", data.cliente || ""],
      ["Dirección", data.direccion || ""],
      ["Contacto", data.contacto || ""],
      ["Fecha", data.fechaServicio || ""],
    ],
  });

  y = pdf.lastAutoTable.finalY + 6;

  /* ===== CHECKLIST (ESTE ERA EL PROBLEMA) ===== */
  const items = data.items || {};

  console.log("✅ ITEMS PDF:", items);

  if (Object.keys(items).length > 0) {
    pdf.setFont("helvetica", "bold");
    pdf.text("CHECKLIST DE INSPECCIÓN", marginLeft, y);
    y += 4;

    pdf.autoTable({
      startY: y,
      theme: "grid",
      styles: { fontSize: 8 },
      head: [["Ítem", "Estado", "Observación"]],
      body: Object.entries(items).map(([codigo, item]) => [
        codigo,
        item.estado || "",
        item.observacion || "",
      ]),
    });

    y = pdf.lastAutoTable.finalY + 6;
  }

  /* ===== FIRMAS ===== */
  const boxW = 70;
  const boxH = 30;

  if (data.firmas?.tecnico) {
    pdf.addImage(data.firmas.tecnico, "PNG", marginLeft, y, boxW, boxH);
  }

  if (data.firmas?.cliente) {
    pdf.addImage(
      data.firmas.cliente,
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
};
