export function useMarlonActivityLayout(reportType, technicianName) {
  const name = String(technicianName || "").trim().replace(/\s+/g, " ").toLocaleUpperCase("es");
  return reportType === "informe" && name === "MARLON GUEVARA";
}

export function layoutActivityImages(images, descriptions, ratios = {}) {
  if (!Array.isArray(images)) return [];
  const rows = [];
  let row = [];
  let width = 0;
  const target = 3.8;

  images.forEach((src, index) => {
    const measured = ratios[src];
    const ratio = Number.isFinite(measured) && measured > 0 ? measured : 1;
    if (row.length && (row.length >= 6 || (width >= 2.4 && Math.abs(target - width) < Math.abs(target - width - ratio)))) {
      rows.push(row);
      row = [];
      width = 0;
    }
    row.push({ src, description: descriptions?.[index] || "", index, ratio });
    width += ratio;
  });
  if (row.length) rows.push(row);
  return rows;
}
