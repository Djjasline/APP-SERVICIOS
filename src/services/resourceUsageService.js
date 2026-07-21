import { supabase } from "@/lib/supabase";

export async function recordResourceUsage({ subtipo, label, url }) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) return;

    const { error } = await supabase.from("registros").insert({
      area: "repositorios",
      tipo: "uso_recurso",
      subtipo: subtipo || "recurso",
      estado: "completado",
      user_id: user.id,
      data: {
        recurso: label || subtipo || "Recurso",
        url: url || "",
        openedAt: new Date().toISOString(),
      },
    });

    if (error) console.warn("No se pudo registrar el uso del recurso:", error.message);
  } catch (error) {
    console.warn("No se pudo registrar el uso del recurso:", error?.message || error);
  }
}

export function openExternalResource({ subtipo, label, url }) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
  void recordResourceUsage({ subtipo, label, url });
}
