import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES DE INSPECCIÓN BARREDORA
============================= */
const secciones = [
  {
    id: "secA",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      { codigo: "A.1", texto: "Fugas de aceite hidráulico (mangueras, acoples, bancos, cilindros y solenoides)" },
      { codigo: "A.2", texto: "Nivel de aceite del tanque AW68, ¿se visualiza la mirilla?" },
      { codigo: "A.3", texto: "Fugas de aceite en motores de cepillos" },
      { codigo: "A.4", texto: "Fugas de aceite en motor de banda" },
      { codigo: "A.5", texto: "Fugas de bombas hidráulicas" },
      { codigo: "A.6", texto: "Fugas en motor John Deere" },
    ],
  },
  {
    id: "secB",
    titulo: "B) SISTEMA DE CONTROL DE POLVO (AGUA)",
    items: [
      { codigo: "B.1", texto: "Inspección de fugas de agua (mangueras, acoples)" },
      { codigo: "B.2", texto: "Estado del filtro para agua" },
      { codigo: "B.3", texto: "Estado de válvulas check" },
      { codigo: "B.4", texto: "Estado de solenoides de apertura de agua" },
      { codigo: "B.5", texto: "Estado de la bomba eléctrica de agua" },
      { codigo: "B.6", texto: "Estado de los aspersores de cepillos" },
      { codigo: "B.7", texto: "Estado de la manguera de carga de agua hidrante" },
      { codigo: "B.8", texto: "Inspección del medidor de nivel del tanque" },
      { codigo: "B.9", texto: "Inspección del sistema de llenado de agua" },
    ],
  },
  {
    id: "secC",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      { codigo: "C.1", texto: "Inspección visual de conectores (sockets) de bancos de control" },
      { codigo: "C.2", texto: "Evaluar funcionamiento de elementos al encender el equipo" },
      { codigo: "C.3", texto: "Estado del tablero de control de cabina" },
      { codigo: "C.4", texto: "Inspección de batería" },
      { codigo: "C.5", texto: "Inspección de luces externas" },
      { codigo: "C.6", texto: "Diagnóstico y conexión con service tool (opcional)" },
      { codigo: "C.7", texto: "Inspección de limpia parabrisas" },
      { codigo: "C.8", texto: "Verificación de conexiones externas (GPS / radiocomunicación)" },
    ],
  },
  {
    id: "secD",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      { codigo: "D.1", texto: "Estado de la banda, aceptable" },
      { codigo: "D.2", texto: "Estado de las cerdas de los cepillos" },
      { codigo: "D.3", texto: "Estado de la tolva" },
      { codigo: "D.4", texto: "Funcionamiento aceptable de la tolva" },
      { codigo: "D.5", texto: "Funcionamiento aceptable de la banda" },
      { codigo: "D.6", texto: "Estado de zapatas de arrastre cortas y largas" },
    ],
  },
  {
    id: "secE",
    titulo: "E) MOTOR JOHN DEERE",
    items: [
      { codigo: "E.1", texto: "Estado de filtros de aire 1° y 2°" },
      { codigo: "E.2", texto: "Estado de filtro combustible trampa de agua" },
      { codigo: "E.3", texto: "Estado de filtro de combustible" },
      { codigo: "E.4", texto: "Estado de filtro de aceite" },
      { codigo: "E.5", texto: "Nivel de aceite de motor" },
      { codigo: "E.6", texto: "Estado y nivel del refrigerante" },
      { codigo: "E.7", texto: "Estado filtro de A/C cabina" },
    ],
  },
];

export default function HojaInspeccionBarredora() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    referenciaContrato: "",
    descripcion: "",
    codInf: "",
    fechaInspeccion: "",
    ubicacion: "",
    cliente: "",
    contactoCliente: "",
    telefonoCliente: "",
    correoCliente: "",
    tecnicoResponsable: "",
    telefonoTecnico: "",
    correoTecnico: "",
    estadoEquipoDetalle: "",
    estadoEquipoPuntos: [],
    notaEquipo: "",
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
    markInspectionCompleted("barredora", id, formData);
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
              <td colSpan={2} className="border-r text-center font-bold py-2">
                HOJA DE INSPECCIÓN BARREDORA
              </td>
              <td className="w-48 p-2">
                <div>Fecha de versión: <strong>01-01-26</strong></div>
                <div>Versión: <strong>01</strong></div>
              </td>
            </tr>
            <tr className="border-b">
              <td className="border-r p-2 font-semibold">REFERENCIA DE CONTRATO</td>
              <td colSpan={2} className="p-2">
                <input name="referenciaContrato" onChange={handleChange} className="w-full border p-1" />
              </td>
            </tr>
            <tr className="border-b">
              <td className="border-r p-2 font-semibold">DESCRIPCIÓN</td>
              <td colSpan={2} className="p-2">
                <input name="descripcion" onChange={handleChange} className="w-full border p-1" />
              </td>
            </tr>
            <tr>
              <td className="border-r p-2 font-semibold">COD. INF.</td>
              <td colSpan={2} className="p-2">
                <input name="codInf" onChange={handleChange} className="w-full border p-1" />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* DATOS SERVICIO */}
      <section className="grid md:grid-cols-2 gap-3 border rounded p-4">
        <input type="date" name="fechaInspeccion" onChange={handleChange} className="border p-2" />
        <input name="ubicacion" placeholder="Ubicación" onChange={handleChange} className="border p-2" />
        <input name="cliente" placeholder="Cliente" onChange={handleChange} className="border p-2" />
        <input name="contactoCliente" placeholder="Contacto cliente" onChange={handleChange} className="border p-2" />
        <input name="telefonoCliente" placeholder="Teléfono cliente" onChange={handleChange} className="border p-2" />
        <input name="correoCliente" placeholder="Correo cliente" onChange={handleChange} className="border p-2" />
        <input name="tecnicoResponsable" placeholder="Técnico responsable" onChange={handleChange} className="border p-2" />
        <input name="telefonoTecnico" placeholder="Teléfono técnico" onChange={handleChange} className="border p-2" />
        <input name="correoTecnico" placeholder="Correo técnico" onChange={handleChange} className="border p-2 md:col-span-2" />
      </section>

      {/* ESTADO DEL EQUIPO */}
      <section className="border rounded p-4 space-y-2">
        <p className="font-semibold">Estado del equipo</p>
        <div className="relative border rounded cursor-crosshair" onClick={handleImageClick}>
          <img src="/estado equipo barredora.png" className="w-full" draggable={false} />
          {formData.estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleRemovePoint(pt.id);
              }}
              className="absolute bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full"
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
        <textarea
          name="estadoEquipoDetalle"
          placeholder="Detalle del estado del equipo"
          onChange={handleChange}
          className="w-full border p-2 min-h-[80px]"
        />
      </section>

      {/* SECCIONES */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
          <table className="w-full text-xs border">
            <thead className="bg-gray-100">
              <tr>
                <th>Ítem</th>
                <th>Detalle</th>
                <th>Sí</th>
                <th>No</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map((item) => (
                <tr key={item.codigo}>
                  <td>{item.codigo}</td>
                  <td>{item.texto}</td>
                  <td><input type="radio" onChange={() => handleItemChange(item.codigo, "estado", "SI")} /></td>
                  <td><input type="radio" onChange={() => handleItemChange(item.codigo, "estado", "NO")} /></td>
                  <td>
                    <input
                      className="w-full border px-1"
                      onChange={(e) =>
                        handleItemChange(item.codigo, "observacion", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* DESCRIPCIÓN EQUIPO */}
      <section className="border rounded p-4 space-y-2 text-xs">
        <h2 className="font-semibold text-center">DESCRIPCIÓN DEL EQUIPO</h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            ["NOTA", "notaEquipo"],
            ["MARCA", "marca"],
            ["MODELO", "modelo"],
            ["N° SERIE", "serie"],
            ["AÑO MODELO", "anioModelo"],
            ["VIN / CHASIS", "vin"],
            ["PLACA", "placa"],
            ["HORAS TRABAJO MÓDULO", "horasModulo"],
            ["HORAS TRABAJO CHASIS", "horasChasis"],
            ["KILOMETRAJE", "kilometraje"],
          ].map(([label, name]) => (
            <div key={name} className="contents">
              <label className="font-semibold border p-1">{label}</label>
              <input name={name} onChange={handleChange} className="col-span-3 border p-1" />
            </div>
          ))}
        </div>
      </section>

      {/* FIRMAS */}
      <section className="border rounded p-4">
        <div className="grid grid-cols-2 gap-4 text-xs text-center">
          <div className="border h-32 flex flex-col justify-between p-2">
            <div className="font-semibold">FIRMA TÉCNICO</div>
            <div className="border-t pt-1">ASTAP Cía. Ltda.</div>
          </div>
          <div className="border h-32 flex flex-col justify-between p-2">
            <div className="font-semibold">FIRMA CLIENTE</div>
            <div className="border-t pt-1">&nbsp;</div>
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
