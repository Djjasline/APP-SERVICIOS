export function useMarlonActivityLayout(reportType, technicianName) {
  const name = String(technicianName || "").trim().replace(/\s+/g, " ").toLocaleUpperCase("es");
  return reportType === "informe" && name === "MARLON GUEVARA";
}

export function layoutActivityImages(images, descriptions) {
  if (!Array.isArray(images)) return [];
  const rows = [];
  images.forEach((src, index) => {
    if (index % 3 === 0) rows.push([]);
    rows[rows.length - 1].push({ src, description: descriptions?.[index] || "", index });
  });
  return rows;
}
