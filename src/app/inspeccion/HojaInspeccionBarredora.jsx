import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import {
  markInspectionCompleted,
  getInspectionById,
} from "@utils/inspectionStorage";

/* =============================
   SECCIONES – BARREDORA
============================= */
const secciones = [
  {
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico (mangueras, acoples, bancos, cilindros y solenoides)"],
      ["A.2", "Nivel de aceite del tanque AW68, ¿se visualiza la mirilla?"],
      ["A.3", "Fugas de aceite en motores de cepillos"],
      ["A.4", "Fugas de aceite en motor de banda"],
      ["A.5", "Fugas de bombas hidráulicas"],
      ["A.6", "Fugas en motor John Deere"],
    ],
  },
  {
    id: "B",
    titulo: "B) SISTEMA DE CONTROL DE POLVO (AGUA)",
    items: [
      ["B.1", "Inspección de fugas de agua (mangueras, acoples)"],
      ["B.2", "Estado del filtro para agua"],
      ["B.3", "Estado de válvulas check"],
      ["B.4", "Estado de solenoides de apertura de agua"],
      ["B.5", "Estado de la bomba eléctrica de agua"],
      ["B.6", "Estado de los aspersores de cepillos"],
      ["B.7", "Estado de la manguera de carga de agua hidrante"],
      ["B.8", "Inspección del medidor de nivel del tanque"],
      ["B.9", "Inspección del sistema de llenado de agua"],
    ],
  },
  {
    id: "C",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      ["C.1", "Inspección visual de conectores de bancos de control"],
      ["C.2", "Evaluar funcionamiento al encender el equipo"],
      ["C.3", "Estado del tablero de control de cabina"],
      ["C.4", "Inspección de batería"],
      ["C.5", "Inspección de luces externas"],
      ["C.6", "Diagnóstico con service tool (opcional)"],
      ["C.7", "Estado del limpia parabrisas"],
      ["C.8", "Conexiones externas (GPS / radio)"],
    ],
  },
  {
    id: "D",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      ["D.1", "Estado de la banda"],
      ["D.2", "Estado de las cerdas de los cepillos"],
      ["D.3", "Estado de la tolva"],
      ["D.4", "Funcionamiento de la tolva"],
      ["D.5", "Funcionamiento de la banda"],
      ["D.6", "Estado de zapatas de arrastre"],
    ],
  },
  {
    id: "E",
    titulo: "E) MOTOR JOHN DEERE",
    items: [
      ["E.1", "Estado de filtros de aire 1° y 2°"],
      ["E.2", "Filtro combustible trampa de agua"],
      ["E.3", "Filtro de combustible"],
      ["E.4", "Filtro de aceite"],
      ["E.5", "Nivel de aceite de motor"],
      ["E.6", "Estado y nivel del refrigerante"],
      ["E.7", "Filtro A/C cabina"],
    ],
  },
];

const initialFormData = {
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
};

export default function HojaInspeccionBarredora() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  const [formData, setFormData] = useState(initialFormData);

  /* =============================
     CARGA DE INSPECCIÓN (IGUAL HIDRO)
  ============================= */
  useEffect(() => {
    const found = getInspectionById("barredora", id);
    if (found?.data) {
      setFormData({
        ...initialFormData,
        ...found.data,
        items: found.data.items || {},
        estadoEquipoPuntos: found.data.estadoEquipoPuntos || [],
      });
    }
  }, [id]);

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

  const clearAllPoints = () => {
    setFormData((p) => ({ ...p, estadoEquipoPuntos: [] }));
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

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >

      {/* ================= ENCABEZADO ================= */}
      <section className="border rounded overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <tbody>
            <tr className="border-b">
              <td rowSpan={4} className="w-32 border-r p-3 text-center">
                <img src="/astap-logo.jpg" className="mx-auto max-h-20" />
              </td>
              <td colSpan={2} className="border-r text-center font-bold">
                HOJA DE INSPECCIÓN BARREDORA
              </td>
              <td className="p-2">
                <div>Fecha versión: <strong>01-01-26</strong></div>
                <div>Versión: <strong>01</strong></div>
              </td>
            </tr>
            {[
              ["REFERENCIA DE CONTRATO", "referenciaContrato"],
              ["DESCRIPCIÓN", "descripcion"],
              ["COD. INF.", "codInf"],
            ].map(([label, name]) => (
              <tr key={name} className="border-b">
                <td className="border-r p-2 font-semibold">{label}</td>
                <td colSpan={2} className="p-2">
                  <input
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className="w-full border p-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ================= DATOS SERVICIO ================= */}
      <section className="grid md:grid-cols-2 gap-3 border rounded p-4">
        {[
          ["cliente", "Cliente"],
          ["direccion", "Dirección"],
          ["contacto", "Contacto"],
          ["telefono", "Teléfono"],
          ["correo", "Correo"],
          ["tecnicoResponsable", "Técnico responsable"],
          ["telefonoTecnico", "Teléfono técnico"],
          ["correoTecnico", "Correo técnico"],
        ].map(([n, p]) => (
          <input
            key={n}
            name={n}
            value={formData[n]}
            placeholder={p}
            onChange={handleChange}
            className="input"
          />
        ))}
        <input
          type="date"
          name="fechaServicio"
          value={formData.fechaServicio}
          onChange={handleChange}
          className="input md:col-span-2"
        />
      </section>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <section className="border rounded p-4 space-y-3">
        <div className="flex justify-between items-center">
          <p className="font-semibold">Estado del equipo</p>
          <button
            type="button"
            onClick={clearAllPoints}
            className="text-xs border px-2 py-1 rounded"
          >
            Limpiar puntos
          </button>
        </div>

        <div
          className="relative border rounded cursor-crosshair"
          onClick={handleImageClick}
        >
          <img
            src="/estado equipo barredora.png"
            className="w-full"
            draggable={false}
          />
          {formData.estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              onDoubleClick={() => handleRemovePoint(pt.id)}
              className="absolute bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full cursor-pointer"
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
          <div key={pt.id} className="flex gap-2">
            <span className="font-semibold">{pt.id})</span>
            <input
              className="flex-1 border p-1"
              value={pt.nota}
              onChange={(e) => handleNotaChange(pt.id, e.target.value)}
            />
          </div>
        ))}
      </section>

      {/* ================= TABLAS ================= */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th>Ítem</th>
                <th>Detalle</th>
                <th>SI</th>
                <th>NO</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map(([codigo, texto]) => (
                <tr key={codigo}>
                  <td>{codigo}</td>
                  <td>{texto}</td>
                  <td className="text-center">
                    <input
                      type="radio"
                      name={`estado-${codigo}`}
                      checked={formData.items[codigo]?.estado === "SI"}
                      onChange={() =>
                        handleItemChange(codigo, "estado", "SI")
                      }
                    />
                  </td>
                  <td className="text-center">
                    <input
                      type="radio"
                      name={`estado-${codigo}`}
                      checked={formData.items[codigo]?.estado === "NO"}
                      onChange={() =>
                        handleItemChange(codigo, "estado", "NO")
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="w-full border px-1"
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

      {/* ================= DATOS EQUIPO ================= */}
      <section className="border rounded p-4">
        <h2 className="font-semibold text-center mb-2">
          DESCRIPCIÓN DEL EQUIPO
        </h2>
        <div className="grid grid-cols-4 gap-2 text-sm">
          {[
            ["nota", "NOTA"],
            ["marca", "MARCA"],
            ["modelo", "MODELO"],
            ["serie", "N° SERIE"],
            ["anioModelo", "AÑO MODELO"],
            ["vin", "VIN / CHASIS"],
            ["placa", "PLACA"],
            ["horasModulo", "HORAS MÓDULO"],
            ["horasChasis", "HORAS CHASIS"],
            ["kilometraje", "KILOMETRAJE"],
          ].map(([n, l]) => (
            <div key={n} className="contents">
              <label className="font-semibold">{l}</label>
              <input
                name={n}
                value={formData[n]}
                onChange={handleChange}
                className="col-span-3 border p-1"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ================= FIRMAS ================= */}
      <section className="border rounded p-4">
        <div className="grid md:grid-cols-2 gap-6 text-center">
          <div>
            <p className="font-semibold mb-1">FIRMA TÉCNICO ASTAP</p>
            <SignatureCanvas
              ref={firmaTecnicoRef}
              canvasProps={{ className: "border w-full h-32" }}
            />
          </div>
          <div>
            <p className="font-semibold mb-1">FIRMA CLIENTE</p>
            <SignatureCanvas
              ref={firmaClienteRef}
              canvasProps={{ className: "border w-full h-32" }}
            />
          </div>
        </div>
      </section>

      {/* ================= BOTONES ================= */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate("/inspeccion")}
          className="border px-4 py-2 rounded"
        >
          Volver
        </button>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Guardar y completar
        </button>
      </div>
    </form>
  );
}
