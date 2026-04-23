import CardModulo from "@/components/CardModulo";
import { Settings, Wrench, Inbox } from "lucide-react";

export default function AreaOperaciones() {

  const modulos = [
    {
      titulo: "Bitácora",
      descripcion: "Control de salida y entrega de vehículos.",
      icono: <Settings size={20} />,
      color: "bg-indigo-600",
      ruta: "/liberacion",
    },
    {
      titulo: "Herramientas y equipos",
      descripcion:
        "Gestión y registro de salida e ingreso de herramientas y equipos técnicos.",
      icono: <Wrench size={20} />,
      color: "bg-blue-600",
      ruta: "/registro",
    },
    {
      titulo: "Recepción de equipos, vehículos y maquinaria",
      descripcion:
        "Ingreso de equipos y validación inicial para mantenimientos y servicios.",
      icono: <Inbox size={20} />,
      color: "bg-green-600",
      ruta: "/recepcion",
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* 🔥 HEADER */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          Operaciones
        </h2>
        <p className="text-sm text-gray-300">
          Gestión operativa de procesos técnicos.
        </p>
      </div>

      {/* 🔥 GRID */}
      <div className="grid md:grid-cols-3 gap-6">

        {modulos.map((item, index) => (
          <CardModulo
            key={index}
            titulo={item.titulo}
            descripcion={item.descripcion}
            ruta={item.ruta}
            color={item.color}
            icono={item.icono}
          />
        ))}

      </div>

    </div>
  );
}
