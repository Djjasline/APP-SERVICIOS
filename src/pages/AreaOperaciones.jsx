import CardModulo from "@/components/CardModulo";
import { Settings, Wrench, Inbox } from "lucide-react";

export default function AreaOperaciones() {

 const modulos = [
  {
    titulo: "Bitácora Vehicular",
    descripcion: "Control de salida y entrega de vehículos.",
    icono: <Settings size={20} />,
    color: "bg-indigo-600",
    ruta: "/operaciones/recepcion",
  },
  {
    titulo: "Registro de salida e ingreso de herramientas",
    descripcion: "Control de salida, retorno y estado de herramientas operativas.",
    icono: <Wrench size={20} />,
    color: "bg-blue-600",
    ruta: "/operaciones/registro",
  },
  {
    titulo: "Liberación",
    descripcion: "Liberación y cierre de equipos, vehículos y maquinaria.",
    icono: <Inbox size={20} />,
    color: "bg-green-600",
    ruta: "/operaciones/liberacion",
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
