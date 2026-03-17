import { supabase } from "@/lib/supabase";

export async function uploadRegistroImage(file, id, tipo) {
  try {
    const fileName = `${id}/${tipo}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;

    const { error } = await supabase.storage
      .from("informe")
      .upload(fileName, file);

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
