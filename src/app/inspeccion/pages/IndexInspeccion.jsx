import { useNavigate } from "react-router-dom";

export default function IndexInspeccion() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">
        Inspección y valoración de equipos
      </h1>

      <div className="grid md:grid-cols-3 gap-4">
        <button onClick={() => navigate("hidro")} className="btn-primary">
          Hidrosuccionador
        </button>

        <button onClick={() => navigate("barredora")} className="btn-primary">
          Barredora
        </button>

        <button onClick={() => navigate("camara")} className="btn-primary">
          Cámara (VCAM / Metrotech)
        </button>
      </div>
    </div>
  );
}
