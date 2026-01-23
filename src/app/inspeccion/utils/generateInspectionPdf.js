import jsPDF from "jspdf";
import "jspdf-autotable";

import {
  preServicio,
  sistemaHidraulicoAceite,
  sistemaHidraulicoAgua,
  sistemaElectrico,
  sistemaSuccion,
} from "../schemas/InspeccionHidroSchema";

import ASTAP_LOGO from "/astap-logo.jpg";

export default function generateInspectionPdf(formData, preview = true) {
  console.log("PDF GENERATE DATA:", formData);

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 14;
  let y = 15;

  /* ================= ENCABEZADO ================= */
  try {
    pdf.addImage(ASTAP_LOGO, "JPEG", margin, y, 30, 15);
  } catch (e) {
    console.warn("Logo no cargado:", e);
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text(
    "HOJA DE INSPECCIÓN HIDROSUCCIONADOR",
    pageWidth / 2,
    y + 10,
    { align: "center" }
  );

  y += 22;

  /* ================= DATOS GENERALES ================= */
  pdf.autoTable({
    startY: y,
    theme: "grid",
    styles: { fontSize: 8 },
    body: [
      ["Referencia contrato", formData.referenciaContrato || ""],
      ["Descripción", formData.descripcion || ""],
      ["Código interno", formData.codInf || ""],
      ["Cliente", formData.cliente || ""],
      ["Dirección", formData.direccion || ""],
      ["Fecha servicio", formData.fechaServicio || ""],
    ],
  });

  y = pdf.lastAutoTable.finalY + 6;

  /* ================= FUNCIÓN CHECKLIST ================= */
  const renderChecklist = (titulo, schema) => {
    pdf.setFont("helvetica", "bold");
    pdf.text(titulo, margin, y);
    y += 3;

    const rows = schema.map((item) => {
      const saved = formData.items?.[item.codigo] || {};
      return [
        item.codigo,
        item.descripcion,
        saved.estado === "SI" ? "✔" : "",
        saved.estado === "NO" ? "✔" : "",
        saved.observacion || "",
      ];
    });

    pdf.autoTable({
      startY: y,
      theme: "grid",
      styles: { fontSize: 8 },
      head: [["Ítem", "Detalle", "SI", "NO", "Observación"]],
      body: rows,
    });

    y = pdf.lastAutoTable.finalY + 6;
  };

  /* ================= SECCIONES ================= */
  renderChecklist("1. PRUEBAS PREVIAS AL SERVICIO", preServicio);
  renderChecklist("A. SISTEMA HIDRÁULICO (ACEITES)", sistemaHidraulicoAceite);
  renderChecklist("B. SISTEMA HIDRÁULICO (AGUA)", sistemaHidraulicoAgua);
  renderChecklist("C. SISTEMA ELÉCTRICO / ELECTRÓNICO", sistemaElectrico);
  renderChecklist("D. SISTEMA DE SUCCIÓN", sistemaSuccion);

  /* ================= DESCRIPCIÓN DEL EQUIPO ================= */
  pdf.setFont("helvetica", "bold");
  pdf.text("DESCRIPCIÓN DEL EQUIPO", margin, y);
  y += 4;

  pdf.autoTable({
    startY: y,
    theme: "grid",
    styles: { fontSize: 8 },
    body: [
      ["Marca", formData.marca || ""],
      ["Modelo", formData.modelo || ""],
      ["Serie", formData.serie || ""],
      ["Año modelo", formData.anioModelo || ""],
      ["VIN / Chasis", formData.vin || ""],
      ["Placa", formData.placa || ""],
      ["Horas módulo", formData.horasModulo || ""],
      ["Horas chasis", formData.horasChasis || ""],
      ["Kilometraje", formData.kilometraje || ""],
      ["Nota", formData.nota || ""],
    ],
  });

  y = pdf.lastAutoTable.finalY + 10;

  /* ================= FIRMAS ================= */
  const boxW = 70;
  const boxH = 28;

  if (formData.firmas?.tecnico?.startsWith("data:image")) {
    pdf.addImage(formData.firmas.tecnico, "PNG", margin, y, boxW, boxH);
  }

  if (formData.firmas?.cliente?.startsWith("data:image")) {
    pdf.addImage(
      formData.firmas.cliente,
      "PNG",
      margin + boxW + 20,
      y,
      boxW,
      boxH
    );
  }

  pdf.text("Firma técnico ASTAP", margin + boxW / 2, y + boxH + 5, {
    align: "center",
  });
  pdf.text(
    "Firma cliente",
    margin + boxW + 20 + boxW / 2,
    y + boxH + 5,
    { align: "center" }
  );

  /* ================= PREVIEW / DOWNLOAD ================= */
  if (preview) {
    const url = pdf.output("bloburl");
    window.open(url, "_blank");
  } else {
    pdf.save(`ASTAP_INSPECCION_HIDRO_${Date.now()}.pdf`);
  }
}
