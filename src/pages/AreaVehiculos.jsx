import CardModulo from "@/components/CardModulo";
import { VEHICULOS_TEXT } from "@/constants/vehiculosText";
import { useTheme } from "@/context/ThemeContext";
import { FileText, ClipboardCheck, Wrench, SlidersHorizontal } from "lucide-react";
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
  titulo={VEHICULOS_TEXT.informe.title}
  descripcion={VEHICULOS_TEXT.informe.description}
  ruta="/vehiculos/informe"
  color="bg-blue-600"
  icono={<FileText size={20} />}
/>

<CardModulo
  titulo={VEHICULOS_TEXT.inspeccion.title}
  descripcion={VEHICULOS_TEXT.inspeccion.description}
  ruta="/vehiculos/inspeccion"
  color="bg-yellow-600"
  icono={<ClipboardCheck size={20} />}
/>

<CardModulo
  titulo={VEHICULOS_TEXT.mantenimiento.title}
  descripcion={VEHICULOS_TEXT.mantenimiento.description}
  ruta="/vehiculos/mantenimiento"
  color="bg-green-600"
  icono={<Wrench size={20} />}
/>

<CardModulo
  titulo={VEHICULOS_TEXT.configurador.title}
  descripcion={VEHICULOS_TEXT.configurador.description}
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
