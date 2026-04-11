import { supabase } from "../lib/supabase";

export const saveOrUpdateReport = async ({
  id = null,
  tipo,
  subtipo,
  data,
  estado = "borrador",
  user_id = null,
}) => {
  try {
    const payload = {
      tipo,
      subtipo,
      data,
      estado,
      user_id,
      updated_at: new Date().toISOString(),
    };

    let query;

    if (id) {
      query = supabase
        .from("registros")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
    } else {
      query = supabase
        .from("registros")
        .insert(payload)
        .select()
        .single();
    }

    const { data: result, error } = await query;

    if (error) throw error;

    return result;
  } catch (error) {
    console.error("❌ Error guardando reporte:", error);
    throw error;
  }
};
