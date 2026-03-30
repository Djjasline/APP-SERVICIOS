import PdfInspeccionButtons from "./components/PdfInspeccionButtons";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import {
  markInspectionCompleted,
  getInspectionById,
} from "@/utils/inspectionStorage";

/* =============================
   PRUEBAS PREVIAS
============================= */
const pruebasPrevias = [
  ["1.1", "Prueba de encendido general del equipo"],
  ["1.2", "Verificación de funcionamiento de controles principales"],
  ["1.3", "Revisión de alarmas o mensajes de fallo"],
];

/* =============================
   SECCIONES
============================= */
const secciones = [
  {
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico"],
      ["A.2", "Nivel de aceite del soplador"],
      ["A.3", "Nivel de aceite hidráulico"],
    ],
  },
  {
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      ["B.1", "Filtros malla agua"],
      ["B.2", "Empaques filtros"],
    ],
  },
];

export default function InspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  const [formData, setFormData] = useState({
    cliente: "",
    direccion: "",
    fechaServicio: "",
    items: {},
    firmas: { tecnico: "", cliente: "" },
  });

  useEffect(() => {
    if (!id) return;
    const stored = getInspectionById("hidro", id);
    if (stored?.data) setFormData(stored.data);
  }, [id]);

  const handleItemChange = (codigo, campo, valor) => {
    setFormData((p) => ({
      ...p,
      items: {
        ...p.items,
        [codigo]: {
          ...p.items[codigo],
          [campo]: valor,
        },
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    markInspectionCompleted("hidro", id, {
      ...formData,
      firmas: {
        tecnico: firmaTecnicoRef.current?.toDataURL() || "",
        cliente: firmaClienteRef.current?.toDataURL() || "",
      },
    });

    navigate("/inspeccion");
  };

  return (
    <>
      {/* ================= BOTONES PDF ================= */}
      <PdfInspeccionButtons />

      {/* ================= FORMULARIO ================= */}
      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto my-6 bg-white p-6 space-y-6 text-sm"
      >
        <h1 className="text-xl font-bold">
          HOJA DE INSPECCIÓN HIDROSUCCIONADOR
        </h1>

        <input
          placeholder="Cliente"
          value={formData.cliente}
          onChange={(e) =>
            setFormData({ ...formData, cliente: e.target.value })
          }
          className="border p-2 w-full"
        />

        <input
          placeholder="Dirección"
          value={formData.direccion}
          onChange={(e) =>
            setFormData({ ...formData, direccion: e.target.value })
          }
          className="border p-2 w-full"
        />

        <input
          type="date"
          value={formData.fechaServicio}
          onChange={(e) =>
            setFormData({ ...formData, fechaServicio: e.target.value })
          }
          className="border p-2 w-full"
        />

        {pruebasPrevias.map(([c, t]) => (
          <div key={c} className="grid grid-cols-4 gap-2">
            <span>{c}</span>
            <span className="col-span-2">{t}</span>
            <input
              type="radio"
              checked={formData.items[c]?.estado === "SI"}
              onChange={() => handleItemChange(c, "estado", "SI")}
            />
            <input
              type="radio"
              checked={formData.items[c]?.estado === "NO"}
              onChange={() => handleItemChange(c, "estado", "NO")}
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-6">
          <SignatureCanvas
            ref={firmaTecnicoRef}
            canvasProps={{ width: 300, height: 120, className: "border" }}
          />
          <SignatureCanvas
            ref={firmaClienteRef}
            canvasProps={{ width: 300, height: 120, className: "border" }}
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2">
          Guardar
        </button>
      </form>

      {/* ================= VISTA PDF (OBLIGATORIA) ================= */}
      <div className="max-w-6xl mx-auto my-12 bg-white border-t pt-10">
        <h2 className="text-center text-gray-400 mb-4">
          Vista PDF (NO borrar)
        </h2>

        <div id="pdf-inspeccion-hidro" className="p-6 text-sm bg-white">
          <img src="/astap-logo.jpg" className="h-14 mb-4" />

          <p><strong>Cliente:</strong> {formData.cliente || "—"}</p>
          <p><strong>Dirección:</strong> {formData.direccion || "—"}</p>
          <p><strong>Fecha:</strong> {formData.fechaServicio || "—"}</p>

          <hr className="my-4" />

          {[...pruebasPrevias, ...secciones.flatMap(s => s.items)].map(
            ([c, t]) => (
              <div key={c} className="grid grid-cols-4 gap-2 border-b py-1">
                <span>{c}</span>
                <span className="col-span-2">{t}</span>
                <span>{formData.items[c]?.estado || "—"}</span>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
