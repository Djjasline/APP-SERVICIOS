import { supabase } from "@/lib/supabase";
import { saveOrUpdateReport } from "../services/reportService";
import {
  canAccessRecord,
  getAccessibleRecordsForUser,
  getRecordAccessPermissionsForUser,
} from "@/services/accessControlService";
import { isSuperAdminEmail, isSupervisorOperacionesEmail } from "@/constants/privilegedAccess.mjs";

const canViewAll = (email = "") => {
  return isSuperAdminEmail(email) || isSupervisorOperacionesEmail(email);
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

  // Solo super admin elimina registros de otros usuarios.
  if (!isSuperAdminEmail(user.email)) {
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

  try {
    const { records } = await getAccessibleRecordsForUser({
      userId: user.id,
      userEmail: user.email,
      area: "operaciones",
      tipo: "registro",
      subtipo: "herramienta",
      canViewAll: canViewAll(user.email),
    });

    return records;
  } catch (error) {
    console.error("Error cargando registros:", error);
    return [];
  }
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
    isSuperAdmin: isSuperAdminEmail(user.email),
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
