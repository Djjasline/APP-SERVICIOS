import { Construction, Layers, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

export default function ConfiguradorHome() {
  const navigate = useNavigate();
  const { isLight } = useTheme();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={`text-xl font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
            Configurador
          </h1>
          <p className={`text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            Módulo para configuración técnica de equipos, esquemas, capas, opciones y revisión.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/area/vehiculos")}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
            isLight
              ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              : "border-white/20 text-white hover:bg-white/10"
          }`}
        >
          Volver
        </button>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
            <Construction size={26} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">🚧 En construcción 🚧</h2>
            <p className="text-sm leading-6">
              El configurador completo requiere modelar catálogos, reglas de opciones, dependencias, costos, capas visuales, checks, revisión y generación de resumen técnico. Esta pantalla queda habilitada como punto de entrada para construir el módulo por etapas.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <SlidersHorizontal size={20} />
          </div>
          <h3 className="font-semibold text-slate-900">Opciones configurables</h3>
          <p className="mt-1 text-sm text-slate-600">Modelo base, chasis, módulo, agua, eléctrico, pintura y accesorios.</p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Layers size={20} />
          </div>
          <h3 className="font-semibold text-slate-900">Esquemas y capas</h3>
          <p className="mt-1 text-sm text-slate-600">Visualización por secciones, componentes y capas seleccionadas.</p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Construction size={20} />
          </div>
          <h3 className="font-semibold text-slate-900">Revisión final</h3>
          <p className="mt-1 text-sm text-slate-600">Resumen de selección, validaciones y documentación técnica.</p>
        </div>
      </div>
    </div>
  );
}
