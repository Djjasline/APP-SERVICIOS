function IndexInspeccion() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <button
          onClick={() => navigate("/")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver al panel principal
        </button>

        <h1 className="text-2xl font-semibold text-slate-900">
          Inspección y valoración
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          <Card
            title="Hidrosuccionador"
            type="hidro"
            description="Inspección general del equipo hidrosuccionador."
          />
          <Card
            title="Barredora"
            type="barredora"
            description="Inspección y valoración de barredoras."
          />
          <Card
            title="Cámara (VCAM / Metrotech)"
            type="camara"
            description="Inspección con sistema de cámara."
          />
        </div>
      </div>
    </div>
  );
}

export default IndexInspeccion;
