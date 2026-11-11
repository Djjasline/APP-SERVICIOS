// Details recovered from the corresponding Git commits, without changing saved records.
const recentUpdates = {
  "31064961": ["Giro en observaciones de Pelican", "Las fotos nuevas de observación en la inspección Pelican pueden girarse antes de subirlas."],
  "6d3e5fd2": ["Criterio de novedades en inspecciones", "En inspecciones desde noviembre de 2026, SÍ indica una novedad y NO una condición correcta; las respuestas guardadas se conservan."],
  "e0d4f97f": ["Colores en inspecciones", "Se ajustaron los colores de las respuestas en los formularios y PDF de inspección."],
  "e3f0bdf2": ["Criterios de inspección", "Se unificaron los criterios de inspección de vehículos desde noviembre de 2026, conservando las respuestas guardadas."],
  "9dc01e3e": ["Giro de fotos", "El giro de imágenes se limitó inicialmente a actividades y estado del equipo."],
  "17c7066c": ["Giro de imágenes", "Se agregó la opción de girar imágenes antes de recortarlas y subirlas."],
  "dc578cce": ["Imágenes de actividades", "Las fotos de actividades se muestran completas y adaptadas al espacio en informes y PDF."],
  "fb2dfc24": ["Aviso de autoguardado", "Se agregó un indicador del guardado local en los formularios compatibles con autoguardado."],
  "0733f5d7": ["Controles de barredora", "Se actualizó la pregunta sobre el funcionamiento de controles en la inspección de barredora."],
  "fc278c7f": ["Redacción de inspección", "Se corrigió una palabra repetida en la inspección de barredora."],
  "2f5047d7": ["Revisión de fugas", "Se actualizó la redacción de las preguntas de fugas en la inspección de barredora."],
  "4afbc819": ["Fotos de observaciones", "Las imágenes de observación de vehículos se ajustan conservando sus proporciones en formularios y PDF."],
  "18937c3c": ["Carga de la aplicación", "Se agregó protección frente a recursos antiguos que podían causar una pantalla en blanco."],
  "bb12867b": ["Puntos sobre fotografías", "Se corrigió la ubicación de los puntos sobre las imágenes de inspección y PDF."],
  "ebf994e3": ["Recorte de fotografías", "Se agregó el recorte opcional de imágenes antes de subirlas."],
  "33a15c5f": ["Contraste de PDF", "Se mejoró el contraste de las vistas PDF en los temas de la aplicación."],
  "193fe262": ["Selección en inspecciones", "Se mejoraron los controles de selección y el contraste de casillas en inspecciones."],
  "7730f8d5": ["Límite de imágenes", "Se habilitaron imágenes ilimitadas por actividad para la cuenta autorizada; las demás mantienen el límite existente."],
  "02149951": ["Fechas en historiales", "Los historiales priorizan la fecha de creación de los registros."],
  "35b23064": ["Fechas de registros", "La corrección histórica de redacción dejó de asignar una fecha de modificación explícita."],
  "c8161949": ["Redacción en formularios", "Se incorporó la corrección de redacción al guardar formularios."],
};

export function getRecentUpdateDetails(key) {
  const match = String(key || "").match(/^github-push-([a-f\d]{7,40})$/i);
  if (!match) return null;
  const details = recentUpdates[match[1].slice(0, 8).toLowerCase()];
  return details ? { title: `Control de cambios: ${details[0]}`, message: details[1] } : null;
}
