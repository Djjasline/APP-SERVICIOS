import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const textValue = (value) => (value === null || value === undefined ? "" : String(value));

const formatNumber = (value) => new Intl.NumberFormat("es-EC", { maximumFractionDigits: 2 }).format(Number(value) || 0);
const money = (value) => new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(Number(value) || 0);

function sanitizeFilename(value) {
  return textValue(value || "cotizacion-servicios").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "cotizacion-servicios";
}

function formatDate(value) {
  if (!value) return "-";
  const [year, month, day] = textValue(value).split("-").map(Number);
  if (!year || !month || !day) return textValue(value);
  return new Intl.DateTimeFormat("es-EC").format(new Date(year, month - 1, day));
}

function lineTotal(line) {
  return (Number(line?.quantity) || 0) * (Number(line?.unitPrice) || 0);
}

function addWrappedText(doc, text, x, y, width, options = {}) {
  doc.setFont("helvetica", options.bold ? "bold" : "normal");
  doc.setFontSize(options.fontSize || 9);
  const lines = doc.splitTextToSize(textValue(text), width);
  doc.text(lines, x, y);
  return y + lines.length * ((options.fontSize || 9) * 0.42);
}

function ensurePage(doc, y, required = 20) {
  if (y + required < PAGE_HEIGHT - MARGIN) return y;
  doc.addPage();
  addHeader(doc, { continuation: true });
  return 34;
}

function addHeader(doc, options = {}) {
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, PAGE_WIDTH, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(options.continuation ? "Oferta de repuestos y servicios (cont.)" : "Oferta de repuestos y servicios", MARGIN, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("ASTAP - Quito, Ecuador", MARGIN, 17);
  doc.text("www.astap.com | astap@astap.com", PAGE_WIDTH - MARGIN, 17, { align: "right" });
  doc.setTextColor(0, 0, 0);
}

function addKeyValue(doc, label, value, x, y, width) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(label, x, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(doc.splitTextToSize(textValue(value) || "-", width), x, y + 4.5);
}

function addSignature(doc, label, name, signature, x, y, width) {
  const imageBox = { x, y, width, height: 18 };
  if (signature) {
    try {
      doc.addImage(signature, "PNG", imageBox.x + 2, imageBox.y, imageBox.width - 4, imageBox.height, undefined, "FAST");
    } catch {
      // Si la firma guardada no puede insertarse, se mantiene la linea para firma fisica.
    }
  }
  doc.setDrawColor(71, 85, 105);
  doc.line(x, y + 20, x + width, y + 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(label, x + width / 2, y + 25, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(textValue(name) || "-", x + width / 2, y + 30, { align: "center" });
}

export function getVehicleServiceQuotePdfFilename({ offer } = {}) {
  const base = offer?.proformaNo || offer?.client || "cotizacion-servicios";
  return `${sanitizeFilename(base)}.pdf`;
}

export async function generateVehicleServiceQuotePdf({ offer = {}, lines = [], totals = {} }) {
  const doc = new jsPDF("p", "mm", "a4");
  addHeader(doc);

  let y = 34;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(MARGIN, y - 6, CONTENT_WIDTH, 36, 2, 2, "F");
  addKeyValue(doc, "ASTAP", "Naciones Unidas 1084 y Amazonas - Quito, Ecuador\nRUC: 1790027740001\nTelf: 2262-154 - Fax: 2462-160", MARGIN + 4, y, 70);
  addKeyValue(doc, "Proforma No.", offer.proformaNo || "Por definir", MARGIN + 118, y, 32);
  addKeyValue(doc, "Fecha", formatDate(offer.date), MARGIN + 154, y, 26);
  y += 42;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Datos del cliente", MARGIN, y);
  y += 6;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, 24, 1.5, 1.5, "S");
  addKeyValue(doc, "Cliente", offer.client, MARGIN + 4, y, 48);
  addKeyValue(doc, "RUC", offer.ruc, MARGIN + 58, y, 30);
  addKeyValue(doc, "Telefono", offer.phone, MARGIN + 94, y, 30);
  addKeyValue(doc, "Atencion", offer.attention, MARGIN + 130, y, 48);
  addKeyValue(doc, "Referencia", offer.reference, MARGIN + 4, y + 12, 104);
  addKeyValue(doc, "Validez", `${offer.validityDays || "-"} dias`, MARGIN + 130, y + 12, 48);
  y += 30;

  y = addWrappedText(doc, offer.intro || "Tenemos el agrado de cotizar a ustedes los repuestos y servicios requeridos.", MARGIN, y, CONTENT_WIDTH, { fontSize: 9 });
  y += 5;

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    styles: { font: "helvetica", fontSize: 7, cellPadding: 1.8, lineColor: [203, 213, 225], lineWidth: 0.1, valign: "top" },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 20 },
      2: { cellWidth: 34 },
      3: { cellWidth: 58 },
      4: { cellWidth: 10, halign: "center" },
      5: { cellWidth: 13, halign: "right" },
      6: { cellWidth: 18, halign: "right" },
      7: { cellWidth: 19, halign: "right" },
    },
    head: [["Item", "CPC", "Descripcion CPC", "Descripcion producto", "Un.", "Cant.", "P. Unit.", "P. Total"]],
    body: lines.length
      ? lines.map((line, index) => [
          index + 1,
          offer.cpcCode || "-",
          textValue(offer.cpcDescription).toUpperCase(),
          textValue(line.description).toUpperCase(),
          line.unit || "u",
          formatNumber(line.quantity),
          money(line.unitPrice),
          money(lineTotal(line)),
        ])
      : [["-", "-", "-", "Sin items agregados.", "-", "-", "-", "-"]],
  });

  y = doc.lastAutoTable.finalY + 8;
  y = ensurePage(doc, y, 34);
  const totalsX = PAGE_WIDTH - MARGIN - 62;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal", totalsX, y);
  doc.text(money(totals.subtotal), PAGE_WIDTH - MARGIN, y, { align: "right" });
  y += 6;
  doc.text("12% IVA", totalsX, y);
  doc.text(money(totals.iva), PAGE_WIDTH - MARGIN, y, { align: "right" });
  y += 7;
  doc.setFillColor(15, 23, 42);
  doc.rect(totalsX - 2, y - 5, 64, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Total", totalsX, y);
  doc.text(money(totals.total), PAGE_WIDTH - MARGIN, y, { align: "right" });
  doc.setTextColor(0, 0, 0);
  y += 14;

  y = ensurePage(doc, y, 54);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Terminos de negociacion", MARGIN, y);
  y += 6;
  y = addWrappedText(doc, `Son: ${offer.amountInWords || "Valor en letras pendiente."}`, MARGIN, y, CONTENT_WIDTH, { fontSize: 8.5 });
  y = addWrappedText(doc, `Entrega: ${offer.delivery || "-"}`, MARGIN, y + 2, CONTENT_WIDTH, { fontSize: 8.5 });
  y = addWrappedText(doc, `Forma de pago: ${offer.payment || "-"}`, MARGIN, y + 2, CONTENT_WIDTH, { fontSize: 8.5 });
  y = addWrappedText(doc, `Garantia: ${offer.warranty || "-"}`, MARGIN, y + 2, CONTENT_WIDTH, { fontSize: 8.5 });
  y = addWrappedText(doc, `Notas: ${offer.notes || "-"}`, MARGIN, y + 2, CONTENT_WIDTH, { fontSize: 8.5 });
  y = addWrappedText(doc, "Esta oferta se rige por los Terminos de Venta Generales de ASTAP, a menos que se especifique de otra manera en esta propuesta.", MARGIN, y + 3, CONTENT_WIDTH, { fontSize: 8 });
  y += 12;

  y = ensurePage(doc, y, 42);
  const signatureWidth = (CONTENT_WIDTH - 18) / 3;
  addSignature(doc, "Preparado por", offer.preparedBy, offer.signatures?.prepared, MARGIN, y, signatureWidth);
  addSignature(doc, "Aprobado por", offer.approvedBy, offer.signatures?.approved, MARGIN + signatureWidth + 9, y, signatureWidth);
  addSignature(doc, "Aceptacion Cliente", offer.acceptedBy, offer.signatures?.accepted, MARGIN + (signatureWidth + 9) * 2, y, signatureWidth);
  y += 42;

  y = ensurePage(doc, y, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Desde 1941 suministrando productos y servicios para aplicaciones petroleras, de agua potable, generacion de energia, medio ambiente e industria", PAGE_WIDTH / 2, y, { align: "center", maxWidth: CONTENT_WIDTH });

  return doc;
}

export async function generateVehicleServiceQuotePdfBlob(payload) {
  const doc = await generateVehicleServiceQuotePdf(payload);
  return doc.output("blob");
}
