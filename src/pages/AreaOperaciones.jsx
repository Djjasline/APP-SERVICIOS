import CardModulo from "@/components/CardModulo";
import { OPERACIONES_TEXT } from "@/constants/operacionesText";
import { useTheme } from "@/context/ThemeContext";
import { ClipboardList, Settings, Wrench, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AreaOperaciones() {
  const { isLight } = useTheme();
  const navigate = useNavigate();

 const modulos = [
  {
    titulo: OPERACIONES_TEXT.recepcion.title,
    descripcion: OPERACIONES_TEXT.recepcion.description,
    icono: <Settings size={20} />,
    color: "bg-indigo-600",
    ruta: "/operaciones/recepcion",
  },
  {
    titulo: OPERACIONES_TEXT.registro.title,
    descripcion: OPERACIONES_TEXT.registro.description,
    icono: <Wrench size={20} />,
    color: "bg-blue-600",
    ruta: "/operaciones/registro",
  },
  {
    titulo: OPERACIONES_TEXT.liberacion.title,
    descripcion: OPERACIONES_TEXT.liberacion.description,
    icono: <Inbox size={20} />,
    color: "bg-green-600",
    ruta: "/operaciones/liberacion",
  },
  {
    titulo: OPERACIONES_TEXT.protocolos.title,
    descripcion: OPERACIONES_TEXT.protocolos.description,
    icono: <ClipboardList size={20} />,
    color: "bg-indigo-600",
    ruta: "/operaciones/protocolos",
  },
];
  return (
    <div className="p-6 space-y-6">

      {/* 🔥 HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
            Operaciones
          </h2>
          <p className={`text-sm ${isLight ? "text-slate-600" : "text-gray-300"}`}>
            Gestión operativa de procesos técnicos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="btn-volver-orange"
        >
          Volver
        </button>
      </div>

      {/* 🔥 GRID */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

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
