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
  const loadReports = () => {
    const stored =
      JSON.parse(localStorage.getItem("serviceReports")) || [];
    setInformes(stored);
  };

  loadReports(); // primera carga

  window.addEventListener("focus", loadReports);

  return () => {
    window.removeEventListener("focus", loadReports);
  };
}, []);

  /* ===========================
     FILTRO
  =========================== */
  const filtrados = informes.filter((inf) => {
    if (filtro === "todos") return true;
    return inf.estado === filtro;
  });

  /* ===========================
     TITULO DEL HISTORIAL
  =========================== */
  const getTitulo = (inf) => {
    const cliente = inf.data?.cliente?.trim();
    const codInf = inf.data?.codInf?.trim();
    const ref = inf.data?.referenciaContrato?.trim();

    if (cliente && codInf) return `${cliente} / ${codInf}`;
    if (cliente && ref) return `${cliente} / ${ref}`;
    if (codInf) return codInf;
    if (ref) return ref;

    return "Sin referencia";
  };

  /* ===========================
     NUEVO INFORME (LIMPIO)
  =========================== */
  const nuevoInforme = () => {
    localStorage.removeItem("currentReport"); // 🔴 LIMPIA BORRADOR
    navigate("/informe/nuevo");
  };

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

        {/* CONTENEDOR */}
        <div className="bg-white p-6 rounded shadow space-y-4">

          {/* NUEVO */}
          <button
            onClick={nuevoInforme}
            className="bg-blue-600 text-white w-full py-2 rounded"
          >
            Nuevo informe
          </button>

          {/* SUBMENÚ */}
          <div className="flex gap-2 pt-4">
            {["todos", "borrador", "completado"].map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-3 py-1 text-xs border rounded ${
                  filtro === f
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {f}
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
                    {getTitulo(inf)}
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
                  <button
                    className="border px-2 py-1 text-xs rounded"
                    onClick={() => {
                      localStorage.setItem(
                        "currentReport",
                        JSON.stringify(inf)
                      );
                      navigate(`/informe/${inf.id}`);
                    }}
                  >
                    Abrir
                  </button>

                  {inf.estado === "completado" && (
                    <button
  className="bg-green-600 text-white px-2 py-1 text-xs rounded"
  onClick={() => navigate(`/informe/${inf.id}/pdf`)}
>
  PDF
</button>
                  )}

                  <button
                    className="text-red-600 text-xs"
                    onClick={() => {
                      const next = informes.filter(i => i.id !== inf.id);
                      setInformes(next);
                      localStorage.setItem(
                        "serviceReports",
                        JSON.stringify(next)
                      );
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
