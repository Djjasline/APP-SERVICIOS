import { useNavigate } from "react-router-dom";

export default function AreaOperaciones() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-xl font-bold">
        Operaciones
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        {/* HERRAMIENTAS */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Herramientas</h2>
          <p className="text-sm text-gray-500">
            Control y gestión de herramientas.
          </p>
          <button
            onClick={() => navigate("/registro")}
            className="mt-2 bg-purple-600 text-white px-3 py-2 rounded"
          >
            Ir
          </button>
        </div>

        {/* RECEPCIÓN */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Recepción</h2>
          <p className="text-sm text-gray-500">
            Ingreso de vehículos al sistema.
          </p>
          <button
            onClick={() => navigate("/recepcion")}
            className="mt-2 bg-red-600 text-white px-3 py-2 rounded"
          >
            Ir
          </button>
        </div>

        {/* LIBERACIÓN */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Liberación</h2>
          <p className="text-sm text-gray-500">
            Salida de equipos y cierre de procesos.
          </p>
          <button
            onClick={() => navigate("/liberacion")}
            className="mt-2 bg-indigo-600 text-white px-3 py-2 rounded"
          >
            Ir
          </button>
        </div>

      </div>

    </div>
  );
}
