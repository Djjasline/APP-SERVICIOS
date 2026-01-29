import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import {
  markInspectionCompleted,
  getInspectionById,
} from "@/utils/inspectionStorage";

/* =============================
   SECCIONES – BARREDORA
============================= */
const secciones = [
  {
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico"],
      ["A.2", "Nivel de aceite del tanque AW68"],
      ["A.3", "Fugas en motores de cepillos"],
      ["A.4", "Fugas en motor de banda"],
      ["A.5", "Fugas en bombas hidráulicas"],
      ["A.6", "Fugas en motor John Deere"],
    ],
  },
  {
    id: "B",
    titulo: "B) SISTEMA DE CONTROL DE POLVO (AGUA)",
    items: [
      ["B.1", "Fugas de agua"],
      ["B.2", "Estado del filtro de agua"],
      ["B.3", "Estado de válvulas check"],
      ["B.4", "Solenoides de apertura"],
      ["B.5", "Bomba eléctrica de agua"],
      ["B.6", "Aspersores de cepillos"],
      ["B.7", "Manguera de carga de agua"],
      ["B.8", "Medidor de nivel"],
      ["B.9", "Sistema de llenado"],
    ],
  },
  {
    id: "C",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      ["C.1", "Conectores de bancos de control"],
      ["C.2", "Encendido del equipo"],
      ["C.3", "Tablero de cabina"],
      ["C.4", "Estado de batería"],
      ["C.5", "Luces externas"],
      ["C.6", "Diagnóstico con service tool"],
      ["C.7", "Limpia parabrisas"],
      ["C.8", "Conexiones externas"],
    ],
  },
  {
    id: "D",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      ["D.1", "Estado de la banda"],
      ["D.2", "Cerdas de cepillos"],
      ["D.3", "Estado de la tolva"],
      ["D.4", "Funcionamiento de tolva"],
      ["D.5", "Funcionamiento de banda"],
      ["D.6", "Zapatas de arrastre"],
    ],
  },
];

/* =============================
   BASE STATE — REGLA DE ORO
============================= */
const baseState = {
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
  fechaServicio: "",

  estadoEquipoPuntos: [],

  nota: "",
  marca: "",
  modelo: "",
  serie: "",
  anioModelo: "",
  vin: "",
  placa: "",
  horasModulo: "",
  horasChasis: "",
  kilometraje: "",

  items: {},
  firmas: {
    tecnico: "",
    cliente: "",
  },
};

export default function HojaInspeccionBarredora() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  const [formData, setFormData] = useState(baseState);

  /* =============================
     CARGAR INSPECCIÓN (EDITAR)
  ============================= */
  useEffect(() => {
    if (!id) return;

    const stored = getInspectionById("barredora", id);

    if (stored?.data) {
      setFormData({
        ...baseState,
        ...stored.data,
        estadoEquipoPuntos: stored.data.estadoEquipoPuntos || [],
        items: stored.data.items || {},
        firmas: stored.data.firmas || baseState.firmas,
      });
    }
  }, [id]);

  /* =============================
     RECARGAR FIRMAS
  ============================= */
  useEffect(() => {
    if (formData.firmas.tecnico && firmaTecnicoRef.current) {
      firmaTecnicoRef.current.clear();
      firmaTecnicoRef.current.fromDataURL(formData.firmas.tecnico);
    }
    if (formData.firmas.cliente && firmaClienteRef.current) {
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
     ESTADO DEL EQUIPO (PUNTOS)
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

  const handleNotaChange = (id, value) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos.map((pt) =>
        pt.id === id ? { ...pt, nota: value } : pt
      ),
    }));
  };

  /* =============================
     SUBMIT
  ============================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    markInspectionCompleted("barredora", id, {
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
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >
      {/* === ENCABEZADO === */}
      <h1 className="text-lg font-bold text-center">
        HOJA DE INSPECCIÓN BARREDORA
      </h1>

      {/* === DATOS CLIENTE === */}
      <section className="grid md:grid-cols-2 gap-3 border rounded p-4">
        {[
          ["cliente", "Cliente"],
          ["direccion", "Dirección"],
          ["contacto", "Contacto"],
          ["telefono", "Teléfono"],
          ["correo", "Correo"],
        ].map(([n, p]) => (
          <input
            key={n}
            name={n}
            placeholder={p}
            value={formData[n]}
            onChange={handleChange}
            className="border p-2"
          />
        ))}
        <input
          type="date"
          name="fechaServicio"
          value={formData.fechaServicio}
          onChange={handleChange}
          className="border p-2 md:col-span-2"
        />
      </section>

      {/* === ESTADO DEL EQUIPO === */}
      <section className="border rounded p-4">
        <img
          src="/estado-equipo-barredora.png"
          className="w-full cursor-crosshair"
          onClick={handleImageClick}
        />
        {formData.estadoEquipoPuntos.map((pt) => (
          <div key={pt.id} className="mt-1">
            <strong>{pt.id})</strong>
            <input
              className="w-full border p-1"
              value={pt.nota}
              onChange={(e) => handleNotaChange(pt.id, e.target.value)}
            />
          </div>
        ))}
      </section>

      {/* === TABLAS === */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
          <table className="w-full text-sm border">
            <tbody>
              {sec.items.map(([codigo, texto]) => (
                <tr key={codigo}>
                  <td>{codigo}</td>
                  <td>{texto}</td>
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[codigo]?.estado === "SI"}
                      onChange={() =>
                        handleItemChange(codigo, "estado", "SI")
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[codigo]?.estado === "NO"}
                      onChange={() =>
                        handleItemChange(codigo, "estado", "NO")
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="w-full border"
                      value={formData.items[codigo]?.observacion || ""}
                      onChange={(e) =>
                        handleItemChange(
                          codigo,
                          "observacion",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* === FIRMAS === */}
      <section className="grid grid-cols-2 gap-4">
        <SignatureCanvas ref={firmaTecnicoRef} canvasProps={{ className: "border w-full h-32" }} />
        <SignatureCanvas ref={firmaClienteRef} canvasProps={{ className: "border w-full h-32" }} />
      </section>

      {/* === BOTONES === */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => navigate("/inspeccion")}>
          Volver
        </button>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2">
          Guardar informe
        </button>
      </div>
    </form>
  );
}
