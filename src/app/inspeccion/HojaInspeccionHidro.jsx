import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES DE INSPECCIÓN
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
      { codigo: "A.1", texto: "Fugas de aceite hidráulico" },
      { codigo: "A.2", texto: "Nivel de aceite del soplador" },
      { codigo: "A.3", texto: "Nivel de aceite hidráulico" },
      { codigo: "A.4", texto: "Aceite caja de transferencia" },
      { codigo: "A.5", texto: "Manómetro filtro hidráulico" },
      { codigo: "A.6", texto: "Filtro hidráulico de retorno" },
      { codigo: "A.7", texto: "Filtros de succión tanque hidráulico" },
      { codigo: "A.8", texto: "Cilindros hidráulicos" },
      { codigo: "A.9", texto: "Tapones de drenaje" },
      { codigo: "A.10", texto: "Bancos hidráulicos" },
    ],
  },
  {
    id: "secB",
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      { codigo: "B.1", texto: "Filtros malla 2\" y 3\"" },
      { codigo: "B.2", texto: "Empaques tapa filtros" },
      { codigo: "B.3", texto: "Fugas de agua (mangueras / acoples)" },
      { codigo: "B.4", texto: "Válvula alivio pistola" },
      { codigo: "B.5", texto: "Golpes / fugas tanque aluminio" },
      { codigo: "B.6", texto: "Medidor de nivel tanque" },
      { codigo: "B.7", texto: "Tapón expansión 2\"" },
      { codigo: "B.8", texto: "Drenaje bomba Rodder" },
      { codigo: "B.9", texto: "Válvulas check bomba" },
      { codigo: "B.10", texto: "Manómetros de presión" },
      { codigo: "B.11", texto: "Carrete de manguera" },
      { codigo: "B.12", texto: "Soporte del carrete" },
      { codigo: "B.13", texto: "Codo giratorio" },
      { codigo: "B.14", texto: "Sistema de trinquete" },
      { codigo: "B.15", texto: "Válvula alivio bomba" },
      { codigo: "B.16", texto: "Válvulas 1\"" },
      { codigo: "B.17", texto: "Válvulas 3/4\"" },
      { codigo: "B.18", texto: "Válvulas 1/2\"" },
      { codigo: "B.19", texto: "Boquillas" },
    ],
  },
  {
    id: "secC",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      { codigo: "C.1", texto: "Tablero frontal" },
      { codigo: "C.2", texto: "Tablero cabina" },
      { codigo: "C.3", texto: "Control remoto" },
      { codigo: "C.4", texto: "Electroválvulas" },
      { codigo: "C.5", texto: "Humedad en componentes" },
      { codigo: "C.6", texto: "Luces y accesorios" },
    ],
  },
  {
    id: "secD",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      { codigo: "D.1", texto: "Sellos tanque" },
      { codigo: "D.2", texto: "Interior tanque desechos" },
      { codigo: "D.3", texto: "Microfiltros succión" },
      { codigo: "D.4", texto: "Tapón drenaje filtro" },
      { codigo: "D.5", texto: "Mangueras succión" },
      { codigo: "D.6", texto: "Seguros compuerta" },
      { codigo: "D.7", texto: "Sistema desfogüe" },
      { codigo: "D.8", texto: "Válvulas alivio Kunkle" },
      { codigo: "D.9", texto: "Operación del soplador" },
    ],
  },
];

export default function HojaInspeccionHidro() {
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
    markInspectionCompleted("hidro", id, formData);
     navigate("/inspeccion");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >

      {/* ENCABEZADO */}
      <section className="border rounded-lg overflow-hidden">
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b">
              <td rowSpan={4} className="w-32 border-r p-3 text-center align-middle">
                <img src="/astap-logo.jpg" alt="ASTAP" className="mx-auto max-h-20" />
              </td>
              <td colSpan={2} className="border-r text-center font-bold py-2">
                REPORTE TÉCNICO DE SERVICIO
              </td>
              <td className="w-48 p-2">
                <div>Fecha de versión: <strong>01-01-26</strong></div>
                <div>Versión: <strong>01</strong></div>
              </td>
            </tr>

            <tr className="border-b">
              <td className="w-48 border-r p-2 font-semibold">REFERENCIA DE CONTRATO</td>
              <td colSpan={2} className="p-2">
                <input
                  name="referenciaContrato"
                  onChange={handleChange}
                  className="w-full border rounded p-1"
                />
              </td>
            </tr>

            <tr className="border-b">
              <td className="border-r p-2 font-semibold">DESCRIPCIÓN</td>
              <td colSpan={2} className="p-2">
                <input
                  name="descripcion"
                  onChange={handleChange}
                  className="w-full border rounded p-1"
                />
              </td>
            </tr>

            <tr>
              <td className="border-r p-2 font-semibold">COD. INF.</td>
              <td colSpan={2} className="p-2">
                <input
                  name="codInf"
                  onChange={handleChange}
                  className="w-full border rounded p-1"
                />
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
        <input name="contactoCliente" placeholder="Contacto con el cliente" onChange={handleChange} className="input" />
        <input name="telefonoCliente" placeholder="Teléfono cliente" onChange={handleChange} className="input" />
        <input name="correoCliente" placeholder="Correo cliente" onChange={handleChange} className="input" explain />
        <input name="tecnicoResponsable" placeholder="Técnico responsable" onChange={handleChange} className="input" />
        <input name="telefonoTecnico" placeholder="Teléfono técnico" onChange={handleChange} className="input" />
        <input name="correoTecnico" placeholder="Correo técnico" onChange={handleChange} className="input" />
      </section>

      {/* ESTADO DEL EQUIPO */}
      <section className="border rounded p-4 space-y-2">
        <p className="font-semibold">Estado del equipo</p>
        <div
          className="relative border rounded overflow-hidden cursor-crosshair"
          onClick={handleImageClick}
        >
          <img src="/estado-equipo.png" className="w-full" draggable={false} />
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
          className="w-full border rounded p-2 min-h-[80px]"
        />
      </section>

      {/* TABLAS A–D */}
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
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[item.codigo]?.estado === "SI"}
                      onChange={() => handleItemChange(item.codigo, "estado", "SI")}
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[item.codigo]?.estado === "NO"}
                      onChange={() => handleItemChange(item.codigo, "estado", "NO")}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full border px-1"
                      value={formData.items[item.codigo]?.observacion || ""}
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

      {/* DESCRIPCIÓN DEL EQUIPO */}
      <section className="border rounded p-4 space-y-2">
        <h2 className="font-semibold text-center">DESCRIPCIÓN DEL EQUIPO</h2>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            ["NOTA", "notaEquipo"],
            ["MARCA", "marca"],
            ["MODELO", "modelo"],
            ["N° SERIE", "serie"],
            ["AÑO MODELO", "anioModelo"],
            ["VIN / CHASIS", "vin"],
            ["PLACA N°", "placa"],
            ["HORAS TRABAJO MÓDULO", "horasModulo"],
            ["HORAS TRABAJO CHASIS", "horasChasis"],
            ["KILOMETRAJE", "kilometraje"],
          ].map(([label, name]) => (
            <>
              <label className="font-semibold">{label}:</label>
              <input
                name={name}
                onChange={handleChange}
                className="col-span-3 border p-1"
              />
            </>
          ))}
        </div>
      </section>

      {/* FIRMAS (SOLO 2) */}
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
