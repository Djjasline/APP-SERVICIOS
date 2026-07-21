import { useEffect } from "react";
import { recordResourceUsage } from "@/services/resourceUsageService";

const TEAMDESK_URL = "https://www.teamdesk.net/secure/db/53431/overview.aspx?t=381285";

export default function BaseDatos() {
  useEffect(() => {
    void recordResourceUsage({
      subtipo: "base-datos-astap",
      label: "Base de datos ASTAP",
      url: TEAMDESK_URL,
    });
    window.location.assign(TEAMDESK_URL);
  }, []);

  return <div className="p-6 text-sm text-slate-600">Abriendo Base de datos ASTAP...</div>;
}
