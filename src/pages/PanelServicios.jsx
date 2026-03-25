import { useNavigate } from "react-router-dom";
import {
  Truck,
  Droplet,
  Fuel,
  Settings,
  FolderArchive,
} from "lucide-react";

export default function PanelServicios() {
  const navigate = useNavigate();

  const menuPrincipal = [
    {
      id: "vehiculos",
      titulo: "Vehículos Especiales",
      descripcion:
        "Gestión de equipos como hidrosuccionadores, barredoras y cámaras.",
      icon: <Truck size={28} />,
      color: "bg-blue-600",
      ruta: "/area/vehiculos",
    },
    {
      id: "agua",
      titulo: "Agua y Saneamiento",
      descripcion:
        "Sistemas hidráulicos, saneamiento y control de agua.",
      icon: <Droplet size={28} />,
      color: "bg-cyan-600",
      ruta: "/area/agua",
    },
    {
      id: "petroleo",
      titulo: "Petróleo y Energía",
      descripcion:
        "Equipos y servicios para el sector energético.",
      icon: <Fuel size={28} />,
      color: "bg-yellow-600",
      ruta: "/area/petroleo",
    },
    {
      id: "operaciones",
      titulo: "Operaciones",
      descripcion:
        "Vista global de todas las actividades técnicas y operativas.",
      icon: <Settings size={28} />,
      color: "bg-gray-800",
      ruta: "/operaciones",
    },
    {
      id: "repositorios",
      titulo: "Repositorios",
      descripcion:
        "Gestión de documentos, informes PDF y archivos técnicos.",
      icon: <FolderArchive size={28} />,
      color: "bg-purple-700",
      ruta: "/repositorios",
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold">
          Panel de servicios ASTAP
        </h1>
        <p className="text-sm text-gray-500">
          Gestión técnica por área
        </p>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid md:grid-cols-3 gap-6">
        {menuPrincipal.map((item) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-xl shadow hover:shadow-md transition space-y-4"
          >
            {/* ICONO */}
            <div className={`${item.color} text-white w-12 h-12 flex items-center justify-center rounded-lg`}>
              {item.icon}
            </div>

            {/* TITULO */}
            <h2 className="font-semibold text-lg">
              {item.titulo}
            </h2>

            {/* DESCRIPCIÓN */}
            <p className="text-sm text-gray-500">
              {item.descripcion}
            </p>

            {/* BOTÓN */}
            <button
              onClick={() => navigate(item.ruta)}
              className={`${item.color} text-white w-full py-2 rounded`}
            >
              Ingresar
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
