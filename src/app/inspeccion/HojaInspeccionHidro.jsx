import { useState } from "react";

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
    titulo:
      "2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES – A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      { codigo: "A.1", texto: "Fugas de aceite hidráulico" },
      { codigo: "A.2", texto: "Nivel de aceite del soplador" },
      { codigo: "A.3", texto: "Nivel de aceite hidráulico" },
      { codigo: "A.4", texto: "Nivel de aceite caja de transferencia" },
      { codigo: "A.5", texto: "Manómetro filtro hidráulico" },
      { codigo: "A.6", texto: "Filtro hidráulico de retorno" },
      { codigo: "A.7", texto: "Filtros succión tanque hidráulico" },
      { codigo: "A.8", texto: "Cilindros hidráulicos" },
      { codigo: "A.9", texto: "Tapones de drenaje" },
      { codigo: "A.10", texto: "Bancos hidráulicos" },
    ],
  },
  {
    id: "secB",
    titulo:
      "2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES – B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      { codigo: "B.1", texto: "Empaques filtros de agua" },
      { codigo: "B.2", texto: "Tapón expansión tanques" },
      { codigo: "B.3", texto: "Fugas tanque aluminio" },
      { codigo: "B.4", texto: "Sistema de trinquete y seguros" },
      { codigo: "B.5", texto: "Sellos tanque desperdicios" },
      { codigo: "B.6", texto: "Filtros malla agua" },
    ],
  },
];

export default function HojaInspeccionHidro() {
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

    tecnicoAstap: "",
    telefonoTecnico: "",
    correoTecnico: "",

    estadoEquipo: "",
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

  return (
    <form className="max-w-6xl mx-auto my-6 bg-white shadow-lg rounded-2xl p-6 space-y-6 text-sm">

      {/* ================= ENCABEZADO ================= */}
      <section className="border rounded-xl p-4 space-y-4">

        <div className="grid grid-cols-[120px_1fr_200px] items-center gap-4">
          <img
            src="/logotipo-de-astap.jpg"
            alt="ASTAP"
            className="w-full object-contain"
          />

          <h1 className="text-center font-semibold text-lg">
            HOJA DE INSPECCIÓN – HIDROSUCCIONADOR
          </h1>

          <div className="text-xs text-right">
            <p>Fecha de versión: 25-11-2025</p>
            <p>Versión: 01</p>
          </div>
        </div>

        <table className="w-full border-collapse border">
          <tbody>
            {[
              ["REFERENCIA DE CONTRATO", "referenciaContrato"],
              ["DESCRIPCIÓN", "descripcion"],
              ["CÓD. INF.", "codInf"],
              ["FECHA DE INSPECCIÓN", "fechaInspeccion", "date"],
              ["UBICACIÓN", "ubicacion"],
              ["CLIENTE", "cliente"],

              ["CONTACTO CLIENTE", "contactoCliente"],
              ["TELÉFONO CLIENTE", "telefonoCliente"],
              ["CORREO CLIENTE", "correoCliente"],

              ["TÉCNICO RESPONSABLE", "tecnicoAstap"],
              ["TELÉFONO TÉCNICO", "telefonoTecnico"],
              ["CORREO TÉCNICO", "correoTecnico"],
            ].map(([label, key, type]) => (
              <tr key={key}>
                <td className="border px-2 py-1 font-semibold w-60">
                  {label}
                </td>
                <td className="border px-2 py-1">
                  <input
                    type={type || "text"}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="w-full outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold">Estado del equipo</h2>

        <img
          src="/estado-equipo.png"
          alt="Estado del equipo"
          className="w-full border rounded"
        />

        <textarea
          name="estadoEquipo"
          value={formData.estadoEquipo}
          onChange={handleChange}
          placeholder="Detalle del estado del equipo"
          className="w-full border rounded px-2 py-1 min-h-[100px]"
        />
      </section>

      {/* ================= TABLAS DE INSPECCIÓN ================= */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-sm">{sec.titulo}</h2>

          <table className="w-full border-collapse border text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1 w-16">Ítem</th>
                <th className="border p-1">Detalle</th>
                <th className="border p-1 w-10">Sí</th>
                <th className="border p-1 w-10">No</th>
                <th className="border p-1 w-48">Observación</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map((item) => (
                <tr key={item.codigo}>
                  <td className="border p-1 text-center">{item.codigo}</td>
                  <td className="border p-1">{item.texto}</td>
                  <td className="border p-1 text-center">
                    <input
                      type="radio"
                      checked={formData.items[item.codigo]?.estado === "SI"}
                      onChange={() => handleItemChange(item.codigo, "estado", "SI")}
                    />
                  </td>
                  <td className="border p-1 text-center">
                    <input
                      type="radio"
                      checked={formData.items[item.codigo]?.estado === "NO"}
                      onChange={() => handleItemChange(item.codigo, "estado", "NO")}
                    />
                  </td>
                  <td className="border p-1">
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
    </form>
  );
}
