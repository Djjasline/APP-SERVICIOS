import { useNavigate } from "react-router-dom";
import {
  FileText,
  ClipboardCheck,
  Wrench,
  Package,
  Truck,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

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
    },
    {
      title: "Inspección y valoración",
      desc: "Registrar inspecciones técnicas por tipo de equipo y estado.",
      icon: <ClipboardCheck size={28} />,
      color: "bg-yellow-500",
      action: () => navigate("/inspeccion"),
    },
    {
      title: "Servicio de mantenimiento",
      desc: "Crear y gestionar mantenimientos preventivos y correctivos.",
      icon: <Wrench size={28} />,
      color: "bg-green-600",
      action: () => navigate("/mantenimiento"),
    },
    {
      title: "Control de herramientas",
      desc: "Registrar salida e ingreso de herramientas y equipos.",
      icon: <Package size={28} />,
      color: "bg-purple-600",
      action: () => navigate("/registro-salida"),
    },
    {
      title: "Recepción vehicular",
      desc: "Registro de recepción, checklist y daños del vehículo.",
      icon: <Truck size={28} />,
      color: "bg-red-600",
      action: () => navigate("/recepcion"),
    },
    {
      title: "Liberación camioneta",
      desc: "Registro de liberación del vehículo y estado final.",
      icon: <CheckCircle size={28} />,
      color: "bg-indigo-600",
      action: () => navigate("/liberacion"),
    },
  ];

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            Panel de servicios ASTAP
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Selecciona un módulo para continuar
          </p>
        </div>
      </div>

      {/* GRID */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {cards.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 200 }}
            onClick={card.action}
            className="bg-white dark:bg-slate-800 rounded-2xl p-7 shadow hover:shadow-xl transition cursor-pointer"
          >
            {/* ICON */}
            <div
              className={`w-14 h-14 flex items-center justify-center rounded-xl text-white mb-5 ${card.color}`}
            >
              {card.icon}
            </div>

            {/* TITLE */}
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {card.title}
            </h2>

            {/* DESC */}
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              {card.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
