import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES – BARREDORA (PDF)
============================= */
const secciones = [
  {
    id: "sec1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    items: [
      { codigo: "1.1", texto: "Prueba de encendido general del equipo" },
      { codigo: "1.2", texto: "Verificación de funcionamiento de controles principales" },
      { codigo: "1.3", texto: "Revisión de alarmas o mensajes de fallo" },
    ],
  },
  {
    id: "secA",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      { codigo: "A.1", texto: "Fugas de aceite hidráulico (mangueras, acoples, bancos, cilindros y solenoides)" },
      { codigo: "A.2", texto: "Nivel de aceite del tanque AW68, se visualiza la mirilla" },
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
      { codigo: "B.1", texto: "Inspección de fugas de agua (mangueras / acoples)" },
      { codigo: "B.2", texto: "Estado del filtro para agua" },
      { codigo: "B.3", texto: "Estado de válvulas checks" },
      { codigo: "B.4", texto: "Estado de solenoides de apertura de agua" },
      { codigo: "B.5", texto: "Estado de la bomba eléctrica de agua" },
      { codigo: "B.6", texto: "Estado de aspersores de cepillos" },
      { codigo: "B.7", texto: "Estado de la manguera de carga de agua" },
      { codigo: "B.8", texto: "Estado del medidor de nivel del tanque" },
      { codigo: "B.9", texto: "Inspección del sistema de llenado de agua" },
    ],
  },
  {
    id: "secC",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      { codigo: "C.1", texto: "Inspección visual de conectores (sockets)" },
      { codigo: "C.2", texto: "Evaluar funcionamiento al encender el equipo" },
      { codigo: "C.3", texto: "Estado del tablero de control de cabina" },
      { codigo: "C.4", texto: "Inspección de batería" },
      { codigo: "C.5", texto: "Inspección de luces externas" },
      { codigo: "C.6", texto: "Diagnóstico con Service Tool (opcional)" },
      { codigo: "C.7", texto: "Inspección de limpia parabrisas" },
      { codigo: "C.8", texto: "Verificación de conexiones externas (GPS / radio)" },
    ],
  },
  {
    id: "secD",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      { codigo: "D.1", texto: "Estado de la banda (aceptable)" },
      { codigo: "D.2", texto: "Estado de cerdas de cepillos" },
      { codigo: "D.3", texto: "Estado de la tolva" },
      { codigo: "D.4", texto: "Funcionamiento de la tolva" },
      { codigo: "D.5", texto: "Funcionamiento de la banda" },
      { codigo: "D.6", texto: "Estado de zapatas de arrastre" },
    ],
  },
  {
    id: "secE",
    titulo: "E) MOTOR JOHN DEERE",
    items: [
      { codigo: "E.1", texto: "Estado de filtros de aire 1° y 2°" },
      { codigo: "E.2", texto: "Filtro de combustible / trampa de agua" },
      { codigo: "E.3", texto: "Filtro de combustible" },
      { codigo: "E.4", texto: "Filtro de aceite" },
      { codigo: "E.5", texto: "Nivel de aceite de motor" },
      { codigo: "E.6", texto: "Nivel y estado del refrigerante" },
      { codigo: "E.7", texto: "Estado del filtro de A/C cabina" },
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
    tecnicoAstap: "",
    responsableCliente: "",
    estadoEquipoDetalle: "",
    puntos: [],
    marca: "",
    modelo: "",
    serie: "",
    anioModelo: "",
    vin: "",
    placa: "",
    horasModulo: "",
    horasChasis: "",
    recorrido: "",
    items: {},
  });

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleItemChange = (codigo, campo, valor) => {
    setFormData((p) => ({
      ...p,
      items: {
        ...p.items,
        [codigo]: { ...p.items[codigo], [campo]: valor },
      },
    }));
  };

  const handleImageClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setFormData((p) => ({
      ...p,
      puntos: [...p.puntos, { id: p.puntos.length + 1, x, y }],
    }));
  };

  const removePoint = (id) =>
    setFormData((p) => ({
      ...p,
      puntos: p.puntos.filter((pt) => pt.id !== id).map((pt, i) => ({ ...pt, id: i + 1 })),
    }));

  const submit = (e) => {
    e.preventDefault();
    markInspectionCompleted("barredora", id, formData);
    navigate("/inspeccion");
  };

  return (
    <form onSubmit={submit} className="max-w-6xl mx-auto bg-white p-6 space-y-6 text-xs">
      {/* ENCABEZADO */}
      <section className="border">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td rowSpan={4} className="w-32 border p-2 text-center">
                <img src="/astap-logo.jpg" className="mx-auto h-16" />
              </td>
              <td colSpan={2} className="border text-center font-bold">
                HOJA DE INSPECCIÓN BARREDORA
              </td>
              <td className="border p-1">
                Fecha de versión: 25-11-2025<br />Versión: 01
              </td>
            </tr>
            {[
              ["REFERENCIA DE CONTRATO", "referenciaContrato"],
              ["DESCRIPCIÓN", "descripcion"],
              ["COD. INF.", "codInf"],
            ].map(([l, n]) => (
              <tr key={n}>
                <td className="border p-1 font-semibold">{l}</td>
                <td colSpan={2} className="border p-1">
                  <input name={n} onChange={handleChange} className="w-full border p-1" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* CONTEXTO */}
      <section className="grid grid-cols-2 gap-2 border p-3">
        <input type="date" name="fechaInspeccion" onChange={handleChange} className="input" />
        <input name="ubicacion" placeholder="Ubicación" onChange={handleChange} className="input" />
        <input name="cliente" placeholder="Cliente" onChange={handleChange} className="input" />
        <input name="tecnicoAstap" placeholder="Técnico ASTAP" onChange={handleChange} className="input" />
        <input name="responsableCliente" placeholder="Responsable cliente" onChange={handleChange} className="input col-span-2" />
      </section>

      {/* ESTADO DEL EQUIPO */}
      <section className="border p-3">
        <p className="font-semibold mb-1">Estado del equipo</p>
        <div className="relative border cursor-crosshair" onClick={handleImageClick}>
          <img src="/estado equipo barredora.png" className="w-full" />
          {formData.puntos.map((p) => (
            <div
              key={p.id}
              onDoubleClick={() => removePoint(p.id)}
              className="absolute bg-red-600 text-white w-5 h-5 text-[10px] flex items-center justify-center rounded-full"
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
            >
              {p.id}
            </div>
          ))}
        </div>
        <textarea
          name="estadoEquipoDetalle"
          placeholder="Observaciones del estado del equipo"
          onChange={handleChange}
          className="w-full border p-2 mt-2"
        />
      </section>

      {/* CHECKLIST */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border p-3">
          <h3 className="font-semibold mb-1">{sec.titulo}</h3>
          <table className="w-full border text-[10px]">
            <thead>
              <tr className="bg-gray-100">
                <th>Ítem</th><th>Detalle</th><th>Sí</th><th>No</th><th>Obs.</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map((i) => (
                <tr key={i.codigo}>
                  <td>{i.codigo}</td>
                  <td>{i.texto}</td>
                  <td><input type="radio" onChange={() => handleItemChange(i.codigo, "estado", "SI")} /></td>
                  <td><input type="radio" onChange={() => handleItemChange(i.codigo, "estado", "NO")} /></td>
                  <td><input className="w-full border" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* BOTONES */}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => navigate("/inspeccion")} className="border px-4 py-2">Volver</button>
        <button type="submit" className="bg-green-600 text-white px-4 py-2">Guardar</button>
      </div>
    </form>
  );
}
