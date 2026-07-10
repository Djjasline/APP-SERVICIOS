import { supabase } from "@/lib/supabase";

function cleanUpdateId(value) {
  return String(value || "").replace(/^app-update-/, "");
}

function mapUpdate(update, readIds = new Set()) {
  return {
    ...update,
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
  return data || [];
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
