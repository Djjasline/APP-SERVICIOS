import { ExternalLink, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TRAINING_URL = "https://fsu.myfslearning.com/student/catalog";

export default function EntrenamientoVehiculos() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-[calc(100vh-5rem)] flex-col gap-6 p-4 md:p-6">
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
            className="btn-volver-orange"
          >
            Volver
          </button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 items-center">
        <div className="w-full rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <GraduationCap size={32} />
          </div>

          <h2 className="text-2xl font-semibold text-slate-900">
            Portal de entrenamiento
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Accede al portal de entrenamiento de barredoras Elgin e hidrosuccionadores Vactor. El sitio se abre en una pestaña segura porque el proveedor no permite cargarlo embebido dentro de otra aplicación.
          </p>

          <button
            type="button"
            onClick={() => window.open(TRAINING_URL, "_blank", "noopener,noreferrer")}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Abrir portal de entrenamiento
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
