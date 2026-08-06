import jsPDF from "jspdf";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const VACTOR_LINE_IMAGE = "/vactor-linea.png.png";
const SPRITE_COLUMNS = 4;
const SPRITE_ROWS = 2;

const MODEL_SPRITES = {
  "2100i": { col: 0, row: 0 },
  "water-recycler": { col: 1, row: 0 },
  impact: { col: 2, row: 0 },
  "2100i-cb": { col: 3, row: 0 },
  "ramjet-truck": { col: 0, row: 1 },
  "ramjet-trailer": { col: 1, row: 1 },
  ace: { col: 2, row: 1 },
  truvac: { col: 3, row: 1 },
};

const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value) || 0);

const formatImpact = (value) => (typeof value === "number" ? money(value) : "Por definir");

const textValue = (value) => (value === null || value === undefined ? "" : String(value));

function sanitizeFilename(value) {
  return textValue(value || "cotizacion-vactor").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function loadDataUrl(src) {
  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function getModelImage(model) {
  try {
    const sprite = model?.sprite || MODEL_SPRITES[model?.id];

    if (sprite) {
      const image = await loadImage(VACTOR_LINE_IMAGE);
      const cropWidth = image.naturalWidth / SPRITE_COLUMNS;
      const cellHeight = image.naturalHeight / SPRITE_ROWS;
      const cropHeight = cellHeight * (sprite.row === 0 ? 0.72 : 0.6);
      const canvas = document.createElement("canvas");
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const context = canvas.getContext("2d");

      context.drawImage(
        image,
        sprite.col * cropWidth,
        sprite.row * cellHeight,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      return { dataUrl: canvas.toDataURL("image/png"), width: canvas.width, height: canvas.height };
    }
  } catch {
    // Si la lamina aun no existe, se usa la imagen de respaldo.
  }

  const dataUrl = await loadDataUrl(model?.fallbackImage || "/hidro-base.png");
  if (!dataUrl) return null;

  try {
    const image = await loadImage(dataUrl);
    return { dataUrl, width: image.naturalWidth, height: image.naturalHeight };
  } catch {
    return { dataUrl, width: 1, height: 1 };
  }
}

function getContainedSize(width, height, maxWidth, maxHeight) {
  const ratio = Math.min(maxWidth / Math.max(width, 1), maxHeight / Math.max(height, 1));
  return {
    width: Math.max(width, 1) * ratio,
    height: Math.max(height, 1) * ratio,
  };
}

function addWrappedText(doc, text, x, y, maxWidth, options = {}) {
  doc.setFont("helvetica", options.bold ? "bold" : "normal");
  doc.setFontSize(options.fontSize || 9);
  const lines = doc.splitTextToSize(textValue(text), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * ((options.fontSize || 9) * 0.42);
}

function addHeader(doc, payload, options = {}) {
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, PAGE_WIDTH, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(options.continuation ? "Cotización técnica Vactor (cont.)" : "Cotización técnica Vactor", MARGIN, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`No. ${payload.quote.number}`, MARGIN, 17);
  doc.text(new Date().toLocaleDateString("es-EC"), PAGE_WIDTH - MARGIN, 17, { align: "right" });
  doc.setTextColor(0, 0, 0);
}

function addKeyValue(doc, label, value, x, y, width) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(label, x, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(doc.splitTextToSize(textValue(value) || "-", width), x, y + 5);
}

function ensurePage(doc, y, required = 18, payload) {
  if (y + required < PAGE_HEIGHT - MARGIN) return y;
  doc.addPage();
  addHeader(doc, payload, { continuation: true });
  return 34;
}

export async function generateConfiguratorPdf(payload) {
  const doc = new jsPDF("p", "mm", "a4");
  const modelImage = await getModelImage(payload.selectedModel);
  const hideValues = Boolean(payload.hideValues);

  addHeader(doc, payload);

  let y = 34;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(MARGIN, y - 5, CONTENT_WIDTH, 42, 2, 2, "F");
  addKeyValue(doc, "Cliente", payload.quote.customer, MARGIN + 4, y, 42);
  addKeyValue(doc, "Cliente final", payload.quote.endCustomer, MARGIN + 52, y, 42);
  addKeyValue(doc, "Vendedor", payload.quote.salesPerson, MARGIN + 100, y, 35);
  addKeyValue(doc, "Modelo", `${payload.selectedModel.name} (${payload.selectedModel.family})`, MARGIN + 140, y, 45);

  if (modelImage) {
    const box = { x: MARGIN + 4, y: y + 15, width: 62, height: 21 };
    const size = getContainedSize(modelImage.width, modelImage.height, box.width, box.height);
    doc.addImage(modelImage.dataUrl, "PNG", box.x + (box.width - size.width) / 2, box.y + (box.height - size.height) / 2, size.width, size.height, undefined, "FAST");
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(hideValues ? "Resumen técnico" : "Resumen económico", MARGIN + 84, y + 19);
  doc.setFont("helvetica", "normal");
  if (hideValues) {
    doc.text("Documento visual sin valores comerciales.", MARGIN + 84, y + 26);
    doc.text("Incluye características y opciones seleccionadas.", MARGIN + 84, y + 32);
  } else {
    doc.text(`Base: ${money(payload.priceSummary.base)}`, MARGIN + 84, y + 26);
    doc.text(`Opciones: ${money(payload.priceSummary.options)}`, MARGIN + 84, y + 32);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`Total referencial: ${money(payload.priceSummary.total)}`, MARGIN + 84, y + 39);
  }

  y += 52;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Configuración seleccionada", MARGIN, y);
  y += 7;
  if (payload.usageProfile?.label) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Perfil matriz ASTAP: ${payload.usageProfile.label}`, MARGIN, y);
    doc.setTextColor(0, 0, 0);
    y += 6;
  }

  doc.setFillColor(15, 23, 42);
  doc.setTextColor(255, 255, 255);
  doc.rect(MARGIN, y - 5, CONTENT_WIDTH, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Detalle", MARGIN + 3, y);
  doc.text("Valor", MARGIN + 104, y);
  if (!hideValues) doc.text("Impacto", PAGE_WIDTH - MARGIN - 3, y, { align: "right" });
  doc.setTextColor(0, 0, 0);
  y += 6;

  const items = payload.items?.length ? payload.items : [{ label: "Opciones adicionales", value: "Sin opciones adicionales seleccionadas", price: 0 }];

  items.forEach((item, index) => {
    y = ensurePage(doc, y, 12, payload);
    const itemLabel = item.priority ? `${item.label} [${item.priority}]` : item.label;
    const detail = itemLabel;
    const value = item.info?.reference ? `${item.value} (${item.info.reference})` : item.value;
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(MARGIN, y - 4, CONTENT_WIDTH, 8, "F");
    }
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const detailBottom = addWrappedText(doc, detail, MARGIN + 3, y, 92, { fontSize: 8 });
    const valueBottom = addWrappedText(doc, value, MARGIN + 104, y, 50, { fontSize: 8 });
    if (!hideValues) doc.text(formatImpact(item.price), PAGE_WIDTH - MARGIN - 3, y, { align: "right" });
    y = Math.max(detailBottom, valueBottom) + 3;
  });

  y = ensurePage(doc, y, 26, payload);
  y += 8;
  doc.setDrawColor(203, 213, 225);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    hideValues
      ? "Documento visual sin valores comerciales. Características sujetas a validación técnica y disponibilidad."
      : "Valores referenciales sujetos a validación de catálogo, reglas técnicas, disponibilidad y precios finales.",
    MARGIN,
    y
  );
  doc.text("Generado desde APP Servicios ASTAP.", MARGIN, y + 5);

  return doc;
}

export async function generateConfiguratorPdfBlob(payload) {
  const doc = await generateConfiguratorPdf(payload);
  return doc.output("blob");
}

export async function downloadConfiguratorPdf(payload) {
  const doc = await generateConfiguratorPdf(payload);
  doc.save(`${sanitizeFilename(payload.quote.number)}.pdf`);
}

export async function downloadStoredConfiguratorPdf(url, quoteNumber = "cotizacion-vactor") {
  if (!url) return;

  const response = await fetch(url);
  if (!response.ok) throw new Error("No se pudo descargar el PDF guardado.");

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `${sanitizeFilename(quoteNumber)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export function getConfiguratorPdfFilename(payload) {
  return `${sanitizeFilename(payload.quote.number)}.pdf`;
}
