import { useNavigate } from "react-router-dom";
import { Settings, Wrench, Inbox } from "lucide-react";

export default function AreaOperaciones() {
  const navigate = useNavigate();

  const modulos = [
    {
      titulo: "Bitacora",
      descripcion: "Control de salida y entrega de vehiculos.",
      icon: <Settings size={24} />,
      color: "bg-indigo-600",
      ruta: "/liberacion", // 🔥 YA CONECTADO AL SISTEMA REAL
    },
    {
      titulo: "Herramientas y equipos",
      descripcion: "Gestión y registro de salida e ingreso de herramientas y equipos técnicos.",
      icon: <Wrench size={24} />,
      color: "bg-gray-700",
      ruta: "/registro",
    },
    {
      titulo: "Recepción de equipos, vehículos y maquinaria",
      descripcion: "Ingreso de equipos y validación inicial para manatenimientos y servicios.",
      icon: <Inbox size={24} />,
      color: "bg-green-600",
      ruta: "/recepcion",
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Operaciones</h1>
        <p className="text-gray-500">
          Gestión operativa de procesos técnicos.
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        {modulos.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition space-y-4"
          >
            {/* ICONO */}
            <div className={`${item.color} text-white w-12 h-12 flex items-center justify-center rounded-lg`}>
              {item.icon}
            </div>

            {/* TITULO */}
            <h2 className="font-semibold text-lg">{item.titulo}</h2>

            {/* DESCRIPCIÓN */}
            <p className="text-sm text-gray-600">{item.descripcion}</p>

            {/* BOTÓN */}
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
  );
}
