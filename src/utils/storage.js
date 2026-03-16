import { supabase } from "@/lib/supabase";

export async function uploadRegistroImage(file, id, tipo) {
  const fileName = `${id}-${tipo}-${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from("registros-herramientas")
    .upload(fileName, file);

  if (error) {
    console.error("Error subiendo imagen:", error);
    return null;
  }

  const { data } = supabase.storage
    .from("registros-herramientas")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
