// ──────────────────────────────────────────────────────
//  generarPDFInformeAgua.js
//  Genera el PDF del Informe de Avance EPMAPS – Cloro Gas
//  Usa jsPDF + autoTable (misma filosofía que generarPDFRecepcion)
// ──────────────────────────────────────────────────────
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Convierte URL de imagen a base64 con timeout
const imageToBase64 = (url, timeoutMs = 8000) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => resolve(null), timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => { clearTimeout(timer); resolve(null); };
    img.src = url;
  });

// ── Colores corporativos ──────────────────────────────
const AZUL_OSCURO  = [26, 41, 66];    // #1a2942
const AZUL_MEDIO   = [37, 99, 235];   // #2563eb
const GRIS_CLARO   = [245, 246, 248]; // #f5f6f8
const NEGRO        = [26, 26, 26];
const BLANCO       = [255, 255, 255];
const VERDE        = [22, 163, 74];
const ROJO         = [220, 38, 38];

// ── helpers PDF ───────────────────────────────────────
const pageW  = (doc) => doc.internal.pageSize.getWidth();
const pageH  = (doc) => doc.internal.pageSize.getHeight();
const margin = 14;

const addPageIfNeeded = (doc, y, needed = 20) => {
  if (y + needed > pageH(doc) - 20) {
    doc.addPage();
    return margin + 6;
  }
  return y;
};

const sectionHeader = (doc, y, text) => {
  const w = pageW(doc) - margin * 2;
  doc.setFillColor(...AZUL_OSCURO);
  doc.rect(margin, y, w, 8, "F");
  doc.setTextColor(...BLANCO);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(text.toUpperCase(), margin + 4, y + 5.5);
  doc.setTextColor(...NEGRO);
  return y + 10;
};

const labelValue = (doc, x, y, label, value, labelW = 38) => {
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(107, 114, 128);
  doc.text(label.toUpperCase(), x, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...NEGRO);
  const val = value ? String(value) : "—";
  doc.text(val, x + labelW, y, { maxWidth: 80 });
};

// ── Encabezado de página ──────────────────────────────
const addHeader = (doc, periodo) => {
  const w = pageW(doc);

  // franja azul superior
  doc.setFillColor(...AZUL_OSCURO);
  doc.rect(0, 0, w, 18, "F");

  // logo texto
  doc.setTextColor(...BLANCO);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("ASTAP CIA. LTDA.", margin, 8);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("Av. Naciones Unidas 1084 – Quito, Ecuador", margin, 13.5);

  // título derecho
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("INFORME DE AVANCE – CLORO GAS EPMAPS", w - margin, 7, { align: "right" });
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(periodo || "", w - margin, 13, { align: "right" });

  doc.setTextColor(...NEGRO);
  return 22;
};

// ── Pie de página ─────────────────────────────────────
const addFooter = (doc, pageNum, totalPages) => {
  const y = pageH(doc) - 8;
  const w = pageW(doc);
  doc.setFillColor(...GRIS_CLARO);
  doc.rect(0, y - 4, w, 12, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("+593 2-226-2154  |  astap@astap.com  |  http://astap.com  |  1790027740001", margin, y + 1);
  doc.text(`Página ${pageNum} / ${totalPages}`, w - margin, y + 1, { align: "right" });
};

// ── Función principal ────────────────────────────────
export const generarPDFInformeAgua = async (data = {}) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const w = pageW(doc);

  // ── Página 1: portada + encabezado del informe ──────
  let y = addHeader(doc, data.periodo);

  // Título principal
  y += 6;
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...AZUL_OSCURO);
  doc.text("Reporte de Avance", margin, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  doc.text(data.periodo || "Sin período definido", margin, y);
  y += 8;

  // Línea separadora
  doc.setDrawColor(...AZUL_MEDIO);
  doc.setLineWidth(0.5);
  doc.line(margin, y, w - margin, y);
  y += 8;

  // Datos del contrato
  y = sectionHeader(doc, y, "Datos del Contrato");
  y += 3;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fontSize: 8.5, cellPadding: 3, textColor: NEGRO },
    headStyles: { fillColor: GRIS_CLARO, fontStyle: "bold", textColor: [55, 65, 81] },
    head: [["Contrato", "Pedido N°", "Supervisor de Contrato", "Administrador de Contrato"]],
    body: [[
      data.contrato || "—",
      data.pedido || "—",
      data.supervisor || "—",
      data.administrador || "—",
    ]],
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 38 },
      2: { cellWidth: 60 },
      3: { cellWidth: 42 },
    },
  });

  y = doc.lastAutoTable.finalY + 10;

  // Introducción estándar
  y = addPageIfNeeded(doc, y, 30);
  y = sectionHeader(doc, y, "Introducción");
  y += 5;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  const intro =
    "La empresa ASTAP, en colaboración con la Empresa Pública Metropolitana de Agua Potable y Saneamiento " +
    "(EPMAPS), tiene a su cargo el mantenimiento de los sistemas de cloro gas en los pozos y tanques de la " +
    "red de distribución de agua. Se presentan a continuación las actividades realizadas durante el período indicado.";
  const introLines = doc.splitTextToSize(intro, w - margin * 2);
  doc.text(introLines, margin, y);
  y += introLines.length * 4.5 + 6;

  // Resumen de actividades
  const actividades = Array.isArray(data.actividades) ? data.actividades : [];

  y = addPageIfNeeded(doc, y, 20);
  y = sectionHeader(doc, y, `Actividades realizadas — ${actividades.length} orden(es) de trabajo`);
  y += 4;

  // tabla resumen
  const resumenRows = actividades.map((act, i) => [
    (i + 1).toString(),
    act.ordenNumero || "—",
    act.lugar || "—",
    act.fechaEjecucion
      ? new Date(act.fechaEjecucion + "T12:00:00").toLocaleDateString("es-EC")
      : "—",
    act.cloroResidual ? `${act.cloroResidual} PPM` : "—",
    act.sistemaHabilitado ? "Habilitado" : "Inhabilitado",
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "striped",
    styles: { fontSize: 8, cellPadding: 3, textColor: NEGRO },
    headStyles: { fillColor: AZUL_OSCURO, textColor: BLANCO, fontStyle: "bold" },
    alternateRowStyles: { fillColor: GRIS_CLARO },
    head: [["#", "OT N°", "Lugar", "Fecha", "Cl Residual", "Sistema"]],
    body: resumenRows,
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 34 },
      2: { cellWidth: 52 },
      3: { cellWidth: 26 },
      4: { cellWidth: 26, halign: "center" },
      5: { cellWidth: 28, halign: "center" },
    },
    didDrawCell: (hookData) => {
      if (hookData.column.index === 5 && hookData.section === "body") {
        const val = hookData.cell.raw;
        if (val === "Inhabilitado") {
          const { x, y: cy, width, height } = hookData.cell;
          doc.setFillColor(...ROJO);
          doc.setTextColor(...BLANCO);
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.rect(x + 2, cy + 1.5, width - 4, height - 3, "F");
          doc.text(val, x + width / 2, cy + height / 2 + 1, { align: "center" });
        }
      }
    },
  });

  y = doc.lastAutoTable.finalY + 10;

  // ── Detalle de cada actividad ──────────────────────
  for (let i = 0; i < actividades.length; i++) {
    const act = actividades[i];

    doc.addPage();
    y = addHeader(doc, data.periodo);
    y += 4;

    // ── Cabecera actividad
    doc.setFillColor(...AZUL_MEDIO);
    doc.rect(margin, y, w - margin * 2, 10, "F");
    doc.setTextColor(...BLANCO);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Actividad ${i + 1} — ${act.ordenNumero || "Sin número"}`,
      margin + 4,
      y + 6.5
    );
    doc.setTextColor(...NEGRO);
    y += 13;

    // Datos de la OT
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(107, 114, 128);
    labelValue(doc, margin, y, "Lugar:", act.lugar, 28);
    labelValue(doc, margin + 95, y, "Unidad Operativa:", act.unidadOperativa, 40);
    y += 6;
    labelValue(doc, margin, y, "Fecha ejecución:", act.fechaEjecucion
      ? new Date(act.fechaEjecucion + "T12:00:00").toLocaleDateString("es-EC")
      : "—", 38);

    y += 10;

    // Actividades realizadas
    y = sectionHeader(doc, y, "Descripción de actividades");
    y += 4;

    const actividadesList = [];
    if (act.comprobacionOperativa)  actividadesList.push(["Comprobación operativa de los equipos", "✓"]);
    if (act.mantenimientoHidraulico) actividadesList.push(["Mantenimiento de los sistemas hidráulicos y de vacío", "✓"]);
    if (act.mantenimientoElectrico)  actividadesList.push(["Mantenimiento eléctrico (terminales, tablero, dispositivos)", "✓"]);
    if (act.limpiezaGeneral)        actividadesList.push(["Limpieza general (corrosiones e incrustaciones)", "✓"]);
    if (act.registroDocumentacion)  actividadesList.push(["Registro y documentación en bitácora digital", "✓"]);

    if (actividadesList.length > 0) {
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        theme: "plain",
        styles: { fontSize: 8, cellPadding: 2.5, textColor: NEGRO },
        body: actividadesList,
        columnStyles: {
          0: { cellWidth: w - margin * 2 - 14 },
          1: { cellWidth: 14, halign: "center", fontStyle: "bold", textColor: VERDE },
        },
      });
      y = doc.lastAutoTable.finalY + 4;
    }

    // Observaciones adicionales
    if (act.observacionesAdicionales) {
      y = addPageIfNeeded(doc, y, 14);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(55, 65, 81);
      doc.text("Observaciones:", margin, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(55, 65, 81);
      const obsLines = doc.splitTextToSize(act.observacionesAdicionales, w - margin * 2);
      doc.text(obsLines, margin, y);
      y += obsLines.length * 4.2 + 4;
    }

    // Estado del sistema
    if (!act.sistemaHabilitado) {
      y = addPageIfNeeded(doc, y, 12);
      doc.setFillColor(254, 226, 226);
      doc.rect(margin, y, w - margin * 2, 8, "F");
      doc.setTextColor(...ROJO);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      const motivo = act.observacionSistema
        ? `Sistema INHABILITADO — ${act.observacionSistema}`
        : "Sistema INHABILITADO";
      doc.text(motivo, margin + 4, y + 5.5);
      doc.setTextColor(...NEGRO);
      y += 12;
    }

    // Mediciones
    y = addPageIfNeeded(doc, y, 30);
    y = sectionHeader(doc, y, "Mediciones obtenidas");
    y += 4;

    const medicionesRows = [
      ["Peso cilindros Cl", act.pesoCilindros || "—"],
      ["Cloro residual", act.cloroResidual ? `${act.cloroResidual} PPM` : "—"],
      ["Dosis Cl", act.dosisCl || "—"],
    ];
    if (act.voltaje)   medicionesRows.push(["Voltaje",    `${act.voltaje} VAC`]);
    if (act.corriente) medicionesRows.push(["Corriente",  `${act.corriente} AMP`]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "plain",
      styles: { fontSize: 8.5, cellPadding: 3, textColor: NEGRO },
      body: medicionesRows,
      columnStyles: {
        0: { cellWidth: 60, fontStyle: "bold", textColor: [55, 65, 81] },
        1: { cellWidth: w - margin * 2 - 60 },
      },
    });
    y = doc.lastAutoTable.finalY + 8;

    // Fotografías
    const fotos = Array.isArray(act.fotografias) ? act.fotografias : [];
    if (fotos.length > 0) {
      y = addPageIfNeeded(doc, y, 20);
      y = sectionHeader(doc, y, `Fotografías (${fotos.length})`);
      y += 6;

      const fotoW = 55;
      const fotoH = 42;
      const gap   = 6;
      const cols  = 3;
      let col     = 0;
      let rowY    = y;

      for (const foto of fotos) {
        if (!foto.url) continue;

        const xPos = margin + col * (fotoW + gap);

        y = addPageIfNeeded(doc, rowY, fotoH + 20);
        if (y !== rowY && col > 0) {
          col  = 0;
          rowY = y;
        }

        try {
          const b64 = await imageToBase64(foto.url);
          if (b64) {
            doc.addImage(b64, "JPEG", xPos, rowY, fotoW, fotoH);
            // borde sutil
            doc.setDrawColor(209, 213, 219);
            doc.setLineWidth(0.3);
            doc.rect(xPos, rowY, fotoW, fotoH);
          }
        } catch {
          doc.setFillColor(...GRIS_CLARO);
          doc.rect(xPos, rowY, fotoW, fotoH, "F");
          doc.setFontSize(7);
          doc.setTextColor(156, 163, 175);
          doc.text("Sin imagen", xPos + fotoW / 2, rowY + fotoH / 2, { align: "center" });
          doc.setTextColor(...NEGRO);
        }

        // descripción debajo de la foto
        if (foto.descripcion) {
          doc.setFontSize(6.5);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(107, 114, 128);
          const descLines = doc.splitTextToSize(foto.descripcion, fotoW);
          doc.text(descLines, xPos, rowY + fotoH + 3.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...NEGRO);
        }

        col++;
        if (col >= cols) {
          col = 0;
          rowY += fotoH + 16;
        }
      }

      y = rowY + (col > 0 ? fotoH + 16 : 0);
    }
  }

  // ── Nota final ────────────────────────────────────
  if (data.notaFinal) {
    doc.addPage();
    y = addHeader(doc, data.periodo);
    y += 8;
    y = sectionHeader(doc, y, "Nota Final");
    y += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    const notaLines = doc.splitTextToSize(data.notaFinal, w - margin * 2);
    doc.text(notaLines, margin, y);
    y += notaLines.length * 5 + 16;
  }

  // ── Firmas ───────────────────────────────────────
  const hasFirmas = data.firmas?.tecnico || data.firmas?.supervisor;
  if (hasFirmas) {
    const lastPage = doc.internal.getNumberOfPages();
    doc.setPage(lastPage);
    y = addPageIfNeeded(doc, y, 60);
    y = sectionHeader(doc, y, "Firmas");
    y += 8;

    const firmaW  = 72;
    const firmaH  = 36;
    const xTecn   = margin;
    const xSuperv = w - margin - firmaW;

    const drawFirma = async (b64Url, x, fy, label) => {
      if (b64Url) {
        try {
          const img = b64Url.startsWith("data:")
            ? b64Url
            : await imageToBase64(b64Url);
          if (img) doc.addImage(img, "PNG", x, fy, firmaW, firmaH);
        } catch { /* omit */ }
      }
      doc.setDrawColor(107, 114, 128);
      doc.setLineWidth(0.3);
      doc.line(x, fy + firmaH + 1, x + firmaW, fy + firmaH + 1);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(55, 65, 81);
      doc.text(label, x + firmaW / 2, fy + firmaH + 5.5, { align: "center" });
    };

    await drawFirma(data.firmas.tecnico,    xTecn,   y, "TÉCNICO DE CAMPO");
    await drawFirma(data.firmas.supervisor, xSuperv, y, "SUPERVISOR DE CONTRATO");
  }

  // ── Numerar páginas ───────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(doc, p, totalPages);
  }

  // ── Guardar ───────────────────────────────────────
  const safePeriodo = (data.periodo || "informe")
    .replace(/[^a-zA-Z0-9\-_áéíóúÁÉÍÓÚñÑ ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 60);

  doc.save(`Informe_EPMAPS_${safePeriodo}_ASTAP.pdf`);
};
