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

  /* ================= MENÚ CENTRAL ================= */
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
        "Operación técnica de sistemas hidráulicos y saneamiento.",
      icon: <Droplet size={28} />,
      color: "bg-cyan-600",
      ruta: "/area/agua",
    },
    {
      id: "petroleo",
      titulo: "Petróleo y Energía",
      descripcion:
        "Gestión de equipos y mantenimiento del sector energético.",
      icon: <Fuel size={28} />,
      color: "bg-yellow-600",
      ruta: "/area/petroleo",
    },
    {
      id: "operaciones",
      titulo: "Operaciones",
      descripcion:
        "Control operativo de recepción, herramientas y liberación.",
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
    <div className="relative min-h-screen">

      {/* ================= FONDO COLLAGE ================= */}
<div className="absolute inset-0 grid grid-cols-4 opacity-80">
  {[...Array(8)].map((_, i) => (
    <img
      key={i}
      src="/background-astap.png"
      className="w-full h-full object-cover"
      style={{
        filter: "brightness(0.9)",
        transform: i % 2 === 0 ? "scaleX(-1)" : "none",
      }}
    />
  ))}
</div>

<div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
      {/* ================= CONTENIDO ================= */}
      <div className="relative p-6 space-y-8">

        {/* HEADER */}
        <div className="flex flex-col items-center text-center space-y-4">
          <img
            src="/astap-logo.jpg"
            alt="ASTAP"
            className="w-20 h-20 object-contain"
          />

          <h1 className="text-2xl md:text-3xl font-bold">
            Panel de servicios ASTAP
          </h1>

          <p className="text-sm text-gray-600">
            Gestión técnica organizada por áreas operativas
          </p>
        </div>

        {/* ================= MENÚ ================= */}
        <div className="grid md:grid-cols-3 gap-6">

          {menuPrincipal.map((item) => (
            <div
              key={item.id}
              className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow hover:shadow-lg transition space-y-4"
            >
              {/* ICONO */}
              <div
                className={`${item.color} text-white w-12 h-12 flex items-center justify-center rounded-lg`}
              >
                {item.icon}
              </div>

              {/* TITULO */}
              <h2 className="font-semibold text-lg">
                {item.titulo}
              </h2>

              {/* DESCRIPCIÓN */}
              <p className="text-sm text-gray-600">
                {item.descripcion}
              </p>

              {/* BOTÓN UNIVERSAL */}
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
