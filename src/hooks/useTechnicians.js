import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Hook que carga los técnicos desde Supabase profiles.
 * Reemplaza el archivo hardcodeado src/data/technicians.js
 *
 * Retorna:
 *  - technicians: [{ name, phone, email }]
 *  - loading: boolean
 */
export function useTechnicians() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .not("full_name", "is", null)
        .order("full_name");

      if (!error && data) {
        setTechnicians(
          data
            .filter((p) => p.full_name?.trim())
            .map((p) => ({
              name:  p.full_name.toUpperCase(),
              phone: p.phone || "",
              email: p.email || "",
            }))
        );
      }

      setLoading(false);
    };

    load();
  }, []);

  return { technicians, loading };
}
