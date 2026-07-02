import { ExternalLink, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TRAINING_URL = "https://fsu.myfslearning.com/student/catalog";

export default function EntrenamientoVehiculos() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-[calc(100vh-5rem)] flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Entrenamiento de vehículos especiales
            </h1>
            <p className="text-sm text-slate-600">
              Portal de entrenamiento de barredoras Elgin e hidrosuccionadores Vactor.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/repositorios")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={() => window.open(TRAINING_URL, "_blank", "noopener,noreferrer")}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Abrir externo
            <ExternalLink size={15} />
          </button>
        </div>
      </div>

      <div className="min-h-[620px] flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <iframe
          title="Entrenamiento de vehículos especiales"
          src={TRAINING_URL}
          className="h-full min-h-[620px] w-full border-0"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
