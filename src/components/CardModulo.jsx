import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export default function CardModulo({
  titulo,
  descripcion,
  ruta,
  color = "bg-blue-600",
  icono = null,
  badge = null,
  disabled = false,
  disabledLabel = "Acceso restringido",
  onOpen,
}) {
  const navigate = useNavigate();

  const esExterno = ruta?.startsWith("http");

  const handleClick = () => {
    if (disabled) return;

    onOpen?.();

    if (esExterno) {
      window.open(ruta, "_blank", "noopener,noreferrer");
    } else {
      navigate(ruta);
    }
  };

  return (
    <div className={`bg-white p-5 rounded-xl shadow flex flex-col justify-between transition duration-300 ${disabled ? "opacity-75" : "hover:shadow-xl hover:-translate-y-1"}`}>

      {/* TOP */}
      <div className="space-y-2">

        {/* ICONO + BADGE */}
        <div className="flex items-center justify-between">
          {icono && (
            <div className={`${color} text-white w-10 h-10 flex items-center justify-center rounded-lg`}>
              {icono}
            </div>
          )}

          {badge && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
              {badge}
            </span>
          )}
        </div>

        {/* TITULO */}
        <h2 className="font-semibold text-gray-900 flex items-center gap-1">
          {titulo}
          {esExterno && <ExternalLink size={13} className="text-gray-400" />}
        </h2>

        {/* DESCRIPCIÓN */}
        <p className="text-sm text-gray-500">
          {descripcion}
        </p>
      </div>

      {/* BOTÓN */}
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`mt-4 ${disabled ? "bg-slate-400 cursor-not-allowed" : color} text-white py-3 rounded-lg text-sm font-medium hover:opacity-90 transition`}
      >
        {disabled ? disabledLabel : esExterno ? "Abrir" : "Ir"}
      </button>
    </div>
  );
}
