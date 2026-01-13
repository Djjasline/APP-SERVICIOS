import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =====================================================
   SECCIONES OFICIALES – PDF HIDROSUCCIONADOR
===================================================== */

// 1. PRUEBAS PREVIAS
const pruebasPrevias = [
  ["1.1", "Prueba de encendido general del equipo"],
  ["1.2", "Verificación de funcionamiento de controles principales"],
  ["1.3", "Revisión de alarmas o mensajes de fallo"],
];

// 2. EVALUACIÓN DE SISTEMAS
const secciones = [
  {
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
];

export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const firmaTecnico = useRef(null);
  const firmaCliente = useRef(null);

  const [data, setData] = useState({
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
    pruebas: {},
    items: {},
    equipo: {
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
    },
  });

  const update = (path, value) => {
    setData((p) => {
      const c = structuredClone(p);
      let r = c;
      for (let i = 0; i < path.length - 1; i++) r = r[path[i]];
      r[path[path.length - 1]] = value;
      return c;
    });
  };

  /* ================= PUNTOS ROJOS ================= */
  const addPoint = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    update(["estadoEquipoPuntos"], [
      ...data.estadoEquipoPuntos,
      {
        id: data.estadoEquipoPuntos.length + 1,
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
        nota: "",
      },
    ]);
  };

  const removePoint = (id) =>
    update(
      ["estadoEquipoPuntos"],
      data.estadoEquipoPuntos.filter((p) => p.id !== id).map((p, i) => ({ ...p, id: i + 1 }))
    );

  const submit = (e) => {
    e.preventDefault();
    markInspectionCompleted("hidro", id, {
      ...data,
      firmas: {
        tecnico: firmaTecnico.current?.toDataURL() || "",
        cliente: firmaCliente.current?.toDataURL() || "",
      },
    });
    navigate("/inspeccion");
  };

  return (
    <form onSubmit={submit} className="max-w-6xl mx-auto bg-white p-6 space-y-6 text-sm">

      {/* ===== ENCABEZADO ===== */}
      <section className="border rounded overflow-hidden">
        <table className="w-full text-xs">
          <tbody>
            <tr>
              <td rowSpan={3} className="w-32 text-center border-r">
                <img src="/astap-logo.jpg" className="mx-auto max-h-20" />
              </td>
              <td className="font-bold text-center">HOJA DE INSPECCIÓN HIDROSUCCIONADOR</td>
            </tr>
            {[
              ["Referencia de contrato", "referenciaContrato"],
              ["Descripción", "descripcion"],
              ["Cod. Inf.", "codInf"],
            ].map(([l, k]) => (
              <tr key={k}>
                <td>
                  <input className="w-full border p-1" placeholder={l} onChange={(e) => update([k], e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ===== DATOS CLIENTE ===== */}
      <section className="grid grid-cols-2 gap-3 border p-4 rounded">
        {["cliente","direccion","contacto","telefono","correo","tecnicoResponsable","telefonoTecnico","correoTecnico"]
          .map((k) => (
            <input key={k} className="border p-2" placeholder={k} onChange={(e) => update([k], e.target.value)} />
          ))}
        <input type="date" className="border p-2 col-span-2" onChange={(e) => update(["fechaServicio"], e.target.value)} />
      </section>

      {/* ===== ESTADO EQUIPO ===== */}
      <section className="border p-4 rounded space-y-3">
        <strong>Estado del equipo</strong>
        <div className="relative border" onClick={addPoint}>
          <img src="/estado-equipo.png" className="w-full" />
          {data.estadoEquipoPuntos.map((p) => (
            <div
              key={p.id}
              onDoubleClick={() => removePoint(p.id)}
              className="absolute bg-red-600 text-white w-6 h-6 text-xs rounded-full flex items-center justify-center"
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)" }}
            >
              {p.id}
            </div>
          ))}
        </div>

        {data.estadoEquipoPuntos.map((p) => (
          <input
            key={p.id}
            className="border p-2 w-full"
            placeholder={`Observación punto ${p.id}`}
            value={p.nota}
            onChange={(e) => update(["estadoEquipoPuntos", p.id - 1, "nota"], e.target.value)}
          />
        ))}
      </section>

      {/* ===== PRUEBAS PREVIAS ===== */}
      <section className="border p-4 rounded">
        <h3 className="font-semibold mb-2">1. PRUEBAS DE ENCENDIDO Y FUNCIONAMIENTO</h3>
        {pruebasPrevias.map(([c, t]) => (
          <div key={c} className="grid grid-cols-5 gap-2 mb-1">
            <div className="col-span-2">{t}</div>
            <input type="radio" onChange={() => update(["pruebas", c], "SI")} />
            <input type="radio" onChange={() => update(["pruebas", c], "NO")} />
            <input className="border px-1" placeholder="Observación" />
          </div>
        ))}
      </section>

      {/* ===== SISTEMAS ===== */}
      {secciones.map((s) => (
        <section key={s.titulo} className="border p-4 rounded">
          <h3 className="font-semibold mb-2">{s.titulo}</h3>
          {s.items.map(([c, t]) => (
            <div key={c} className="grid grid-cols-5 gap-2 mb-1">
              <div className="col-span-2">{t}</div>
              <input type="radio" onChange={() => update(["items", c], "SI")} />
              <input type="radio" onChange={() => update(["items", c], "NO")} />
              <input className="border px-1" placeholder="Observación" />
            </div>
          ))}
        </section>
      ))}

      {/* ===== DATOS EQUIPO ===== */}
      <section className="border p-4 rounded">
        <h3 className="font-semibold text-center mb-2">DESCRIPCIÓN DEL EQUIPO</h3>
        {Object.keys(data.equipo).map((k) => (
          <input key={k} className="border p-2 w-full mb-2" placeholder={k} onChange={(e) => update(["equipo", k], e.target.value)} />
        ))}
      </section>

      {/* ===== FIRMAS ===== */}
      <section className="grid grid-cols-2 gap-4">
        <SignatureCanvas ref={firmaTecnico} canvasProps={{ className: "border h-32 w-full" }} />
        <SignatureCanvas ref={firmaCliente} canvasProps={{ className: "border h-32 w-full" }} />
      </section>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => navigate("/inspeccion")} className="border px-4 py-2">Volver</button>
        <button type="submit" className="bg-green-600 text-white px-4 py-2">Guardar y completar</button>
      </div>
    </form>
  );
}
