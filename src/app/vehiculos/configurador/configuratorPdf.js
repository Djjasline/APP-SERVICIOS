import jsPDF from "jspdf";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const VACTOR_LINE_IMAGE = "/vactor-linea.png.png";

const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value) || 0);

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

async function getModelImageDataUrl(model) {
  try {
    if (model?.sprite) {
      const image = await loadImage(VACTOR_LINE_IMAGE);
      const cols = 4;
      const rows = 2;
      const cropWidth = image.naturalWidth / cols;
      const cropHeight = image.naturalHeight / rows;
      const canvas = document.createElement("canvas");
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      const context = canvas.getContext("2d");

      context.drawImage(
        image,
        model.sprite.col * cropWidth,
        model.sprite.row * cropHeight,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      return canvas.toDataURL("image/png");
    }
  } catch {
    // Si la lamina aun no existe, se usa la imagen de respaldo.
  }

  return loadDataUrl(model?.fallbackImage || "/hidro-base.png");
}

function addWrappedText(doc, text, x, y, maxWidth, options = {}) {
  doc.setFont("helvetica", options.bold ? "bold" : "normal");
  doc.setFontSize(options.fontSize || 9);
  const lines = doc.splitTextToSize(textValue(text), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * ((options.fontSize || 9) * 0.42);
}

function addHeader(doc, payload) {
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, PAGE_WIDTH, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Cotización técnica Vactor", MARGIN, 10);
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

function ensurePage(doc, y, required = 18) {
  if (y + required < PAGE_HEIGHT - MARGIN) return y;
  doc.addPage();
  addHeader(doc, { quote: { number: "continuación" } });
  return 34;
}

export async function generateConfiguratorPdf(payload) {
  const doc = new jsPDF("p", "mm", "a4");
  const modelImage = await getModelImageDataUrl(payload.selectedModel);

  addHeader(doc, payload);

  let y = 34;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(MARGIN, y - 5, CONTENT_WIDTH, 42, 2, 2, "F");
  addKeyValue(doc, "Cliente", payload.quote.customer, MARGIN + 4, y, 42);
  addKeyValue(doc, "Cliente final", payload.quote.endCustomer, MARGIN + 52, y, 42);
  addKeyValue(doc, "Vendedor", payload.quote.salesPerson, MARGIN + 100, y, 35);
  addKeyValue(doc, "Modelo", `${payload.selectedModel.name} (${payload.selectedModel.family})`, MARGIN + 140, y, 45);

  if (modelImage) {
    doc.addImage(modelImage, "PNG", MARGIN + 4, y + 15, 62, 21, undefined, "FAST");
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("Resumen económico", MARGIN + 84, y + 19);
  doc.setFont("helvetica", "normal");
  doc.text(`Base: ${money(payload.priceSummary.base)}`, MARGIN + 84, y + 26);
  doc.text(`Opciones: ${money(payload.priceSummary.options)}`, MARGIN + 84, y + 32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Total referencial: ${money(payload.priceSummary.total)}`, MARGIN + 84, y + 39);

  y += 52;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Configuración seleccionada", MARGIN, y);
  y += 7;

  doc.setFillColor(15, 23, 42);
  doc.setTextColor(255, 255, 255);
  doc.rect(MARGIN, y - 5, CONTENT_WIDTH, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Detalle", MARGIN + 3, y);
  doc.text("Valor", MARGIN + 104, y);
  doc.text("Impacto", PAGE_WIDTH - MARGIN - 3, y, { align: "right" });
  doc.setTextColor(0, 0, 0);
  y += 6;

  const items = payload.items?.length ? payload.items : [{ label: "Opciones adicionales", value: "Sin opciones adicionales seleccionadas", price: 0 }];

  items.forEach((item, index) => {
    y = ensurePage(doc, y, 12);
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(MARGIN, y - 4, CONTENT_WIDTH, 8, "F");
    }
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    addWrappedText(doc, item.label, MARGIN + 3, y, 92, { fontSize: 8 });
    addWrappedText(doc, item.value, MARGIN + 104, y, 50, { fontSize: 8 });
    doc.text(money(item.price), PAGE_WIDTH - MARGIN - 3, y, { align: "right" });
    y += 8;
  });

  y = ensurePage(doc, y, 26);
  y += 8;
  doc.setDrawColor(203, 213, 225);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Valores referenciales sujetos a validación de catálogo, reglas técnicas, disponibilidad y precios finales.", MARGIN, y);
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

export function getConfiguratorPdfFilename(payload) {
  return `${sanitizeFilename(payload.quote.number)}.pdf`;
}
