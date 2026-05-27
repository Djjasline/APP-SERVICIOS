import { supabase } from "../lib/supabase";

export const saveOrUpdateReport = async ({
  id = null,
  area = "vehiculos",
  tipo,
  subtipo = "general",
  data,
  estado = "borrador",
}) => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("❌ Error obteniendo usuario:", userError);
      throw new Error("Usuario no autenticado");
    }

   const payload = {
  area, // vehiculos | agua | petroleo | operaciones
  tipo, // informe | inspeccion | mantenimiento | liberacion | recepcion | registro
  subtipo, // general | hidro | barredora | camara | bomba | valvula
  data,
  estado,
  updated_at: new Date().toISOString(),
};

if (!id) {
  payload.user_id = user.id;
}

if (!id) {
  payload.user_id = user.id;
}

    let query;

    if (id) {
      query = supabase
  .from("registros")
  .update(payload)
  .eq("id", id)
  .select()
  .maybeSingle();
    } else {
      query = supabase
        .from("registros")
        .insert(payload)
        .select()
.maybeSingle();
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
