import { supabase } from "@/lib/supabase"
import { saveOrUpdateReport } from "../services/reportService"

/* ================= CREAR REGISTRO ================= */
/**
 * Crear o actualizar registro SIN duplicados
 */
export async function createRegistro({ id = null, data }) {
  try {
    const result = await saveOrUpdateReport({
      id,
      tipo: "registro",
      subtipo: "herramienta", // ajusta si manejas otro subtipo
      data,
      estado: "borrador"
    })

    return result
  } catch (error) {
    console.error("❌ Error en createRegistro:", error)
    throw error
  }
}

/* ================= ELIMINAR REGISTRO ================= */
export async function deleteRegistro(id) {
  const { error } = await supabase
    .from("registros")
    .delete()
    .eq("id", id)
    .eq("tipo", "registro")

  if (error) {
    console.error("Error eliminando registro:", error)
    return false
  }

  return true
}

/* ================= OBTENER TODOS ================= */
export async function getAllRegistros() {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .eq("tipo", "registro")
    .eq("subtipo", "herramienta")

  if (error) {
    console.error("Error cargando registros:", error)
    return []
  }

  return data
}

/* ================= OBTENER POR ID ================= */
export async function getRegistroById(id) {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error obteniendo registro:", error)
    return null
  }

  return data
}

/* ================= ACTUALIZAR ================= */
/**
 * Actualiza registro usando el service (UNIFICADO)
 */
export async function updateRegistro(id, payload, estado = "borrador") {
  try {
    const result = await saveOrUpdateReport({
      id,
      tipo: "registro",
      subtipo: "herramienta",
      data: payload,
      estado
    })

    return result
  } catch (error) {
    console.error("Error actualizando registro:", error)
  }
}
