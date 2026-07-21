import { useEffect } from "react";
import { recordResourceUsage } from "@/services/resourceUsageService";

const DOCUMOTO_ELGIN_URL = "https://documoto.digabit.com/ui/home";

export default function DocumotoElgin() {
  useEffect(() => {
    void recordResourceUsage({
      subtipo: "documoto-elgin",
      label: "Documoto - Elgin",
      url: DOCUMOTO_ELGIN_URL,
    });
    window.location.assign(DOCUMOTO_ELGIN_URL);
  }, []);

  return <div className="p-6 text-sm text-slate-600">Abriendo Documoto - Elgin...</div>;
}
