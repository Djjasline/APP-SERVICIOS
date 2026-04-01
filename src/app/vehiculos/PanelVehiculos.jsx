import { useNavigate } from "react-router-dom";

export default function PanelVehiculos() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-white text-2xl font-semibold tracking-wide">
          Panel ASTAP
        </h1>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">

        {/* SECCIÓN */}
        <div className="space-y-6">

          {/* TÍTULO */}
          <h2 className="text-white text-2xl font-semibold tracking-wide">
            Vehículos Especiales
          </h2>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {/* INFORME */}
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200 space-y-4 hover:shadow-xl hover:-translate-y-1 transition duration-300">
              
              <div className="flex items-center gap-2">
                <span className="text-blue-600 text-xl">📄</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  Informe General
                </h3>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                Registro técnico de trabajos realizados.
              </p>

              <button
                onClick={() => navigate("/informe")}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                Ir
              </button>
            </div>

            {/* INSPECCIÓN */}
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200 space-y-4 hover:shadow-xl hover:-translate-y-1 transition duration-300">
              
              <div className="flex items-center gap-2">
                <span className="text-yellow-600 text-xl">🛠</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  Inspección
                </h3>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                Evaluación del estado de equipos como barredoras, hidrosuccionadores y cámaras de inspección.
              </p>

              <button
                onClick={() => navigate("/inspeccion")}
                className="px-4 py-2 text-sm font-medium bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition shadow-sm"
              >
                Ir
              </button>
            </div>

            {/* MANTENIMIENTO */}
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200 space-y-4 hover:shadow-xl hover:-translate-y-1 transition duration-300">
              
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-xl">🧰</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  Mantenimiento
                </h3>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                Control de mantenimiento preventivo de barredoras, hidrosuccionadores y cámaras de inspección.
              </p>

              <button
                onClick={() => navigate("/mantenimiento")}
                className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
              >
                Ir
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
