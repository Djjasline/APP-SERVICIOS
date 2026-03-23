import { supabase } from "@/lib/supabase"
import { saveOrUpdateReport } from "../services/reportService"

/* ======================================================
   STORAGE PARA INSPECCIONES (SUPABASE)
====================================================== */

/* ================= GET ALL ================= */
export async function getAllInspections() {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .eq("tipo", "inspeccion")
    .order("updated_at", { ascending: false })

  if (error || !data) return []

  return data.map(r => ({
    id: r.id,
    type: r.subtipo,
    estado: r.estado,
    fecha: r.created_at,
    updatedAt: r.updated_at,
    data: r.data
  }))
}

/* ================= GET BY TYPE ================= */
export async function getInspections(type) {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .eq("tipo", "inspeccion")
    .eq("subtipo", type)
    .order("updated_at", { ascending: false })

  if (error || !data) return []

  return data.map(r => ({
    id: r.id,
    type: r.subtipo,
    estado: r.estado,
    fecha: r.created_at,
    updatedAt: r.updated_at,
    data: r.data
  }))
}

/* ================= GET BY ID ================= */
export async function getInspectionById(type, id) {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .eq("id", id)
    .eq("tipo", "inspeccion")
    .eq("subtipo", type)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id,
    type: data.subtipo,
    estado: data.estado,
    fecha: data.created_at,
    updatedAt: data.updated_at,
    data: data.data
  }
}

/* ================= CREATE ================= */
/**
 * Crear inspección SIN duplicados
 */
export async function createInspection(type) {
  try {
    const result = await saveOrUpdateReport({
      id: null,
      tipo: "inspeccion",
      subtipo: type,
      data: {},
      estado: "borrador"
    })

    return result.id
  } catch (error) {
    console.error("Error creando inspección:", error)
    return null
  }
}

/* ================= SAVE DRAFT ================= */
/**
 * Guardar cambios (borrador)
 */
export async function saveInspectionDraft(type, id, data) {
  try {
    await saveOrUpdateReport({
      id,
      tipo: "inspeccion",
      subtipo: type,
      data,
      estado: "borrador"
    })
  } catch (error) {
    console.error("Error guardando borrador:", error)
  }
}

/* ================= MARK COMPLETED ================= */
/**
 * Marcar inspección como completada
 */
export async function markInspectionCompleted(type, id, data) {
  try {
    await saveOrUpdateReport({
      id,
      tipo: "inspeccion",
      subtipo: type,
      data,
      estado: "completado"
    })
  } catch (error) {
    console.error("Error marcando completado:", error)
  }
}

/* ================= DELETE ================= */
export async function deleteInspection(type, id) {
  await supabase
    .from("registros")
    .delete()
    .eq("id", id)
    .eq("tipo", "inspeccion")
    .eq("subtipo", type)
}
