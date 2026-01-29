import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import {
  markInspectionCompleted,
  getInspectionById,
} from "@/utils/inspectionStorage";

/* =============================
   SECCIONES – CÁMARA V-CAM
============================= */
const secciones = [
  {
    id: "1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS",
    items: [
      ["1.1", "Prueba de encendido general del equipo"],
      ["1.2", "Verificación de funcionamiento de controles principales"],
      ["1.3", "Revisión de alarmas o mensajes de fallo"],
    ],
  },
  {
    id: "2",
    titulo: "2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O SISTEMAS",
    items: [
      ["A.1", "Estructura del carrete sin deformaciones"],
      ["A.2", "Pintura y acabado sin corrosión"],
      ["A.3", "Manivela y freno en buen estado"],
      ["A.4", "Base estable sin vibraciones"],
      ["A.5", "Ruedas en buen estado"],
      ["A.6", "Cable sin cortes ni aplastamientos"],
      ["A.7", "Recubrimiento sin grietas"],
      ["A.8", "Longitud correcta del cable"],
      ["A.9", "Marcadores visibles"],
      ["A.10", "Enrollado uniforme"],
      ["A.11", "Cable limpio"],
      ["A.12", "Lubricación correcta"],
      ["A.13", "Protecciones instaladas"],
      ["A.14", "Empaque en buen estado"],
      ["A.15", "Sin fugas"],
      ["A.16", "Protección frontal intacta"],
      ["A.17", "Lente sin rayaduras"],
      ["A.18", "Iluminación LED funcional"],
      ["A.19", "Imagen estable"],
      ["A.20", "Sin interferencias"],
      ["A.21", "Control de intensidad LED"],
    ],
  },
];

export default function HojaInspeccionCamara() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  /* =============================
     ESTADO BASE (IGUAL A HIDRO)
  ============================= */
  const baseState = {
    referenciaContrato: "",
    descripcion: "",
    codInf: "",
    fechaInspeccion: "",

    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    tecnicoResponsable: "",
    telefonoTecnico: "",
    correoTecnico: "",

    estadoEquipoPuntos: [],
    items: {},
    firmas: {
      tecnico: "",
      cliente: "",
    },
  };

  const [formData, setFormData] = useState(baseState);

  /* =============================
     CARGAR INSPECCIÓN
  ============================= */
  useEffect(() => {
    if (!id) return;
    const stored = getInspectionById("camara", id);
    if (stored?.data) {
      setFormData({
        ...baseState,
        ...stored.data,
        estadoEquipoPuntos: stored.data.estadoEquipoPuntos || [],
        items: stored.data.items || {},
        firmas: stored.data.firmas || { tecnico: "", cliente: "" },
      });
    }
  }, [id]);

  /* =============================
     RECARGAR FIRMAS
  ============================= */
  useEffect(() => {
    if (formData.firmas?.tecnico && firmaTecnicoRef.current) {
      firmaTecnicoRef.current.clear();
      firmaTecnicoRef.current.fromDataURL(formData.firmas.tecnico);
    }
    if (formData.firmas?.cliente && firmaClienteRef.current) {
      firmaClienteRef.current.clear();
      firmaClienteRef.current.fromDataURL(formData.firmas.cliente);
    }
  }, [formData.firmas]);

  /* =============================
     HANDLERS
  ============================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

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

  /* =============================
     PUNTOS ROJOS
  ============================= */
  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: [
        ...p.estadoEquipoPuntos,
        { id: p.estadoEquipoPuntos.length + 1, x, y, nota: "" },
      ],
    }));
  };

  const handleRemovePoint = (pid) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos
        .filter((pt) => pt.id !== pid)
        .map((pt, i) => ({ ...pt, id: i + 1 })),
    }));
  };

  const handleNotaChange = (pid, value) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos.map((pt) =>
        pt.id === pid ? { ...pt, nota: value } : pt
      ),
    }));
  };

  /* =============================
     SUBMIT
  ============================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    markInspectionCompleted("camara", id, {
      ...formData,
      firmas: {
        tecnico: firmaTecnicoRef.current?.toDataURL() || "",
        cliente: firmaClienteRef.current?.toDataURL() || "",
      },
    });

    navigate("/inspeccion");
  };

  /* =============================
     RENDER
  ============================= */
  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm">

      {/* ESTADO DEL EQUIPO */}
      <section className="border rounded p-4 space-y-3">
        <p className="font-semibold">Estado del equipo</p>

        <div className="relative border rounded cursor-crosshair" onClick={handleImageClick}>
          <img src="/estado equipo camara.png" className="w-full" draggable={false} />
          {formData.estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              onDoubleClick={() => handleRemovePoint(pt.id)}
              className="absolute bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full"
              style={{ left: `${pt.x}%`, top: `${pt.y}%`, transform: "translate(-50%, -50%)" }}
            >
              {pt.id}
            </div>
          ))}
        </div>

        {formData.estadoEquipoPuntos.map((pt) => (
          <input
            key={pt.id}
            className="w-full border p-1"
            placeholder={`Observación punto ${pt.id}`}
            value={pt.nota}
            onChange={(e) => handleNotaChange(pt.id, e.target.value)}
          />
        ))}
      </section>

      {/* TABLAS */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
          <table className="w-full text-xs border">
            <thead className="bg-gray-100">
              <tr>
                <th>Ítem</th>
                <th>Detalle</th>
                <th>Estado</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map(([codigo, texto]) => (
                <tr key={codigo}>
                  <td>{codigo}</td>
                  <td>{texto}</td>
                  <td>{formData.items[codigo]?.estado || "—"}</td>
                  <td>
                    <input
                      className="w-full border px-1"
                      value={formData.items[codigo]?.observacion || ""}
                      onChange={(e) =>
                        handleItemChange(codigo, "observacion", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* FIRMAS */}
      <section className="border rounded p-4 grid md:grid-cols-2 gap-6 text-center">
        <div>
          <p className="font-semibold mb-1">FIRMA TÉCNICO ASTAP</p>
          <SignatureCanvas ref={firmaTecnicoRef} canvasProps={{ className: "border w-full h-32" }} />
        </div>
        <div>
          <p className="font-semibold mb-1">FIRMA CLIENTE</p>
          <SignatureCanvas ref={firmaClienteRef} canvasProps={{ className: "border w-full h-32" }} />
        </div>
      </section>

      {/* BOTONES */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => navigate("/inspeccion")} className="border px-4 py-2 rounded">
          Volver
        </button>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Guardar informe
        </button>
      </div>
    </form>
  );
}
