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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">
          Panel de servicios ASTAP
        </h1>
        <p className="text-sm text-gray-500">
          Gestión técnica por área
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {areas.map((area) => (
          <div
            key={area.id}
            className="bg-white p-6 rounded-xl shadow space-y-3 hover:shadow-md transition"
          >
            <h2 className="font-semibold text-lg">
              {area.titulo}
            </h2>

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
  );
}
