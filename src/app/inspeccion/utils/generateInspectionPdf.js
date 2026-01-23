import jsPDF from "jspdf";
import "jspdf-autotable";

// IMPORTA TODO EL ESQUEMA (YA LO TIENES)
import {
  preServicio,
  sistemaHidraulicoAceite,
  sistemaHidraulicoAgua,
  sistemaElectrico,
  sistemaSuccion,
} from "../schemas/InspeccionHidroSchema";

/**
 * GENERADOR PDF INSPECCIÓN HIDRO
 * REGLA DE ORO:
 * - Todo el formulario SIEMPRE aparece
 * - Lleno o vacío
 * - Sin imágenes (por ahora)
 */
export function generateInspectionPdf(data = {}) {
  console.log("PDF GENERATE DATA:", data);

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 14;

  /* ======================================================
     TÍTULO
  ====================================================== */
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("HOJA DE INSPECCIÓN HIDROSUCCIONADOR", pageWidth / 2, y, {
    align: "center",
  });

  y += 8;

  /* ======================================================
     DATOS GENERALES
  ====================================================== */
  pdf.autoTable({
    startY: y,
    theme: "grid",
    styles: { fontSize: 8 },
    body: [
      ["Referencia contrato", data.referenciaContrato || ""],
      ["Descripción", data.descripcion || ""],
      ["Código interno", data.codInf || ""],
      ["Cliente", data.cliente || ""],
      ["Dirección", data.direccion || ""],
      ["Fecha servicio", data.fechaServicio || ""],
    ],
  });

  y = pdf.lastAutoTable.finalY + 6;

  /* ======================================================
     FUNCIÓN PARA TABLAS DE CHECKLIST
  ====================================================== */
  const renderChecklist = (titulo, esquema, valores = {}) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(titulo, 14, y);
    y += 3;

    const rows = esquema.map((item) => {
      const v = valores[item.codigo] || {};
      return [
        item.codigo,
        item.descripcion,
        v.estado === "SI" ? "✔" : "",
        v.estado === "NO" ? "✔" : "",
        v.observacion || "",
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

  /* ======================================================
     CHECKLIST COMPLETO (TODAS LAS SECCIONES)
  ====================================================== */
  renderChecklist(
    "1. PRUEBAS PREVIAS AL SERVICIO",
    preServicio,
    data.items
  );

  renderChecklist(
    "A. SISTEMA HIDRÁULICO (ACEITES)",
    sistemaHidraulicoAceite,
    data.items
  );

  renderChecklist(
    "B. SISTEMA HIDRÁULICO (AGUA)",
    sistemaHidraulicoAgua,
    data.items
  );

  renderChecklist(
    "C. SISTEMA ELÉCTRICO / ELECTRÓNICO",
    sistemaElectrico,
    data.items
  );

  renderChecklist(
    "D. SISTEMA DE SUCCIÓN",
    sistemaSuccion,
    data.items
  );

  /* ======================================================
     DESCRIPCIÓN DEL EQUIPO
  ====================================================== */
  pdf.setFont("helvetica", "bold");
  pdf.text("DESCRIPCIÓN DEL EQUIPO", 14, y);
  y += 4;

  pdf.autoTable({
    startY: y,
    theme: "grid",
    styles: { fontSize: 8 },
    body: [
      ["Marca", data.marca || ""],
      ["Modelo", data.modelo || ""],
      ["Serie", data.serie || ""],
      ["Año modelo", data.anioModelo || ""],
      ["VIN / Chasis", data.vin || ""],
      ["Placa", data.placa || ""],
      ["Horas módulo", data.horasModulo || ""],
      ["Horas chasis", data.horasChasis || ""],
      ["Kilometraje", data.kilometraje || ""],
      ["Nota", data.nota || ""],
    ],
  });

  y = pdf.lastAutoTable.finalY + 8;

  /* ======================================================
     FIRMAS (CAJAS VACÍAS)
  ====================================================== */
  pdf.setFont("helvetica", "bold");
  pdf.text("Firma técnico ASTAP", 35, y);
  pdf.text("Firma cliente", pageWidth - 60, y);

  y += 2;

  pdf.rect(20, y, 70, 30);
  pdf.rect(pageWidth - 90, y, 70, 30);

  /* ======================================================
     GUARDAR
  ====================================================== */
  pdf.save(`ASTAP_INSPECCION_HIDRO_${Date.now()}.pdf`);
}
