import { supabase } from "@/lib/supabase";
import { saveOrUpdateReport } from "../services/reportService";

const SUPER_ADMIN_EMAIL = "smaviles@astap.com";

/* ================= CREAR REGISTRO ================= */
/**
 * Crear o actualizar registro SIN duplicados
 */
export async function createRegistro({ id = null, data }) {
  try {
    const result = await saveOrUpdateReport({
      id,
      area: "operaciones",
      tipo: "registro",
      subtipo: "herramienta",
      data,
      estado: "borrador",
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

  if (user.email !== SUPER_ADMIN_EMAIL) {
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

  let query = supabase
    .from("registros")
    .select("*")
    .eq("area", "operaciones")
    .eq("tipo", "registro")
    .eq("subtipo", "herramienta")
    .order("created_at", { ascending: false });

  if (user.email !== SUPER_ADMIN_EMAIL) {
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error cargando registros:", error);
    return [];
  }

  return data || [];
}

/* ================= OBTENER POR ID ================= */
export async function getRegistroById(id) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let query = supabase
    .from("registros")
    .select("*")
    .eq("id", id)
    .eq("area", "operaciones")
    .eq("tipo", "registro")
    .eq("subtipo", "herramienta")
    .single();

  if (user.email !== SUPER_ADMIN_EMAIL) {
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error obteniendo registro:", error);
    return null;
  }

  return data;
}

/* ================= ACTUALIZAR ================= */
/**
 * Actualiza registro usando el service (UNIFICADO)
 */
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
