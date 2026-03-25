import { useNavigate } from "react-router-dom";

export default function AreaAgua() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-xl font-bold">
        Agua y Saneamiento
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Informes</h2>
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

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Inspección</h2>
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
