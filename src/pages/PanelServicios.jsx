import { useNavigate } from "react-router-dom";

export default function PanelServicios() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Panel de servicios ASTAP
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 1. INFORME GENERAL */}
          <div className="bg-white border rounded-xl p-6 space-y-3 shadow-sm">
            <h2 className="font-semibold text-slate-800">
              1. Informe general de servicios
            </h2>

            <button
              onClick={() => navigate("/service-report-creation")}
              className="w-full px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
            >
              Nuevo informe
            </button>
          </div>

          {/* 2. INSPECCIÓN */}
          <div className="bg-white border rounded-xl p-6 space-y-3 shadow-sm">
            <h2 className="font-semibold text-slate-800">
              2. Inspección y valoración
            </h2>

            <button
              onClick={() => navigate("/inspeccion")}
              className="w-full px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              Ir a inspecciones
            </button>
          </div>

          {/* 3. MANTENIMIENTO */}
          <div className="bg-white border rounded-xl p-6 space-y-3 shadow-sm">
            <h2 className="font-semibold text-slate-800">
              3. Servicio de mantenimiento
            </h2>

            <button
              onClick={() => navigate("/mantenimiento")}
              className="w-full px-4 py-2 rounded-md bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 transition"
            >
              Ir a mantenimiento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
