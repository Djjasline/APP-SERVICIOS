// src/app/inspeccion/index.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

// ======================================================
// Secciones de ítems (Sí / No / Observación)
// ======================================================
const secciones = [
  {
    id: "sec1",
    titulo:
      "2. Pruebas de encendido del equipo y funcionamiento de sus sistemas, previos al servicio",
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
      "3. Evaluación del estado de los componentes o sistemas del módulo – A) Sistema hidráulico (aceites)",
    items: [
      {
        codigo: "A.1",
        texto:
          "Fugas de aceite hidráulico (mangueras - acoples - bancos)",
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
        texto:
          "Evaluación de bancos hidráulicos, presentan fugas o daños",
      },
    ],
  },
  {
    id: "secB",
    titulo:
      "4. Evaluación del estado de los componentes o sistemas del módulo – B) Sistema hidráulico (agua)",
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
          "Inspección de los sellos del tanque de desperdicios (frontal y posterior), presencia de humedad en sus componentes",
      },
      {
        codigo: "B.6",
        texto:
          'Inspección del estado de los filtros malla para agua de 2" y 3"',
      },
    ],
  },
  // Aquí luego se pueden agregar más secciones (C, D, etc.)
];

// ======================================================
// Componente principal
// ======================================================
const InspeccionHidro = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // 1. Datos del reporte (mismo modelo que informe general)
    client: "",
    clientContact: "",
    clientEmail: "",
    clientRole: "",
    serviceDate: "",
    internalCode: "",
    address: "",
    reference: "",
    technicalPersonnel: "",
    technicianPhone: "",
    technicianEmail: "",

    // Estado / observaciones
    estadoEquipoTexto: "",
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

    // Firmas
    elaboradoNombre: "",
    elaboradoCargo: "",
    elaboradoTelefono: "",
    elaboradoCorreo: "",
    autorizadoNombre: "",
    autorizadoCargo: "",
    autorizadoTelefono: "",
    autorizadoCorreo: "",

    // Ítems (Sí/No + observación)
    items: {},
  });

  // Marcadores sobre la imagen del equipo
  const [markers, setMarkers] = useState([]);

  // =====================
  // Handlers generales
  // =====================
  const handleChange = (e) => {
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

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMarkers((prev) => [
      ...prev,
      { id: prev.length + 1, x, y },
    ]);
  };

  const handleMarkerDoubleClick = (id) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleResetItems = () => {
    setFormData((prev) => ({ ...prev, items: {} }));
    setMarkers([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí luego se podrá conectar a backend o generar PDF
    console.log("Datos hoja inspección:", formData, markers);
    alert("Datos de inspección guardados en memoria (consola).");
  };

  const handleBackToPanel = () => {
    navigate("/"); // Panel principal
  };

  // =====================
  // Render
  // =====================
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Barra superior */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Hoja de inspección hidrosuccionador
            </h1>
            <p className="text-sm text-slate-600">
              Inspección y valoración de equipos / hidrosuccionador.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            iconName="ArrowLeft"
            onClick={handleBackToPanel}
          >
            Volver al panel
          </Button>
        </header>

        {/* Contenido principal */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-2xl p-6 space-y-6 text-xs md:text-sm"
        >
          {/* Encabezado con logo ASTAP */}
          <section className="border rounded-xl p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/astap-logo.jpg"
                  alt="ASTAP"
                  className="h-10 w-auto"
                />
                <div>
                  <h2 className="font-bold text-base md:text-lg text-slate-900">
                    HOJA DE INSPECCIÓN HIDROSUCCIONADOR
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
          </section>

          {/* 1. Datos del reporte (mismo modelo del informe general) */}
          <section className="border rounded-xl p-4 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                1. Datos del reporte
              </h2>
              <p className="text-xs text-slate-500">
                Datos del cliente, contacto, servicio y técnico responsable.
              </p>
            </div>

            <div className="space-y-4">
              {/* Cliente */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Cliente (empresa) *
                </label>
                <input
                  type="text"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Nombre de la empresa cliente"
                />
              </div>

              {/* Contacto + cargo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Contacto del cliente
                  </label>
                  <input
                    type="text"
                    name="clientContact"
                    value={formData.clientContact}
                    onChange={handleChange}
                    className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                    placeholder="Nombre de la persona de contacto"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Cargo del cliente
                  </label>
                  <input
                    type="text"
                    name="clientRole"
                    value={formData.clientRole}
                    onChange={handleChange}
                    className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                    placeholder="Cargo o rol de la persona de contacto"
                  />
                </div>
              </div>

              {/* Correo cliente */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Correo del cliente
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="correo@cliente.com"
                />
              </div>

              {/* Fecha + código interno */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Fecha de servicio / inspección
                  </label>
                  <input
                    type="date"
                    name="serviceDate"
                    value={formData.serviceDate}
                    onChange={handleChange}
                    className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Código interno (Cód. INF.)
                  </label>
                  <input
                    type="text"
                    name="internalCode"
                    value={formData.internalCode}
                    onChange={handleChange}
                    className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                    placeholder="Identificador interno del servicio"
                  />
                </div>
              </div>

              {/* Dirección + referencia */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Dirección / ubicación
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Dirección donde se realiza la inspección"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Referencia
                </label>
                <textarea
                  rows={2}
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
                  placeholder="Puntos de referencia para llegar al sitio"
                />
              </div>

              {/* Datos del técnico */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Técnico responsable
                  </label>
                  <input
                    type="text"
                    name="technicalPersonnel"
                    value={formData.technicalPersonnel}
                    onChange={handleChange}
                    className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                    placeholder="Nombre del técnico ASTAP"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Teléfono del técnico
                  </label>
                  <input
                    type="tel"
                    name="technicianPhone"
                    value={formData.technicianPhone}
                    onChange={handleChange}
                    className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                    placeholder="+593 ..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Correo del técnico
                  </label>
                  <input
                    type="email"
                    name="technicianEmail"
                    value={formData.technicianEmail}
                    onChange={handleChange}
                    className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                    placeholder="tecnico@astap.com"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 2. Estado del equipo con imagen clicable */}
          <section className="border rounded-xl p-4 space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                2. Estado del equipo
              </h2>
              <p className="text-xs text-slate-500">
                Haga clic sobre la imagen para marcar puntos con daños o
                defectos. Haga doble clic sobre un número para eliminarlo.
              </p>
            </div>

            <div
              className="relative border rounded-xl bg-slate-50 overflow-hidden cursor-crosshair"
              onClick={handleImageClick}
            >
              <img
                src="/estado-equipo.png"
                alt="Vistas del equipo"
                className="w-full h-auto select-none pointer-events-none"
              />

              {/* Marcadores */}
              {markers.map((marker) => (
                <div
                  key={marker.id}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleMarkerDoubleClick(marker.id);
                  }}
                  className="absolute flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-[10px] font-semibold shadow cursor-pointer"
                  style={{
                    left: `${marker.x}%`,
                    top: `${marker.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {marker.id}
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <label className="flex flex-col gap-1">
                <span className="font-semibold text-xs text-slate-700">
                  Estado general del equipo
                </span>
                <textarea
                  name="estadoEquipoTexto"
                  value={formData.estadoEquipoTexto}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 min-h-[80px] text-sm outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
                  placeholder="Describa el estado general del equipo, daños visibles, condiciones especiales, etc."
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-semibold text-xs text-slate-700">
                  Observaciones generales
                </span>
                <textarea
                  name="observacionesGenerales"
                  value={formData.observacionesGenerales}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 min-h-[80px] text-sm outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
                  placeholder="Observaciones adicionales relevantes para la inspección."
                />
              </label>
            </div>
          </section>

          {/* 3+. Tablas de ítems (Sí / No / Observación) */}
          {secciones.map((sec) => (
            <section key={sec.id} className="border rounded-xl p-4 space-y-3">
              <h2 className="font-semibold text-xs md:text-sm">
                {sec.titulo}
              </h2>
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

          {/* Descripción del equipo */}
          <section className="border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold text-xs md:text-sm">
              5. Descripción del equipo
            </h2>
            <div className="grid md:grid-cols-4 gap-3">
              <label className="flex flex-col gap-1">
                <span>Marca</span>
                <input
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  className="border rounded px-2 py-1"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span>Modelo</span>
                <input
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  className="border rounded px-2 py-1"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span>N° serie</span>
                <input
                  name="numeroSerie"
                  value={formData.numeroSerie}
                  onChange={handleChange}
                  className="border rounded px-2 py-1"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span>Placa N°</span>
                <input
                  name="placa"
                  value={formData.placa}
                  onChange={handleChange}
                  className="border rounded px-2 py-1"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span>Horas trabajo módulo</span>
                <input
                  name="horasModulo"
                  value={formData.horasModulo}
                  onChange={handleChange}
                  className="border rounded px-2 py-1"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span>Horas trabajo chasis</span>
                <input
                  name="horasChasis"
                  value={formData.horasChasis}
                  onChange={handleChange}
                  className="border rounded px-2 py-1"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span>Año modelo</span>
                <input
                  name="anioModelo"
                  value={formData.anioModelo}
                  onChange={handleChange}
                  className="border rounded px-2 py-1"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span>VIN chasis</span>
                <input
                  name="vinChasis"
                  value={formData.vinChasis}
                  onChange={handleChange}
                  className="border rounded px-2 py-1"
                />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span>Kilometraje</span>
                <input
                  name="kilometraje"
                  value={formData.kilometraje}
                  onChange={handleChange}
                  className="border rounded px-2 py-1"
                />
              </label>
            </div>
          </section>

          {/* Firmas y responsables */}
          <section className="border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold text-xs md:text-sm">
              6. Firmas y responsables
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="font-semibold text-xs">
                  Elaborado por: ASTAP Cía. Ltda.
                </p>
                <label className="flex flex-col gap-1">
                  <span>Nombre</span>
                  <input
                    name="elaboradoNombre"
                    value={formData.elaboradoNombre}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span>Cargo</span>
                  <input
                    name="elaboradoCargo"
                    value={formData.elaboradoCargo}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span>Teléfono</span>
                  <input
                    name="elaboradoTelefono"
                    value={formData.elaboradoTelefono}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span>Correo</span>
                  <input
                    name="elaboradoCorreo"
                    value={formData.elaboradoCorreo}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-xs">
                  Autorizado por: CLIENTE
                </p>
                <label className="flex flex-col gap-1">
                  <span>Nombre</span>
                  <input
                    name="autorizadoNombre"
                    value={formData.autorizadoNombre}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span>Cargo</span>
                  <input
                    name="autorizadoCargo"
                    value={formData.autorizadoCargo}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span>Teléfono</span>
                  <input
                    name="autorizadoTelefono"
                    value={formData.autorizadoTelefono}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span>Correo</span>
                  <input
                    name="autorizadoCorreo"
                    value={formData.autorizadoCorreo}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Botones inferiores */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetItems}
              className="px-4 py-2 rounded-lg border text-xs md:text-sm inline-flex items-center gap-1"
            >
              <Icon name="Eraser" size={14} />
              Limpiar ítems / puntos
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs md:text-sm inline-flex items-center gap-1"
            >
              <Icon name="Save" size={14} />
              Guardar / continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InspeccionHidro;
