import { supabase } from "@/lib/supabase";

/* ================= CREAR REGISTRO ================= */
export async function createRegistro() {
  const { data, error } = await supabase
    .from("registros")
    .insert([
      {
        tipo: "registro",
        subtipo: "herramienta",
        estado: "salida",
        data: {},
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creando registro:", error);
    return null;
  }

  return data.id;
}

/* ================= OBTENER TODOS ================= */
export async function getAllRegistros() {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .eq("tipo", "registro")
    .eq("subtipo", "herramienta");

  if (error) {
    console.error("Error cargando registros:", error);
    return [];
  }

  return data;
}

/* ================= OBTENER POR ID ================= */
export async function getRegistroById(id) {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error obteniendo registro:", error);
    return null;
  }

  return data;
}

/* ================= ACTUALIZAR ================= */
export async function updateRegistro(id, payload, estado) {
  const { error } = await supabase
    .from("registros")
    .update({
      data: payload,
      estado,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error actualizando registro:", error);
  }
}
