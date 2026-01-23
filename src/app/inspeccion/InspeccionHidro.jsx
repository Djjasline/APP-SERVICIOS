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
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico"],
      ["A.2", "Nivel de aceite del soplador"],
      ["A.3", "Nivel de aceite hidráulico"],
      ["A.4", "Nivel de aceite caja transferencia"],
      ["A.5", "Manómetro filtro hidráulico"],
      ["A.6", "Filtro hidráulico retorno"],
      ["A.7", "Filtros succión tanque"],
      ["A.8", "Cilindros hidráulicos"],
      ["A.9", "Tapones drenaje"],
      ["A.10", "Bancos hidráulicos"],
    ],
  },
  {
    id: "B",
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      ["B.1", "Filtros malla agua"],
      ["B.2", "Empaques filtros"],
      ["B.3", "Fugas agua"],
      ["B.4", "Válvula alivio pistola"],
      ["B.5", "Tanque aluminio"],
      ["B.6", "Medidor nivel"],
      ["B.7", "Tapón expansión"],
      ["B.8", "Drenaje bomba"],
      ["B.9", "Válvulas check"],
      ["B.10", "Manómetros presión"],
    ],
  },
  {
    id: "C",
    titulo: "C) SISTEMA ELÉCTRICO",
    items: [
      ["C.1", "Tablero frontal"],
      ["C.2", "Tablero cabina"],
      ["C.3", "Control remoto"],
      ["C.4", "Electroválvulas"],
      ["C.5", "Humedad"],
      ["C.6", "Luces externas"],
    ],
  },
  {
    id: "D",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      ["D.1", "Sellos tanque"],
      ["D.2", "Interior tanque"],
      ["D.3", "Microfiltro"],
      ["D.4", "Tapón drenaje"],
      ["D.5", "Mangueras"],
      ["D.6", "Seguros compuerta"],
      ["D.7", "Sistema desfogue"],
      ["D.8", "Válvulas alivio"],
      ["D.9", "Soplador"],
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
    contacto: "",
    telefono: "",
    correo: "",
    tecnicoResponsable: "",
    fechaServicio: "",
    estadoEquipoPuntos: [],
    items: {},
    descripcionEquipo: "",
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
      {/* 🔑 BOTONES PDF */}
      <PdfInspeccionButtons />

      {/* 🔑 CONTENEDOR PDF */}
      <div id="pdf-inspeccion-hidro">
        <form
          onSubmit={handleSubmit}
          className="max-w-6xl mx-auto my-6 bg-white p-6 space-y-6 text-sm"
        >
          {/* ENCABEZADO */}
          <div className="flex items-center gap-4 border-b pb-4">
            <img src="/astap-logo.jpg" className="h-16" />
            <h1 className="text-xl font-bold">
              HOJA DE INSPECCIÓN HIDROSUCCIONADOR
            </h1>
          </div>

          {/* DATOS */}
          <div className="grid grid-cols-2 gap-3">
            {["cliente", "direccion", "contacto", "telefono", "correo"].map(
              (f) => (
                <input
                  key={f}
                  placeholder={f}
                  value={formData[f]}
                  onChange={(e) =>
                    setFormData({ ...formData, [f]: e.target.value })
                  }
                  className="border p-2"
                />
              )
            )}
          </div>

          {/* PRUEBAS */}
          <table className="w-full border">
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Detalle</th>
                <th>SI</th>
                <th>NO</th>
                <th>Obs</th>
              </tr>
            </thead>
            <tbody>
              {pruebasPrevias.map(([c, t]) => (
                <tr key={c}>
                  <td>{c}</td>
                  <td>{t}</td>
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[c]?.estado === "SI"}
                      onChange={() => handleItemChange(c, "estado", "SI")}
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[c]?.estado === "NO"}
                      onChange={() => handleItemChange(c, "estado", "NO")}
                    />
                  </td>
                  <td>
                    <input
                      className="border"
                      value={formData.items[c]?.observacion || ""}
                      onChange={(e) =>
                        handleItemChange(c, "observacion", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* SECCIONES */}
          {secciones.map((s) => (
            <div key={s.id}>
              <h2 className="font-semibold mt-4">{s.titulo}</h2>
              {s.items.map(([c, t]) => (
                <div key={c} className="grid grid-cols-5 gap-2">
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
            </div>
          ))}

          {/* FIRMAS */}
          <div className="grid grid-cols-2 gap-6">
            <SignatureCanvas
              ref={firmaTecnicoRef}
              canvasProps={{ width: 400, height: 150, className: "border" }}
            />
            <SignatureCanvas
              ref={firmaClienteRef}
              canvasProps={{ width: 400, height: 150, className: "border" }}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate("/inspeccion")}>
              Volver
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2">
              Guardar informe
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
