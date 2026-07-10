const APP_UPDATES = [
  {
    id: "2026-07-10-vehicle-pdf-print-fixes",
    title: "Corrección de impresión PDF vehículos",
    message:
      "Se corrigió la numeración montada, la carga del logo ASTAP, el ancho del cuadro de conclusiones/recomendaciones y la espera de imágenes antes de imprimir PDFs.",
    created_at: "2026-07-10T18:30:00-05:00",
  },
  {
    id: "2026-07-10-pdf-equipment-image-layout",
    title: "PDFs de vehículos más compactos",
    message:
      "Se ajustó Estado del equipo para que la imagen no se corte entre páginas, use una caja máxima de 95 mm x 70 mm y aproveche mejor la primera hoja del PDF.",
    created_at: "2026-07-10T17:30:00-05:00",
  },
  {
    id: "2026-07-10-vcam-protocol",
    title: "Nuevo protocolo Cámara V-CAM6",
    message:
      "Ya está disponible el protocolo de mantenimiento preventivo para Cámara V-CAM6, con formulario, PDF, checklist, repuestos, pruebas finales y permisos administrativos.",
    created_at: "2026-07-10T16:30:00-05:00",
  },
  {
    id: "2026-07-10-vactor-protocol-improvements",
    title: "Protocolo Vactor mejorado",
    message:
      "El protocolo Vactor ahora incluye pruebas previas, recambio de elementos, herramientas, instrucciones operativas, especificaciones de aceite y más verificaciones finales.",
    created_at: "2026-07-10T15:30:00-05:00",
  },
  {
    id: "2026-07-09-multiple-pumps-valves",
    title: "Múltiples bombas y válvulas",
    message:
      "Ahora los informes de Agua, Industria y Petróleo permiten registrar varias bombas o válvulas, identificarlas individualmente y verlas completas en el PDF.",
    created_at: "2026-07-09T12:00:00-05:00",
  },
  {
    id: "2026-07-09-access-all-users",
    title: "Acceso ampliado a áreas",
    message:
      "Todos los usuarios autenticados pueden ingresar a las áreas y submenús principales. El panel administrativo sigue reservado para superadministradores.",
    created_at: "2026-07-09T11:30:00-05:00",
  },
  {
    id: "2026-07-09-road-wizard-pdf",
    title: "Corrección PDF Road Wizard",
    message:
      "El PDF de inspección Road Wizard ya muestra correctamente N° serie, VIN/chasis, placa, horas, kilometraje y horómetro.",
    created_at: "2026-07-09T10:30:00-05:00",
  },
  {
    id: "2026-07-09-login-errors",
    title: "Mensajes de login mejorados",
    message:
      "El inicio de sesión ahora muestra mensajes más claros para contraseña incorrecta, correo no confirmado o problemas de conexión.",
    created_at: "2026-07-09T10:00:00-05:00",
  },
];

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

function storageKey(email) {
  return `app_updates_read:${normalizeEmail(email) || "anonymous"}`;
}

function getReadIds(email) {
  if (typeof localStorage === "undefined") return new Set();

  try {
    const raw = localStorage.getItem(storageKey(email));
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(email, ids) {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(storageKey(email), JSON.stringify(Array.from(ids)));
  } catch {
    // Ignore storage failures; updates will simply appear unread again.
  }
}

export function getAppUpdates(email) {
  const readIds = getReadIds(email);

  return APP_UPDATES.map((update) => ({
    ...update,
    id: `app-update-${update.id}`,
    update_id: update.id,
    record_type: "app_update",
    read: readIds.has(update.id),
    isAppUpdate: true,
  }));
}

export function getUnreadAppUpdatesCount(email) {
  return getAppUpdates(email).filter((update) => !update.read).length;
}

export function markAppUpdateRead(email, updateId) {
  const cleanId = String(updateId || "").replace(/^app-update-/, "");
  if (!cleanId) return false;

  const readIds = getReadIds(email);
  readIds.add(cleanId);
  saveReadIds(email, readIds);
  return true;
}
