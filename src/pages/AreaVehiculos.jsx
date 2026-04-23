import { useNavigate } from "react-router-dom";

export default function AreaVehiculos() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">

      {/* 🔥 TÍTULO + DESCRIPCIÓN */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          Vehículos Especiales
        </h2>
        <p className="text-sm text-gray-300">
          Gestión de equipos y servicios especializados.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* INFORMES */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Informe General</h2>
          <p className="text-sm text-gray-500">
            Registro técnico de trabajos realizados.
          </p>
          <button
            onClick={() => navigate("/informe")}
            className="mt-2 bg-blue-600 text-white px-3 py-2 rounded"
          >
            Ir
          </button>
        </div>

        {/* INSPECCIÓN */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Inspección</h2>
          <p className="text-sm text-gray-500">
            Evaluación del estado de equipos como Barredoras, Hidrosuccionadores y Cámaras de inspección.
          </p>
          <button
            onClick={() => navigate("/inspeccion")}
            className="mt-2 bg-yellow-600 text-white px-3 py-2 rounded"
          >
            Ir
          </button>
        </div>

        {/* MANTENIMIENTO */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Mantenimiento</h2>
          <p className="text-sm text-gray-500">
            Control de mantenimiento preventivo de Barredoras, Hidrosuccionadores y Cámaras de inspeciión.
          </p>
          <button
            onClick={() => navigate("/mantenimiento")}
            className="mt-2 bg-green-600 text-white px-3 py-2 rounded"
          >
            Ir
          </button>
        </div>

      </div>
    </div>
  );
}
