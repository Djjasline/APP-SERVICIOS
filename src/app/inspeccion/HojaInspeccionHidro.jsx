import React, { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  getInspectionHistory,
  markInspectionCompleted,
} from "@utils/inspectionStorage";

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
      "2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O ESTADO DE LOS SISTEMAS DEL MÓDULO VACTOR – B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      {
        codigo: "B.1",
        texto:
          "Estado de los empaques de la tapa de los filtros de agua",
      },
      {
        codigo: "B.2",
        texto:
          "Inspección del sistema de tapón de expansión de 2\" de tanques de agua",
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

/* =============================
   COMPONENTE PRINCIPAL
============================= */
export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReadOnly = searchParams.get("view") === "readonly";

  const [formData, setFormData] = useState({
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

    marca: "",
    modelo: "",
    numeroSerie: "",
    placa: "",
    horasModulo: "",
    horasChasis: "",
    anioModelo: "",
    vinChasis: "",
    kilometraje: "",

    elaboradoNombre: "",
    elaboradoCargo: "",
    elaboradoTelefono: "",
    elaboradoCorreo: "",
    autorizadoNombre: "",
    autorizadoCargo: "",
    autorizadoTelefono: "",
    autorizadoCorreo: "",

    items: {},
  });

  /* =============================
     CARGAR DESDE HISTORIAL
  ============================= */
  useEffect(() => {
    if (!id) return;

    const history = getInspectionHistory();
    const item = history.hidro.find((i) => i.id === id);

    if (item?.datos) {
      setFormData(item.datos);
    }
  }, [id]);

  /* =============================
     HANDLERS
  ============================= */
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
    markInspectionCompleted("hidro", id, formData);
    navigate("/inspeccion");
  };

  const generarPDF = () => {
    alert("Aquí se generará el PDF (siguiente paso)");
  };

  /* =============================
     JSX (FORMATO ORIGINAL)
  ============================= */
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow-lg rounded-2xl p-6 space-y-6 text-xs md:text-sm"
    >

      {/* ================= ENCABEZADO ================= */}
      <section className="border rounded-xl p-4 space-y-3">
        <div className="flex justify-between">
          <h1 className="font-bold text-lg">
            HOJA DE INSPECCIÓN HIDROSUCCIONADOR
          </h1>
          <div className="text-[10px] text-right">
            <p>Fecha de versión: 25-11-2025</p>
            <p>Versión: 01</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <input
            name="referenciaContrato"
            value={formData.referenciaContrato}
            onChange={handleChange}
            disabled={isReadOnly}
            className="border rounded px-2 py-1"
            placeholder="Referencia contrato"
          />
          <input
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            disabled={isReadOnly}
            className="border rounded px-2 py-1 md:col-span-2"
            placeholder="Descripción"
          />
          <input
            name="codInf"
            value={formData.codInf}
            onChange={handleChange}
            disabled={isReadOnly}
            className="border rounded px-2 py-1"
            placeholder="Cod. INF."
          />
        </div>
      </section>

      {/* ================= ESTADO EQUIPO ================= */}
      <section className="border rounded-xl p-4 space-y-3">
        <textarea
          name="estadoEquipo"
          value={formData.estadoEquipo}
          onChange={handleChange}
          readOnly={isReadOnly}
          className="border rounded px-2 py-1 min-h-[80px] w-full"
          placeholder="Estado del equipo"
        />
        <textarea
          name="observacionesGenerales"
          value={formData.observacionesGenerales}
          onChange={handleChange}
          readOnly={isReadOnly}
          className="border rounded px-2 py-1 min-h-[80px] w-full"
          placeholder="Observaciones generales"
        />
      </section>

      {/* ================= TABLAS ================= */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">{sec.titulo}</h2>
          <table className="w-full border-collapse border text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2">Ítem</th>
                <th className="border px-2">Detalle</th>
                <th className="border px-2">Sí</th>
                <th className="border px-2">No</th>
                <th className="border px-2">Observación</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map((item) => (
                <tr key={item.codigo}>
                  <td className="border px-2">{item.codigo}</td>
                  <td className="border px-2">{item.texto}</td>
                  <td className="border px-2 text-center">
                    <input
                      type="radio"
                      disabled={isReadOnly}
                      checked={
                        formData.items[item.codigo]?.estado === "SI"
                      }
                      onChange={() =>
                        handleItemChange(item.codigo, "estado", "SI")
                      }
                    />
                  </td>
                  <td className="border px-2 text-center">
                    <input
                      type="radio"
                      disabled={isReadOnly}
                      checked={
                        formData.items[item.codigo]?.estado === "NO"
                      }
                      onChange={() =>
                        handleItemChange(item.codigo, "estado", "NO")
                      }
                    />
                  </td>
                  <td className="border px-2">
                    <input
                      className="w-full border px-1"
                      disabled={isReadOnly}
                      value={
                        formData.items[item.codigo]?.observacion || ""
                      }
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
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* ================= BOTONES ================= */}
      <div className="flex justify-end gap-3">
        {isReadOnly ? (
          <>
            <button
              type="button"
              onClick={generarPDF}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Generar PDF
            </button>
            <button
              type="button"
              onClick={() => navigate("/inspeccion")}
              className="px-4 py-2 border rounded"
            >
              Volver
            </button>
          </>
        ) : (
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Guardar / continuar
          </button>
        )}
      </div>
    </form>
  );
}
