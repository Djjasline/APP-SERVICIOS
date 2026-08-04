import { supabase } from "@/lib/supabase";

function sanitizeStoragePart(value, fallback) {
  const safeValue = String(value || fallback)
    .trim()
    .replace(/\\/g, "/")
    .replace(/[^a-zA-Z0-9/_-]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^-+|-+$/g, "")
    .replace(/^\/+|\/+$/g, "");

  return safeValue || fallback;
}

export async function uploadRegistroImage(file, id, tipo) {
  try {
    if (!file) return null;

    const folder = sanitizeStoragePart(id, "temp");
    const prefix = sanitizeStoragePart(tipo, "imagen");
    const fileName = `${folder}/${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;

    const { error } = await supabase.storage
      .from("informe")
      .upload(fileName, file, {
        contentType: file.type || "image/jpeg",
      });

    if (error) {
      console.error("Error subiendo imagen:", error);
      return null;
    }

    const { data } = supabase.storage
      .from("informe")
      .getPublicUrl(fileName);

    return data.publicUrl;

  } catch (err) {
    console.error("Error general:", err);
    return null;
  }
}
