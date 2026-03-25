import { useNavigate } from "react-router-dom";

export default function PanelServicios() {
  const navigate = useNavigate();

  const areas = [
    {
      id: "vehiculos",
      titulo: "Vehículos Especiales",
      descripcion:
        "Gestión de equipos como hidrosuccionadores, barredoras y cámaras.",
      color: "bg-blue-600",
    },
    {
      id: "agua",
      titulo: "Agua y Saneamiento",
      descripcion:
        "Sistemas hidráulicos, saneamiento y control de agua.",
      color: "bg-cyan-600",
    },
    {
      id: "petroleo",
      titulo: "Petróleo y Energía",
      descripcion:
        "Equipos y servicios para el sector energético.",
      color: "bg-yellow-600",
    },
  ];

  const modulosGlobales = [
    {
      id: "operaciones",
      titulo: "Operaciones",
      descripcion:
        "Vista global de todas las actividades técnicas.",
      color: "bg-gray-800",
      ruta: "/operaciones",
    },
    {
      id: "repositorios",
      titulo: "Repositorios",
      descripcion:
        "Gestión de documentos, informes y archivos técnicos.",
      color: "bg-purple-700",
      ruta: "/repositorios",
    },
  ];

  return (
    <div className="p-6 space-y-8">

      <div>
        <h1 className="text-xl font-bold">
          Panel de servicios ASTAP
        </h1>
        <p className="text-sm text-gray-500">
          Gestión técnica por área
        </p>
      </div>

      {/* ================= ÁREAS ================= */}
      <div>
        <h2 className="font-semibold mb-3">Áreas</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {areas.map((area) => (
            <div
              key={area.id}
              className="bg-white p-5 rounded-xl shadow space-y-3"
            >
              <h3 className="font-semibold text-lg">
                {area.titulo}
              </h3>

              <p className="text-sm text-gray-500">
                {area.descripcion}
              </p>

              <button
                onClick={() => navigate(`/area/${area.id}`)}
                className={`${area.color} text-white w-full py-2 rounded`}
              >
                Ingresar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= OPERACIONES / REPOSITORIOS ================= */}
      <div>
        <h2 className="font-semibold mb-3">Módulos globales</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {modulosGlobales.map((mod) => (
            <div
              key={mod.id}
              className="bg-white p-5 rounded-xl shadow space-y-3"
            >
              <h3 className="font-semibold text-lg">
                {mod.titulo}
              </h3>

              <p className="text-sm text-gray-500">
                {mod.descripcion}
              </p>

              <button
                onClick={() => navigate(mod.ruta)}
                className={`${mod.color} text-white w-full py-2 rounded`}
              >
                Ir
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
