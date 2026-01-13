import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* ======================================================
   1. PRUEBAS DE ENCENDIDO Y FUNCIONAMIENTO (PRE-SERVICIO)
====================================================== */
const pruebasEncendido = [
  ["1.1", "Prueba de encendido general del equipo"],
  ["1.2", "Verificación de funcionamiento de controles principales"],
  ["1.3", "Revisión de alarmas o mensajes de fallo"],
];

/* ======================================================
   2. EVALUACIÓN DEL ESTADO DE LOS SISTEMAS – HIDRO
====================================================== */
const secciones = [
  {
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico (mangueras - acoples - bancos)"],
      ["A.2", "Nivel de aceite del soplador"],
      ["A.3", "Nivel de aceite hidráulico"],
      ["A.4", "Nivel de aceite en la caja de transferencia"],
      ["A.5", "Inspección del manómetro de filtro hidráulico de retorno, verde, amarillo, rojo"],
      ["A.6", "Inspección del filtro hidráulico de retorno, presenta fugas o daños"],
      ["A.7", "Inspección de los filtros de succión del tanque hidráulico (opcional)"],
      ["A.8", "Estado de los cilindros hidráulicos, presenta fugas o daños"],
      ["A.9", "Evaluación del estado de los tapones de drenaje de lubricantes"],
      ["A.10", "Evaluación de bancos hidráulicos, presentan fugas o daños"],
    ],
  },
  {
    id: "B",
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      ["B.1", "Inspección del estado de los filtros malla para agua de 2” y 3”"],
      ["B.2", "Estado de los empaques de la tapa de los filtros de agua"],
      ["B.3", "Inspección de fugas de agua (mangueras - acoples)"],
      ["B.4", "Inspección de la válvula de alivio de la pistola (opcional de 700 PSI)"],
      ["B.5", "Inspección de golpes y fugas de agua en el tanque de aluminio"],
      ["B.6", "Inspección del medidor de nivel del tanque, ¿se visualiza sus bolitas?"],
      ["B.7", "Inspección del sistema de tapón de expansión de 2” de tanques de aluminio"],
      ["B.8", "Inspección del sistema de drenaje de la bomba Rodder (opcional)"],
      ["B.9", "Estado de válvulas checks internas de la bomba de 2” y de 3”"],
      ["B.10", "Estado de los manómetros de presión (opcional)"],
      ["B.11", "Inspección del estado del carrete de manguera, manguera guía"],
      ["B.12", "Soporte del carrete, ¿está flojo?"],
      ["B.13", "Inspección del codo giratorio del carrete, superior e inferior, presenta fugas"],
      ["B.14", "Inspección del sistema de trinquete, seguros, cilindros neumáticos, ¿se activan?"],
      ["B.15", "Inspección de la válvula de alivio de bomba de agua (opcional)"],
      ["B.16", "Inspección de válvulas de 1”"],
      ["B.17", "Inspección de válvulas de 3/4”"],
      ["B.18", "Inspección de válvulas de 1/2”"],
      ["B.19", "Estado de las boquillas, ¿se las da mantenimiento, conservación?"],
    ],
  },
  {
    id: "C",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      ["C.1", "Inspección de funciones de tablero frontal, ¿se mantiene limpio?"],
      ["C.2", "Evaluar funcionamiento de tablero de control interno cabina"],
      ["C.3", "Inspección del estado de control remoto, estado de su puerto de carga"],
      ["C.4", "Inspección del estado de las electroválvulas de los bancos de control"],
      ["C.5", "Presencia de humedad en sus componentes"],
      ["C.6", "Revisión de luces estrobo, flechas y accesorios externos"],
    ],
  },
  {
    id: "D",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      ["D.1", "Inspección de los sellos en el tanque de desperdicios frontal y posterior"],
      ["D.2", "Estado interno del tanque de desechos, canastillas, esferas y deflectores"],
      ["D.3", "Inspección del microfiltros de succión"],
      ["D.4", "Inspección del tapón de drenaje del filtro de succión"],
      ["D.5", "Estado físico de las mangueras de succión"],
      ["D.6", "Seguros de compuerta del tanque de desechos"],
      ["D.7", "Inspección del sistema de desfogue (válvula y actuador)"],
      ["D.8", "Inspección de válvulas de alivio de presión Kunkle"],
      ["D.9", "Inspeccionar la operación del soplador"],
    ],
  },
];

export default function HojaInspeccionHidro() {
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

    estadoEquipoPuntos: [],
    items: {},

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
        [codigo]: { ...p.items[codigo], [campo]: valor },
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
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm">

      {/* ===== 1. PRUEBAS DE ENCENDIDO ===== */}
      <section className="border rounded p-4">
        <h2 className="font-bold mb-2">
          1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO
        </h2>
        <table className="w-full border text-sm">
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
            {pruebasEncendido.map(([c, t]) => (
              <tr key={c}>
                <td>{c}</td>
                <td>{t}</td>
                <td><input type="radio" /></td>
                <td><input type="radio" /></td>
                <td><input className="w-full border px-1" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ===== 2. EVALUACIÓN DE SISTEMAS ===== */}
      <h2 className="font-bold text-center">
        2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O ESTADO DE LOS SISTEMAS DEL MÓDULO VACTOR
      </h2>

      {/* TABLAS A–D */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h3 className="font-semibold mb-2">{sec.titulo}</h3>
          <table className="w-full border text-sm">
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
              {sec.items.map(([c, t]) => (
                <tr key={c}>
                  <td>{c}</td>
                  <td>{t}</td>
                  <td><input type="radio" /></td>
                  <td><input type="radio" /></td>
                  <td><input className="w-full border px-1" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* ===== DESCRIPCIÓN DEL EQUIPO ===== */}
      <section className="border rounded p-4">
        <h2 className="font-bold text-center mb-2">DESCRIPCIÓN DEL EQUIPO</h2>
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
              <input name={n} onChange={handleChange} className="col-span-3 border p-1" />
            </div>
          ))}
        </div>
      </section>

      {/* ===== FIRMAS ===== */}
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
