import { useNavigate } from "react-router-dom";

export default function IndexMantenimiento() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Servicio de mantenimiento
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold">Mantenimiento Hidrosuccionador</h2>

            <button
              onClick={() => navigate("hidro")}
              className="w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Crear mantenimiento
            </button>
          </div>

          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold">Mantenimiento Barredora</h2>

            <button
              onClick={() => navigate("barredora")}
              className="w-full px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Crear mantenimiento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
