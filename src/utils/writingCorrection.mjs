const LOCAL_REPLACEMENTS = [
  ["se realizo", "se realizó"],
  ["se verifico", "se verificó"],
  ["se cambio", "se cambió"],
  ["se instalo", "se instaló"],
  ["se reparo", "se reparó"],
  ["se capacito", "se capacitó"],
  ["a traves", "a través"],
  ["actualizacion", "actualización"],
  ["accion", "acción"],
  ["analisis", "análisis"],
  ["aplicacion", "aplicación"],
  ["aprobacion", "aprobación"],
  ["atencion", "atención"],
  ["calibracion", "calibración"],
  ["calificacion", "calificación"],
  ["camara", "cámara"],
  ["capacitacion", "capacitación"],
  ["comprobacion", "comprobación"],
  ["comunicacion", "comunicación"],
  ["conclusion", "conclusión"],
  ["condicion", "condición"],
  ["configuracion", "configuración"],
  ["conexion", "conexión"],
  ["correccion", "corrección"],
  ["diagnostico", "diagnóstico"],
  ["descripcion", "descripción"],
  ["direccion", "dirección"],
  ["documentacion", "documentación"],
  ["ejecucion", "ejecución"],
  ["electrica", "eléctrica"],
  ["electricas", "eléctricas"],
  ["electrico", "eléctrico"],
  ["electricos", "eléctricos"],
  ["energia", "energía"],
  ["evaluacion", "evaluación"],
  ["funcion", "función"],
  ["garantia", "garantía"],
  ["gestion", "gestión"],
  ["hidraulica", "hidráulica"],
  ["hidraulicas", "hidráulicas"],
  ["hidraulico", "hidráulico"],
  ["hidraulicos", "hidráulicos"],
  ["imagenes", "imágenes"],
  ["informacion", "información"],
  ["inspeccion", "inspección"],
  ["instalacion", "instalación"],
  ["intervencion", "intervención"],
  ["liberacion", "liberación"],
  ["lubricacion", "lubricación"],
  ["mecanica", "mecánica"],
  ["mecanicas", "mecánicas"],
  ["mecanico", "mecánico"],
  ["mecanicos", "mecánicos"],
  ["medicion", "medición"],
  ["observacion", "observación"],
  ["operacion", "operación"],
  ["participacion", "participación"],
  ["petroleo", "petróleo"],
  ["planificacion", "planificación"],
  ["practica", "práctica"],
  ["practicas", "prácticas"],
  ["presentacion", "presentación"],
  ["presion", "presión"],
  ["programacion", "programación"],
  ["recepcion", "recepción"],
  ["recomendacion", "recomendación"],
  ["reparacion", "reparación"],
  ["revision", "revisión"],
  ["situacion", "situación"],
  ["solucion", "solución"],
  ["supervision", "supervisión"],
  ["tecnica", "técnica"],
  ["tecnicas", "técnicas"],
  ["tecnico", "técnico"],
  ["tecnicos", "técnicos"],
  ["validacion", "validación"],
  ["valvula", "válvula"],
  ["vehiculo", "vehículo"],
  ["vehiculos", "vehículos"],
  ["verificacion", "verificación"],
].sort(([left], [right]) => right.length - left.length);

const PROTECTED_KEY_TOKENS = new Set([
  "amount",
  "area",
  "cantidad",
  "cedula",
  "chasis",
  "cod",
  "codigo",
  "code",
  "correo",
  "cost",
  "costo",
  "created",
  "date",
  "email",
  "equipo",
  "equipment",
  "estado",
  "fecha",
  "file",
  "hora",
  "horometro",
  "id",
  "iva",
  "kilometraje",
  "km",
  "link",
  "marca",
  "matricula",
  "model",
  "modelo",
  "number",
  "numero",
  "path",
  "phone",
  "placa",
  "precio",
  "price",
  "quantity",
  "rating",
  "ratings",
  "ruc",
  "serial",
  "serie",
  "status",
  "stock",
  "subtotal",
  "time",
  "timestamp",
  "tipo",
  "total",
  "updated",
  "url",
  "uuid",
  "valor",
  "vin",
  "weight",
]);

const MEDIA_KEY_TOKENS = new Set([
  "avatar",
  "firma",
  "firmas",
  "foto",
  "fotos",
  "image",
  "images",
  "imagen",
  "imagenes",
  "photo",
  "photos",
  "signature",
  "signatures",
]);

const patternCache = new Map();

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getTextTokens(value) {
  return String(value || "")
    .replace(/([a-záéíóúüñ])([A-ZÁÉÍÓÚÜÑ])/g, "$1 $2")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function getPattern(source) {
  if (!patternCache.has(source)) {
    patternCache.set(
      source,
      new RegExp(`(^|[^\\p{L}\\p{N}_])(${escapeRegExp(source)})(?=$|[^\\p{L}\\p{N}_])`, "giu")
    );
  }

  return patternCache.get(source);
}

function keepCapitalization(original, replacement) {
  if (!original) return replacement;
  if (original === original.toLocaleUpperCase("es-EC")) return replacement.toLocaleUpperCase("es-EC");
  if (original[0] === original[0].toLocaleUpperCase("es-EC")) {
    return `${replacement[0].toLocaleUpperCase("es-EC")}${replacement.slice(1)}`;
  }

  return replacement;
}

function looksLikeProtectedValue(value) {
  const text = String(value || "").trim();
  return (
    /^(?:data:[^,]+,|https?:\/\/|www\.)/i.test(text) ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ||
    /^[A-Za-z0-9+/=]{120,}$/.test(text)
  );
}

function correctValue(value, key = "") {
  if (isWritingCorrectionExcludedKey(key)) return { value, corrections: 0 };

  if (typeof value === "string") {
    const corrected = correctWritingText(value);
    return { value: corrected, corrections: corrected === value ? 0 : 1 };
  }

  if (Array.isArray(value)) {
    let corrections = 0;
    let changed = false;
    const next = value.map((item) => {
      const result = correctValue(item, key);
      corrections += result.corrections;
      changed ||= result.value !== item;
      return result.value;
    });

    return { value: changed ? next : value, corrections };
  }

  if (!value || typeof value !== "object" || Object.getPrototypeOf(value) !== Object.prototype) {
    return { value, corrections: 0 };
  }

  let corrections = 0;
  let changed = false;
  const next = {};

  for (const [childKey, childValue] of Object.entries(value)) {
    const result = correctValue(childValue, childKey);
    next[childKey] = result.value;
    corrections += result.corrections;
    changed ||= result.value !== childValue;
  }

  return { value: changed ? next : value, corrections };
}

export function isWritingCorrectionExcludedKey(key) {
  const tokens = getTextTokens(key);
  if (tokens.length === 0) return false;
  if (MEDIA_KEY_TOKENS.has(tokens[0])) return true;
  return tokens.some((token) => PROTECTED_KEY_TOKENS.has(token));
}

export function correctWritingText(value) {
  if (typeof value !== "string" || !value.trim() || looksLikeProtectedValue(value)) return value;

  let corrected = value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]+([,;:!?])/g, "$1")
    .trim();

  for (const [source, replacement] of LOCAL_REPLACEMENTS) {
    corrected = corrected.replace(getPattern(source), (_match, prefix, found) => {
      return `${prefix}${keepCapitalization(found, replacement)}`;
    });
  }

  return corrected;
}

export function correctWritingData(value) {
  return correctValue(value);
}
