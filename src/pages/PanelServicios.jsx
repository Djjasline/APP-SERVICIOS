import { useNavigate } from "react-router-dom";
import { FileText, ClipboardCheck, Wrench, Package } from "lucide-react";

export default function PanelServicios() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Panel de servicios ASTAP
          </h1>
          <p className="text-slate-300 text-lg">
            Gestión técnica de informes, inspecciones, mantenimiento y herramientas
          </p>
        </div>

        {/* CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* INFORME GENERAL */}
          <div className="bg-white rounded-2xl p-7 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition h-full flex flex-col justify-between">
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
              onClick={() => {
                localStorage.removeItem("currentReport");
                navigate("/informe");
              }}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition"
            >
              Nuevo informe
            </button>
          </div>

          {/* INSPECCIÓN */}
           <div className="bg-white rounded-2xl p-7 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition h-full flex flex-col justify-between">
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
          <div className="bg-white rounded-2xl p-7 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition h-full flex flex-col justify-between">
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

          {/* CONTROL DE HERRAMIENTAS */}
          <div className="bg-white rounded-2xl p-7 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition h-full flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-purple-600 text-white">
                <Package size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Control de herramientas
              </h2>
            </div>

            <p className="text-slate-600 mb-8">
              Registrar salida e ingreso de herramientas y equipos con imágenes y firmas.
            </p>

            <button
              onClick={() => navigate("/registro-salida")}
              className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold text-lg hover:bg-purple-700 transition"
            >
              Ir a registros
            </button>
          </div>
          {/* RECEPCIÓN VEHICULAR */}
 <div className="bg-white rounded-2xl p-7 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition h-full flex flex-col justify-between">
  <div className="flex items-center gap-4 mb-6">
    <div className="p-4 rounded-xl bg-red-600 text-white">
      🚛
    </div>
    <h2 className="text-xl font-bold text-slate-900">
      Recepción vehicular
    </h2>
  </div>

  <p className="text-slate-600 mb-8">
    Registro de recepción, checklist y daños del vehículo con evidencia gráfica.
  </p>

  <button
    onClick={() => navigate("/recepcion")}
    className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold text-lg hover:bg-red-700 transition"
  >
    Ir a recepción
  </button>
</div>
          {/* LIBERACIÓN CAMIONETA */}
<div className="bg-white rounded-2xl p-7 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition">
  <div className="flex items-center gap-4 mb-6">
    <div className="p-4 rounded-xl bg-indigo-600 text-white">
      🚚
    </div>
    <h2 className="text-xl font-bold text-slate-900">
      Liberación camioneta
    </h2>
  </div>

  <p className="text-slate-600 mb-8">
    Registro de liberación del vehículo, checklist final, estado y firmas de entrega.
  </p>

  <button
    onClick={() => navigate("/liberacion")}
    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 transition"
  >
    Ir a liberación
  </button>
</div>
        </div>
      </div>
    </div>
  );
}
