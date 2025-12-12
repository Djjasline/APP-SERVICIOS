// src/pages/inspection/index.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

// ============================
//  Secciones de inspección
// ============================
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
          'Inspección del estado de los filtros malla para agua de 2" y 3"',
      },
    ],
  },
  // Más adelante aquí podemos agregar secC, secD, etc.
];

// ============================
//  Componente Hoja Inspección
// ============================
function HojaInspeccionHidro() {
  const [formData, setFormData] = useState({
    // encabezado
    referenciaContrato: "",
    descripcion: "",
    codInf: "",
    fechaInspeccion: "",
    ubicacion: "",
    cliente: "",
    tecnicoAstap: "",
    responsableCliente: "",
    estadoEquipo: "",
    observacionesGenerales: "",
    // descripción del equipo
    marca: "",
    modelo: "",
    numeroSerie: "",
    placa: "",
    horasModulo: "",
    horasChasis: "",
    anioModelo: "",
    vinChasis: "",
    kilometraje: "",
    // firmas
    elaboradoNombre: "",
    elaboradoCargo: "",
    elaboradoTelefono: "",
    elaboradoCorreo: "",
    autorizadoNombre: "",
    autorizadoCargo: "",
    autorizadoTelefono: "",
    autorizadoCorreo: "",
    // ítems SI/NO + observación
    items: {},
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Más adelante conectamos esto con PDF o backend
    console.log("Datos de inspección:", formData);
    alert("Inspección registrada en memoria (consola del navegador).");
  };

  const handleResetItems = () => {
    setFormData((prev) => ({
      ...prev,
      items: {},
    }));
  };

  return (
    <form
      className="max-w-6xl mx-auto my-4 bg-white shadow-lg rounded-2xl p-6 space-y-6 text-xs md:text-sm"
      onSubmit={handleSubmit}
    >
      {/* ENCABEZADO */}
      <section className="border rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h1 className="font-bold text-base md:text-lg text-center md:text-left">
            HOJA DE INSPECCIÓN HIDROSUCCIONADOR
          </h1>
          <div className="text-[10px] text-right">
            <p>Fecha de versión: 25-11-2025</p>
            <p>Versión: 01</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Referencia de contrato</span>
            <input
              name="referenciaContrato"
              value={formData.referenciaContrato}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="font-semibold">Descripción</span>
            <input
              name="descripcion"
              value={formData.descripcion}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Cod. INF.</span>
            <input
              name="codInf"
              value={formData.codInf}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Fecha de inspección</span>
            <input
              type="date"
              name="fechaInspeccion"
              value={formData.fechaInspeccion}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Ubicación</span>
            <input
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Cliente</span>
            <input
              name="cliente"
              value={formData.cliente}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Técnico ASTAP</span>
            <input
              name="tecnicoAstap"
              value={formData.tecnicoAstap}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="font-semibold">Responsable cliente</span>
            <input
              name="responsableCliente"
              value={formData.responsableCliente}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
        </div>
      </section>

      {/* ESTADO GENERAL DEL EQUIPO */}
      <section className="border rounded-xl p-4 space-y-3">
        <label className="flex flex-col gap-1">
          <span className="font-semibold">Estado del equipo</span>
          <textarea
            name="estadoEquipo"
            value={formData.estadoEquipo}
            onChange={handleHeaderChange}
            className="border rounded px-2 py-1 min-h-[80px]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">Observaciones generales</span>
          <textarea
            name="observacionesGenerales"
            value={formData.observacionesGenerales}
            onChange={handleHeaderChange}
            className="border rounded px-2 py-1 min-h-[80px]"
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

      {/* DESCRIPCIÓN DEL EQUIPO */}
      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-xs md:text-sm">
          Descripción del equipo
        </h2>
        <div className="grid md:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1">
            <span>Marca</span>
            <input
              name="marca"
              value={formData.marca}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Modelo</span>
            <input
              name="modelo"
              value={formData.modelo}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>N° serie</span>
            <input
              name="numeroSerie"
              value={formData.numeroSerie}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Placa / Código interno</span>
            <input
              name="placa"
              value={formData.placa}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Horas módulo</span>
            <input
              name="horasModulo"
              value={formData.horasModulo}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Horas chasis</span>
            <input
              name="horasChasis"
              value={formData.horasChasis}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Año modelo</span>
            <input
              name="anioModelo"
              value={formData.anioModelo}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>VIN chasis</span>
            <input
              name="vinChasis"
              value={formData.vinChasis}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Kilometraje</span>
            <input
              name="kilometraje"
              value={formData.kilometraje}
              onChange={handleHeaderChange}
              className="border rounded px-2 py-1"
            />
          </label>
        </div>
      </section>

      {/* FIRMAS */}
      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-xs md:text-sm">Firmas</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-xs">
              Elaborado por ASTAP / Técnico
            </h3>
            <label className="flex flex-col gap-1">
              <span>Nombre</span>
              <input
                name="elaboradoNombre"
                value={formData.elaboradoNombre}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Cargo</span>
              <input
                name="elaboradoCargo"
                value={formData.elaboradoCargo}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Teléfono</span>
              <input
                name="elaboradoTelefono"
                value={formData.elaboradoTelefono}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Correo</span>
              <input
                name="elaboradoCorreo"
                value={formData.elaboradoCorreo}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-xs">
              Autorizado por cliente
            </h3>
            <label className="flex flex-col gap-1">
              <span>Nombre</span>
              <input
                name="autorizadoNombre"
                value={formData.autorizadoNombre}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Cargo</span>
              <input
                name="autorizadoCargo"
                value={formData.autorizadoCargo}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Teléfono</span>
              <input
                name="autorizadoTelefono"
                value={formData.autorizadoTelefono}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Correo</span>
              <input
                name="autorizadoCorreo"
                value={formData.autorizadoCorreo}
                onChange={handleHeaderChange}
                className="border rounded px-2 py-1"
              />
            </label>
          </div>
        </div>
      </section>

      {/* BOTONES */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleResetItems}
          className="inline-flex items-center text-xs text-slate-600 hover:text-slate-900"
        >
          <Icon name="Eraser" size={14} className="mr-1" />
          Limpiar ítems de inspección
        </button>

        <Button
          size="sm"
          iconName="Save"
          iconPosition="left"
          type="submit"
        >
          Guardar (por ahora en consola)
        </Button>
      </div>
    </form>
  );
}

// ============================
//  Página que usa la hoja
// ============================
const InspectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Encabezado superior */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Hoja de inspección hidráulica
            </h1>
            <p className="text-sm text-slate-600">
              Inspección y valoración de equipos Vactor / hidrosuccionador.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            iconName="ArrowLeft"
            onClick={() => navigate("/")}
          >
            Volver al panel
          </Button>
        </header>

        {/* Formulario completo */}
        <HojaInspeccionHidro />
      </div>
    </div>
  );
};

export default InspectionPage;
