import { supabase } from "@/lib/supabase";

/* ======================================================
   STORAGE PARA INSPECCIONES (SUPABASE)
====================================================== */

/* ================= GET ALL ================= */
export async function getAllInspections() {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .eq("tipo", "inspeccion")
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  return data.map(r => ({
    id: r.id,
    type: r.subtipo,
    estado: r.estado,
    fecha: r.created_at,
    updatedAt: r.updated_at,
    data: r.data
  }));
}

/* ================= GET BY TYPE ================= */
export async function getInspections(type) {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .eq("tipo", "inspeccion")
    .eq("subtipo", type)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  return data.map(r => ({
    id: r.id,
    type: r.subtipo,
    estado: r.estado,
    fecha: r.created_at,
    updatedAt: r.updated_at,
    data: r.data
  }));
}

/* ================= GET BY ID ================= */
export async function getInspectionById(type, id) {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .eq("id", id)
    .eq("tipo", "inspeccion")
    .eq("subtipo", type)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    type: data.subtipo,
    estado: data.estado,
    fecha: data.created_at,
    updatedAt: data.updated_at,
    data: data.data
  };
}

/* ================= CREATE ================= */
export async function createInspection(type) {
  const { data, error } = await supabase
    .from("registros")
    .insert([
      {
        tipo: "inspeccion",
        subtipo: type,
        estado: "borrador",
        data: {},
      },
    ])
    .select()
    .single();

  if (error) return null;

  return data.id;
}

/* ================= SAVE DRAFT ================= */
export async function saveInspectionDraft(type, id, data) {
  await supabase
    .from("registros")
    .update({
      estado: "borrador",
      data: data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("tipo", "inspeccion")
    .eq("subtipo", type);
}

/* ================= MARK COMPLETED ================= */
export async function markInspectionCompleted(type, id, data) {
  await supabase
    .from("registros")
    .update({
      estado: "completada",
      data: data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("tipo", "inspeccion")
    .eq("subtipo", type);
}

/* ================= DELETE ================= */
export async function deleteInspection(type, id) {
  await supabase
    .from("registros")
    .delete()
    .eq("id", id)
    .eq("tipo", "inspeccion")
    .eq("subtipo", type);
}
