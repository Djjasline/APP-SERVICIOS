import { useNavigate } from "react-router-dom";

export default function AreaPetroleo() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-xl font-bold">
          Petróleo y Energía
        </h1>
        <p className="text-sm text-gray-500">
          Gestión de equipos y servicios especializados para el sector energético.
        </p>
      </div>

      {/* ================= SUBMENÚ ================= */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* INFORMES */}
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg">Informes</h2>
          <p className="text-sm text-gray-500 mt-1">
            Registro técnico de trabajos realizados en equipos del sector energético.
          </p>

          <button
            onClick={() => navigate("/informe")}
            className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition"
          >
            Ir
          </button>
        </div>

        {/* INSPECCIÓN */}
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg">Inspección</h2>
          <p className="text-sm text-gray-500 mt-1">
            Evaluación del estado operativo de equipos en ambientes industriales.
          </p>

          <button
            onClick={() => navigate("/inspeccion")}
            className="mt-3 w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-500 transition"
          >
            Ir
          </button>
        </div>

        {/* MANTENIMIENTO */}
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg">Mantenimiento</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de mantenimiento preventivo y correctivo en equipos energéticos.
          </p>

          <button
            onClick={() => navigate("/mantenimiento")}
            className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-500 transition"
          >
            Ir
          </button>
        </div>

      </div>

    </div>
  );
}
