import { supabase } from "@/lib/supabase"
import { saveOrUpdateReport } from "../services/reportService"

const SUPER_ADMIN_EMAIL = "smaviles@astap.com"

/* ======================================================
   STORAGE PARA INSPECCIONES (SUPABASE)
====================================================== */

const mapInspection = (r) => ({
  id: r.id,
  type: r.subtipo,
  estado: r.estado,
  fecha: r.created_at,
  updatedAt: r.updated_at,
  data: r.data,
})

const applyUserFilter = async (query) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  if (user.email !== SUPER_ADMIN_EMAIL) {
    return query.eq("user_id", user.id)
  }

  return query
}

/* ================= GET ALL ================= */
export async function getAllInspections() {
  let query = supabase
    .from("registros")
    .select("*")
    .eq("area", "vehiculos")
    .eq("tipo", "inspeccion")
    .order("updated_at", { ascending: false })

  query = await applyUserFilter(query)
  if (!query) return []

  const { data, error } = await query

  if (error || !data) return []

  return data.map(mapInspection)
}

/* ================= GET BY TYPE ================= */
export async function getInspections(type) {
  let query = supabase
    .from("registros")
    .select("*")
    .eq("area", "vehiculos")
    .eq("tipo", "inspeccion")
    .eq("subtipo", type)
    .order("updated_at", { ascending: false })

  query = await applyUserFilter(query)
  if (!query) return []

  const { data, error } = await query

  if (error || !data) return []

  return data.map(mapInspection)
}

/* ================= GET BY ID ================= */
export async function getInspectionById(type, id) {
  let query = supabase
    .from("registros")
    .select("*")
    .eq("id", id)
    .eq("area", "vehiculos")
    .eq("tipo", "inspeccion")
    .eq("subtipo", type)

  query = await applyUserFilter(query)
  if (!query) return null

  const { data, error } = await query.maybeSingle()

  if (error || !data) return null

  return mapInspection(data)
}

/* ================= CREATE ================= */
/**
 * Crear inspección SIN duplicados
 */
export async function createInspection(type) {
  try {
    const result = await saveOrUpdateReport({
      id: null,
      area: "vehiculos",
      tipo: "inspeccion",
      subtipo: type,
      data: {},
      estado: "borrador",
    })

    return result?.id || null
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
      area: "vehiculos",
      tipo: "inspeccion",
      subtipo: type,
      data,
      estado: "borrador",
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
      area: "vehiculos",
      tipo: "inspeccion",
      subtipo: type,
      data,
      estado: "completado",
    })
  } catch (error) {
    console.error("Error marcando completado:", error)
  }
}

/* ================= DELETE ================= */
export async function deleteInspection(type, id) {
  let query = supabase
    .from("registros")
    .delete()
    .eq("id", id)
    .eq("area", "vehiculos")
    .eq("tipo", "inspeccion")
    .eq("subtipo", type)

  query = await applyUserFilter(query)
  if (!query) return false

  const { error } = await query

  if (error) {
    console.error("Error eliminando inspección:", error)
    return false
  }

  return true
}
