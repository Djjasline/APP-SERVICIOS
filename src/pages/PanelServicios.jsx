import { useNavigate } from "react-router-dom";
import {
  FileText,
  ClipboardCheck,
  Wrench,
} from "lucide-react";

export default function PanelServicios() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* TÍTULO */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Panel de servicios ASTAP
          </h1>
          <p className="text-slate-600">
            Gestión de informes, inspecciones y mantenimiento técnico
          </p>
        </div>

        {/* TARJETAS */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* INFORME GENERAL */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
                <FileText size={28} />
              </div>
              <h2 className="text-lg font-semibold">
                Informe general de servicios
              </h2>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Crear informes técnicos detallados con actividades, imágenes y firmas.
            </p>

            <button
              onClick={() => navigate("/service-report-creation")}
              className="w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Nuevo informe
            </button>
          </div>

          {/* INSPECCIÓN */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-700">
                <ClipboardCheck size={28} />
              </div>
              <h2 className="text-lg font-semibold">
                Inspección y valoración
              </h2>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Registrar inspecciones técnicas por tipo de equipo.
            </p>

            <button
              onClick={() => navigate("/inspeccion")}
              className="w-full px-4 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Ir a inspecciones
            </button>
          </div>

          {/* MANTENIMIENTO */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-green-100 text-green-700">
                <Wrench size={28} />
              </div>
              <h2 className="text-lg font-semibold">
                Servicio de mantenimiento
              </h2>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Crear y gestionar mantenimientos preventivos y correctivos.
            </p>

            <button
              onClick={() => navigate("/mantenimiento")}
              className="w-full px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Ir a mantenimiento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
