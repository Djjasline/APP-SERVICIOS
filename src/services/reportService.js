import { supabase } from "../lib/supabase";
import { createNotification } from "./notificationService";

const KARIM_EMAIL = "kamhez@astap.com";

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
      area,
      tipo,
      subtipo,
      data,
      estado,
      updated_at: new Date().toISOString(),
    };

    if (!id) payload.user_id = user.id;

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

try {
  if (result && result.area === "operaciones") {
    if (result.tipo === "registro" && result.estado === "salida") {
      await createNotification({
        recipient_email: KARIM_EMAIL,
        title: "Herramientas pendientes de ingreso",
        message: `El registro ${result.id} tiene herramientas en campo y requiere revisión de Karim.`,
        record_type: "registro",
        record_id: result.id,
      });
    }

    if (result.tipo === "recepcion") {
      await createNotification({
        recipient_email: KARIM_EMAIL,
        title: "Nueva recepción pendiente",
        message: `La recepción ${result.id} requiere revisión y firma.`,
        record_type: "recepcion",
        record_id: result.id,
      });
    }

    if (result.tipo === "liberacion") {
      await createNotification({
        recipient_email: KARIM_EMAIL,
        title: "Nueva liberación pendiente",
        message: `La liberación ${result.id} requiere revisión y firma.`,
        record_type: "liberacion",
        record_id: result.id,
      });
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

function getNombreFormulario(tipo) {
  switch (tipo) {
    case "registro":
      return "Registro de herramientas";
    case "recepcion":
      return "Recepción vehicular";
    case "liberacion":
      return "Liberación";
    default:
      return "Formulario";
  }
}
