// src/app/inspeccion/HojaInspeccionHidro.jsx

import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* ============================
   SECCIONES COMPLETAS A–E
============================ */
const secciones = [
  {
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      { codigo: "A.1", texto: "Fugas de aceite hidráulico (mangueras, acoples, bancos)" },
      { codigo: "A.2", texto: "Nivel de aceite del soplador" },
      { codigo: "A.3", texto: "Nivel de aceite hidráulico" },
      { codigo: "A.4", texto: "Nivel de aceite caja de transferencia" },
      { codigo: "A.5", texto: "Manómetro filtro hidráulico (verde / amarillo / rojo)" },
      { codigo: "A.6", texto: "Filtro hidráulico de retorno, presenta fugas o daños" },
      { codigo: "A.7", texto: "Filtros de succión del tanque hidráulico (opcional)" },
      { codigo: "A.8", texto: "Cilindros hidráulicos, presentan fugas o daños" },
      { codigo: "A.9", texto: "Tapones de drenaje de lubricantes" },
      { codigo: "A.10", texto: "Bancos hidráulicos, presentan fugas o daños" },
    ],
  },
  {
    id: "B",
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      { codigo: "B.1", texto: "Filtros malla para agua 2” y 3”" },
      { codigo: "B.2", texto: "Empaques tapa filtros de agua" },
      { codigo: "B.3", texto: "Fugas de agua (mangueras – acoples)" },
      { codigo: "B.4", texto: "Válvula alivio pistola (opcional 700 PSI)" },
      { codigo: "B.5", texto: "Golpes y fugas tanque de aluminio" },
      { codigo: "B.6", texto: "Medidor nivel tanque, ¿visualiza bolitas?" },
      { codigo: "B.7", texto: "Tapón expansión 2” tanque aluminio" },
      { codigo: "B.8", texto: "Sistema drenaje bomba Rodder (opcional)" },
      { codigo: "B.9", texto: "Válvulas check internas bomba 2” y 3”" },
      { codigo: "B.10", texto: "Manómetros de presión (opcional)" },
      { codigo: "B.11", texto: "Carrete de manguera / manguera guía" },
      { codigo: "B.12", texto: "Soporte del carrete, ¿está flojo?" },
      { codigo: "B.13", texto: "Codo giratorio del carrete" },
      { codigo: "B.14", texto: "Sistema trinquete, seguros y cilindros neumáticos" },
      { codigo: "B.15", texto: "Válvula alivio bomba de agua (opcional)" },
      { codigo: "B.16", texto: "Válvulas 1”" },
      { codigo: "B.17", texto: "Válvulas 3/4”" },
      { codigo: "B.18", texto: "Válvulas 1/2”" },
      { codigo: "B.19", texto: "Estado de boquillas, mantenimiento y conservación" },
    ],
  },
  {
    id: "C",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      { codigo: "C.1", texto: "Funciones tablero frontal, se mantiene limpio" },
      { codigo: "C.2", texto: "Funcionamiento tablero control cabina" },
      { codigo: "C.3", texto: "Control remoto, estado puerto de carga" },
      { codigo: "C.4", texto: "Electroválvulas de bancos de control" },
      { codigo: "C.5", texto: "Presencia de humedad en componentes" },
      { codigo: "C.6", texto: "Luces estrobo, flechas y accesorios externos" },
    ],
  },
  {
    id: "D",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      { codigo: "D.1", texto: "Sellos tanque desperdicios frontal y posterior" },
      { codigo: "D.2", texto: "Interior tanque desechos (canastillas, esferas, deflectores)" },
      { codigo: "D.3", texto: "Microfiltros de succión (3)" },
      { codigo: "D.4", texto: "Tapón drenaje filtro de succión" },
      { codigo: "D.5", texto: "Estado físico mangueras de succión" },
      { codigo: "D.6", texto: "Seguros compuerta tanque desechos" },
      { codigo: "D.7", texto: "Sistema desfogue (válvula y actuador)" },
      { codigo: "D.8", texto: "Válvulas alivio presión Kunkle (3)" },
      { codigo: "D.9", texto: "Operación del soplador" },
    ],
  },
  {
    id: "E",
    titulo: "E) MOTOR JOHN DEERE",
    items: [
      { codigo: "E.1", texto: "Filtros de aire primario y secundario" },
      { codigo: "E.2", texto: "Filtro combustible trampa de agua" },
      { codigo: "E.3", texto: "Filtro de combustible" },
      { codigo: "E.4", texto: "Filtro de aceite" },
      { codigo: "E.5", texto: "Nivel de aceite del motor" },
      { codigo: "E.6", texto: "Estado y nivel del refrigerante" },
      { codigo: "E.7", texto: "Filtro A/C cabina" },
    ],
  },
];

export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const sigTecnico = useRef(null);
  const sigCliente = useRef(null);

  const [data, setData] = useState({
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
    puntos: [],
    equipo: {
      marca: "",
      modelo: "",
      serie: "",
      anioModelo: "",
      vin: "",
      placa: "",
      horasModulo: "",
      horasChasis: "",
      kilometraje: "",
      nota: "",
    },
    items: {},
  });

  const update = (path, value) => {
    setData((p) => {
      const c = structuredClone(p);
      let ref = c;
      for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
      ref[path[path.length - 1]] = value;
      return c;
    });
  };

  const marcar = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    update(["puntos"], [...data.puntos, { id: data.puntos.length + 1, x, y }]);
  };

  const guardar = () => {
    markInspectionCompleted("hidro", id, {
      ...data,
      firmas: {
        tecnico: sigTecnico.current?.toDataURL(),
        cliente: sigCliente.current?.toDataURL(),
      },
    });
    navigate("/inspeccion");
  };

  return (
    <form className="max-w-6xl mx-auto p-6 space-y-6 bg-white rounded shadow">
      {/* ENCABEZADO */}
      <table className="w-full border text-xs">
        <tbody>
          <tr>
            <td rowSpan={3} className="w-32 text-center border">
              <img src="/astap-logo.jpg" className="mx-auto h-16" />
            </td>
            <td colSpan={2} className="text-center font-bold border">
              HOJA DE INSPECCIÓN HIDROSUCCIONADOR
            </td>
            <td className="border p-2">
              Fecha versión: 01-01-26<br />Versión: 01
            </td>
          </tr>
          {[
            ["REFERENCIA DE CONTRATO", "referenciaContrato"],
            ["DESCRIPCIÓN", "descripcion"],
            ["COD. INF.", "codInf"],
          ].map(([l, k]) => (
            <tr key={k}>
              <td className="border p-1 font-semibold">{l}</td>
              <td colSpan={2} className="border">
                <input className="w-full border p-1" onChange={e => update([k], e.target.value)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ESTADO DEL EQUIPO */}
      <section className="border p-4">
        <p className="font-semibold">Estado del equipo</p>
        <div className="relative border cursor-crosshair" onClick={marcar}>
          <img src="/estado-equipo.png" className="w-full" />
          {data.puntos.map(p => (
            <div
              key={p.id}
              className="absolute bg-red-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)" }}
            >
              {p.id}
            </div>
          ))}
        </div>
        <textarea
          className="w-full border mt-2 p-2"
          placeholder="Detalle del estado del equipo"
          onChange={e => update(["estadoEquipoDetalle"], e.target.value)}
        />
      </section>

      {/* TABLAS */}
      {secciones.map(sec => (
        <table key={sec.id} className="w-full border text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th colSpan={5} className="border p-1">{sec.titulo}</th>
            </tr>
            <tr>
              <th>Ítem</th><th>Detalle</th><th>Sí</th><th>No</th><th>Observación</th>
            </tr>
          </thead>
          <tbody>
            {sec.items.map(i => (
              <tr key={i.codigo}>
                <td>{i.codigo}</td>
                <td>{i.texto}</td>
                <td><input type="radio" onChange={() => update(["items", i.codigo, "estado"], "SI")} /></td>
                <td><input type="radio" onChange={() => update(["items", i.codigo, "estado"], "NO")} /></td>
                <td><input className="border w-full" onChange={e => update(["items", i.codigo, "obs"], e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}

      {/* FIRMAS */}
      <table className="w-full border">
        <thead><tr><th>Firma Técnico</th><th>Firma Cliente</th></tr></thead>
        <tbody>
          <tr>
            <td><SignatureCanvas ref={sigTecnico} canvasProps={{ width: 300, height: 120 }} /></td>
            <td><SignatureCanvas ref={sigCliente} canvasProps={{ width: 300, height: 120 }} /></td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => navigate("/inspeccion")} className="border px-4 py-2">
          Volver
        </button>
        <button type="button" onClick={guardar} className="bg-green-600 text-white px-4 py-2">
          Guardar y completar
        </button>
      </div>
    </form>
  );
}
