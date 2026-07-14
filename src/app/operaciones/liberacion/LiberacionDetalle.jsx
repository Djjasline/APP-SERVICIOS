import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function LiberacionDetalle({ pdfMode = false, allowDownload = true }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [registro, setRegistro] = useState(null);

  useEffect(() => {
    const load = async () => {

      // 🔵 SI ES LOCAL
      if (id === "local") {
        const local = JSON.parse(localStorage.getItem("currentLiberacion"));
        setRegistro(local);
        return;
      }

      // 🔵 SUPABASE
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) {
        setRegistro(data);
      }
    };

    load();
  }, [id]);

  if (!registro) {
    return <div className="p-6">Cargando...</div>;
  }

  const data = registro.data || {};
  const titulo = "AUTORIZACIÓN DE USO DE VEHÍCULO PARA REFINERÍA";

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {pdfMode && (
        <style>{`@media print { .no-print { display: none !important; } body { background: #fff !important; } }`}</style>
      )}

      <div className="max-w-[794px] mx-auto bg-white p-6 shadow border space-y-4">

        <h1 className="text-lg font-bold text-center">
          {pdfMode ? titulo : `Detalle de ${titulo}`}
        </h1>

        {/* DATOS */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><strong>Cliente:</strong> {data.cliente}</p>
          <p><strong>Conductor:</strong> {data.conductor}</p>
          <p><strong>Placa:</strong> {data.placa}</p>
          <p><strong>Vehículo:</strong> {data.vehiculo}</p>
          <p><strong>Inspector:</strong> {data.inspector}</p>
          <p>
            <strong>Estado:</strong>{" "}
            {registro.estado === "completado" ? "APROBADO" : "NO APROBADO"}
          </p>
        </div>

        {/* CHECKLIST */}
        <div className="space-y-2">
          <h2 className="border border-blue-300 bg-blue-100 px-2 py-1 text-sm font-semibold text-slate-900">
            Checklist
          </h2>

          {Object.entries(data.checklist || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between border-b py-1 text-sm">
              <span>{key}</span>
              <span className="font-bold">{value}</span>
            </div>
          ))}
        </div>

        {/* OBSERVACIONES */}
        <div>
          <h2 className="font-semibold">Observaciones</h2>
          <p className="text-sm text-gray-700">
            {data.observaciones || "Sin observaciones"}
          </p>
        </div>

        {/* FIRMA */}
        {data.firmaInspector && (
          <div>
            <h2 className="font-semibold">Firma</h2>
            <img
              src={data.firmaInspector}
              alt="firma"
              className="border mt-2 w-[300px]"
            />
          </div>
        )}

        {/* BOTONES */}
        <div className="no-print flex justify-between mt-6">
          <button
            onClick={() => navigate("/operaciones/liberacion")}
            className="btn-volver-orange"
          >
            Volver
          </button>

          {pdfMode ? (
            allowDownload && (
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Descargar PDF
              </button>
            )
          ) : (
            <button
              onClick={() => navigate(`/operaciones/liberacion/pdf/${id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Ver PDF
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
