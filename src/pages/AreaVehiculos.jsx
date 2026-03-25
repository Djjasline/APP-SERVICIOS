import { useNavigate } from "react-router-dom";

export default function AreaVehiculos() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          Vehículos Especiales
        </h1>
        <p className="text-sm text-gray-500">
          Gestión técnica por área
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* ================= IZQUIERDA ================= */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">

          <h2 className="font-semibold text-lg">
            Vehículos Especiales
          </h2>

          {/* INFORMES */}
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Informes</h3>
            <p className="text-xs text-gray-500">
              Registro técnico de trabajos realizados en equipos.
            </p>

            <button
              onClick={() => navigate("/informe")}
              className="bg-blue-600 text-white w-full py-2 rounded"
            >
              Ir
            </button>
          </div>

          {/* INSPECCIÓN */}
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Inspección</h3>
            <p className="text-xs text-gray-500">
              Evaluación del estado operativo de los equipos.
            </p>

            <button
              onClick={() => navigate("/inspeccion")}
              className="bg-yellow-500 text-white w-full py-2 rounded"
            >
              Ir
            </button>
          </div>

          {/* MANTENIMIENTO */}
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Mantenimiento</h3>
            <p className="text-xs text-gray-500">
              Gestión y control de mantenimiento preventivo y correctivo.
            </p>

            <button
              onClick={() => navigate("/mantenimiento")}
              className="bg-green-600 text-white w-full py-2 rounded"
            >
              Ir
            </button>
          </div>

        </div>

        {/* ================= DERECHA ================= */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">

          <h2 className="font-semibold text-lg">
            Operaciones
          </h2>

          {/* HERRAMIENTAS */}
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Herramientas</h3>
            <p className="text-xs text-gray-500">
              Control y seguimiento de equipos y herramientas.
            </p>

            <button
              onClick={() => navigate("/registro")}
              className="bg-purple-600 text-white w-full py-2 rounded"
            >
              Ir
            </button>
          </div>

          {/* RECEPCIÓN */}
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Recepción</h3>
            <p className="text-xs text-gray-500">
              Registro de ingreso de vehículos a operación.
            </p>

            <button
              onClick={() => navigate("/recepcion")}
              className="bg-red-600 text-white w-full py-2 rounded"
            >
              Ir
            </button>
          </div>

          {/* LIBERACIÓN */}
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Liberación</h3>
            <p className="text-xs text-gray-500">
              Control de salida y entrega de vehículos.
            </p>

            <button
              onClick={() => navigate("/liberacion")}
              className="bg-indigo-600 text-white w-full py-2 rounded"
            >
              Ir
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
