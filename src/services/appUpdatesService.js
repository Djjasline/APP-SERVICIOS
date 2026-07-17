import { supabase } from "@/lib/supabase";

function cleanUpdateId(value) {
  return String(value || "").replace(/^app-update-/, "");
}

const FRIENDLY_UPDATES = [
  {
    match: "agregar encuesta de satisfaccion en construccion",
    title: "Control de cambios: encuesta de satisfacción",
    message: "Se agregó el acceso en construcción a la encuesta de satisfacción para Agua, Industria, Petróleo y Vehículos Especiales.",
  },
  {
    match: "remove public mobile contact",
    title: "Control de cambios: contacto público",
    message: "Se quitó el número celular del contacto visible y se dejó solo el teléfono principal de ASTAP.",
  },
  {
    match: "improve initial app paint",
    title: "Control de cambios: carga inicial",
    message: "Se mejoró la primera carga de la aplicación para mostrar contenido más rápido.",
  },
  {
    match: "improve app security and loading",
    title: "Control de cambios: seguridad y carga",
    message: "Se reforzó la privacidad de la app y se optimizó la carga de pantallas y archivos pesados.",
  },
  {
    match: "use user profiles in history filters",
    title: "Control de cambios: filtros de historial",
    message: "Los historiales ahora usan los usuarios registrados para filtrar por técnico o responsable.",
  },
  {
    match: "use technician selects in histories",
    title: "Control de cambios: filtros de técnicos",
    message: "Los historiales ahora muestran listas desplegables para seleccionar técnicos.",
  },
  {
    match: "rename repository vehicle sections",
    title: "Control de cambios: repositorios de vehículos",
    message: "Se actualizaron los nombres de las secciones técnicas y de entrenamiento de vehículos especiales.",
  },
  {
    match: "fix tool register light layout",
    title: "Control de cambios: registro de herramientas",
    message: "Se corrigió la presentación clara del registro de salida e ingreso de herramientas.",
  },
  {
    match: "align tool register light theme",
    title: "Control de cambios: registro de herramientas",
    message: "Se alineó el registro de herramientas con el estilo claro usado en Operaciones.",
  },
  {
    match: "organize admin options menu",
    title: "Control de cambios: menú administrativo",
    message: "Las opciones del administrador quedaron organizadas en un menú interno.",
  },
  {
    match: "add admin success dashboard",
    title: "Control de cambios: panel administrativo",
    message: "Se agregó un dashboard administrativo con métricas, filtros, gráficos y exportación CSV.",
  },
  {
    match: "add notification filters and read actions",
    title: "Control de cambios: mejoras en notificaciones",
    message: "Se agregó un buscador, filtros por tipo y una opción para marcar varios avisos como leídos.",
  },
  {
    match: "improve water route signature boxes",
    title: "Control de cambios: firmas del recorrido",
    message: "Se mejoraron los cuadros de firma del informe de recorrido para que las firmas no se corten.",
  },
  {
    match: "add construction icon to route progress",
    title: "Control de cambios: avance del recorrido",
    message: "Se agregó el símbolo de construcción junto al avance del informe de recorrido.",
  },
  {
    match: "show water route progress",
    title: "Control de cambios: avance del recorrido",
    message: "Se muestra el porcentaje de avance del informe de recorrido sin bloquear su acceso.",
  },
  {
    match: "restrict configurator access",
    title: "Control de cambios: configurador",
    message: "El configurador muestra 20% de avance y queda con acceso restringido hasta nueva orden.",
  },
  {
    match: "add optional authorization signatures to reports",
    title: "Control de cambios: firma de autorización",
    message: "Se agregó la opción Autorizado por en informes de Agua, Industria y Petróleo.",
  },
  {
    match: "add optional vehicle report authorization signature",
    title: "Control de cambios: firma de autorización",
    message: "Se agregó la opción Autorizado por en informes de vehículos.",
  },
  {
    match: "normalize tool register signature boxes",
    title: "Control de cambios: firmas de herramientas",
    message: "Se ajustaron los cuadros de firma del registro de herramientas para que se vean proporcionados.",
  },
  {
    match: "fit vehicle log sheet to a4 width",
    title: "Control de cambios: bitácora vehicular",
    message: "La bitácora vehicular ahora se ajusta mejor a una hoja A4 vertical y evita la barra horizontal.",
  },
  {
    match: "match refinery authorization pdf format",
    title: "Control de cambios: autorización de vehículo",
    message: "Se mejoró el formato PDF de autorización de uso de vehículo para que se parezca al formulario original.",
  },
];

function stripTechnicalReferences(value) {
  return String(value || "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\([0-9a-f]{7,40}\)/gi, "")
    .replace(/\b[0-9a-f]{7,40}\b/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();
}

function getChangeCount(title) {
  const match = String(title || "").match(/(?:Actualizaci[oó]n de la app|Control de cambios):\s*(\d+)\s+cambios/i);
  return match ? Number(match[1]) : 0;
}

function getSubjectFromTitle(title) {
  const cleanTitle = stripTechnicalReferences(title);

  if (/^Actualizaci[oó]n:\s*/i.test(cleanTitle)) {
    return cleanTitle.replace(/^Actualizaci[oó]n:\s*/i, "").trim();
  }

  return "";
}

function genericFriendlyUpdate(update) {
  const count = getChangeCount(update?.title);

  if (count > 1) {
    return {
      title: `Control de cambios: ${count} cambios publicados`,
      message: `Se publicaron ${count} mejoras en la aplicación.`,
    };
  }

  const subject = getSubjectFromTitle(update?.title).toLowerCase();
  const known = FRIENDLY_UPDATES.find((item) => subject.includes(item.match));
  if (known) return known;

  return {
    title: "Control de cambios: actualización publicada",
    message: "Se publicó una mejora en la aplicación.",
  };
}

function friendlyUpdate(update) {
  const rawTitle = stripTechnicalReferences(update?.title);
  const rawMessage = stripTechnicalReferences(update?.message);
  const searchable = `${rawTitle} ${rawMessage}`.toLowerCase();
  const known = FRIENDLY_UPDATES.find((item) => searchable.includes(item.match));

  if (known) return known;

  if (/^Actualizaci[oó]n/i.test(rawTitle)) {
    return genericFriendlyUpdate(update);
  }

  return {
    title: rawTitle.replace(/^Actualizaci[oó]n:/i, "Control de cambios:") || "Control de cambios",
    message: rawMessage || "Se publicó una mejora en la aplicación.",
  };
}

function withFriendlyText(update) {
  const friendly = friendlyUpdate(update);

  return {
    ...update,
    raw_title: update.title,
    raw_message: update.message,
    title: friendly.title,
    message: friendly.message,
  };
}

function mapUpdate(update, readIds = new Set()) {
  return {
    ...withFriendlyText(update),
    id: `app-update-${update.id}`,
    update_id: update.id,
    record_type: "app_update",
    read: readIds.has(update.id),
    isAppUpdate: true,
  };
}

export async function getAppUpdates(userId) {
  if (!userId) return [];

  const { data: updates, error } = await supabase
    .from("app_updates")
    .select("id, update_key, title, message, active, created_at")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando boletines:", error);
    return [];
  }

  const updateIds = (updates || []).map((update) => update.id);
  if (updateIds.length === 0) return [];

  const { data: reads, error: readsError } = await supabase
    .from("app_update_reads")
    .select("update_id")
    .eq("user_id", userId)
    .in("update_id", updateIds);

  if (readsError) {
    console.error("Error cargando lecturas de boletines:", readsError);
  }

  const readIds = new Set((reads || []).map((read) => read.update_id));
  return (updates || []).map((update) => mapUpdate(update, readIds));
}

export async function getUnreadAppUpdatesCount(userId) {
  const updates = await getAppUpdates(userId);
  return updates.filter((update) => !update.read).length;
}

export async function markAppUpdateRead(userId, updateId) {
  const cleanId = cleanUpdateId(updateId);
  if (!userId || !cleanId) return false;

  const { error } = await supabase
    .from("app_update_reads")
    .upsert(
      {
        user_id: userId,
        update_id: cleanId,
        read_at: new Date().toISOString(),
      },
      { onConflict: "user_id,update_id" }
    );

  if (error) {
    console.error("Error marcando boletín como leído:", error);
    return false;
  }

  return true;
}

export async function getAllAppUpdatesForAdmin() {
  const { data, error } = await supabase
    .from("app_updates")
    .select("id, update_key, title, message, active, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(withFriendlyText);
}

export async function createAppUpdate({ title, message, userId }) {
  const cleanTitle = String(title || "").trim();
  const cleanMessage = String(message || "").trim();

  if (!cleanTitle || !cleanMessage) {
    throw new Error("Título y mensaje son obligatorios.");
  }

  const updateKey = `${new Date().toISOString().slice(0, 10)}-${Date.now()}`;
  const { data, error } = await supabase
    .from("app_updates")
    .insert({
      update_key: updateKey,
      title: cleanTitle,
      message: cleanMessage,
      created_by: userId || null,
      active: true,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function setAppUpdateActive(id, active) {
  const { data, error } = await supabase
    .from("app_updates")
    .update({ active: !!active, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}
