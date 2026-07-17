import { Construction, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { VEHICULOS_TEXT } from "@/constants/vehiculosText";

export default function ConfiguradorHome() {
  const navigate = useNavigate();
  const { isLight } = useTheme();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={`text-xl font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
            {VEHICULOS_TEXT.configurador.title}
          </h1>
          <p className={`text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            {VEHICULOS_TEXT.configurador.description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/area/vehiculos")}
          className="btn-volver-orange"
        >
          Volver
        </button>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
            <Lock size={26} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Acceso restringido hasta nueva orden</h2>
            <p className="text-sm leading-6">
              El configurador está en construcción con 20% de avance. El acceso queda limitado temporalmente mientras se completan catálogos, reglas de opciones, dependencias, costos, capas visuales, checks, revisión y generación de resumen técnico.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm opacity-60">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500 text-white">
            <Construction size={20} />
          </div>
          <h3 className="font-semibold text-slate-900">Opciones configurables</h3>
          <p className="mt-1 text-sm text-slate-600">Bloqueado temporalmente.</p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm opacity-60">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500 text-white">
            <Construction size={20} />
          </div>
          <h3 className="font-semibold text-slate-900">Esquemas y capas</h3>
          <p className="mt-1 text-sm text-slate-600">Bloqueado temporalmente.</p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm opacity-60">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500 text-white">
            <Construction size={20} />
          </div>
          <h3 className="font-semibold text-slate-900">Revisión final</h3>
          <p className="mt-1 text-sm text-slate-600">Bloqueado temporalmente.</p>
        </div>
      </div>
    </div>
  );
}
