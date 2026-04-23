import { useNavigate } from "react-router-dom";

export default function CardModulo({
  titulo,
  descripcion,
  ruta,
  color = "bg-blue-600",
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold text-gray-900">
        {titulo}
      </h2>

      <p className="text-sm text-gray-500">
        {descripcion}
      </p>

      <button
        onClick={() => navigate(ruta)}
        className={`mt-2 ${color} text-white px-3 py-2 rounded`}
      >
        Ir
      </button>
    </div>
  );
}
