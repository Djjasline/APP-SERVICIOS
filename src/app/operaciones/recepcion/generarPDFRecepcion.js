import jsPDF from "jspdf";
import { checklistVehiculo } from "./recepcionSchema";

const COL_WIDTHS = [23.855, 17.426, 3.426, 3.711, 22.285, 5.711, 5.426, 26.426, 3.426, 3.141, 5.711, 13.57, 4.285];
const PAGE_MARGIN = 8;
const PAGE_WIDTH = 210;
const TABLE_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const COL_TOTAL = COL_WIDTHS.reduce((sum, width) => sum + width, 0);

const colX = (col) => {
  const left = COL_WIDTHS.slice(0, col).reduce((sum, width) => sum + width, 0);
  return PAGE_MARGIN + (left / COL_TOTAL) * TABLE_WIDTH;
};

const colW = (col, span = 1) => {
  const width = COL_WIDTHS.slice(col, col + span).reduce((sum, item) => sum + item, 0);
  return (width / COL_TOTAL) * TABLE_WIDTH;
};

const textValue = (value) => (value === null || value === undefined ? "" : String(value));

const imageToDataUrl = async (url) => {
  try {
    if (!url) return null;

    const response = await fetch(url);
    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result);
      };

      reader.onerror = () => {
        resolve(null);
      };

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("No se pudo cargar imagen para PDF:", error);
    return null;
  }
};
const addText = (doc, text, x, y, w, h, opts = {}) => {
  const fontSize = opts.fontSize || 7.5;
  const lineHeight = fontSize * 0.36;
  const align = opts.align || "left";

  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.setFontSize(fontSize);

  const lines = doc.splitTextToSize(textValue(text), Math.max(2, w - 1.5));
  const textY = y + h / 2 - ((lines.length - 1) * lineHeight) / 2 + fontSize * 0.12;
  const textX = align === "center" ? x + w / 2 : align === "right" ? x + w - 1 : x + 1;

  doc.text(lines, textX, textY, {
    align,
    baseline: "middle",
    maxWidth: Math.max(2, w - 1.5),
  });
};

const cell = (doc, col, span, y, h, text = "", opts = {}) => {
  const x = colX(col);
  const w = colW(col, span);
  doc.setDrawColor(0, 0, 0);
  doc.setTextColor(0, 0, 0);
  if (opts.fillColor) {
    doc.setFillColor(...opts.fillColor);
    doc.rect(x, y, w, h, "FD");
  } else {
    doc.rect(x, y, w, h);
  }
  if (text !== "") addText(doc, text, x, y, w, h, opts);
};

const choiceCell = (doc, col, y, h, value, option) => {
  cell(doc, col, 1, y, h, value === option ? "X" : "", {
    align: "center",
    bold: true,
    fontSize: 8,
  });
};

const drawGauge = (doc, x, y, w, h, value = 0) => {
  const level = Math.min(1, Math.max(0, Number(value) || 0));
  const cx = x + w / 2;
  const cy = y + h * 0.73;
  const r = Math.min(w * 0.36, h * 0.5);
  const angle = Math.PI + level * Math.PI;
  const px = cx + r * 0.85 * Math.cos(angle);
  const py = cy + r * 0.85 * Math.sin(angle);

  doc.setLineWidth(0.35);
for (let a = 180; a <= 360; a += 8) {
  const rad1 = ((a - 8) * Math.PI) / 180;
  const rad2 = (a * Math.PI) / 180;

  doc.line(
    cx + r * Math.cos(rad1),
    cy + r * Math.sin(rad1),
    cx + r * Math.cos(rad2),
    cy + r * Math.sin(rad2)
  );
}
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("E", cx - r - 3, cy + 1);
  doc.text("F", cx + r + 1, cy + 1);
  doc.line(cx, cy, px, py);
  doc.circle(cx, cy, 0.9, "F");
  doc.rect(cx - 2, cy + 2, 4, 3);
};

const drawVehicleDiagram = (doc, x, y, w, h, puntos = []) => {
  doc.setDrawColor(80, 88, 98);
  doc.setLineWidth(0.35);

  const sx = w / 720;
  const sy = h / 230;
  const px = (n) => x + n * sx;
  const py = (n) => y + n * sy;

  doc.roundedRect(px(70), py(34), 120 * sx, 56 * sy, 2, 2);
  doc.line(px(72), py(44), px(50), py(59));
  doc.line(px(50), py(59), px(50), py(88));
  doc.line(px(50), py(88), px(72), py(88));
  doc.line(px(190), py(44), px(214), py(62));
  doc.line(px(214), py(62), px(214), py(88));
  doc.line(px(214), py(88), px(190), py(88));
  doc.line(px(92), py(34), px(92), py(90));
  doc.line(px(168), py(34), px(168), py(90));
  doc.circle(px(72), py(101), 15 * sx);
  doc.circle(px(192), py(101), 15 * sx);

  doc.lines([
    [65 * sx, -30 * sy],
    [105 * sx, 0],
    [41 * sx, 29 * sy],
    [180 * sx, 0],
    [12 * sx, 18 * sy],
    [-8 * sx, 29 * sy],
    [-390 * sx, 0],
    [-12 * sx, -23 * sy],
  ], px(275), py(65));
  doc.circle(px(345), py(115), 25 * sx);
  doc.circle(px(600), py(115), 25 * sx);

  doc.roundedRect(px(62), py(145), 142 * sx, 58 * sy, 2, 2);
  doc.line(px(62), py(165), px(204), py(165));
  doc.line(px(78), py(145), px(78), py(203));
  doc.line(px(188), py(145), px(188), py(203));

  doc.lines([
    [64 * sx, -26 * sy],
    [104 * sx, 0],
    [42 * sx, 27 * sy],
    [152 * sx, 0],
    [16 * sx, 18 * sy],
    [-8 * sx, 28 * sy],
    [-366 * sx, 0],
    [-16 * sx, -22 * sy],
  ], px(288), py(171));
  doc.circle(px(355), py(218), 22 * sx);
  doc.circle(px(590), py(218), 22 * sx);

  puntos.forEach((p) => {
    doc.setFillColor(210, 31, 43);
    doc.setDrawColor(255, 255, 255);
    doc.circle(x + (Number(p.x) / 100) * w, y + (Number(p.y) / 100) * h, 1.8, "FD");
  });

  doc.setDrawColor(0, 0, 0);
};

export const generarPDFRecepcion = async (data) => {
  const doc = new jsPDF("p", "mm", "a4");
  doc.setLineWidth(0.25);

  let y = 5;

  cell(doc, 0, 13, y, 11, "BITÁCORA Y CONTROL VEHICULAR", {
    align: "center",
    fontSize: 17,
    bold: true,
    fillColor: [248, 250, 252],
  });
  addText(doc, "ASTAP", colX(11), y, colW(11, 2), 11, {
    align: "center",
    bold: true,
    fontSize: 10,
  });
  y += 11;

  cell(doc, 0, 13, y, 6, "ENTREGA VEHICULAR", { bold: true, fontSize: 9, fillColor: [219, 234, 254] });
  y += 6;

  cell(doc, 0, 1, y, 7, "CONDUCTOR:", { fontSize: 8 });
  cell(doc, 1, 7, y, 7, data.conductor, { fontSize: 8 });
  cell(doc, 8, 3, y, 7, "FECHA:", { fontSize: 8 });
  cell(doc, 11, 2, y, 7, data.fecha, { align: "center", fontSize: 8 });
  y += 7;

  cell(doc, 0, 1, y, 7, "LUGAR DESTINO:", { fontSize: 8 });
  cell(doc, 1, 7, y, 7, data.lugarDestino, { fontSize: 8 });
  cell(doc, 8, 3, y, 7, "CIUDAD:", { fontSize: 8 });
  cell(doc, 11, 2, y, 7, data.ciudad, { align: "center", fontSize: 8 });
  y += 7;

  cell(doc, 0, 1, y, 11, "VEHÍCULO:", { align: "center", fontSize: 8 });
  cell(doc, 1, 1, y, 11, "MODELO:", { align: "center", fontSize: 8 });
  cell(doc, 2, 1, y, 11, "SEL.", {
  align: "center",
  bold: true,
  fontSize: 5.5,
});
  cell(doc, 3, 2, y, 11, "COMBUSTIBLE:", { align: "center", fontSize: 8 });
  cell(doc, 5, 2, y, 11, "TOTAL\nCOMBUSTIBLE", { align: "center", fontSize: 5.5 });
  cell(doc, 7, 1, y, 11, "PLACA:", { align: "center", fontSize: 8 });
  cell(doc, 8, 3, y, 11, "COLOR:", { align: "center", fontSize: 8 });
  cell(doc, 11, 2, y, 11, "PICO Y PLACA:", { align: "center", fontSize: 8 });
  y += 11;

  cell(doc, 0, 1, y, 5.5);
  cell(doc, 1, 1, y, 5.5, data.modelo, { align: "center", fontSize: 7 });
  cell(doc, 2, 1, y, 5.5, data.seleccionado ? "X" : "", { align: "center", bold: true });
  cell(doc, 3, 2, y, 5.5, data.combustible, { align: "center", fontSize: 7 });
  cell(doc, 5, 2, y, 5.5, data.totalCombustible, { align: "center", fontSize: 7 });
  cell(doc, 7, 1, y, 5.5, data.placa, { align: "center", fontSize: 7 });
  cell(doc, 8, 3, y, 5.5, data.color, { align: "center", fontSize: 7 });
  cell(doc, 11, 2, y, 5.5, data.picoPlaca, { align: "center", fontSize: 7 });
  y += 5.5;

  cell(doc, 0, 7, y, 5.5);
  cell(doc, 7, 4, y, 5.5, "PEDIDO/DEMANDA", { align: "center", bold: true, fontSize: 7 });
  cell(doc, 11, 2, y, 5.5, data.pedidoDemanda, { align: "center", fontSize: 7 });
  y += 5.5;

  const docsTop = y;
  const docsHeight = 6 + 5.5 + 5.5 + 6 * 5.1 + 3 * 5.1 + 4;
  cell(doc, 0, 1, docsTop, docsHeight, "DOCUMENTOS Y ESTADO\nDEL VEHÍCULO:", {
    align: "center",
    fontSize: 9,
  });

  cell(doc, 1, 1, y, 11.5, "SOAT:", { fontSize: 7.5 });
  cell(doc, 2, 1, y, 6, "SI", { align: "center", fontSize: 6 });
  cell(doc, 3, 1, y, 6, "NO", { align: "center", fontSize: 6 });
  cell(doc, 4, 1, y, 11.5, "MANUAL SEGURADORA", { fontSize: 6.5 });
  cell(doc, 5, 1, y, 6, "SI", { align: "center", fontSize: 6 });
  cell(doc, 6, 1, y, 6, "NO", { align: "center", fontSize: 6 });
  cell(doc, 7, 1, y, 11.5, "MATRÍCULA", { fontSize: 7 });
  cell(doc, 8, 1, y, 6, "SI", { align: "center", fontSize: 6 });
  cell(doc, 9, 1, y, 6, "NO", { align: "center", fontSize: 6 });
  cell(doc, 10, 3, y, 6, "KILÓMETROS SALIDA", { align: "center", fontSize: 7 });
  y += 6;

  choiceCell(doc, 2, y, 5.5, data.documentos?.soat, "SI");
  choiceCell(doc, 3, y, 5.5, data.documentos?.soat, "NO");
  choiceCell(doc, 5, y, 5.5, data.documentos?.manualSeguradora, "SI");
  choiceCell(doc, 6, y, 5.5, data.documentos?.manualSeguradora, "NO");
  choiceCell(doc, 8, y, 5.5, data.documentos?.matricula, "SI");
  choiceCell(doc, 9, y, 5.5, data.documentos?.matricula, "NO");
  cell(doc, 10, 3, y, 5.5, data.kilometrosSalida, { align: "center", fontSize: 7 });
  y += 5.5;

  cell(doc, 1, 1, y, 5.5, "INTERIOR", { fontSize: 7.5 });
  cell(doc, 2, 1, y, 5.5, "SI", { align: "center", fontSize: 6 });
  cell(doc, 3, 1, y, 5.5, "NO", { align: "center", fontSize: 6 });
  cell(doc, 4, 1, y, 5.5, "MOTOR", { align: "center", fontSize: 7.5 });
  cell(doc, 5, 1, y, 5.5, "SI", { align: "center", fontSize: 6 });
  cell(doc, 6, 1, y, 5.5, "NO", { align: "center", fontSize: 6 });
  cell(doc, 7, 1, y, 5.5, "EXTERIOR", { align: "center", fontSize: 7.5 });
  cell(doc, 8, 1, y, 5.5, "SI", { align: "center", fontSize: 6 });
  cell(doc, 9, 1, y, 5.5, "NO", { align: "center", fontSize: 6 });
  cell(doc, 10, 3, y, 5.5, "NIVEL DE COMBUSTIBLE", { align: "center", fontSize: 7 });
  y += 5.5;

  const fuelSalidaTop = y + 5.1;
  checklistVehiculo.interior.slice(0, 6).forEach((item, index) => {
    const motor = checklistVehiculo.motor[index];
    const exterior = checklistVehiculo.exterior[index];

    cell(doc, 1, 1, y, 5.1, item.label, { fontSize: 6.2 });
    choiceCell(doc, 2, y, 5.1, data.checklist?.interior?.[item.key], "SI");
    choiceCell(doc, 3, y, 5.1, data.checklist?.interior?.[item.key], "NO");
    cell(doc, 4, 1, y, 5.1, motor.label, { fontSize: 6.2 });
    choiceCell(doc, 5, y, 5.1, data.checklist?.motor?.[motor.key], "SI");
    choiceCell(doc, 6, y, 5.1, data.checklist?.motor?.[motor.key], "NO");
    cell(doc, 7, 1, y, 5.1, exterior.label, { fontSize: 6.2 });
    choiceCell(doc, 8, y, 5.1, data.checklist?.exterior?.[exterior.key], "SI");
    choiceCell(doc, 9, y, 5.1, data.checklist?.exterior?.[exterior.key], "NO");

    if (index === 0) cell(doc, 10, 3, y, 5.1, "SALIDA", { align: "center", fontSize: 7 });
    y += 5.1;
  });
  cell(doc, 10, 3, fuelSalidaTop, 25.5);
  drawGauge(doc, colX(10), fuelSalidaTop, colW(10, 3), 25.5, data.combustibleSalida);

  checklistVehiculo.interior.slice(6).forEach((item, index) => {
    cell(doc, 1, 1, y, 5.1, item.label, { fontSize: 6.2 });
    choiceCell(doc, 2, y, 5.1, data.checklist?.interior?.[item.key], "SI");
    choiceCell(doc, 3, y, 5.1, data.checklist?.interior?.[item.key], "NO");
    cell(doc, 4, 9, y, 5.1, index === 0 ? "OBSERVACIONES:" : data.observacionesMotor?.[index - 1], {
      fontSize: 6.5,
    });
    y += 5.1;
  });
  cell(doc, 1, 3, y, 4);
  cell(doc, 4, 9, y, 4);
  y += 4;

  cell(doc, 0, 13, y, 6, "DAÑOS DE CARROCERÍA Y COMENTARIOS GENERALES", {
    align: "center",
    fontSize: 9,
    fillColor: [219, 234, 254],
  });
  y += 6;

  const danosImagenes = data.danos?.imagenes || [];
  const boxX = colX(0);
  const boxW = colW(0, 13);
  const boxH = 48;

  cell(doc, 0, 13, y, boxH);

  if (danosImagenes.length === 0) {
    addText(doc, "Sin fotografías de daños registradas", boxX, y, boxW, boxH, {
      align: "center",
      fontSize: 8,
    });
  } else {
    const gap = 2;
    const maxFotos = Math.min(3, danosImagenes.length);
    const fotoW = (boxW - gap * (maxFotos + 1)) / maxFotos;
    const fotoH = 24;
    const fotoY = y + 3;

    for (let i = 0; i < maxFotos; i += 1) {
      const item = danosImagenes[i];
      const fotoX = boxX + gap + i * (fotoW + gap);
      const imgData = await imageToDataUrl(item.url);

      doc.rect(fotoX, fotoY, fotoW, fotoH);

      if (imgData) {
        const props = doc.getImageProperties(imgData);
        const ratio = props.width / props.height;
        let drawW = fotoW;
        let drawH = fotoW / ratio;

        if (drawH > fotoH) {
          drawH = fotoH;
          drawW = fotoH * ratio;
        }

        const drawX = fotoX + (fotoW - drawW) / 2;
        const drawY = fotoY + (fotoH - drawH) / 2;
        const format = String(imgData).startsWith("data:image/png") ? "PNG" : "JPEG";

        doc.addImage(imgData, format, drawX, drawY, drawW, drawH);
      } else {
        addText(doc, "Imagen no disponible", fotoX, fotoY, fotoW, fotoH, {
          align: "center",
          fontSize: 6,
        });
      }

      (item.puntos || []).forEach((p, pi) => {
        const px = fotoX + Number(p.x || 0) * fotoW;
        const py = fotoY + Number(p.y || 0) * fotoH;

        doc.setFillColor(220, 38, 38);
        doc.setDrawColor(255, 255, 255);
        doc.circle(px, py, 2.2, "FD");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.text(String(pi + 1), px, py + 0.2, {
          align: "center",
          baseline: "middle",
        });

        doc.setTextColor(0, 0, 0);
      });

      let obsY = fotoY + fotoH + 4;

      (item.puntos || []).forEach((p, pi) => {
        const texto = `${pi + 1}) ${p.observacion || "—"}`;
        const lines = doc.splitTextToSize(texto, fotoW - 1);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.5);
        doc.text(lines, fotoX, obsY);

        obsY += lines.length * 2.4;
      });
    }

    if (danosImagenes.length > maxFotos) {
      addText(
        doc,
        `Se muestran ${maxFotos} de ${danosImagenes.length} fotografías registradas.`,
        boxX,
        y + boxH - 5,
        boxW,
        4,
        { align: "center", fontSize: 6 }
      );
    }
  }

  y += boxH;
  cell(doc, 0, 13, y, 5.5, "OBSERVACIONES ENTREGA:", { fontSize: 7.5 });
  y += 5.5;
  cell(doc, 0, 13, y, 16, data.observacionesEntrega, { fontSize: 7 });
  y += 16;

  cell(doc, 0, 13, y, 6, "RECEPCIÓN VEHICULAR", { bold: true, fontSize: 9, fillColor: [219, 234, 254] });
  y += 6;

  cell(doc, 0, 1, y, 18, "NIVEL\nDE COMBUSTIBLE LLEGADA", {
    align: "center",
    bold: true,
    fontSize: 7,
  });
  cell(doc, 1, 3, y, 18);
  drawGauge(doc, colX(1), y, colW(1, 3), 18, data.recepcion?.combustibleLlegada);
  cell(doc, 4, 1, y, 18);
  cell(doc, 5, 3, y, 18, `KILÓMETROS\nDE LLEGADA\n${textValue(data.recepcion?.kilometrosLlegada)}`, {
    align: "center",
    bold: true,
    fontSize: 7,
  });
  cell(doc, 8, 5, y, 5, "MANTENIMIENTO", { align: "center", bold: true, fontSize: 7 });
  cell(doc, 8, 3, y + 5, 4.5, "SI", { align: "center", bold: true, fontSize: 6 });
  cell(doc, 11, 2, y + 5, 4.5, "NO", { align: "center", bold: true, fontSize: 6 });
  cell(doc, 8, 3, y + 9.5, 8.5, data.recepcion?.mantenimiento === "SI" ? "X" : "", {
    align: "center",
    bold: true,
  });
  cell(doc, 11, 2, y + 9.5, 8.5, data.recepcion?.mantenimiento === "NO" ? "X" : "", {
    align: "center",
    bold: true,
  });
  y += 18;

  cell(doc, 0, 1, y, 18, "FIRMA RESPONSABLE /\nCONDUCTOR:", {
    align: "center",
    fontSize: 8,
  });
  cell(doc, 1, 4, y, 18);
  if (data.firmas?.responsable) {
    doc.addImage(data.firmas.responsable, "PNG", colX(1) + 2, y + 2, colW(1, 4) - 4, 14);
  }
  cell(doc, 5, 3, y, 18, "RECEPCIÓN FINAL SERVICIO:", {
    align: "center",
    fontSize: 8,
  });
  cell(doc, 8, 5, y, 18);
  if (data.firmas?.recepcionFinal) {
    doc.addImage(data.firmas.recepcionFinal, "PNG", colX(8) + 2, y + 2, colW(8, 5) - 4, 14);
  }
  y += 18;

  cell(doc, 0, 13, y, 5.5, "OBSERVACIONES DE LA RECEPCIÓN:", {
    bold: true,
    fontSize: 7.5,
  });
  y += 5.5;
  cell(doc, 0, 13, y, 14, data.observacionesRecepcion, { fontSize: 7 });
  y += 14;

  doc.save("hoja_control_vehicular.pdf");
};
