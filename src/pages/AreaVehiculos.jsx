import CardModulo from "@/components/CardModulo";
import { useTheme } from "@/context/ThemeContext";
import { FileText, ClipboardCheck, Wrench, ClipboardList, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AreaVehiculos() {
  const { isLight } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">

      {/* 🔥 HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
            Vehículos Especiales
          </h2>
          <p className={`text-sm ${isLight ? "text-slate-600" : "text-gray-300"}`}>
            Gestión de equipos y servicios especializados.
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
      <div className="grid md:grid-cols-2 gap-6">

        <CardModulo
  titulo="Informe Técnico de Servicio"
  descripcion="Instalación y cambio de repuestos, montaje de elementos y reparación de sistemas. No aplica para inspección ni mantenimiento de equipos."
  ruta="/vehiculos/informe"
  color="bg-blue-600"
  icono={<FileText size={20} />}
/>

<CardModulo
  titulo="Informe de Inspección de Equipos"
  descripcion="Evaluación del estado de equipos como Barredoras, Hidrosuccionadores y Cámaras de inspección."
  ruta="/vehiculos/inspeccion"
  color="bg-yellow-600"
  icono={<ClipboardCheck size={20} />}
/>

<CardModulo
  titulo="Informe de Mantenimiento de Equipos"
  descripcion="Control de mantenimiento preventivo de equipos."
  ruta="/vehiculos/mantenimiento"
  color="bg-green-600"
  icono={<Wrench size={20} />}
/>

<CardModulo
  titulo="Protocolos"
  descripcion="Protocolos técnicos para procedimientos, mantenimiento y verificación de equipos."
  ruta="/vehiculos/protocolos"
  color="bg-indigo-600"
  icono={<ClipboardList size={20} />}
/>

<CardModulo
  titulo="Configurador 🚧 · 20% de avance"
  descripcion="Configurador técnico de equipos, esquemas, capas y revisión. Acceso restringido hasta nueva orden."
  ruta="/vehiculos/configurador"
  color="bg-orange-600"
  icono={<SlidersHorizontal size={20} />}
  disabled
  disabledLabel="Acceso restringido"
/>

      </div>

    </div>
  );
}
