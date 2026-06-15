import { supabase } from "../lib/supabase";
import { createNotification } from "./notificationService";

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
      subtipo,
      data,
      estado,
      updated_at: new Date().toISOString(),
    };

    if (!id) payload.user_id = user.id;

    let query;
    if (id) {
      query = supabase.from("registros").update(payload).eq("id", id).select().maybeSingle();
    } else {
      query = supabase.from("registros").insert(payload).select().maybeSingle();
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

    // Notificar (mínimo) para registros de operaciones en estado 'salida'
    try {
      if (result && result.area === "operaciones" && result.tipo === "registro") {
        if (result.estado === "salida") {
          await createNotification({
            recipient_email: "kamhez@astap.com",
            title: "Nuevo registro en Operaciones",
            message: `Registro ${result.id} requiere revisión (estado: ${result.estado})`,
            record_type: "registro",
            record_id: result.id,
          }).catch((e) => console.error("Notification error:", e));
        }
      }
    } catch (notifyErr) {
      console.error("Error al intentar notificar:", notifyErr);
    }

    return result;
  } catch (error) {
    console.error("❌ Error guardando reporte:", error);
    throw error;
  }
};
