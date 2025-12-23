import { useNavigate } from "react-router-dom";

export default function IndexInspeccion() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Inspecciones</h1>

      <button onClick={() => navigate("hidro")}>
        Inspección Hidrosuccionador
      </button>

      <button onClick={() => navigate("barredora")}>
        Inspección Barredora
      </button>

      <button onClick={() => navigate("camara")}>
        Inspección Cámara
      </button>
    </div>
  );
}
