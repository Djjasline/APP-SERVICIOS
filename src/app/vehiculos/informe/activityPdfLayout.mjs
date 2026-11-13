export function useMarlonActivityLayout(reportType, technicianName) {
  const name = String(technicianName || "").trim().replace(/\s+/g, " ").toLocaleUpperCase("es");
  return reportType === "informe" && name === "MARLON GUEVARA";
}

export function pairActivityImages(images, descriptions) {
  const pairs = [];
  if (!Array.isArray(images)) return pairs;
  images.forEach((src, index) => {
    if (index % 2 === 0) pairs.push([]);
    pairs[pairs.length - 1].push({ src, description: descriptions?.[index] || "", index });
  });
  return pairs;
}
