import { supabase } from "@/lib/supabase";
import { saveOrUpdateReport } from "../services/reportService";
import {
  canAccessRecord,
  getRecordAccessPermissionsForUser,
} from "@/services/accessControlService";

const SUPER_ADMIN_EMAIL = "smaviles@astap.com";
const SUPERVISOR_OPERACIONES_EMAIL = "kamhez@astap.com";

const canViewAll = (email = "") => {
  const userEmail = email.toLowerCase();
  return (
    userEmail === SUPER_ADMIN_EMAIL ||
    userEmail === SUPERVISOR_OPERACIONES_EMAIL
  );
};

/* ================= CREAR REGISTRO ================= */
export async function createRegistro({ id = null, data }) {
  try {
    const result = await saveOrUpdateReport({
      id,
      area: "operaciones",
      tipo: "registro",
      subtipo: "herramienta",
      data,
      estado: "salida",
    });

    return result;
  } catch (error) {
    console.error("❌ Error en createRegistro:", error);
    throw error;
  }
}

/* ================= ELIMINAR REGISTRO ================= */
export async function deleteRegistro(id) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  let query = supabase
    .from("registros")
    .delete()
    .eq("id", id)
    .eq("area", "operaciones")
    .eq("tipo", "registro")
    .eq("subtipo", "herramienta");

  // Karim NO elimina registros de otros. Solo Santiago puede.
  if (user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
    query = query.eq("user_id", user.id);
  }

  const { error } = await query;

  if (error) {
    console.error("Error eliminando registro:", error);
    return false;
  }

  return true;
}

/* ================= OBTENER TODOS ================= */
export async function getAllRegistros() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const loadBaseQuery = () =>
    supabase
      .from("registros")
      .select("*")
      .eq("area", "operaciones")
      .eq("tipo", "registro")
      .eq("subtipo", "herramienta")
      .order("created_at", { ascending: false });

  if (canViewAll(user.email)) {
    const { data, error } = await loadBaseQuery();

    if (error) {
      console.error("Error cargando registros:", error);
      return [];
    }

    return data || [];
  }

  const permissions = await getRecordAccessPermissionsForUser(user.id);
  const { data, error } = await loadBaseQuery();

  if (error) {
    console.error("Error cargando registros:", error);
    return [];
  }

  const userEmail = user.email?.toLowerCase() || "";
  return (data || []).filter((record) => {
    const ownRecord = record.user_id === user.id || record.data?.tecnicoCorreo?.toLowerCase() === userEmail;
    return ownRecord || canAccessRecord({ record, userId: user.id, permissions, isSuperAdmin: false, action: "view" });
  });
}

/* ================= OBTENER POR ID ================= */
export async function getRegistroById(id) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .eq("id", id)
    .eq("area", "operaciones")
    .eq("tipo", "registro")
    .eq("subtipo", "herramienta")
    .maybeSingle();

  if (error) {
    console.error("Error obteniendo registro:", error);
    return null;
  }

  if (!data) return null;

  if (canViewAll(user.email) || data.user_id === user.id) return data;

  const permissions = await getRecordAccessPermissionsForUser(user.id);
  const canView = canAccessRecord({
    record: data,
    userId: user.id,
    permissions,
    isSuperAdmin: user.email?.toLowerCase() === SUPER_ADMIN_EMAIL,
    action: "view",
  });

  if (!canView) return null;

  return data;
}

/* ================= ACTUALIZAR ================= */
export async function updateRegistro(id, payload, estado = "borrador") {
  try {
    const result = await saveOrUpdateReport({
      id,
      area: "operaciones",
      tipo: "registro",
      subtipo: "herramienta",
      data: payload,
      estado,
    });

    return result;
  } catch (error) {
    console.error("Error actualizando registro:", error);
    throw error;
  }
}
