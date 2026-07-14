import { supabase } from "../lib/supabase";
import { createNotification } from "./notificationService";
import { getNotificationRecipientsForRecord } from "./notificationRecipientService";
import { hasReportCodeSequence, normalizeReportCodeValue, reserveNextReportCode } from "./reportCodeService";

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

    await notifyConfiguredRecipients(result, user);

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
      return "Autorización de uso de vehículo para refinería";
    default:
      return "Formulario";
  }
}

async function notifyConfiguredRecipients(result, user) {
  if (!result) return;

  try {
    const recipients = await getNotificationRecipientsForRecord({
      area: result.area,
      tipo: result.tipo,
      subtipo: result.subtipo,
    });

    if (recipients.length === 0) return;

    const formName = getNombreFormularioPorArea(result);
    const statusLabel = result.estado === "completado" ? "completado" : "borrador";
    const clientName = result.data?.cliente || result.data?.conductor || result.data?.equipo || "Sin cliente";
    const code = result.data?.codInf || result.data?.codigo || result.data?.pedidoDemanda || result.id;
    const technician = result.data?.tecnicoNombre || user.email || "Sin técnico";

    await Promise.all(
      recipients.map((recipient_email) =>
        createNotification({
          recipient_email,
          title: `App Servicios: ${formName} ${statusLabel}`,
          message: `${technician} guardó ${formName.toLowerCase()} en estado ${statusLabel}. Referencia: ${clientName}. Código/Pedido: ${code}.`,
          record_type: result.tipo || "formulario",
          record_id: result.id,
        })
      )
    );
  } catch (notifyErr) {
    console.error("Error al intentar notificar:", notifyErr);
  }
}

function getNombreFormularioPorArea(result) {
  if (result.area === "vehiculos") return getNombreFormularioVehiculos(result.tipo, result.subtipo);
  return getNombreFormulario(result.tipo);
}

function getNombreFormularioVehiculos(tipo, subtipo) {
  if (tipo === "informe") return "informe general de servicio técnico";
  if (tipo === "inspeccion") return `informe de inspección${subtipo ? ` ${subtipo}` : ""}`;
  if (tipo === "mantenimiento") return `informe de mantenimiento${subtipo ? ` ${subtipo}` : ""}`;
  if (tipo === "protocolo") return `protocolo${subtipo ? ` ${subtipo}` : ""}`;
  return "formulario de vehículos";
}
