import jsPDF from "jspdf";
import "jspdf-autotable";

import {
  preServicio,
  sistemaHidraulicoAceite,
  sistemaHidraulicoAgua,
  sistemaElectrico,
  sistemaSuccion,
} from "../schemas/InspeccionHidroSchema";

/* ======================================================
   IMÁGENES BASE64 (OBLIGATORIO PARA jsPDF EN PRODUCCIÓN)
====================================================== */

// 🔵 LOGO ASTAP (ejemplo, reemplaza por el tuyo real)
const LOGO_ASTAP_BASE64 =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wCEAAkGBxISEhUTEhIVFRUVFRUVFRUVFRUVFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBBAcDAv/EADkQAAIBAgQDBgQEBQQDAQAAAAECAAMRBBIhMQVBUQYiYXGBEzKRobHR8BQjQlJy0fEVFjNTgpL/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAQIDBAX/xAAoEQEAAQQBAwMDBQAAAAAAAAAAAQACAxESITEEQVEiMlFhcbH/2gAMAwEAAhEDEQA/AP3yREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREH//Z";

// 🔵 IMAGEN ESTADO DEL EQUIPO (REEMPLAZA POR TU BASE64 REAL)
const EQUIPO_HIDRO_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...PEGAR_AQUI_COMPLETO...";

/* ======================================================
   GENERADOR PDF – FORMATO COMPLETO (REGLA DE ORO)
====================================================== */
export function generateInspectionPdf(data = {}) {
  console.log("PDF GENERATE DATA:", data);

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginLeft = 12;
  let y = 12;

  /* ======================================================
     ENCABEZADO
  ====================================================== */
  pdf.addImage(LOGO_ASTAP_BASE64, "JPEG", marginLeft, y, 22, 14);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(
    "HOJA DE INSPECCIÓN HIDROSUCCIONADOR",
    pageWidth / 2,
    y + 8,
    { align: "center" }
  );

  y += 18;

  /* ======================================================
     DATOS GENERALES (SIEMPRE)
  ====================================================== */
  pdf.autoTable({
    startY: y,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    body: [
      ["Referencia contrato", data.referenciaContrato || ""],
      ["Descripción", data.descripcion || ""],
      ["Código informe", data.codInf || ""],
      ["Cliente", data.cliente || ""],
      ["Dirección", data.direccion || ""],
      ["Contacto", data.contacto || ""],
      ["Correo", data.correo || ""],
      ["Técnico responsable", data.tecnicoResponsable || ""],
      ["Teléfono técnico", data.telefonoTecnico || ""],
      ["Correo técnico", data.correoTecnico || ""],
      ["Fecha servicio", data.fechaServicio || ""],
    ],
  });

  y = pdf.lastAutoTable.finalY + 6;

  /* ======================================================
     ESTADO DEL EQUIPO (IMAGEN + PUNTOS)
  ====================================================== */
  pdf.setFont("helvetica", "bold");
  pdf.text("Estado del equipo", marginLeft, y);
  y += 4;

  const imgW = 170;
  const imgH = 70;

  pdf.addImage(EQUIPO_HIDRO_BASE64, "PNG", marginLeft, y, imgW, imgH);


  const puntos = Array.isArray(data.estadoEquipoPuntos)
    ? data.estadoEquipoPuntos
    : [];

  puntos.forEach((p) => {
    if (typeof p.x === "number" && typeof p.y === "number") {
      const px = marginLeft + (p.x / 100) * imgW;
      const py = y + (p.y / 100) * imgH;
      pdf.setFillColor(255, 0, 0);
      pdf.circle(px, py, 2, "F");
    }
  });

  y += imgH + 6;

  /* ======================================================
     CHECKLIST COMPLETO (FORMATO MANDA)
  ====================================================== */
  const respuestas = data.items || {};

  const renderChecklist = (titulo, schema) => {
    pdf.setFont("helvetica", "bold");
    pdf.text(titulo, marginLeft, y);
    y += 2;

    const body = schema.map((i) => {
      const val = respuestas[i.codigo] || {};
      return [
        i.codigo,
        i.descripcion,
        val.estado === "SI" ? "X" : "",
        val.estado === "NO" ? "X" : "",
        val.observacion || "",
      ];
    });

    pdf.autoTable({
      startY: y,
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 1 },
      head: [["Ítem", "Detalle", "SI", "NO", "Observación"]],
      body,
    });

    y = pdf.lastAutoTable.finalY + 4;
  };

  renderChecklist(
    "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS",
    preServicio
  );
  renderChecklist("A. SISTEMA HIDRÁULICO (ACEITES)", sistemaHidraulicoAceite);
  renderChecklist("B. SISTEMA HIDRÁULICO (AGUA)", sistemaHidraulicoAgua);
  renderChecklist("C. SISTEMA ELÉCTRICO / ELECTRÓNICO", sistemaElectrico);
  renderChecklist("D. SISTEMA DE SUCCIÓN", sistemaSuccion);

  /* ======================================================
     DESCRIPCIÓN DEL EQUIPO
  ====================================================== */
  pdf.setFont("helvetica", "bold");
  pdf.text("Descripción del equipo", marginLeft, y);
  y += 2;

  pdf.autoTable({
    startY: y,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    body: [
      ["Nota", data.nota || ""],
      ["Marca", data.marca || ""],
      ["Modelo", data.modelo || ""],
      ["N° Serie", data.serie || ""],
      ["Año modelo", data.anioModelo || ""],
      ["VIN / Chasis", data.vin || ""],
      ["Placa", data.placa || ""],
      ["Horas módulo", data.horasModulo || ""],
      ["Horas chasis", data.horasChasis || ""],
      ["Kilometraje", data.kilometraje || ""],
    ],
  });

  y = pdf.lastAutoTable.finalY + 8;

  /* ======================================================
     FIRMAS
  ====================================================== */
  const boxW = 70;
  const boxH = 28;

  if (data.firmas?.tecnico) {
    pdf.addImage(
      data.firmas.tecnico,
      "PNG",
      marginLeft,
      y,
      boxW,
      boxH
    );
  }

  if (data.firmas?.cliente) {
    pdf.addImage(
      data.firmas.cliente,
      "PNG",
      marginLeft + boxW + 20,
      y,
      boxW,
      boxH
    );
  }

  pdf.setFontSize(8);
  pdf.text("Firma técnico ASTAP", marginLeft + boxW / 2, y + boxH + 4, {
    align: "center",
  });
  pdf.text(
    "Firma cliente",
    marginLeft + boxW + 20 + boxW / 2,
    y + boxH + 4,
    { align: "center" }
  );

  /* ======================================================
     VISTA PREVIA + DESCARGA
  ====================================================== */
  const blobUrl = pdf.output("bloburl");
  window.open(blobUrl, "_blank");

  setTimeout(() => {
    pdf.save(`ASTAP_INSPECCION_HIDRO_${Date.now()}.pdf`);
  }, 500);
}
