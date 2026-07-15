import { supabase } from "@/lib/supabase";

function cleanUpdateId(value) {
  return String(value || "").replace(/^app-update-/, "");
}

const FRIENDLY_UPDATES = [
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

function friendlyUpdate(update) {
  const rawTitle = stripTechnicalReferences(update?.title);
  const rawMessage = stripTechnicalReferences(update?.message);
  const searchable = `${rawTitle} ${rawMessage}`.toLowerCase();
  const known = FRIENDLY_UPDATES.find((item) => searchable.includes(item.match));

  if (known) return known;

  const fallbackMessage = rawMessage
    .replace(/^Se publicó una nueva versión de la app con estos cambios:\s*-?\s*/i, "")
    .replace(/^Actualización:\s*/i, "")
    .trim();

  return {
    title: rawTitle.replace(/^Actualización:/i, "Control de cambios:") || "Control de cambios",
    message: fallbackMessage
      ? `Se actualizó la app: ${fallbackMessage}`
      : "Se publicó una mejora en la app.",
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
