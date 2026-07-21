import { useEffect } from "react";
import { recordResourceUsage } from "@/services/resourceUsageService";

const TRAINING_URL = "https://fsu.myfslearning.com/student/catalog";

export default function EntrenamientoVehiculos() {
  useEffect(() => {
    void recordResourceUsage({
      subtipo: "entrenamiento-vehiculos",
      label: "Portal de entrenamiento de vehículos especiales",
      url: TRAINING_URL,
    });
    window.location.assign(TRAINING_URL);
  }, []);

  return <div className="p-6 text-sm text-slate-600">Abriendo portal de entrenamiento...</div>;
}
