import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Hook que carga los técnicos desde Supabase profiles.
 */
export function useTechnicians() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .not("full_name", "is", null)
        .order("full_name");

      if (error) {
        console.error("Error cargando técnicos:", error);
        setLoading(false);
        return;
      }

      setTechnicians(
        (data || [])
          .filter((p) => p.full_name?.trim())
          .map((p) => ({
            name: p.full_name,
            phone: p.phone || "",
            email: p.email || "",
          }))
      );

      setLoading(false);
    };

    load();
  }, []);

  return { technicians, loading };
}
