import { useNavigate } from "react-router-dom";
import {
  FileText,
  ClipboardCheck,
  Wrench,
  Package,
  Truck,
  CheckCircle,
} from "lucide-react";

export default function PanelServicios() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Informe general",
      desc: "Crear informes técnicos con actividades, imágenes, conclusiones y firmas.",
      icon: <FileText size={28} />,
      color: "bg-blue-600",
      action: () => {
        localStorage.removeItem("currentReport");
        navigate("/informe");
      },
      btn: "Nuevo informe",
    },
    {
      title: "Inspección y valoración",
      desc: "Registrar inspecciones técnicas por tipo de equipo y estado.",
      icon: <ClipboardCheck size={28} />,
      color: "bg-yellow-500",
      action: () => navigate("/inspeccion"),
      btn: "Ir a inspecciones",
    },
    {
      title: "Servicio de mantenimiento",
      desc: "Crear y gestionar mantenimientos preventivos y correctivos.",
      icon: <Wrench size={28} />,
      color: "bg-green-600",
      action: () => navigate("/mantenimiento"),
      btn: "Ir a mantenimiento",
    },
    {
      title: "Control de herramientas",
      desc: "Registrar salida e ingreso de herramientas y equipos con imágenes y firmas.",
      icon: <Package size={28} />,
      color: "bg-purple-600",
      action: () => navigate("/registro-salida"),
      btn: "Ir a registros",
    },
    {
      title: "Recepción vehicular",
      desc: "Registro de recepción, checklist y daños del vehículo con evidencia gráfica.",
      icon: <Truck size={28} />,
      color: "bg-red-600",
      action: () => navigate("/recepcion"),
      btn: "Ir a recepción",
    },
    {
      title: "Liberación camioneta",
      desc: "Registro de liberación del vehículo, checklist final, estado y firmas.",
      icon: <CheckCircle size={28} />,
      color: "bg-indigo-600",
      action: () => navigate("/liberacion"),
      btn: "Ir a liberación",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* HEADER */}
    <div className="flex justify-between items-center">
  <div>
    <h1 className="text-3xl font-bold text-white">
      Dashboard
    </h1>
    <p className="text-slate-400 text-sm">
      Gestión técnica de servicios
    </p>
  </div>

  <span className="text-sm text-slate-400">
    Última actualización: hoy
  </span>
</div>
<div className="flex justify-between items-center">
  <h1 className="text-3xl font-bold text-slate-900">
    Dashboard
  </h1>

  <span className="text-sm text-slate-500">
    Última actualización: hoy
  </span>
</div>
        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {cards.map((card, i) => (
            <div
              key={i}
              className="group bg-white/95 backdrop-blur rounded-2xl p-7 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition duration-300 flex flex-col justify-between border border-white/20"
            >
              {/* ICON + TITLE */}
              <div>
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-xl text-white mb-5 ${card.color} shadow-md`}
                >
                  {card.icon}
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {card.title}
                </h2>

                <p className="text-slate-600 text-sm leading-relaxed">
                  {card.desc}
                </p>
              </div>

              {/* BUTTON */}
              <button
                onClick={card.action}
                className={`mt-8 w-full py-3 rounded-xl text-white font-semibold text-base transition 
                ${card.color} 
                hover:opacity-90 
                group-hover:scale-[1.02]`}
              >
                {card.btn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
