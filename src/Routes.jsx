import { useNavigate } from "react-router-dom";

export default function PanelServicios() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Panel de servicios ASTAP</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">1. Informe general de servicios</h2>
          <button
            className="btn-primary"
            onClick={() => navigate("/service-report-creation")}
          >
            Nuevo informe
          </button>
        </div>

        <div className="border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">2. Inspección y valoración</h2>
          <button
            className="btn-primary"
            onClick={() => navigate("/inspeccion")}
          >
            Ir a inspecciones
          </button>
        </div>

        <div className="border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">3. Servicio de mantenimiento</h2>
          <button className="btn-secondary" disabled>
            Próximamente
          </button>
        </div>
      </div>
    </div>
  );
}
