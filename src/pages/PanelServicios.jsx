import { useNavigate } from "react-router-dom";

export default function PanelServicios() {
  const navigate = useNavigate();

  // 🔹 COMPONENTE TARJETA REUTILIZABLE
  const Card = ({ title, desc, color, onClick }) => (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col justify-between hover:shadow-md transition">
      <div>
        <h3 className="font-semibold text-md mb-1">{title}</h3>
        <p className="text-xs text-gray-500 mb-4">{desc}</p>
      </div>

      <button
        onClick={onClick}
        className={`text-white py-2 rounded text-sm ${color}`}
      >
        Ir
      </button>
    </div>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ================= HEADER ================= */}
        <div>
          <h1 className="text-xl font-bold">
            Panel de servicios ASTAP
          </h1>
          <p className="text-sm text-gray-500">
            Gestión técnica por área
          </p>
        </div>

        {/* ================= AREAS ================= */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* ================= VEHÍCULOS ================= */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="font-semibold text-lg">
              Vehículos Especiales
            </h2>

            <div className="grid gap-4">

              <Card
                title="Informes"
                desc="Registro técnico de trabajos realizados en equipos."
                color="bg-blue-600"
                onClick={() => navigate("/informe")}
              />

              <Card
                title="Inspección"
                desc="Evaluación del estado operativo de los equipos."
                color="bg-yellow-500"
                onClick={() => navigate("/inspeccion")}
              />

              <Card
                title="Mantenimiento"
                desc="Gestión y control de mantenimiento preventivo y correctivo."
                color="bg-green-600"
                onClick={() => navigate("/mantenimiento")}
              />

            </div>
          </div>

          {/* ================= OPERACIONES ================= */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="font-semibold text-lg">
              Operaciones
            </h2>

            <div className="grid gap-4">

              <Card
                title="Herramientas"
                desc="Control y seguimiento de equipos y herramientas."
                color="bg-purple-600"
                onClick={() => navigate("/herramientas")}
              />

              <Card
                title="Recepción"
                desc="Registro de ingreso de vehículos a operación."
                color="bg-red-600"
                onClick={() => navigate("/recepcion")}
              />

              <Card
                title="Liberación"
                desc="Control de salida y entrega de vehículos."
                color="bg-indigo-600"
                onClick={() => navigate("/liberacion")}
              />

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
