import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InformeHome() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("todos");
  const [reports, setReports] = useState([]);

  /* ===========================
     CARGAR INFORMES
  =========================== */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];
    setReports(stored.reverse());
  }, []);

  /* ===========================
     FILTRADO
  =========================== */
  const filtered = reports.filter((r) => {
    const firmado =
      r.data?.firmas?.tecnico && r.data?.firmas?.cliente;

    if (tab === "borrador") return !firmado;
    if (tab === "completado") return firmado;
    return true;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow space-y-4">

        {/* ENCABEZADO */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Informe general</h1>
          <button
            onClick={() => navigate("/")}
            className="border px-4 py-1 rounded"
          >
            Volver
          </button>
        </div>

        {/* NUEVO INFORME */}
        <button
          onClick={() => navigate("/informe/nuevo")}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Nuevo informe
        </button>

        {/* TABS */}
        <div className="flex gap-2">
          {["todos", "borrador", "completado"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded border text-xs ${
                tab === t ? "bg-black text-white" : ""
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* LISTA */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400">Sin registros</p>
          )}

          {filtered.map((r) => {
            const firmado =
              r.data?.firmas?.tecnico && r.data?.firmas?.cliente;

            return (
              <div
                key={r.id}
                className="border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-sm">
                    {r.data.cliente || "Sin cliente"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs">
                    Estado:{" "}
                    <strong>
                      {firmado ? "Completado" : "Borrador"}
                    </strong>
                  </p>
                </div>

                <button
                  onClick={() => {
                    localStorage.setItem(
                      "currentReport",
                      JSON.stringify(r)
                    );
                    navigate(`/informe/${r.id}`);
                  }}
                  className="text-blue-600 text-sm"
                >
                  Abrir
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
