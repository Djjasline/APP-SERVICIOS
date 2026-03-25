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
        "Gestión de informes, inspecciones y mantenimiento de equipos.",
      icon: <Truck size={28} />,
      color: "bg-blue-600",
      ruta: "/informe", // 🔥 YA EXISTE
    },
    {
      id: "agua",
      titulo: "Agua y Saneamiento",
      descripcion:
        "Operación técnica de sistemas hidráulicos y saneamiento.",
      icon: <Droplet size={28} />,
      color: "bg-cyan-600",
      ruta: "/inspeccion", // 🔥 YA EXISTE
    },
    {
      id: "petroleo",
      titulo: "Petróleo y Energía",
      descripcion:
        "Gestión de equipos y mantenimiento para el sector energético.",
      icon: <Fuel size={28} />,
      color: "bg-yellow-600",
      ruta: "/mantenimiento", // 🔥 YA EXISTE
    },
    {
      id: "operaciones",
      titulo: "Operaciones",
      descripcion:
        "Control operativo de recepción, herramientas y liberación.",
      icon: <Settings size={28} />,
      color: "bg-gray-800",
      ruta: "/recepcion", // 🔥 YA EXISTE
    },
    {
      id: "repositorios",
      titulo: "Repositorios",
      descripcion:
        "Gestión de registros técnicos y herramientas.",
      icon: <FolderArchive size={28} />,
      color: "bg-purple-700",
      ruta: "/registro", // 🔥 YA EXISTE
    },
  ];

  return (
    <div className="relative min-h-screen">

      {/* 🔥 FONDO */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{
          backgroundImage: "url('/background-astap.png')",
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />

      {/* CONTENIDO */}
      <div className="relative p-6 space-y-10">

        {/* HEADER */}
        <div className="flex flex-col items-center text-center space-y-4">
          <img
            src="/astap-logo.jpg"
            alt="ASTAP"
            className="w-24 h-24 object-contain drop-shadow-lg"
          />

          <h1 className="text-3xl font-bold tracking-tight">
            Panel de servicios ASTAP
          </h1>

          <p className="text-gray-500 max-w-xl">
            Gestión técnica organizada por áreas operativas
          </p>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {menuPrincipal.map((item) => (
            <div
              key={item.id}
              className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow hover:shadow-xl transition space-y-4"
            >
              <div
                className={`${item.color} text-white w-12 h-12 flex items-center justify-center rounded-lg`}
              >
                {item.icon}
              </div>

              <h2 className="font-semibold text-lg">
                {item.titulo}
              </h2>

              <p className="text-sm text-gray-600">
                {item.descripcion}
              </p>

              <button
                onClick={() => navigate(item.ruta)}
                className={`${item.color} text-white w-full py-2 rounded-lg hover:opacity-90 transition`}
              >
                Ingresar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
