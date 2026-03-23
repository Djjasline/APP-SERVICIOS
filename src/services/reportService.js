import { supabase } from "../lib/supabase"

/**
 * Crear o actualizar un reporte sin duplicados
 */
export const saveOrUpdateReport = async ({
  id = null,
  tipo,
  subtipo,
  data,
  estado = "borrador",
  user_id = null
}) => {
  try {
    const payload = {
      id: id || undefined,
      tipo,
      subtipo,
      data,
      estado,
      user_id,
      updated_at: new Date().toISOString()
    }

    const { data: result, error } = await supabase
      .from("registros")
      .upsert(payload)
      .select()
      .single()

    if (error) throw error

    return result
  } catch (error) {
    console.error("❌ Error guardando reporte:", error)
    throw error
  }
}

/**
 * Completar reporte con firma
 */
export const completeReport = async ({
  id,
  data,
  firmado_por,
  identificacion,
  firmaBase64
}) => {
  try {
    const updatedData = {
      ...data,
      firma: firmaBase64,
      firmado_por,
      identificacion,
      fecha_firma: new Date().toISOString()
    }

    const { data: result, error } = await supabase
      .from("registros")
      .update({
        data: updatedData,
        estado: "completado",
        firmado: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return result
  } catch (error) {
    console.error("❌ Error completando reporte:", error)
    throw error
  }
}

/**
 * Obtener reportes por tipo
 */
export const getReportsByTipo = async (tipo) => {
  try {
    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .eq("tipo", tipo)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data
  } catch (error) {
    console.error("❌ Error obteniendo reportes:", error)
    throw error
  }
}
