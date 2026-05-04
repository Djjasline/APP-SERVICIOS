import { supabase } from "../lib/supabase";

export const saveOrUpdateReport = async ({
  id = null,
  tipo,
  subtipo,
  data,
  estado = "borrador",
}) => {
  try {
    /* ===========================
       OBTENER USUARIO LOGUEADO
    =========================== */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("❌ Error obteniendo usuario:", userError);
      throw new Error("Usuario no autenticado");
    }

    /* ===========================
       PAYLOAD FINAL
    =========================== */
    const payload = {
      tipo,
      subtipo,
      data,
      estado,
      user_id: user.id, // 🔥 CLAVE: dueño del registro
      updated_at: new Date().toISOString(),
    };

    let query;

    /* ===========================
       UPDATE
    =========================== */
    if (id) {
      query = supabase
        .from("registros")
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.id) // 🔥 SEGURIDAD: solo su propio registro
        .select()
        .single();
    }

    /* ===========================
       INSERT
    =========================== */
    else {
      query = supabase
        .from("registros")
        .insert(payload)
        .select()
        .single();
    }

    const { data: result, error } = await query;

    if (error) {
      console.error("❌ Supabase error detail:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }

    return result;
  } catch (error) {
    console.error("❌ Error guardando reporte:", error);
    throw error;
  }
};
