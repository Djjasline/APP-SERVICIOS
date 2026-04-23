import { useNavigate } from "react-router-dom";

export default function CardModulo({
  titulo,
  descripcion,
  ruta,
  color = "bg-blue-600",
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-4 rounded shadow flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition duration-300">

      <div>
        <h2 className="font-semibold text-gray-900">
          {titulo}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {descripcion}
        </p>
      </div>

      <button
        onClick={() => navigate(ruta)}
        className={`mt-4 ${color} text-white px-4 py-3 text-sm rounded`}
      >
        Ir
      </button>
    </div>
  );
}
