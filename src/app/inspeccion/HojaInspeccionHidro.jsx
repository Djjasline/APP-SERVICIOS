import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import {
  markInspectionCompleted,
  getInspectionById,
} from "@/utils/inspectionStorage";

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

  const baseState = {
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
    firmas: {
    tecnico: "",
    cliente: "",
  },
  };

  const [formData, setFormData] = useState(baseState);

  useEffect(() => {
    if (!id || id === "0") return;
    const stored = getInspectionById("hidro", id);
    if (stored?.data) {
      setFormData({
        ...baseState,
        ...stored.data,
        estadoEquipoPuntos: stored.data.estadoEquipoPuntos || [],
        items: stored.data.items || {},
      });
    }
  }, [id]);
/* =========================
   RECARGAR FIRMAS AL ABRIR
========================= */
useEffect(() => {
  if (!formData?.firmas) return;

  if (
    formData.firmas.tecnico &&
    firmaTecnicoRef.current
  ) {
    firmaTecnicoRef.current.fromDataURL(
      formData.firmas.tecnico
    );
  }

  if (
    formData.firmas.cliente &&
    firmaClienteRef.current
  ) {
    firmaClienteRef.current.fromDataURL(
      formData.firmas.cliente
    );
  }
}, [formData.firmas]);

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

  /* ===== PUNTOS ROJOS ===== */
  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: [
        ...p.estadoEquipoPuntos,
        { id: p.estadoEquipoPuntos.length + 1, x, y, nota: "" },
      ],
    }));
  };

  const handleRemovePoint = (pid) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos
        .filter((pt) => pt.id !== pid)
        .map((pt, i) => ({ ...pt, id: i + 1 })),
    }));
  };

  const clearAllPoints = () => {
    setFormData((p) => ({ ...p, estadoEquipoPuntos: [] }));
  };

  const handleNotaChange = (pid, value) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos.map((pt) =>
        pt.id === pid ? { ...pt, nota: value } : pt
      ),
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
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >

      {/* ================= ENCABEZADO ================= */}
      <section className="border rounded overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <tbody>
            <tr className="border-b">
              <td rowSpan={4} className="w-32 border-r p-3 text-center">
                <img src="/astap-logo.jpg" className="mx-auto max-h-20" />
              </td>
              <td colSpan={2} className="border-r text-center font-bold">
                HOJA DE INSPECCIÓN HIDROSUCCIONADOR
              </td>
              <td className="p-2">
                <div>Fecha versión: <strong>01-01-26</strong></div>
                <div>Versión: <strong>01</strong></div>
              </td>
            </tr>
            {[
              ["REFERENCIA DE CONTRATO", "referenciaContrato"],
              ["DESCRIPCIÓN", "descripcion"],
              ["COD. INF.", "codInf"],
            ].map(([label, name]) => (
              <tr key={name} className="border-b">
                <td className="border-r p-2 font-semibold">{label}</td>
                <td colSpan={2} className="p-2">
                  <input
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className="w-full border p-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ================= DATOS SERVICIO ================= */}
      <section className="grid md:grid-cols-2 gap-3 border rounded p-4">
        {[
          ["cliente", "Cliente"],
          ["direccion", "Dirección"],
          ["contacto", "Contacto"],
          ["telefono", "Teléfono"],
          ["correo", "Correo"],
          ["tecnicoResponsable", "Técnico responsable"],
          ["telefonoTecnico", "Teléfono técnico"],
          ["correoTecnico", "Correo técnico"],
        ].map(([n, p]) => (
          <input
            key={n}
            name={n}
            placeholder={p}
            value={formData[n]}
            onChange={handleChange}
            className="input"
          />
        ))}
        <input
          type="date"
          name="fechaServicio"
          value={formData.fechaServicio}
          onChange={handleChange}
          className="input md:col-span-2"
        />
      </section>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <section className="border rounded p-4 space-y-3">
        <div className="flex justify-between items-center">
          <p className="font-semibold">Estado del equipo</p>
          <button type="button" onClick={clearAllPoints} className="text-xs border px-2 py-1 rounded">
            Limpiar puntos
          </button>
        </div>

        <div className="relative border rounded cursor-crosshair" onClick={handleImageClick}>
          <img src="/estado-equipo.png" className="w-full" draggable={false} />
          {formData.estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              onDoubleClick={() => handleRemovePoint(pt.id)}
              className="absolute bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full cursor-pointer"
              style={{ left: `${pt.x}%`, top: `${pt.y}%`, transform: "translate(-50%, -50%)" }}
              title="Doble click para eliminar"
            >
              {pt.id}
            </div>
          ))}
        </div>

        {formData.estadoEquipoPuntos.map((pt) => (
  <div key={pt.id} className="flex gap-2">
    <span className="font-semibold">{pt.id})</span>
    <input
      className="w-full border px-1"
      placeholder={`Observación punto ${pt.id}`}
      value={pt.nota}
      onChange={(e) => handleNotaChange(pt.id, e.target.value)}
    />
  </div>
))}
      </section>

      {/* ================= PRUEBAS PREVIAS ================= */}
      <section className="border rounded p-4">
        <h2 className="font-semibold mb-2">
          1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS
        </h2>

        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th>Artículo</th>
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
                <td>
                  <input
                    type="radio"
                    name={`${codigo}-estado`}
                    checked={formData.items[codigo]?.estado === "SI"}
                    onChange={() => handleItemChange(codigo, "estado", "SI")}
                  />
                </td>
                <td>
                  <input
                    type="radio"
                    name={`${codigo}-estado`}
                    checked={formData.items[codigo]?.estado === "NO"}
                    onChange={() => handleItemChange(codigo, "estado", "NO")}
                  />
                </td>
                <td>
                  <input
                    className="w-full border px-1"
                    value={formData.items[codigo]?.observacion || ""}
                    onChange={(e) =>
                      handleItemChange(codigo, "observacion", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <h2 className="font-semibold text-sm px-2">
        2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O SISTEMAS
      </h2>

      {/* ================= TABLAS ================= */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
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
                  <td>
                    <input
                      type="radio"
                      name={`${codigo}-estado`}
                      checked={formData.items[codigo]?.estado === "SI"}
                      onChange={() => handleItemChange(codigo, "estado", "SI")}
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      name={`${codigo}-estado`}
                      checked={formData.items[codigo]?.estado === "NO"}
                      onChange={() => handleItemChange(codigo, "estado", "NO")}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full border px-1"
                      value={formData.items[codigo]?.observacion || ""}
                      onChange={(e) =>
                        handleItemChange(codigo, "observacion", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* ================= DATOS EQUIPO ================= */}
      <section className="border rounded p-4">
        <h2 className="font-semibold text-center mb-2">DESCRIPCIÓN DEL EQUIPO</h2>
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
              <input
                name={n}
                value={formData[n]}
                onChange={handleChange}
                className="col-span-3 border p-1"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ================= FIRMAS ================= */}
      <section className="border rounded p-4">
        <div className="grid md:grid-cols-2 gap-6 text-center">
          <div>
            <p className="font-semibold mb-1">FIRMA TÉCNICO ASTAP</p>
            <SignatureCanvas
  ref={firmaTecnicoRef}
  canvasProps={{
    width: 420,
    height: 150,
    className: "border w-full"
  }}
/>

          </div>
          <div>
            <p className="font-semibold mb-1">FIRMA CLIENTE</p>
            <SignatureCanvas
  ref={firmaTecnicoRef}
  canvasProps={{
    width: 420,
    height: 150,
    className: "border w-full"
  }}
/>

          </div>
        </div>
      </section>

      {/* ================= BOTONES ================= */}
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Guardar informe
        </button>
      </div>
    </form>
  );
}
