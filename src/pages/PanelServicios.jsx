import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Truck,
  Droplet,
  Factory,
  Fuel,
  Settings,
  FolderArchive,
} from "lucide-react";

export default function PanelServicios() {
  const navigate = useNavigate();
  const { isProveedorVehiculos, isProveedorVehiculosOnly } = useAuth();
  const { isLight } = useTheme();
  const proveedorSoloVehiculos = isProveedorVehiculosOnly ?? isProveedorVehiculos;

  useEffect(() => {
    if (proveedorSoloVehiculos) {
      navigate("/area/vehiculos", { replace: true });
    }
  }, [proveedorSoloVehiculos, navigate]);

  if (proveedorSoloVehiculos) {
    return null;
  }

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
      id: "industria",
      titulo: "Industria",
      descripcion:
        "Gestión técnica de equipos industriales, bombas y válvulas.",
      icon: <Factory size={28} />,
      color: "bg-slate-700",
      ruta: "/area/industria",
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
    <div className="relative">
      {/* ================= FONDO COLLAGE ================= */}
      <div className={`absolute inset-0 grid grid-cols-4 ${isLight ? "opacity-25" : "opacity-80"}`}>
        {[...Array(8)].map((_, i) => (
          <img
            key={i}
            src="/background-astap.png"
            alt=""
            className="w-full h-full object-cover"
            style={{
              filter: isLight ? "brightness(1.05) saturate(0.8)" : "brightness(0.6)",
              transform: i % 2 === 0 ? "scaleX(-1)" : "none",
            }}
          />
        ))}
      </div>

      <div className={`absolute inset-0 backdrop-blur-sm ${isLight ? "bg-white/70" : "bg-black/50"}`} />

      {/* ================= CONTENIDO ================= */}
      <div className="relative p-6 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col items-center text-center space-y-4">
          <img
            src="/astap-logo.jpg"
            alt="ASTAP"
            className="w-20 h-20 object-contain"
          />

          <h1 className={`text-2xl md:text-3xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
            Panel de servicios ASTAP
          </h1>

          <p className={`text-sm ${isLight ? "text-slate-600" : "text-gray-300"}`}>
            Gestión técnica organizada por secciones operativas
          </p>
        </div>

        {/* ================= MENÚ ================= */}
        <div className="grid md:grid-cols-3 gap-6">
          {menuPrincipal.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 space-y-4"
            >
              {/* ICONO */}
              <div
                className={`${item.color} text-white w-12 h-12 flex items-center justify-center rounded-lg`}
              >
                {item.icon}
              </div>

              {/* TITULO */}
              <h2 className="font-semibold text-lg text-gray-900">
                {item.titulo}
              </h2>

              {/* DESCRIPCIÓN */}
              <p className="text-sm text-gray-600">{item.descripcion}</p>

              {/* BOTÓN */}
              <button
                type="button"
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
