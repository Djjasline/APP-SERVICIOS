import { useNavigate } from "react-router-dom";

export default function AreaAgua() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">

      {/* 🔥 TÍTULO + DESCRIPCIÓN (IGUAL QUE VEHÍCULOS) */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          Agua y Saneamiento
        </h2>
        <p className="text-sm text-gray-300">
          Gestión de sistemas hidráulicos y servicios de saneamiento.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* INFORMES */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-gray-900">Informes</h2>
          <p className="text-sm text-gray-500">
            Reportes técnicos de sistemas hidráulicos.
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
            Evaluación de redes y equipos hidráulicos.
          </p>
          <button
            onClick={() => navigate("/inspeccion")}
            className="mt-2 bg-yellow-600 text-white px-3 py-2 rounded"
          >
            Ir
          </button>
        </div>

      </div>

    </div>
  );
}
