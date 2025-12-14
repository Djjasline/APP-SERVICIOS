// src/app/inspeccion/index.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactSignatureCanvas from "react-signature-canvas";

// ========================
// Definición de secciones
// ========================
const secciones = [
  {
    id: "sec1",
    titulo:
      "3. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    items: [
      { codigo: "1.1", texto: "Prueba de encendido general del equipo" },
      {
        codigo: "1.2",
        texto: "Verificación de funcionamiento de controles principales",
      },
      {
        codigo: "1.3",
        texto: "Revisión de alarmas o mensajes de fallo",
      },
    ],
  },
  {
    id: "secA",
    titulo:
      "4. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O ESTADO DE LOS SISTEMAS DEL MÓDULO VACTOR – A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      {
        codigo: "A.1",
        texto: "Fugas de aceite hidráulico (mangueras - acoples - bancos)",
      },
      { codigo: "A.2", texto: "Nivel de aceite del soplador" },
      { codigo: "A.3", texto: "Nivel de aceite hidráulico" },
      { codigo: "A.4", texto: "Nivel de aceite en la caja de transferencia" },
      {
        codigo: "A.5",
        texto:
          "Inspección del manómetro de filtro hidráulico de retorno (verde, amarillo, rojo)",
      },
      {
        codigo: "A.6",
        texto:
          "Inspección del filtro hidráulico de retorno, presenta fugas o daños",
      },
      {
        codigo: "A.7",
        texto:
          "Inspección de los filtros de succión del tanque hidráulico (opcional)",
      },
      {
        codigo: "A.8",
        texto:
          "Estado de los cilindros hidráulicos, presenta fugas o daños",
      },
      {
        codigo: "A.9",
        texto:
          "Evaluación del estado de los tapones de drenaje de lubricantes",
      },
      {
        codigo: "A.10",
        texto: "Evaluación de bancos hidráulicos, presentan fugas o daños",
      },
    ],
  },
  {
    id: "secB",
    titulo:
      "5. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O ESTADO DE LOS SISTEMAS DEL MÓDULO VACTOR – B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      {
        codigo: "B.1",
        texto: "Estado de los empaques de la tapa de los filtros de agua",
      },
      {
        codigo: "B.2",
        texto:
          'Inspección del sistema de tapón de expansión de 2" de tanques de agua',
      },
      {
        codigo: "B.3",
        texto:
          "Inspección de golpes y fugas de agua en el tanque de aluminio",
      },
      {
        codigo: "B.4",
        texto:
          "Inspección de sistema de trinquete, seguros y cilindros neumáticos, se activan",
      },
      {
        codigo: "B.5",
        texto:
          "Inspección de los sellos en el tanque de desperdicios (frontal y posterior), presencia de humedad en sus componentes",
      },
      {
        codigo: "B.6",
        texto:
          'Inspección del estado de los filtros malla para agua de 2" y 3"',
      },
    ],
  },
  // Más secciones (C, D, etc.) se pueden agregar luego aquí.
];

// ========================
// Componente principal
// ========================
const HojaInspeccionHidro = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // 1. Datos del reporte (mismo modelo que informe de servicio)
    client: "",
    clientContact: "",
    clientRole: "",
    clientEmail: "",
    serviceDate: "",
    internalCode: "",
    address: "",
    reference: "",
    technicalPersonnel: "",
    technicianPhone: "",
    technicianEmail: "",

    // Estado del equipo / observaciones
    estadoEquipo: "",
    observacionesGenerales: "",

    // Descripción del equipo
    marca: "",
    modelo: "",
    numeroSerie: "",
    placa: "",
    horasModulo: "",
    horasChasis: "",
    anioModelo: "",
    vinChasis: "",
    kilometraje: "",

    // Firmas digitales
    astapSignature: "",
    clientSignature: "",

    // Ítems SI/NO + observación
    items: {},
  });

  // Puntos de daño sobre la imagen del equipo
  const [damagePoints, setDamagePoints] = useState([]);

  // Refs y helpers para firmas
  const astapSigRef = useRef(null);
  const clientSigRef = useRef(null);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (codigo, campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [codigo]: {
          ...prev.items[codigo],
          [campo]: valor,
        },
      },
    }));
  };

  // Imagen: click para agregar punto numerado
  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setDamagePoints((prev) => [
      ...prev,
      { id: prev.length + 1, x, y },
    ]);
  };

  const handlePointDoubleClick = (id) => {
    setDamagePoints((prev) => prev.filter((p) => p.id !== id));
  };

  const saveSignature = (who) => {
    const ref = who === "astap" ? astapSigRef : clientSigRef;

    if (ref.current && !ref.current.isEmpty()) {
      const dataUrl = ref.current.toDataURL("image/png");
      setFormData((prev) => ({
        ...prev,
        [who === "astap" ? "astapSignature" : "clientSignature"]: dataUrl,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [who === "astap" ? "astapSignature" : "clientSignature"]: "",
      }));
    }
  };

  const clearSignature = (who) => {
    const ref = who === "astap" ? astapSigRef : clientSigRef;
    if (ref.current) ref.current.clear();

    setFormData((prev) => ({
      ...prev,
      [who === "astap" ? "astapSignature" : "clientSignature"]: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos de inspección:", formData, damagePoints);
    alert("Datos de la inspección guardados en memoria (por ahora).");
  };

  const handleResetItems = () => {
    setFormData((prev) => ({
      ...prev,
      items: {},
    }));
  };

  // ========================
  // Render
  // ========================
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Encabezado superior de la página */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Hoja de inspección hidráulica
            </h1>
            <p className="text-sm text-slate-600">
              Inspección y valoración de equipos Vactor / hidrosuccionadora.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Volver al panel
          </button>
        </header>

        {/* FORMULARIO COMPLETO */}
        <form
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          {/* ENCABEZADO + 1. DATOS DEL REPORTE */}
          <section className="bg-white shadow-lg rounded-2xl border p-6 space-y-5">
            {/* Encabezado con logo + título + versión */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/astap-logo.jpg"
                  alt="Logo ASTAP"
                  className="h-10 w-auto"
                />
                <div>
                  <h2 className="font-bold text-base md:text-lg">
                    HOJA DE INSPECCIÓN HIDROSUCCIONADORA
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Formato para registrar el estado del equipo, condiciones
                    generales y observaciones.
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-right text-slate-600">
                <p>Fecha de versión: 01-01-2026</p>
                <p>Versión: 01</p>
              </div>
            </div>

            <hr className="border-slate-200" />

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">
                1. Datos del reporte
              </h3>
              <p className="text-[11px] text-slate-500">
                Datos del cliente, contacto, servicio y técnico responsable.
              </p>
            </div>

            <div className="space-y-4">
              {/* Cliente */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Cliente (empresa) *
                </label>
                <input
                  type="text"
                  name="client"
                  value={formData.client}
                  onChange={handleHeaderChange}
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Nombre de la empresa cliente"
                />
              </div>

              {/* Contacto + cargo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">
                    Contacto del cliente
                  </label>
                  <input
                    type="text"
                    name="clientContact"
                    value={formData.clientContact}
                    onChange={handleHeaderChange}
                    className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                    placeholder="Nombre de la persona de contacto"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">
                    Cargo del cliente
                  </label>
                  <input
                    type="text"
                    name="clientRole"
                    value={formData.clientRole}
                    onChange={handleHeaderChange}
                    className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                    placeholder="Cargo o rol de la persona de contacto"
                  />
                </div>
              </div>

              {/* Correo */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Correo del cliente
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleHeaderChange}
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="correo@cliente.com"
                />
              </div>

              {/* Fecha + código interno */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">
                    Fecha de inspección
                  </label>
                  <input
                    type="date"
                    name="serviceDate"
                    value={formData.serviceDate}
                    onChange={handleHeaderChange}
                    className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">
                    Código interno
                  </label>
                  <input
                    type="text"
                    name="internalCode"
                    value={formData.internalCode}
                    onChange={handleHeaderChange}
                    className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                    placeholder="Identificador interno del servicio"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleHeaderChange}
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Dirección donde se realiza la inspección"
                />
              </div>

              {/* Referencia */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Referencia
                </label>
                <textarea
                  rows={2}
                  name="reference"
                  value={formData.reference}
                  onChange={handleHeaderChange}
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
                  placeholder="Puntos de referencia para llegar al sitio"
                />
              </div>

              {/* Técnico */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">
                    Técnico responsable
                  </label>
                  <input
                    type="text"
                    name="technicalPersonnel"
                    value={formData.technicalPersonnel}
                    onChange={handleHeaderChange}
                    className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                    placeholder="Nombre del técnico ASTAP"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">
                    Teléfono del técnico
                  </label>
                  <input
                    type="tel"
                    name="technicianPhone"
                    value={formData.technicianPhone}
                    onChange={handleHeaderChange}
                    className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                    placeholder="+593 ..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">
                    Correo del técnico
                  </label>
                  <input
                    type="email"
                    name="technicianEmail"
                    value={formData.technicianEmail}
                    onChange={handleHeaderChange}
                    className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                    placeholder="tecnico@astap.com"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 2. ESTADO DEL EQUIPO */}
          <section className="bg-white shadow-lg rounded-2xl border p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                2. Estado del equipo
              </h3>
              <p className="text-[11px] text-slate-500">
                Haga clic sobre la imagen para marcar puntos con daños o
                defectos. Haga doble clic sobre un número para eliminarlo.
              </p>
            </div>

            <div
              className="relative border rounded-xl overflow-hidden bg-slate-50 cursor-crosshair"
              onClick={handleImageClick}
            >
              <img
                src="/estado-equipo.png"
                alt="Esquema del equipo para marcar daños"
                className="w-full max-h-[420px] object-contain select-none"
              />

              {damagePoints.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onDoubleClick={() => handlePointDoubleClick(p.id)}
                  className="absolute w-6 h-6 rounded-full bg-red-600 text-[11px] text-white flex items-center justify-center shadow"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {p.id}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-700">
                  Descripción general del estado del equipo
                </span>
                <textarea
                  name="estadoEquipo"
                  rows={3}
                  value={formData.estadoEquipo}
                  onChange={handleHeaderChange}
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-700">
                  Observaciones adicionales
                </span>
                <textarea
                  name="observacionesGenerales"
                  rows={3}
                  value={formData.observacionesGenerales}
                  onChange={handleHeaderChange}
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
                />
              </label>
            </div>
          </section>

          {/* 3–5. TABLAS DE ÍTEMS */}
          {secciones.map((sec) => (
            <section
              key={sec.id}
              className="bg-white shadow-lg rounded-2xl border p-6 space-y-3"
            >
              <h3 className="font-semibold text-xs md:text-sm text-slate-900">
                {sec.titulo}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 border-collapse text-[10px] md:text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1 w-16">Ítem</th>
                      <th className="border px-2 py-1 text-left">
                        Detalle del parámetro o actividad ejecutada
                      </th>
                      <th className="border px-2 py-1 w-10">Sí</th>
                      <th className="border px-2 py-1 w-10">No</th>
                      <th className="border px-2 py-1 w-48">
                        Observación / Novedad
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.items.map((item) => {
                      const estado =
                        formData.items[item.codigo]?.estado || "";
                      const obs =
                        formData.items[item.codigo]?.observacion || "";
                      return (
                        <tr key={item.codigo}>
                          <td className="border px-2 py-1 text-center">
                            {item.codigo}
                          </td>
                          <td className="border px-2 py-1">{item.texto}</td>
                          <td className="border px-2 py-1 text-center">
                            <input
                              type="radio"
                              name={`estado-${item.codigo}`}
                              value="SI"
                              checked={estado === "SI"}
                              onChange={(e) =>
                                handleItemChange(
                                  item.codigo,
                                  "estado",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="border px-2 py-1 text-center">
                            <input
                              type="radio"
                              name={`estado-${item.codigo}`}
                              value="NO"
                              checked={estado === "NO"}
                              onChange={(e) =>
                                handleItemChange(
                                  item.codigo,
                                  "estado",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="border px-2 py-1">
                            <input
                              className="w-full border rounded px-1 py-0.5"
                              value={obs}
                              onChange={(e) =>
                                handleItemChange(
                                  item.codigo,
                                  "observacion",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          {/* 6. DESCRIPCIÓN DEL EQUIPO */}
          <section className="bg-white shadow-lg rounded-2xl border p-6 space-y-3">
            <h3 className="font-semibold text-xs md:text-sm text-slate-900">
              6. Descripción del equipo
            </h3>
            <div className="grid md:grid-cols-4 gap-3">
              <label className="flex flex-col gap-1 text-xs">
                <span>Marca</span>
                <input
                  name="marca"
                  value={formData.marca}
                  onChange={handleHeaderChange}
                  className="border rounded px-2 py-1 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span>Modelo</span>
                <input
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleHeaderChange}
                  className="border rounded px-2 py-1 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span>N° serie</span>
                <input
                  name="numeroSerie"
                  value={formData.numeroSerie}
                  onChange={handleHeaderChange}
                  className="border rounded px-2 py-1 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span>Placa N°</span>
                <input
                  name="placa"
                  value={formData.placa}
                  onChange={handleHeaderChange}
                  className="border rounded px-2 py-1 text-sm"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs">
                <span>Horas trabajo módulo</span>
                <input
                  name="horasModulo"
                  value={formData.horasModulo}
                  onChange={handleHeaderChange}
                  className="border rounded px-2 py-1 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span>Horas trabajo chasis</span>
                <input
                  name="horasChasis"
                  value={formData.horasChasis}
                  onChange={handleHeaderChange}
                  className="border rounded px-2 py-1 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span>Año modelo</span>
                <input
                  name="anioModelo"
                  value={formData.anioModelo}
                  onChange={handleHeaderChange}
                  className="border rounded px-2 py-1 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span>VIN chasis</span>
                <input
                  name="vinChasis"
                  value={formData.vinChasis}
                  onChange={handleHeaderChange}
                  className="border rounded px-2 py-1 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs md:col-span-2">
                <span>Kilometraje</span>
                <input
                  name="kilometraje"
                  value={formData.kilometraje}
                  onChange={handleHeaderChange}
                  className="border rounded px-2 py-1 text-sm"
                />
              </label>
            </div>
          </section>

          {/* 7. FIRMAS Y RESPONSABLES (FIRMA DIGITAL) */}
          <section className="bg-white shadow-lg rounded-2xl border p-6 space-y-4">
            <h3 className="font-semibold text-xs md:text-sm text-slate-900">
              7. Firmas y responsables
            </h3>
            <p className="text-[11px] text-slate-600">
              Capture la firma del técnico de ASTAP y la del cliente. Use mouse
              o toque sobre el recuadro para firmar.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Firma Técnico ASTAP */}
              <div className="space-y-2">
                <p className="text-xs font-semibold">Firma Técnico ASTAP</p>
                <p className="text-[11px] text-slate-500">
                  Responsable del servicio
                </p>

                <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50 px-3 py-3">
                  <ReactSignatureCanvas
                    ref={astapSigRef}
                    penColor="#0f172a"
                    canvasProps={{
                      className:
                        "w-full h-40 bg-white rounded-lg border border-slate-200",
                    }}
                    onEnd={() => saveSignature("astap")}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => clearSignature("astap")}
                      className="text-[11px] text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                    >
                      ⟳ Limpiar
                    </button>
                    <span className="text-[11px] text-slate-400">
                      Use mouse o toque para firmar
                    </span>
                  </div>
                </div>
              </div>

              {/* Firma del Cliente */}
              <div className="space-y-2">
                <p className="text-xs font-semibold">Firma del Cliente</p>
                <p className="text-[11px] text-slate-500">
                  Confirmación de recepción del servicio
                </p>

                <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50 px-3 py-3">
                  <ReactSignatureCanvas
                    ref={clientSigRef}
                    penColor="#0f172a"
                    canvasProps={{
                      className:
                        "w-full h-40 bg-white rounded-lg border border-slate-200",
                    }}
                    onEnd={() => saveSignature("client")}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => clearSignature("client")}
                      className="text-[11px] text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                    >
                      ⟳ Limpiar
                    </button>
                    <span className="text-[11px] text-slate-400">
                      Use mouse o toque para firmar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* BOTONES FINALES */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetItems}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs md:text-sm text-slate-700 bg-white hover:bg-slate-50"
            >
              Limpiar ítems (Sí/No)
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs md:text-sm hover:bg-blue-700"
            >
              Guardar / continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HojaInspeccionHidro;
