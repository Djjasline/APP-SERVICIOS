import { useNavigate } from "react-router-dom";
import { FileText, ClipboardCheck, Wrench } from "lucide-react";

export default function PanelServicios() {
  const navigate = useNavigate();
return (
  <div style={{ background: "red", color: "white", padding: 40 }}>
    <h1>ESTE PANEL ES EL QUE SE RENDERIZA</h1>
  </div>
);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Panel de servicios ASTAP
          </h1>
          <p className="text-slate-300 text-lg">
            Gestión técnica de informes, inspecciones y mantenimiento
          </p>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* INFORME GENERAL */}
          <div className="bg-white rounded-2xl p-7 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-blue-600 text-white">
                <FileText size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Informe general
              </h2>
            </div>

            <p className="text-slate-600 mb-8">
              Crear informes técnicos con actividades, imágenes, conclusiones y firmas.
            </p>

            <button
              onClick={() => navigate("/service-report-creation")}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition"
            >
              Nuevo informe
            </button>
          </div>

          {/* INSPECCIÓN */}
          <div className="bg-white rounded-2xl p-7 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-yellow-500 text-white">
                <ClipboardCheck size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Inspección y valoración
              </h2>
            </div>

            <p className="text-slate-600 mb-8">
              Registrar inspecciones técnicas por tipo de equipo y estado.
            </p>

            <button
              onClick={() => navigate("/inspeccion")}
              className="w-full py-3 rounded-xl bg-yellow-500 text-white font-semibold text-lg hover:bg-yellow-600 transition"
            >
              Ir a inspecciones
            </button>
          </div>

          {/* MANTENIMIENTO */}
          <div className="bg-white rounded-2xl p-7 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-green-600 text-white">
                <Wrench size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Servicio de mantenimiento
              </h2>
            </div>

            <p className="text-slate-600 mb-8">
              Crear y gestionar mantenimientos preventivos y correctivos.
            </p>

            <button
              onClick={() => navigate("/mantenimiento")}
              className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold text-lg hover:bg-green-700 transition"
            >
              Ir a mantenimiento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
