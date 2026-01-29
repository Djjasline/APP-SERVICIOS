import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import {
  markInspectionCompleted,
  getInspectionById,
} from "@utils/inspectionStorage";

/* =============================
   SECCIONES – CÁMARA
============================= */
const secciones = [
  {
    id: "sec1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    items: [
      ["1.1", "Prueba de encendido general del equipo"],
      ["1.2", "Verificación de funcionamiento de controles principales"],
      ["1.3", "Revisión de alarmas o mensajes de fallo"],
    ],
  },
  {
    id: "secA",
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

  const [formData, setFormData] = useState({
    referenciaContrato: "",
    descripcion: "",
    codInf: "",
    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    tecnicoResponsable: "",
    telefonoTecnico: "",
    correoTecnico: "",
    fechaInspeccion: "",
    estadoEquipoPuntos: [],
    items: {},
    firmas: {
      tecnico: "",
      cliente: "",
    },
  });

  /* =============================
     CARGA DESDE HISTORIAL (CLAVE)
  ============================= */
  useEffect(() => {
    const saved = getInspectionById("camara", id);
    if (saved) {
      setFormData(saved);

      if (saved.firmas?.tecnico && firmaTecnicoRef.current) {
        firmaTecnicoRef.current.fromDataURL(saved.firmas.tecnico);
      }
      if (saved.firmas?.cliente && firmaClienteRef.current) {
        firmaClienteRef.current.fromDataURL(saved.firmas.cliente);
      }
    }
  }, [id]);

  /* =============================
     HANDLERS GENERALES
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
     PUNTOS ROJOS – ESTADO EQUIPO
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

  const handleRemovePoint = (id) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos
        .filter((pt) => pt.id !== id)
        .map((pt, i) => ({ ...pt, id: i + 1 })),
    }));
  };

  const handleNotaChange = (id, value) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos.map((pt) =>
        pt.id === id ? { ...pt, nota: value } : pt
      ),
    }));
  };

  const clearAllPoints = () => {
    setFormData((p) => ({ ...p, estadoEquipoPuntos: [] }));
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

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >
      {/* ENCABEZADO */}
      <section className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td rowSpan={3} className="w-32 p-3 text-center border-r">
                <img src="/astap-logo.jpg" className="mx-auto max-h-20" />
              </td>
              <td colSpan={2} className="text-center font-bold border-r">
                HOJA DE INSPECCIÓN CÁMARA
              </td>
              <td className="p-2">Versión 01</td>
            </tr>
            {[
              ["REFERENCIA DE CONTRATO", "referenciaContrato"],
              ["DESCRIPCIÓN", "descripcion"],
              ["COD. INF.", "codInf"],
            ].map(([l, n]) => (
              <tr key={n}>
                <td className="font-semibold p-2 border-r">{l}</td>
                <td colSpan={2} className="p-2">
                  <input
                    name={n}
                    value={formData[n]}
                    onChange={handleChange}
                    className="w-full border p-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ESTADO DEL EQUIPO */}
      <section className="border rounded p-4 space-y-3">
        <div className="flex justify-between">
          <strong>Estado del equipo</strong>
          <button type="button" onClick={clearAllPoints} className="text-xs border px-2">
            Limpiar puntos
          </button>
        </div>

        <div className="relative border" onClick={handleImageClick}>
          <img src="/estado equipo camara.png" className="w-full" />
          {formData.estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              onDoubleClick={() => handleRemovePoint(pt.id)}
              className="absolute bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs"
              style={{
                left: `${pt.x}%`,
                top: `${pt.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {pt.id}
            </div>
          ))}
        </div>

        {formData.estadoEquipoPuntos.map((pt) => (
          <input
            key={pt.id}
            className="w-full border p-1"
            value={pt.nota}
            placeholder={`Observación punto ${pt.id}`}
            onChange={(e) => handleNotaChange(pt.id, e.target.value)}
          />
        ))}
      </section>

      {/* TABLAS */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
          <table className="w-full border text-sm">
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Detalle</th>
                <th>SI</th>
                <th>NO</th>
                <th>Obs.</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map(([codigo, texto]) => (
                <tr key={codigo}>
                  <td>{codigo}</td>
                  <td>{texto}</td>
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[codigo]?.estado === "SI"}
                      onChange={() => handleItemChange(codigo, "estado", "SI")}
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[codigo]?.estado === "NO"}
                      onChange={() => handleItemChange(codigo, "estado", "NO")}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full border"
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
          <strong>Firma Técnico</strong>
          <SignatureCanvas ref={firmaTecnicoRef} canvasProps={{ className: "border w-full h-32" }} />
        </div>
        <div>
          <strong>Firma Cliente</strong>
          <SignatureCanvas ref={firmaClienteRef} canvasProps={{ className: "border w-full h-32" }} />
        </div>
      </section>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => navigate("/inspeccion")} className="border px-4 py-2">
          Volver
        </button>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Guardar y completar
        </button>
      </div>
    </form>
  );
}
