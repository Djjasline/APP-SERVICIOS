import jsPDF from "jspdf";
import "jspdf-autotable";

const ASTAP_LOGO = "/astap-logo.jpg";

export default function generateInspectionPdf(data) {
  console.log("PDF DATA:", data);

  if (!data) return;

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
      ["Referencia contrato", data.referenciaContrato || "—"],
      ["Descripción", data.descripcion || "—"],
      ["Código informe", data.codInf || "—"],
      ["Cliente", data.cliente || "—"],
      ["Dirección", data.direccion || "—"],
      ["Fecha servicio", data.fechaservicio || "—"],
    ],
  });

  y = pdf.lastAutoTable.finalY + 6;

  /* =============================
     CHECKLIST REAL (items)
  ============================== */
  const items = data.items || {};

  if (Object.keys(items).length > 0) {
    pdf.setFont("helvetica", "bold");
    pdf.text("CHECKLIST DE INSPECCIÓN", marginLeft, y);
    y += 4;

    const rows = Object.entries(items).map(([codigo, item]) => [
      codigo,
      item.titulo || item.descripcion || "Ítem",
      item.estado || "",
      item.observacion || "",
    ]);

    pdf.autoTable({
      startY: y,
      theme: "grid",
      styles: { fontSize: 8 },
      head: [["Código", "Ítem", "Estado", "Observación"]],
      body: rows,
    });

    y = pdf.lastAutoTable.finalY + 8;
  }

  /* =============================
     ESTADO DEL EQUIPO (PUNTOS)
  ============================== */
  if (Array.isArray(data.estadoEquipoPuntos) && data.estadoEquipoPuntos.length) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Estado del equipo (observaciones)", marginLeft, y);
    y += 4;

    data.estadoEquipoPuntos.forEach((p, i) => {
      pdf.text(`${i + 1}. ${p}`, marginLeft, y);
      y += 4;
    });

    y += 4;
  }

  /* =============================
     FIRMAS
  ============================== */
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

  /* =============================
     VER + DESCARGAR
  ============================== */
  const url = pdf.output("bloburl");
  window.open(url, "_blank");

  setTimeout(() => {
    pdf.save(`ASTAP_INSPECCION_HIDRO_${Date.now()}.pdf`);
  }, 500);
}
