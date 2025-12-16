// src/app/inspeccion/HojaInspeccionHidro.jsx
import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

// ======================================================================
//  Definición de secciones de ítems (SI / NO + Observación)
// ======================================================================
const secciones = [
  {
    id: "sec1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
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
      "2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O ESTADO DE LOS SISTEMAS DEL MÓDULO VACTOR – A) SISTEMA HIDRÁULICO (ACEITES)",
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
        texto: "Estado de los cilindros hidráulicos, presenta fugas o daños",
      },
      {
        codigo: "A.9",
        texto: "Evaluación del estado de los tapones de drenaje de lubricantes",
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
      "2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O ESTADO DE LOS SISTEMAS DEL MÓDULO VACTOR – B) SISTEMA HIDRÁULICO (AGUA)",
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
          "Inspección del estado de los filtros malla para agua de 2\" y 3\"",
      },
    ],
  },
];

// ======================================================================
//  Componente principal
// ======================================================================
const HojaInspeccionHidro = () => {
  const [formData, setFormData] = useState({
    // 1. Datos del reporte
    clienteEmpresa: "",
    contactoCliente: "",
    cargoCliente: "",
    correoCliente: "",
    fechaServicio: "",
    codigoInterno: "",
    direccion: "",
    referencia: "",
    tecnicoAstap: "",
    telefonoTecnico: "",
    correoTecnico: "",

    // Encabezado específico de la hoja
    referenciaContrato: "",
    descripcion: "",
    codInf: "",
    fechaInspeccion: "",
    ubicacion: "",
    cliente: "",
    responsableCliente: "",
    estadoEquipo: "",
    observacionesGenerales: "",

    // 5. Datos del equipo
    equipoUnidad: "",
    marca: "",
    modelo: "",
    numeroSerie: "",
    placa: "",
    horasModulo: "",
    horasChasis: "",
    anioModelo: "",
    vinChasis: "",
    kilometraje: "",

    // Ítems
    items: {},

    // Firmas digitales
    digitalSignatures: {
      astap: null,
      client: null,
    },
  });

  // Puntos sobre la imagen de estado del equipo
  const [equipmentMarks, setEquipmentMarks] = useState([]);

  // Refs para firmas
  const astapSigRef = useRef(null);
  const clientSigRef = useRef(null);

  // ================================================================
  // Handlers generales
  // ================================================================
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

  // ================================================================
  // Estado del equipo: imagen con puntos numerados
  // ================================================================
  const handleEquipmentClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setEquipmentMarks((prev) => [
      ...prev,
      { id: prev.length + 1, x, y },
    ]);
  };

  const handleMarkerDoubleClick = (id) => {
    setEquipmentMarks((prev) => prev.filter((m) => m.id !== id));
  };

  // ================================================================
  // Firmas digitales
  // ================================================================
  const handleClearSignature = (who) => {
    if (who === "astap" && astapSigRef.current) {
      astapSigRef.current.clear();
    }
    if (who === "client" && clientSigRef.current) {
      clientSigRef.current.clear();
    }
  };

  const handleSaveSignatures = () => {
    const astapData =
      astapSigRef.current && !astapSigRef.current.isEmpty()
        ? astapSigRef.current.toDataURL("image/png")
        : null;

    const clientData =
      clientSigRef.current && !clientSigRef.current.isEmpty()
        ? clientSigRef.current.toDataURL("image/png")
        : null;

    setFormData((prev) => ({
      ...prev,
      digitalSignatures: {
        astap: astapData,
        client: clientData,
      },
    }));

    alert("Firmas guardadas en el formulario (luego las conectamos al PDF).");
  };

  // ================================================================
  // Envío del formulario
  // ================================================================
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos de inspección:", {
      ...formData,
      equipmentMarks,
    });
    alert("Datos del reporte guardados en memoria (PDF pendiente).");
  };

  const handleResetItems = () => {
    setFormData((prev) => ({
      ...prev,
      items: {},
    }));
  };

  // ==================================================================
  // Render
  // ==================================================================
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow-lg rounded-2xl p-6 space-y-6 text-xs md:text-sm"
    >
      {/* ENCABEZADO CON LOGO */}
      <section className="border rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/astap-logo.jpg"
              alt="ASTAP"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="font-bold text-base md:text-lg text-slate-900">
                HOJA DE INSPECCIÓN HIDROSUCCIONADORA
              </h1>
              <p className="text-[11px] text-slate-500">
                Inspección y valoración de equipos Vactor / hidrosuccionador.
              </p>
            </div>
          </div>

          <div className="text-[10px] text-right text-slate-600">
            <p>Fecha de versión: 01-01-2026</p>
            <p>Versión: 01</p>
          </div>
        </div>
      </section>

      {/* 1. DATOS DEL REPORTE (mismo modelo que el informe de servicio) */}
      <section className="border rounded-xl p-4 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            1. Datos del reporte
          </h2>
          <p className="text-[11px] text-slate-500">
            Datos del cliente, contacto, servicio y técnico responsable.
          </p>
        </div>

        <div className="space-y-4">
          {/* Cliente empresa */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">
              Cliente (empresa) *
            </label>
            <input
              type="text"
              name="clienteEmpresa"
              value={formData.clienteEmpresa}
              onChange={handleHeaderChange}
              className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              placeholder="Nombre de la empresa cliente"
            />
          </div>

          {/* Contacto y cargo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Contacto del cliente
              </label>
              <input
                type="text"
                name="contactoCliente"
                value={formData.contactoCliente}
                onChange={handleHeaderChange}
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Nombre de la persona de contacto"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Cargo del cliente
              </label>
              <input
                type="text"
                name="cargoCliente"
                value={formData.cargoCliente}
                onChange={handleHeaderChange}
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Cargo o rol de la persona de contacto"
              />
            </div>
          </div>

          {/* Correo */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">
              Correo del cliente
            </label>
            <input
              type="email"
              name="correoCliente"
              value={formData.correoCliente}
              onChange={handleHeaderChange}
              className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              placeholder="correo@cliente.com"
            />
          </div>

          {/* Fecha y código interno */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Fecha de servicio
              </label>
              <input
                type="date"
                name="fechaServicio"
                value={formData.fechaServicio}
                onChange={handleHeaderChange}
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Código interno
              </label>
              <input
                type="text"
                name="codigoInterno"
                value={formData.codigoInterno}
                onChange={handleHeaderChange}
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Identificador interno del servicio"
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">
              Dirección
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleHeaderChange}
              className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              placeholder="Dirección donde se realiza el servicio"
            />
          </div>

          {/* Referencia */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">
              Referencia
            </label>
            <textarea
              name="referencia"
              rows={2}
              value={formData.referencia}
              onChange={handleHeaderChange}
              className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
              placeholder="Puntos de referencia para llegar al sitio"
            />
          </div>

          {/* Datos del técnico */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Técnico responsable
              </label>
              <input
                type="text"
                name="tecnicoAstap"
                value={formData.tecnicoAstap}
                onChange={handleHeaderChange}
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Nombre del técnico ASTAP"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Teléfono del técnico
              </label>
              <input
                type="tel"
                name="telefonoTecnico"
                value={formData.telefonoTecnico}
                onChange={handleHeaderChange}
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="+593 ..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Correo del técnico
              </label>
              <input
                type="email"
                name="correoTecnico"
                value={formData.correoTecnico}
                onChange={handleHeaderChange}
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="tecnico@astap.com"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ESTADO DEL EQUIPO CON IMAGEN ÚNICA */}
      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-xs md:text-sm">2. Estado del equipo</h2>
        <p className="text-[11px] text-slate-500">
          Haga clic sobre la imagen para marcar puntos con daños o defectos. Haga
          doble clic sobre un número para eliminarlo.
        </p>

        <div
          className="relative w-full max-w-3xl mx-auto bg-slate-50 border rounded-xl overflow-hidden cursor-crosshair"
          onClick={handleEquipmentClick}
        >
          <img
            src="/estado-equipo.png"
            alt="Esquema del equipo"
            className="w-full h-auto select-none pointer-events-none"
          />

          {equipmentMarks.map((mark) => (
            <div
              key={mark.id}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleMarkerDoubleClick(mark.id);
              }}
              className="absolute w-6 h-6 bg-red-600 text-white text-[11px] rounded-full flex items-center justify-center shadow cursor-pointer"
              style={{
                left: `${mark.x}%`,
                top: `${mark.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {mark.id}
            </div>
          ))}
        </div>

        <label className="flex flex-col gap-1 pt-3">
          <span className="font-semibold text-[11px] text-slate-700">
            Observaciones generales
          </span>
          <textarea
            name="observacionesGenerales"
            value={formData.observacionesGenerales}
            onChange={handleHeaderChange}
            className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20 min-h-[80px] resize-y"
          />
        </label>
      </section>

      {/* TABLAS DE ÍTEMS */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-xs md:text-sm">{sec.titulo}</h2>
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
                  const estado = formData.items[item.codigo]?.estado || "";
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

      {/* 5. DATOS DEL EQUIPO – mismo modelo que el reporte de servicio */}
      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-xs md:text-sm">5. Datos del equipo</h2>
        <p className="text-[11px] text-slate-500">
          Información del equipo intervenido y sus datos principales.
        </p>

        <div className="space-y-4">
          {/* Equipo / Unidad */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">
              Equipo / Unidad
            </label>
            <input
              type="text"
              name="equipoUnidad"
              value={formData.equipoUnidad}
              onChange={handleHeaderChange}
              className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              placeholder="Descripción del equipo o unidad"
            />
          </div>

          {/* Marca / Modelo / Serie */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Marca
              </label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleHeaderChange}
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Modelo
              </label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleHeaderChange}
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Serie
              </label>
              <input
                type="text"
                name="numeroSerie"
                value={formData.numeroSerie}
                onChange={handleHeaderChange}
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>
          </div>

          {/* Placa / Código interno */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">
              Placa / Código interno
            </label>
            <input
              type="text"
              name="placa"
              value={formData.placa}
              onChange={handleHeaderChange}
              className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
            />
          </div>

          {/* Recorrido / Horas / Año de fabricación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Recorrido (km)
              </label>
              <input
                type="number"
                name="kilometraje"
                value={formData.kilometraje}
                onChange={handleHeaderChange}
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Tiempo de vida útil (horas)
              </label>
              <input
                type="number"
                name="horasModulo"
                value={formData.horasModulo}
                onChange={handleHeaderChange}
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Año de fabricación
              </label>
              <input
                type="number"
                name="anioModelo"
                value={formData.anioModelo}
                onChange={handleHeaderChange}
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>
          </div>

          {/* VIN */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">
              Número de identificación del vehículo (VIN)
            </label>
            <input
              type="text"
              name="vinChasis"
              value={formData.vinChasis}
              onChange={handleHeaderChange}
              className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
            />
          </div>
        </div>
      </section>

      {/* 6. FIRMAS DIGITALES DEL REPORTE */}
      <section className="border rounded-xl p-4 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            6. Firmas digitales del reporte
          </h2>
          <p className="text-[11px] text-slate-500">
            Capture la firma del técnico de ASTAP y la del cliente para validar
            el reporte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Firma ASTAP */}
          <div className="border rounded-xl p-3 space-y-2">
            <h3 className="font-semibold text-xs text-slate-900">
              Firma Técnico ASTAP
            </h3>
            <p className="text-[11px] text-slate-500">
              Responsable del servicio
            </p>
            <div className="border-2 border-dashed rounded-lg min-h-[160px] bg-slate-50">
              <SignatureCanvas
                ref={astapSigRef}
                canvasProps={{
                  className: "w-full h-40 rounded-lg",
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-600">
              <button
                type="button"
                onClick={() => handleClearSignature("astap")}
              >
                ⟳ Limpiar
              </button>
              <span>Use mouse o toque para firmar</span>
            </div>
          </div>

          {/* Firma Cliente */}
          <div className="border rounded-xl p-3 space-y-2">
            <h3 className="font-semibold text-xs text-slate-900">
              Firma del Cliente
            </h3>
            <p className="text-[11px] text-slate-500">
              Confirmación de recepción del servicio
            </p>
            <div className="border-2 border-dashed rounded-lg min-h-[160px] bg-slate-50">
              <SignatureCanvas
                ref={clientSigRef}
                canvasProps={{
                  className: "w-full h-40 rounded-lg",
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-600">
              <button
                type="button"
                onClick={() => handleClearSignature("client")}
              >
                ⟳ Limpiar
              </button>
              <span>Use mouse o toque para firmar</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveSignatures}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs md:text-sm"
          >
            💾 Guardar firmas
          </button>
        </div>
      </section>

      {/* BOTONES FINALES */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleResetItems}
          className="px-4 py-2 rounded-lg border text-xs md:text-sm"
        >
          Limpiar artículos (Sí/No)
        </button>

        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs md:text-sm"
        >
          Guardar / continuar
        </button>
      </div>
    </form>
  );
};

export default HojaInspeccionHidro;
