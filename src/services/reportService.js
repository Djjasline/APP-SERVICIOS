import { supabase } from "../lib/supabase";
import { createNotification } from "./notificationService";
import { hasReportCodeSequence, normalizeReportCodeValue, reserveNextReportCode } from "./reportCodeService";

const KARIM_EMAIL = "kamhez@astap.com";
const ARIEL_EMAIL = "abriones@astap.com";

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

    const reportData = await resolveReportData({ id, data });

    const payload = {
      area,
      tipo,
      subtipo,
      data: reportData,
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
  if (result && result.area === "vehiculos") {
    const formName = getNombreFormularioVehiculos(result.tipo, result.subtipo);
    const statusLabel = result.estado === "completado" ? "completado" : "borrador";
    const clientName = result.data?.cliente || "Sin cliente";
    const code = result.data?.codInf || result.data?.pedidoDemanda || result.id;
    const technician = result.data?.tecnicoNombre || user.email || "Sin técnico";

    await createNotification({
      recipient_email: ARIEL_EMAIL,
      title: `VM Services: ${formName} ${statusLabel}`,
      message: `${technician} guardó ${formName.toLowerCase()} en estado ${statusLabel}. Cliente: ${clientName}. Código/Pedido: ${code}.`,
      record_type: `vehiculos_${result.tipo || "formulario"}`,
      record_id: result.id,
    });
  }

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

async function resolveReportData({ id, data }) {
  if (!data?.codInf) return data;

  if (!id) {
    return { ...data, codInf: await reserveNextReportCode(data.codInf) };
  }

  const { data: existing, error } = await supabase
    .from("registros")
    .select("data")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  const previousCode = normalizeReportCodeValue(existing?.data?.codInf);
  const currentCode = normalizeReportCodeValue(data.codInf);

  if (currentCode && (!hasReportCodeSequence(data.codInf) || currentCode !== previousCode)) {
    return { ...data, codInf: await reserveNextReportCode(data.codInf) };
  }

  return data;
}

function getNombreFormulario(tipo) {
  switch (tipo) {
    case "registro":
      return "Registro de salida e ingreso de herramientas";
    case "recepcion":
      return "Bitácora y control vehicular";
    case "liberacion":
      return "Liberación";
    default:
      return "Formulario";
  }
}

function getNombreFormularioVehiculos(tipo, subtipo) {
  if (tipo === "informe") return "informe general de servicio técnico";
  if (tipo === "inspeccion") return `informe de inspección${subtipo ? ` ${subtipo}` : ""}`;
  if (tipo === "mantenimiento") return `informe de mantenimiento${subtipo ? ` ${subtipo}` : ""}`;
  return "formulario de vehículos";
}
