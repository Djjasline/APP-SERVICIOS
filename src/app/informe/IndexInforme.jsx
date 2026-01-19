import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function IndexInforme() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState("todos");
  const [informes, setInformes] = useState([]);

  /* ===========================
     CARGAR INFORMES
  =========================== */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];
    setInformes(stored);
  }, []);

  /* ===========================
     FILTRO
  =========================== */
  const filtrados = informes.filter((inf) => {
    if (filtro === "todos") return true;
    return inf.estado === filtro;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ENCABEZADO */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Informe general</h1>
          <button
            onClick={() => navigate("/")}
            className="border px-4 py-2 rounded"
          >
            Volver
          </button>
        </div>

        {/* CREAR */}
        <div className="bg-white p-6 rounded shadow space-y-4">
          <p className="text-sm text-gray-600">
            Crear informes técnicos con actividades, imágenes, conclusiones y firmas.
          </p>

          <button
            onClick={() => navigate("/informe/nuevo")}
            className="bg-blue-600 text-white w-full py-2 rounded"
          >
            Nuevo informe
          </button>

          {/* SUBMENÚ */}
          <div className="flex gap-2 pt-4">
            {[
              ["todos", "Todos"],
              ["borrador", "Borrador"],
              ["completado", "Completado"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFiltro(key)}
                className={`px-3 py-1 text-xs border rounded ${
                  filtro === key
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* HISTORIAL */}
          <div className="pt-4 space-y-2">
            {filtrados.length === 0 && (
              <p className="text-xs text-gray-500">Sin registros</p>
            )}

            {filtrados.map((inf) => (
              <div
                key={inf.id}
                className="border rounded p-3 flex justify-between items-center text-sm"
              >
                <div>
                 <p className="font-semibold">
  {inf.data?.cliente && inf.data?.codInf
    ? `${inf.data.cliente} / ${inf.data.codInf}`
    : inf.data?.cliente || inf.data?.codInf || "Sin cliente"}
</p>
                  <p className="text-xs text-gray-500">
                    {new Date(inf.createdAt).toLocaleString()}
                  </p>
                  <span
                    className={`text-xs font-semibold ${
                      inf.estado === "completado"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {inf.estado}
                  </span>
                </div>

                <div className="flex gap-2">
                  {/* ABRIR / EDITAR */}
                  <button
                    className="border px-2 py-1 text-xs rounded"
                    onClick={() =>
                      navigate(`/informe/${inf.id}`)
                    }
                  >
                    Abrir
                  </button>

                  {/* PDF SOLO COMPLETADO */}
                  {inf.estado === "completado" && (
                    <button
                      className="bg-green-600 text-white px-2 py-1 text-xs rounded"
                      onClick={() =>
                        navigate(`/informe/pdf/${inf.id}`)
                      }
                    >
                      PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
