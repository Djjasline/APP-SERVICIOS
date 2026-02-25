import { supabase } from "@/lib/supabase";

export const syncReports = async () => {
  const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];

  const pending = stored.filter(r => r.synced === false);

  if (!pending.length) return;

  for (const report of pending) {
    try {
      const { error } = await supabase
        .from("informes")
        .upsert({
          id: report.id,
          estado: report.estado || "borrador",
          data: report.data,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        report.synced = true;
      }
    } catch (err) {
      console.warn("No se pudo sincronizar", report.id);
    }
  }

  localStorage.setItem("serviceReports", JSON.stringify(stored));
};
