// src/app/inspeccion/utils/generateReportPdf.js
import jsPDF from "jspdf";
import "jspdf-autotable";
import astapLogo from "../astap-logo.jpg";

// Colores corporativos
const COLORS = {
  primary: [0, 59, 102],
  sectionHeaderBg: [0, 59, 102],
  sectionHeaderText: [255, 255, 255],
  tableHeaderBg: [173, 216, 230],
  tableHeaderText: [0, 0, 0],
  tableStripedBg: [245, 249, 255],
};

export const generateReportPdf = (inspectionData) => {
  const pdf = new jsPDF("p", "mm", "a4");

  const marginLeft = 14;
  let cursorY = 14;
  const pageWidth = pdf.internal.pageSize.getWidth();

  /* ================= ENCABEZADO ================= */
  pdf.addImage(astapLogo, "JPEG", marginLeft, cursorY, 30, 18);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    "HOJA DE INSPECCIÓN HIDROSUCCIONADOR",
    pageWidth / 2,
    cursorY + 10,
    { align: "center" }
  );

  cursorY += 24;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");

  pdf.autoTable({
    startY: cursorY,
    theme: "grid",
    styles: { fontSize: 8 },
    body: [
      ["Referencia contrato", inspectionData.referenciaContrato || ""],
      ["Descripción", inspectionData.descripcion || ""],
      ["Código informe", inspectionData.codInf || ""],
      ["Cliente", inspectionData.cliente || ""],
      ["Dirección", inspectionData.direccion || ""],
      ["Contacto", inspectionData.contacto || ""],
      ["Teléfono", inspectionData.telefono || ""],
      ["Correo", inspectionData.correo || ""],
      ["Técnico responsable", inspectionData.tecnicoResponsable || ""],
      ["Fecha servicio", inspectionData.fechaServicio || ""],
    ],
  });

  cursorY = pdf.lastAutoTable.finalY + 6;

  /* ================= PRUEBAS / SECCIONES ================= */
  const renderTable = (title, items) => {
    pdf.setFillColor(...COLORS.sectionHeaderBg);
    pdf.setTextColor(...COLORS.sectionHeaderText);
    pdf.rect(marginLeft, cursorY, pageWidth - 28, 7, "F");
    pdf.text(title, marginLeft + 2, cursorY + 5);

    cursorY += 8;

    pdf.autoTable({
      startY: cursorY,
      theme: "grid",
      styles: { fontSize: 8 },
      head: [["Ítem", "Detalle", "Estado", "Observación"]],
      body: items.map(([codigo, texto]) => {
        const item = inspectionData.items?.[codigo] || {};
        return [
          codigo,
          texto,
          item.estado || "",
          item.observacion || "",
        ];
      }),
    });

    cursorY = pdf.lastAutoTable.finalY + 6;
    pdf.setTextColor(0, 0, 0);
  };

  // Pruebas previas
  renderTable(
    "PRUEBAS DE ENCENDIDO Y FUNCIONAMIENTO",
    inspectionData.pruebasPrevias || []
  );

  // Secciones dinámicas
  (inspectionData.secciones || []).forEach((sec) => {
    renderTable(sec.titulo, sec.items);
  });

  /* ================= DESCRIPCIÓN DEL EQUIPO ================= */
  pdf.autoTable({
    startY: cursorY,
    theme: "grid",
    styles: { fontSize: 8 },
    body: [
      ["Marca", inspectionData.marca || ""],
      ["Modelo", inspectionData.modelo || ""],
      ["Serie", inspectionData.serie || ""],
      ["Año modelo", inspectionData.anioModelo || ""],
      ["VIN / Chasis", inspectionData.vin || ""],
      ["Placa", inspectionData.placa || ""],
      ["Horas módulo", inspectionData.horasModulo || ""],
      ["Horas chasis", inspectionData.horasChasis || ""],
      ["Kilometraje", inspectionData.kilometraje || ""],
      ["Nota", inspectionData.nota || ""],
    ],
  });

  cursorY = pdf.lastAutoTable.finalY + 10;

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
    "Firma técnico ASTAP",
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
  const fileName = `ASTAP_Inspeccion_Hidro_${inspectionData.codInf || "SIN-CODIGO"}.pdf`;
  pdf.save(fileName);
};
