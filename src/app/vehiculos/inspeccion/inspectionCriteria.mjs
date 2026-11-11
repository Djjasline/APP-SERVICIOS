// Compare UTC creation dates consistently in forms and PDFs; never use updated_at.
export function usesNewInspectionCriteria(createdAt) {
  const time = new Date(createdAt || "").getTime();
  return Number.isFinite(time) && time >= Date.UTC(2026, 10, 1);
}

const positiveQuestions = {
  "¿Se encuentran alarmas activas o mensajes de error en el panel?": "¿El panel se encuentra sin alarmas activas ni mensajes de error?",
  "¿Se detectan fugas de aceite en mangueras, acoples, bancos, cilindros, válvulas o solenoides?": "¿Las mangueras, acoples, bancos, cilindros, válvulas y solenoides se encuentran sin fugas de aceite?",
  "¿Se presentan fugas de aceite en los motores de los cepillos?": "¿Los motores de los cepillos se encuentran sin fugas de aceite?",
  "¿Se detectan fugas de aceite en el motor de la banda?": "¿El motor de la banda se encuentra sin fugas de aceite?",
  "¿Existen fugas de aceite en las bombas hidráulicas?": "¿Las bombas hidráulicas se encuentran sin fugas de aceite?",
  "¿Se detectan fugas de aceite en el motor John Deere?": "¿El motor John Deere se encuentra sin fugas de aceite?",
  "¿Se detectan fugas de agua en mangueras o acoples del sistema?": "¿Las mangueras y acoples del sistema se encuentran sin fugas de agua?",
  "¿Se detectan códigos de error con el service tool (opcional)?": "¿La revisión con el service tool está libre de códigos de error (opcional)?",
  "¿La tolva presenta fisuras, deformaciones o acumulación de residuos?": "¿La tolva se encuentra sin fisuras, deformaciones ni acumulación de residuos?",
};

export function inspectionDescription(description, enabled) {
  if (!enabled) return description;
  const review = (positiveQuestions[description] || description).replace(/^[¿\s]+|[?\s]+$/g, "");
  return `¿Existe alguna novedad al revisar lo siguiente: ${review}?`;
}
