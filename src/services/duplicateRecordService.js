import { supabase } from "@/lib/supabase";

function cloneData(data) {
  return JSON.parse(JSON.stringify(data || {}));
}

function isMediaKey(key) {
  return /(avatar|firma|foto|fotos|image|images|imagen|imagenes|photo|photos|signature)/i.test(
    String(key || "")
  );
}

function stripMediaFields(value, key = "") {
  if (isMediaKey(key)) {
    if (Array.isArray(value)) return [];
    if (value && typeof value === "object") return null;
    return "";
  }

  if (Array.isArray(value)) {
    return value.map((item) => stripMediaFields(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        stripMediaFields(childValue, childKey),
      ])
    );
  }

  return value;
}

function prepareDuplicatedData(record, user) {
  const data = stripMediaFields(cloneData(record?.data));

  return {
    ...data,
    codInf: "",
    codigo: "",
    tecnicoCorreo: user?.email || data.tecnicoCorreo || "",
    duplicated_from_id: record?.id || null,
    duplicated_from_code: data.codInf || data.codigo || "",
    duplicated_at: new Date().toISOString(),
  };
}

export async function duplicateRecordAsDraft(record, user) {
  if (!record?.id) throw new Error("Registro inválido para duplicar.");
  if (!user?.id) throw new Error("Usuario no autenticado.");

  const payload = {
    area: record.area || record.data?.area || "vehiculos",
    tipo: record.tipo,
    subtipo: record.subtipo || "general",
    estado: "borrador",
    user_id: user.id,
    data: prepareDuplicatedData(record, user),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("registros")
    .insert(payload)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}
