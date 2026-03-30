import jsPDF from "jspdf";

export const generarPDFRecepcion = (data) => {
  const doc = new jsPDF("p", "mm", "a4");

  let y = 10;

  // =========================
  // TITULO
  // =========================
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("HOJA DE RECEPCIÓN", 80, y);

  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  // =========================
  // SECCION SUPERIOR
  // =========================

  // Bordes
  doc.rect(10, y, 190, 20);

  doc.text("ENTREGA VEHICULAR", 12, y + 4);

  doc.line(10, y + 6, 200, y + 6);

  doc.text(`CONDUCTOR: ${data.conductor}`, 12, y + 10);
  doc.text(`FECHA: ${data.fecha}`, 130, y + 10);

  doc.text(`LUGAR DESTINO: ${data.lugarDestino}`, 12, y + 16);
  doc.text(`CIUDAD: ${data.ciudad}`, 130, y + 16);

  y += 25;

  // =========================
  // DATOS VEHICULO
  // =========================
  doc.rect(10, y, 190, 12);

  doc.text(`VEHÍCULO: ${data.vehiculo}`, 12, y + 5);
  doc.text(`MODELO: ${data.modelo}`, 80, y + 5);
  doc.text(`PLACA: ${data.placa}`, 140, y + 5);

  y += 15;

  // =========================
  // CHECKLIST
  // =========================
  doc.text("DOCUMENTOS / ESTADO DEL VEHÍCULO", 12, y);

  y += 5;

  const drawChecklist = (titulo, items, startX) => {
    doc.text(titulo, startX, y);

    let offsetY = y + 4;

    Object.entries(items).forEach(([key, val]) => {
      doc.rect(startX, offsetY - 3, 3, 3);
      if (val) doc.text("X", startX + 0.5, offsetY - 0.5);
      doc.text(key, startX + 5, offsetY);
      offsetY += 4;
    });
  };

  drawChecklist("INTERIOR", data.checklist.interior, 10);
  drawChecklist("MOTOR", data.checklist.motor, 70);
  drawChecklist("EXTERIOR", data.checklist.exterior, 130);

  y += 25;

  // =========================
  // DAÑOS (REEMPLAZO DEL CAMIÓN)
  // =========================
  doc.setFont("helvetica", "bold");
  doc.text("DAÑOS DE CARROCERÍA Y COMENTARIOS GENERALES", 10, y);

  y += 5;

  doc.rect(10, y, 190, 90);

  if (data.danos?.imagen) {
    const imgX = 15;
    const imgY = y + 5;
    const imgWidth = 180;
    const imgHeight = 70;

    // Imagen real
    doc.addImage(
      data.danos.imagen,
      "JPEG",
      imgX,
      imgY,
      imgWidth,
      imgHeight
    );

    // Escala dinámica
    const canvasWidth = data.danos.canvasWidth || 1000;
    const canvasHeight = data.danos.canvasHeight || 600;

    const scaleX = imgWidth / canvasWidth;
    const scaleY = imgHeight / canvasHeight;

    // Puntos
    data.danos.puntos.forEach(p => {
      let color = [255, 0, 0];

      if (p.tipo === "rayon") color = [255, 255, 0];
      if (p.tipo === "abolladura") color = [255, 165, 0];

      doc.setFillColor(...color);

      doc.circle(
        imgX + p.x * scaleX,
        imgY + p.y * scaleY,
        2,
        "F"
      );
    });
  }

  y += 95;

  // =========================
  // OBSERVACIONES ENTREGA
  // =========================
  doc.setFont("helvetica", "normal");
  doc.text("OBSERVACIONES ENTREGA:", 10, y);

  y += 5;

  doc.rect(10, y, 190, 20);

  doc.text(data.observaciones || "-", 12, y + 5);

  y += 25;

  // =========================
  // RECEPCION VEHICULAR
  // =========================
  doc.text("RECEPCIÓN VEHICULAR", 10, y);

  y += 5;

  doc.rect(10, y, 190, 25);

  doc.text("NIVEL COMBUSTIBLE", 12, y + 6);
  doc.text("KILÓMETROS DE LLEGADA", 70, y + 6);
  doc.text("MANTENIMIENTO", 150, y + 6);

  y += 30;

  // =========================
  // OBSERVACIONES FINALES
  // =========================
  doc.text("OBSERVACIONES DE LA RECEPCIÓN:", 10, y);

  y += 5;

  doc.rect(10, y, 190, 20);

  // =========================
  // EXPORTAR
  // =========================
  doc.save("hoja_recepcion.pdf");
};
