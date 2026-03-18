import jsPDF from "jspdf";

export const generarPDFRecepcion = (data) => {
  const doc = new jsPDF();

  // =========================
  // TITULO
  // =========================
  doc.setFontSize(16);
  doc.text("HOJA DE RECEPCIÓN", 70, 10);

  // =========================
  // DATOS GENERALES
  // =========================
  doc.setFontSize(10);

  doc.text(`Conductor: ${data.conductor}`, 10, 20);
  doc.text(`Fecha: ${data.fecha}`, 140, 20);

  doc.text(`Ciudad: ${data.ciudad}`, 10, 26);
  doc.text(`Destino: ${data.lugarDestino}`, 140, 26);

  // =========================
  // VEHICULO
  // =========================
  doc.text(`Vehículo: ${data.vehiculo}`, 10, 34);
  doc.text(`Modelo: ${data.modelo}`, 80, 34);
  doc.text(`Placa: ${data.placa}`, 140, 34);

  // =========================
  // CHECKLIST
  // =========================
  let y = 45;

  doc.text("CHECKLIST", 10, y);
  y += 5;

  Object.entries(data.checklist).forEach(([grupo, items]) => {
    doc.text(grupo.toUpperCase(), 10, y);
    y += 4;

    Object.entries(items).forEach(([item, val]) => {
      doc.text(`${item}: ${val ? "✔" : "✘"}`, 15, y);
      y += 4;
    });

    y += 2;
  });

  // =========================
  // DAÑOS (IMAGEN + PUNTOS)
  // =========================
  y += 5;
  doc.text("DAÑOS DE CARROCERÍA", 10, y);
  y += 5;

  if (data.danos?.imagen) {
    const imgWidth = 180;
    const imgHeight = 80;

    doc.addImage(
      data.danos.imagen,
      "JPEG",
      10,
      y,
      imgWidth,
      imgHeight
    );

    // ESCALAS
    const canvasWidth = 1000; // referencia
    const canvasHeight = 600;

    const scaleX = imgWidth / canvasWidth;
    const scaleY = imgHeight / canvasHeight;

    // PUNTOS
    data.danos.puntos.forEach(p => {
      let color = [255, 0, 0];

      if (p.tipo === "rayon") color = [255, 255, 0];
      if (p.tipo === "abolladura") color = [255, 165, 0];

      doc.setFillColor(...color);

      doc.circle(
        10 + p.x * scaleX,
        y + p.y * scaleY,
        2,
        "F"
      );
    });

    y += imgHeight + 5;
  }

  // =========================
  // OBSERVACIONES
  // =========================
  doc.text("OBSERVACIONES:", 10, y);
  y += 5;

  doc.text(data.observaciones || "-", 10, y);

  // =========================
  // EXPORTAR
  // =========================
  doc.save("recepcion.pdf");
};
