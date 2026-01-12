import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES BARREDORA
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
      { codigo: "B.2", texto: "Estado del filtro de agua" },
      { codigo: "B.3", texto: "Estado de válvulas check" },
      { codigo: "B.4", texto: "Estado de solenoides de apertura de agua" },
      { codigo: "B.5", texto: "Estado de la bomba eléctrica de agua" },
      { codigo: "B.6", texto: "Estado de los aspersores de cepillos" },
      { codigo: "B.7", texto: "Estado de la manguera de carga de agua de hidrante" },
      { codigo: "B.8", texto: "Inspección del medidor de nivel del tanque" },
      { codigo: "B.9", texto: "Inspección del sistema de llenado de agua" },
    ],
  },
  {
    id: "secC",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      { codigo: "C.1", texto: "Inspección visual de conectores (sockets) de los bancos de control" },
      { codigo: "C.2", texto: "Evaluar funcionamiento de elementos al encender el equipo" },
      { codigo: "C.3", texto: "Estado del tablero de control de cabina" },
      { codigo: "C.4", texto: "Inspección de batería" },
      { codigo: "C.5", texto: "Inspección de luces externas" },
      { codigo: "C.6", texto: "Diagnóstico y conexión con Service Tool (opcional)" },
      { codigo: "C.7", texto: "Inspección de limpia parabrisas" },
      { codigo: "C.8", texto: "Verificación de conexiones externas (GPS – radiocomunicación)" },
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
      { codigo: "E.1", texto: "Estado de filtros de aire primario y secundario" },
      { codigo: "E.2", texto: "Estado del filtro de combustible trampa de agua" },
      { codigo: "E.3", texto: "Estado del filtro de combustible" },
      { codigo: "E.4", texto: "Estado del filtro de aceite" },
      { codigo: "E.5", texto: "Nivel de aceite del motor" },
      { codigo: "E.6", texto: "Estado y nivel del refrigerante" },
      { codigo: "E.7", texto: "Estado del filtro de aire acondicionado cabina" },
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
              <td rowSpan={3} className="w-32 border-r p-3 text-center">
                <img src="/astap-logo.jpg" className="mx-auto max-h-20" />
              </td>
              <td colSpan={2} className="text-center font-bold">
                HOJA DE INSPECCIÓN BARREDORA
              </td>
              <td className="w-48 p-2">
                <div>Fecha de versión: 01-01-2026</div>
                <div>Versión: 01</div>
              </td>
            </tr>
            <tr className="border-b">
              <td className="border-r p-2 font-semibold">REFERENCIA DE CONTRATO</td>
              <td colSpan={2} className="p-2">
                <input name="referenciaContrato" onChange={handleChange} className="w-full border p-1" />
              </td>
            </tr>
            <tr>
              <td className="border-r p-2 font-semibold">DESCRIPCIÓN</td>
              <td colSpan={2} className="p-2">
                <input name="descripcion" onChange={handleChange} className="w-full border p-1" />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* DATOS DEL SERVICIO */}
      <section className="grid md:grid-cols-2 gap-3 border rounded p-4">
        <input type="date" name="fechaInspeccion" onChange={handleChange} className="input" />
        <input name="ubicacion" placeholder="Ubicación" onChange={handleChange} className="input" />
        <input name="cliente" placeholder="Cliente" onChange={handleChange} className="input" />
        <input name="contactoCliente" placeholder="Contacto cliente" onChange={handleChange} className="input" />
        <input name="telefonoCliente" placeholder="Teléfono cliente" onChange={handleChange} className="input" />
        <input name="correoCliente" placeholder="Correo cliente" onChange={handleChange} className="input" />
        <input name="tecnicoResponsable" placeholder="Técnico responsable" onChange={handleChange} className="input" />
        <input name="telefonoTecnico" placeholder="Teléfono técnico" onChange={handleChange} className="input" />
        <input name="correoTecnico" placeholder="Correo técnico" onChange={handleChange} className="input" />
      </section>

      {/* CHECKLIST */}
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
                  <td><input className="w-full border px-1" onChange={(e) => handleItemChange(item.codigo, "observacion", e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* FIRMAS */}
      <section className="grid grid-cols-2 gap-4 text-xs">
        <div className="border h-32 flex items-end justify-center">FIRMA TÉCNICO</div>
        <div className="border h-32 flex items-end justify-center">FIRMA CLIENTE</div>
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
