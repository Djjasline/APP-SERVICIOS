// src/utils/generarInformePdf.js
import jsPDF from "jspdf";
import "jspdf-autotable";

export function generarInformePdf({ type, inspection }) {
  const doc = new jsPDF();

  const titulo = {
    hidro: "INFORME DE INSPECCIÓN – HIDROSUCCIONADOR",
    barredora: "INFORME DE INSPECCIÓN – BARREDORA",
    camara: "INFORME DE INSPECCIÓN – CÁMARA",
  };

  doc.setFontSize(14);
  doc.text(titulo[type] || "INFORME DE INSPECCIÓN", 14, 15);

  doc.setFontSize(10);
  doc.text(`Fecha: ${inspection.fecha || ""}`, 14, 25);
  doc.text(`Estado: ${inspection.estado}`, 14, 32);

  doc.text(
    `Cliente: ${inspection.data?.cliente || "Sin cliente"}`,
    14,
    40
  );

  // TABLA SIMPLE DE DATOS
  doc.autoTable({
    startY: 50,
    head: [["Campo", "Valor"]],
    body: Object.entries(inspection.data || {}).map(
      ([k, v]) => [k, String(v)]
    ),
    styles: { fontSize: 8 },
  });

  doc.save(
    `inspeccion-${type}-${inspection.id}.pdf`
  );
}
