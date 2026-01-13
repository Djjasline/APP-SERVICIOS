import { useNavigate } from "react-router-dom";

export default function IndexInforme() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ENCABEZADO */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Informe general
          </h1>

          <button
            onClick={() => navigate("/")}
            className="border px-4 py-2 rounded hover:bg-gray-100 text-sm"
          >
            Volver
          </button>
        </div>

        {/* TARJETA NUEVO INFORME */}
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <p className="text-slate-600">
            Crear informes técnicos con actividades, imágenes, conclusiones y firmas.
          </p>

          <button
            onClick={() => navigate("nuevo")}
            className="w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Nuevo informe
          </button>
        </div>

      </div>
    </div>
  );
}
