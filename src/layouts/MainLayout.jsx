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

  // 📊 DATOS REALES
  const informes = JSON.parse(localStorage.getItem("informes")) || [];
  const inspecciones = JSON.parse(localStorage.getItem("inspecciones")) || [];
  const mantenimientos = JSON.parse(localStorage.getItem("mantenimientos")) || [];
  const vehiculos = JSON.parse(localStorage.getItem("vehiculos")) || [];

  const cards = [
    {
      title: "Informe general",
      desc: "Crear informes técnicos con actividades y firmas.",
      icon: <FileText size={28} />,
      color: "bg-blue-600",
      action: () => navigate("/informe"),
    },
    {
      title: "Inspección",
      desc: "Registrar inspecciones técnicas.",
      icon: <ClipboardCheck size={28} />,
      color: "bg-yellow-500",
      action: () => navigate("/inspeccion"),
    },
    {
      title: "Mantenimiento",
      desc: "Gestión de mantenimientos.",
      icon: <Wrench size={28} />,
      color: "bg-green-600",
      action: () => navigate("/mantenimiento"),
    },
    {
      title: "Herramientas",
      desc: "Control de equipos.",
      icon: <Package size={28} />,
      color: "bg-purple-600",
      action: () => navigate("/registro-salida"),
    },
    {
      title: "Recepción",
      desc: "Ingreso de vehículos.",
      icon: <Truck size={28} />,
      color: "bg-red-600",
      action: () => navigate("/recepcion"),
    },
    {
      title: "Liberación",
      desc: "Salida de vehículos.",
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
        </div>
      </div>

      {/* 📊 MÉTRICAS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Informes", value: informes.length, color: "text-blue-600" },
          { label: "Inspecciones", value: inspecciones.length, color: "text-yellow-500" },
          { label: "Mantenimientos", value: mantenimientos.length, color: "text-green-600" },
          { label: "Vehículos", value: vehiculos.length, color: "text-indigo-600" },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow">
            <p className="text-sm text-slate-500">{item.label}</p>
            <h2 className={`text-2xl font-bold ${item.color}`}>
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* 🚀 GRID ANIMADO */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10"
      >
        {cards.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-7 shadow-lg cursor-pointer"
            onClick={card.action}
          >
            <div className={`w-14 h-14 flex items-center justify-center rounded-xl text-white mb-5 ${card.color}`}>
              {card.icon}
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {card.title}
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-sm">
              {card.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
}
