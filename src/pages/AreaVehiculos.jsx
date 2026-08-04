import CardModulo from "@/components/CardModulo";
import { VEHICULOS_TEXT } from "@/constants/vehiculosText";
import { isConfiguratorOwner } from "@/constants/accessControl";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { canUseConfiguratorPermission } from "@/services/accessControlService";
import { FileText, ClipboardCheck, Wrench, SlidersHorizontal, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AreaVehiculos() {
  const { isLight } = useTheme();
  const { email, user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [canUseConfiguratorByPermission, setCanUseConfiguratorByPermission] = useState(false);
  const superAdminActivo = typeof isSuperAdmin === "function" ? isSuperAdmin() : !!isSuperAdmin;
  const puedeUsarConfigurador = isConfiguratorOwner(email || user?.email) || superAdminActivo || canUseConfiguratorByPermission;

  useEffect(() => {
    let mounted = true;

    async function loadPermission() {
      if (!user?.id || isConfiguratorOwner(email || user?.email) || superAdminActivo) {
        if (mounted) setCanUseConfiguratorByPermission(false);
        return;
      }

      try {
        const allowed = await canUseConfiguratorPermission(user.id);
        if (mounted) setCanUseConfiguratorByPermission(allowed);
      } catch (error) {
        console.error("Error cargando permiso del configurador:", error);
        if (mounted) setCanUseConfiguratorByPermission(false);
      }
    }

    loadPermission();

    return () => {
      mounted = false;
    };
  }, [email, superAdminActivo, user?.email, user?.id]);

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
  disabled={!puedeUsarConfigurador}
  disabledLabel="Acceso exclusivo"
/>

<CardModulo
  titulo="Encuesta de satisfacción"
  descripcion="Módulo en construcción para medir la satisfacción del cliente por cada servicio de campo."
  ruta="/vehiculos/encuesta-satisfaccion"
  color="bg-orange-600"
  icono={<Star size={20} />}
  badge="🚧 · 95% de avance"
/>

      </div>

    </div>
  );
}
