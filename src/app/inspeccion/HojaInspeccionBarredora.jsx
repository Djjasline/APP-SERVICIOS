import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES – BARREDORA (OFICIAL)
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
      ["C.2", "Evaluar funcionamiento de elementos al encender el equipo"],
      ["C.3", "Estado del tablero de control de cabina"],
      ["C.4", "Inspección de batería"],
      ["C.5", "Inspección de luces externas"],
      ["C.6", "Diagnóstico y conexión con service tool (opcional)"],
      ["C.7", "Inspección de limpia parabrisas"],
      ["C.8", "Verificación de conexiones externas (GPS / radiocomunicación)"],
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
      ["D.6", "Estado de zapatas de arrastre cortas y largas"],
    ],
  },
  {
    id: "E",
    titulo: "E) MOTOR JOHN DEERE",
    items: [
      ["E.1", "Estado de filtros de aire 1° y 2°"],
      ["E.2", "Estado de filtro combustible trampa de agua"],
      ["E.3", "Estado de filtro de combustible"],
      ["E.4", "Estado de filtro de aceite"],
      ["E.5", "Nivel de aceite de motor"],
      ["E.6", "Estado y nivel del refrigerante"],
      ["E.7", "Estado filtro de A/C cabina"],
    ],
  },
];

export default function HojaInspeccionBarredora() {
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
    fechaServicio: "",

    estadoEquipoDetalle: "",
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
  });

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

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: [
        ...p.estadoEquipoPuntos,
        { id: p.estadoEquipoPuntos.length + 1, x, y },
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const firmas = {
      tecnico: firmaTecnicoRef.current?.toDataURL() || "",
      cliente: firmaClienteRef.current?.toDataURL() || "",
    };

    markInspectionCompleted("barredora", id, {
      ...formData,
      firmas,
    });

    navigate("/inspeccion");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm">

      {/* ENCABEZADO */}
      <section className="border rounded overflow-hidden">
        <table className="w-full text-xs border-collapse">
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
                  <input name={name} onChange={handleChange} className="w-full border p-1" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* DATOS DEL SERVICIO */}
      <section className="grid md:grid-cols-2 gap-3 border rounded p-4">
        <input name="cliente" placeholder="Cliente" onChange={handleChange} className="input" />
        <input name="direccion" placeholder="Dirección" onChange={handleChange} className="input" />
        <input name="contacto" placeholder="Contacto" onChange={handleChange} className="input" />
        <input name="telefono" placeholder="Teléfono" onChange={handleChange} className="input" />
        <input name="correo" placeholder="Correo" onChange={handleChange} className="input" />
        <input name="tecnicoResponsable" placeholder="Técnico responsable" onChange={handleChange} className="input" />
        <input name="telefonoTecnico" placeholder="Teléfono técnico" onChange={handleChange} className="input" />
        <input name="correoTecnico" placeholder="Correo técnico" onChange={handleChange} className="input" />
        <input type="date" name="fechaServicio" onChange={handleChange} className="input md:col-span-2" />
      </section>

      {/* ESTADO DEL EQUIPO */}
      <section className="border rounded p-4 space-y-2">
        <p className="font-semibold">Estado del equipo</p>
        <div className="relative border rounded cursor-crosshair" onClick={handleImageClick}>
          <img src="/estado equipo barredora.png" className="w-full" draggable={false} />
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
        <textarea
          name="estadoEquipoDetalle"
          placeholder="Observaciones del estado del equipo"
          onChange={handleChange}
          className="w-full border p-2 min-h-[80px]"
        />
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
                  <td><input type="radio" onChange={() => handleItemChange(codigo, "estado", "SI")} /></td>
                  <td><input type="radio" onChange={() => handleItemChange(codigo, "estado", "NO")} /></td>
                  <td>
                    <input
                      className="w-full border px-1"
                      onChange={(e) => handleItemChange(codigo, "observacion", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* DATOS DEL EQUIPO */}
      <section className="border rounded p-4">
        <h2 className="font-semibold text-center mb-2">DATOS DEL EQUIPO</h2>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            ["NOTA", "nota"],
            ["MARCA", "marca"],
            ["MODELO", "modelo"],
            ["N° SERIE", "serie"],
            ["AÑO MODELO", "anioModelo"],
            ["VIN / CHASIS", "vin"],
            ["PLACA", "placa"],
            ["HORAS MÓDULO", "horasModulo"],
            ["HORAS CHASIS", "horasChasis"],
            ["KILOMETRAJE", "kilometraje"],
          ].map(([label, name]) => (
            <div key={name} className="contents">
              <label className="font-semibold">{label}</label>
              <input name={name} onChange={handleChange} className="col-span-3 border p-1" />
            </div>
          ))}
        </div>
      </section>

      {/* FIRMAS */}
      <section className="border rounded p-4">
        <div className="grid md:grid-cols-2 gap-6 text-center">
          <div>
            <p className="font-semibold mb-1">FIRMA TÉCNICO ASTAP</p>
            <SignatureCanvas ref={firmaTecnicoRef} canvasProps={{ className: "border w-full h-32" }} />
          </div>
          <div>
            <p className="font-semibold mb-1">FIRMA CLIENTE</p>
            <SignatureCanvas ref={firmaClienteRef} canvasProps={{ className: "border w-full h-32" }} />
          </div>
        </div>
      </section>

      {/* BOTONES */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => navigate("/inspeccion")} className="border px-4 py-2 rounded">
          Volver
        </button>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Guardar y completar
        </button>
      </div>
    </form>
  );
}
