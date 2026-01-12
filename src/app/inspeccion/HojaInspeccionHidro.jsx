import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
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
      { codigo: "B.3", texto: "Fugas de agua" },
      { codigo: "B.4", texto: "Sistema de trinquete" },
      { codigo: "B.5", texto: "Sellos tanque desperdicios" },
      { codigo: "B.6", texto: "Manómetros presión" },
    ],
  },
];

export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const sigTecnico = useRef(null);
  const sigCliente = useRef(null);

  const emptyData = {
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

    equipo: {
      nota: "",
      marca: "",
      modelo: "",
      serie: "",
      anio: "",
      vin: "",
      placa: "",
      horasModulo: "",
      horasChasis: "",
      kilometraje: "",
    },

    items: {},

    firmas: {
      tecnico: "",
      cliente: "",
    },
  };

  const [data, setData] = useState(emptyData);

  /* ===========================
     CARGAR DESDE STORAGE
  =========================== */
  useEffect(() => {
    const current = JSON.parse(localStorage.getItem("currentInspection"));
    if (current?.data) {
      setData(current.data);

      setTimeout(() => {
        if (current.data.firmas?.tecnico) {
          sigTecnico.current?.fromDataURL(current.data.firmas.tecnico);
        }
        if (current.data.firmas?.cliente) {
          sigCliente.current?.fromDataURL(current.data.firmas.cliente);
        }
      }, 0);
    }
  }, []);

  /* ===========================
     UPDATE GENÉRICO
  =========================== */
  const update = (path, value) => {
    setData(prev => {
      const copy = structuredClone(prev);
      let ref = copy;
      for (let i = 0; i < path.length - 1; i++) {
        ref = ref[path[i]];
      }
      ref[path[path.length - 1]] = value;
      return copy;
    });
  };

  const handleItemChange = (codigo, campo, valor) => {
    setData(prev => ({
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

  /* ===========================
     GUARDAR INSPECCIÓN
  =========================== */
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...data,
      firmas: {
        tecnico: sigTecnico.current?.isEmpty()
          ? ""
          : sigTecnico.current.toDataURL(),
        cliente: sigCliente.current?.isEmpty()
          ? ""
          : sigCliente.current.toDataURL(),
      },
    };

    markInspectionCompleted("hidro", id, payload);
    localStorage.setItem("currentInspection", JSON.stringify({ data: payload }));

    navigate("/inspeccion");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >

      {/* ================= ENCABEZADO ================= */}
      <section className="border rounded overflow-hidden">
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b">
              <td rowSpan={4} className="w-32 border-r p-3 text-center">
                <img src="/astap-logo.jpg" className="w-full object-contain" />
              </td>
              <td colSpan={2} className="border-r text-center font-bold py-2">
                HOJA DE INSPECCIÓN – HIDROSUCCIONADOR
              </td>
              <td className="w-48 p-2">
                <div>Versión: <strong>01</strong></div>
              </td>
            </tr>
            {[
              ["REFERENCIA CONTRATO", "referenciaContrato"],
              ["DESCRIPCIÓN", "descripcion"],
              ["COD. INF.", "codInf"],
            ].map(([label, key]) => (
              <tr key={key} className="border-b">
                <td className="border-r p-2 font-semibold">{label}</td>
                <td colSpan={2} className="p-2">
                  <input
                    className="w-full border p-1"
                    value={data[key]}
                    onChange={e => update([key], e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <section className="border rounded p-4 space-y-2">
        <p className="font-semibold">Estado del equipo</p>
        <img src="/estado-equipo.png" className="w-full border rounded" />
        <textarea
          className="w-full border p-2 min-h-[80px]"
          placeholder="Detalle del estado del equipo"
          value={data.estadoEquipoDetalle}
          onChange={e => update(["estadoEquipoDetalle"], e.target.value)}
        />
      </section>

      {/* ================= CHECKLIST ================= */}
      {secciones.map(sec => (
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
              {sec.items.map(item => (
                <tr key={item.codigo}>
                  <td>{item.codigo}</td>
                  <td>{item.texto}</td>
                  <td>
                    <input
                      type="radio"
                      checked={data.items[item.codigo]?.estado === "SI"}
                      onChange={() => handleItemChange(item.codigo, "estado", "SI")}
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      checked={data.items[item.codigo]?.estado === "NO"}
                      onChange={() => handleItemChange(item.codigo, "estado", "NO")}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full border px-1"
                      value={data.items[item.codigo]?.observacion || ""}
                      onChange={e =>
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

      {/* ================= FIRMAS ================= */}
      <section className="border rounded p-4">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th>FIRMA TÉCNICO ASTAP</th>
              <th>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center">
                <SignatureCanvas
                  ref={sigTecnico}
                  canvasProps={{ width: 300, height: 150 }}
                />
                <button type="button" onClick={() => sigTecnico.current.clear()}>
                  Limpiar
                </button>
              </td>
              <td className="text-center">
                <SignatureCanvas
                  ref={sigCliente}
                  canvasProps={{ width: 300, height: 150 }}
                />
                <button type="button" onClick={() => sigCliente.current.clear()}>
                  Limpiar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Guardar y completar
        </button>
      </div>
    </form>
  );
}
