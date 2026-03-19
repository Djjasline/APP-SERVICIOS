import { useNavigate } from "react-router-dom";
import {
  FileText,
  ClipboardCheck,
  Wrench,
  Package,
  Truck,
  CheckCircle,
} from "lucide-react";

export default function PanelServicios() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Panel de servicios ASTAP
          </h1>
          <p className="text-slate-400 text-sm">
            Gestión técnica de informes, inspecciones y mantenimiento
          </p>
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* INFORME */}
          <div className="bg-white rounded-2xl p-7 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-blue-600 text-white">
                <FileText size={28} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Informe general
              </h2>
            </div>

            <p className="text-slate-600 mb-6 text-sm">
              Crear informes técnicos con actividades y firmas.
            </p>

            <button
              onClick={() => {
                localStorage.removeItem("currentReport");
                navigate("/informe");
              }}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Nuevo informe
            </button>
          </div>

          {/* INSPECCIÓN */}
          <div className="bg-white rounded-2xl p-7 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-yellow-500 text-white">
                <ClipboardCheck size={28} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Inspección
              </h2>
            </div>

            <p className="text-slate-600 mb-6 text-sm">
              Registrar inspecciones técnicas.
            </p>

            <button
              onClick={() => navigate("/inspeccion")}
              className="w-full py-3 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
            >
              Ir a inspecciones
            </button>
          </div>

          {/* MANTENIMIENTO */}
          <div className="bg-white rounded-2xl p-7 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-green-600 text-white">
                <Wrench size={28} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Mantenimiento
              </h2>
            </div>

            <p className="text-slate-600 mb-6 text-sm">
              Gestión de mantenimientos.
            </p>

            <button
              onClick={() => navigate("/mantenimiento")}
              className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            >
              Ir a mantenimiento
            </button>
          </div>

          {/* HERRAMIENTAS */}
          <div className="bg-white rounded-2xl p-7 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-purple-600 text-white">
                <Package size={28} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Herramientas
              </h2>
            </div>

            <p className="text-slate-600 mb-6 text-sm">
              Control de equipos.
            </p>

            <button
              onClick={() => navigate("/registro-salida")}
              className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
            >
              Ir a registros
            </button>
          </div>

          {/* RECEPCIÓN */}
          <div className="bg-white rounded-2xl p-7 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-red-600 text-white">
                <Truck size={28} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Recepción
              </h2>
            </div>

            <p className="text-slate-600 mb-6 text-sm">
              Ingreso de vehículos.
            </p>

            <button
              onClick={() => navigate("/recepcion")}
              className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Ir a recepción
            </button>
          </div>

          {/* LIBERACIÓN */}
          <div className="bg-white rounded-2xl p-7 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-indigo-600 text-white">
                <CheckCircle size={28} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Liberación
              </h2>
            </div>

            <p className="text-slate-600 mb-6 text-sm">
              Salida de vehículos.
            </p>

            <button
              onClick={() => navigate("/liberacion")}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
            >
              Ir a liberación
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
