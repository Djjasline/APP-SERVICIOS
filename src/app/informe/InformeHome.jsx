import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InformeHome() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("todos");

  /* =============================
     CARGAR INFORMES
  ============================== */
  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("serviceReports")) || [];
    setReports(stored);
  }, []);

  /* =============================
     FILTRADO
  ============================== */
  const filtered = reports.filter((r) => {
    const firmado =
      r.data?.firmas?.tecnico && r.data?.firmas?.cliente;

    if (filter === "borrador") return !firmado;
    if (filter === "completado") return firmado;
    return true;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-4">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            Informe general
          </h1>

          <button
            onClick={() => navigate("/")}
            className="border px-4 py-2 rounded"
          >
            Volver
          </button>
        </div>

        {/* NUEVO INFORME */}
        <div className="bg-white rounded shadow p-4">
          <p className="text-sm text-gray-600 mb-2">
            Crear informes técnicos con actividades, imágenes,
            conclusiones y firmas.
          </p>

          <button
            onClick={() => navigate("/informe/nuevo")}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Nuevo informe
          </button>
        </div>

        {/* FILTROS */}
        <div className="flex gap-2 text-sm">
          {["todos", "borrador", "completado"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded border ${
                filter === f
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* HISTORIAL */}
        <div className="bg-white rounded shadow p-4 space-y-3">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-500">
              Sin registros
            </p>
          )}

          {filtered.map((r) => {
            const firmado =
              r.data?.firmas?.tecnico &&
              r.data?.firmas?.cliente;

            return (
              <div
                key={r.id}
                className="border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-sm">
                    {r.data?.cliente || "Sin cliente"}
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

                <div className="flex gap-3 items-center">
                  {/* ABRIR */}
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

                  {/* PDF SOLO SI COMPLETADO */}
                  {firmado && (
                    <button
                      onClick={() =>
                        navigate(`/informe/pdf/${r.id}`)
                      }
                      className="text-green-600 text-sm"
                    >
                      PDF
                    </button>
                  )}

                  {/* ELIMINAR */}
                  <button
                    onClick={() => {
                      if (
                        !confirm("¿Eliminar informe?")
                      )
                        return;

                      const updated = reports.filter(
                        (x) => x.id !== r.id
                      );
                      localStorage.setItem(
                        "serviceReports",
                        JSON.stringify(updated)
                      );
                      setReports(updated);
                    }}
                    className="text-red-600 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
