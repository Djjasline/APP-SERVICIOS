import { useNavigate } from "react-router-dom";

export default function CardModulo({
  titulo,
  descripcion,
  ruta,
  color = "bg-blue-600",
  icono = null,
  badge = null,
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-5 rounded-xl shadow flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition duration-300">

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
        <h2 className="font-semibold text-gray-900">
          {titulo}
        </h2>

        {/* DESCRIPCIÓN */}
        <p className="text-sm text-gray-500">
          {descripcion}
        </p>
      </div>

      {/* BOTÓN */}
      <button
        onClick={() => navigate(ruta)}
        className={`mt-4 ${color} text-white py-3 rounded-lg text-sm font-medium hover:opacity-90 transition`}
      >
        Ir
      </button>
    </div>
  );
}
