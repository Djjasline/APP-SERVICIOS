import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   PRUEBAS PREVIAS AL SERVICIO
============================= */
const pruebasPrevias = [
  ["1.1", "Prueba de encendido general del equipo"],
  ["1.2", "Verificación de funcionamiento de controles principales"],
  ["1.3", "Revisión de alarmas o mensajes de fallo"],
];

/* =============================
   SECCIONES – HIDROSUCCIONADOR
============================= */
const secciones = [
  {
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico (mangueras - acoples - bancos)"],
      ["A.2", "Nivel de aceite del soplador"],
      ["A.3", "Nivel de aceite hidráulico"],
      ["A.4", "Nivel de aceite en la caja de transferencia"],
      ["A.5", "Manómetro de filtro hidráulico de retorno"],
      ["A.6", "Filtro hidráulico de retorno, presenta fugas o daños"],
      ["A.7", "Filtros de succión del tanque hidráulico"],
      ["A.8", "Cilindros hidráulicos, presentan fugas o daños"],
      ["A.9", "Tapones de drenaje de lubricantes"],
      ["A.10", "Bancos hidráulicos, presentan fugas o daños"],
    ],
  },
  {
    id: "B",
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      ["B.1", "Filtros malla de agua 2” y 3”"],
      ["B.2", "Empaques de tapa de filtros de agua"],
      ["B.3", "Fugas de agua (mangueras / acoples)"],
      ["B.4", "Válvula de alivio de la pistola"],
      ["B.5", "Golpes o fugas en tanque de aluminio"],
      ["B.6", "Medidor de nivel del tanque"],
      ["B.7", "Tapón de expansión del tanque"],
      ["B.8", "Drenaje de la bomba Rodder"],
      ["B.9", "Válvulas check internas"],
      ["B.10", "Manómetros de presión"],
      ["B.11", "Carrete de manguera de agua"],
      ["B.12", "Soporte del carrete"],
      ["B.13", "Codo giratorio del carrete"],
      ["B.14", "Sistema de trinquete y seguros"],
      ["B.15", "Válvula de alivio de bomba de agua"],
      ["B.16", "Válvulas de 1”"],
      ["B.17", "Válvulas de 3/4”"],
      ["B.18", "Válvulas de 1/2”"],
      ["B.19", "Boquillas"],
    ],
  },
  {
    id: "C",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      ["C.1", "Funciones del tablero frontal"],
      ["C.2", "Tablero de control en cabina"],
      ["C.3", "Control remoto"],
      ["C.4", "Electroválvulas"],
      ["C.5", "Humedad en componentes"],
      ["C.6", "Luces y accesorios externos"],
    ],
  },
  {
    id: "D",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      ["D.1", "Sellos del tanque de desperdicios"],
      ["D.2", "Interior del tanque de desechos"],
      ["D.3", "Microfiltro de succión"],
      ["D.4", "Tapón de drenaje del filtro de succión"],
      ["D.5", "Mangueras de succión"],
      ["D.6", "Seguros de compuerta"],
      ["D.7", "Sistema de desfogue"],
      ["D.8", "Válvulas de alivio Kunkle"],
      ["D.9", "Operación del soplador"],
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

      {/* ===== 1. PRUEBAS PREVIAS ===== */}
      <section className="border rounded p-4">
        <h2 className="font-semibold mb-2">
          1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO
        </h2>
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
            {pruebasPrevias.map(([codigo, texto]) => (
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

      {/* ===== 2. EVALUACIÓN DE SISTEMAS ===== */}
      <h2 className="font-semibold text-base">
        2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O ESTADO DE LOS SISTEMAS
      </h2>

      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h3 className="font-semibold mb-2">{sec.titulo}</h3>
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
