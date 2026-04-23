import { useNavigate } from "react-router-dom";

export default function AreaPetroleo() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">

      {/* 🔥 TÍTULO + DESCRIPCIÓN (ESTÁNDAR UNIFICADO) */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          Petróleo y Energía
        </h2>
        <p className="text-sm text-gray-300">
          Gestión de equipos y servicios especializados para el sector energético.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* INFORMES */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-gray-900">Informes</h2>
          <p className="text-sm text-gray-500">
            Registro técnico de trabajos realizados en equipos del sector energético.
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
          <h2 className="font-semibold text-gray-900">Inspección</h2>
          <p className="text-sm text-gray-500">
            Evaluación del estado operativo de equipos en ambientes industriales.
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
          <h2 className="font-semibold text-gray-900">Mantenimiento</h2>
          <p className="text-sm text-gray-500">
            Gestión de mantenimiento preventivo y correctivo en equipos energéticos.
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
