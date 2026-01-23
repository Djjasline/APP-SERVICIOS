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
      {/* BOTONES PDF (flotantes) */}
      <PdfInspeccionButtons />

      {/* =============================
          CONTENEDOR PDF (SOLO HTML)
      ============================== */}
      <div
        id="pdf-inspeccion-hidro"
        style={{ background: "#fff", padding: "24px" }}
      >
        <div className="flex items-center gap-4 border-b pb-4 mb-4">
          <img src="/astap-logo.jpg" className="h-16" />
          <h1 className="text-xl font-bold">
            HOJA DE INSPECCIÓN HIDROSUCCIONADOR
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-6">
          <div><strong>Cliente:</strong> {formData.cliente || "—"}</div>
          <div><strong>Dirección:</strong> {formData.direccion || "—"}</div>
          <div><strong>Contacto:</strong> {formData.contacto || "—"}</div>
          <div><strong>Teléfono:</strong> {formData.telefono || "—"}</div>
          <div><strong>Correo:</strong> {formData.correo || "—"}</div>
          <div><strong>Fecha servicio:</strong> {formData.fechaServicio || "—"}</div>
        </div>

        {[...pruebasPrevias, ...secciones.flatMap(s => s.items)].map(
          ([codigo, texto]) => (
            <div key={codigo} className="grid grid-cols-5 gap-2 border-b py-1 text-sm">
              <span>{codigo}</span>
              <span className="col-span-2">{texto}</span>
              <span>{formData.items[codigo]?.estado || "—"}</span>
              <span>{formData.items[codigo]?.observacion || ""}</span>
            </div>
          )
        )}

        <div className="grid grid-cols-2 gap-6 mt-8 text-center">
          <div>
            <p className="font-semibold mb-2">Firma técnico</p>
            {formData.firmas.tecnico && (
              <img src={formData.firmas.tecnico} className="border mx-auto h-32" />
            )}
          </div>
          <div>
            <p className="font-semibold mb-2">Firma cliente</p>
            {formData.firmas.cliente && (
              <img src={formData.firmas.cliente} className="border mx-auto h-32" />
            )}
          </div>
        </div>
      </div>

      {/* =============================
          FORMULARIO REAL (INTERACTIVO)
      ============================== */}
      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto my-6 bg-white p-6 space-y-6 text-sm"
      >
        {/* AQUÍ SIGUE TU FORMULARIO TAL CUAL LO TENÍAS */}
        {/* inputs, radios, firmas canvas, etc */}

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate("/inspeccion")}>
            Volver
          </button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2">
            Guardar informe
          </button>
        </div>
      </form>
    </>
  );
}
