import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES DE INSPECCIÓN
============================= */
const secciones = [
  {
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      { codigo: "A.1", texto: "Fugas de aceite hidráulico (mangueras, acoples, bancos)" },
      { codigo: "A.2", texto: "Nivel de aceite del soplador" },
      { codigo: "A.3", texto: "Nivel de aceite hidráulico" },
      { codigo: "A.4", texto: "Nivel de aceite en caja de transferencia" },
      { codigo: "A.5", texto: "Manómetro filtro hidráulico (verde / amarillo / rojo)" },
      { codigo: "A.6", texto: "Filtro hidráulico retorno (fugas / daños)" },
      { codigo: "A.7", texto: "Filtros succión tanque hidráulico" },
      { codigo: "A.8", texto: "Cilindros hidráulicos (fugas / daños)" },
      { codigo: "A.9", texto: "Tapones de drenaje lubricantes" },
      { codigo: "A.10", texto: "Bancos hidráulicos (fugas / daños)" },
    ],
  },
  {
    id: "B",
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      { codigo: "B.1", texto: "Filtros malla 2” y 3”" },
      { codigo: "B.2", texto: "Empaques tapa filtros agua" },
      { codigo: "B.3", texto: "Fugas agua (mangueras / acoples)" },
      { codigo: "B.4", texto: "Válvula alivio pistola (700 PSI)" },
      { codigo: "B.5", texto: "Golpes / fugas tanque aluminio" },
      { codigo: "B.6", texto: "Medidor nivel tanque" },
      { codigo: "B.7", texto: "Tapón expansión tanque" },
      { codigo: "B.8", texto: "Drenaje bomba Rodder" },
      { codigo: "B.9", texto: "Válvulas check bomba" },
      { codigo: "B.10", texto: "Manómetros presión" },
      { codigo: "B.11", texto: "Carrete de manguera" },
      { codigo: "B.12", texto: "Soporte del carrete" },
      { codigo: "B.13", texto: "Codo giratorio" },
      { codigo: "B.14", texto: "Sistema trinquete / seguros" },
      { codigo: "B.15", texto: "Válvula alivio bomba agua" },
      { codigo: "B.16", texto: "Válvulas 1”" },
      { codigo: "B.17", texto: "Válvulas ¾”" },
      { codigo: "B.18", texto: "Válvulas ½”" },
      { codigo: "B.19", texto: "Boquillas" },
    ],
  },
  {
    id: "C",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      { codigo: "C.1", texto: "Tablero frontal limpio" },
      { codigo: "C.2", texto: "Tablero control cabina" },
      { codigo: "C.3", texto: "Control remoto / puerto carga" },
      { codigo: "C.4", texto: "Electroválvulas" },
      { codigo: "C.5", texto: "Humedad en componentes" },
      { codigo: "C.6", texto: "Luces y accesorios" },
    ],
  },
  {
    id: "D",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      { codigo: "D.1", texto: "Sellos tanque frontal / posterior" },
      { codigo: "D.2", texto: "Interior tanque desechos" },
      { codigo: "D.3", texto: "Microfiltros succión" },
      { codigo: "D.4", texto: "Tapón drenaje filtro succión" },
      { codigo: "D.5", texto: "Mangueras succión" },
      { codigo: "D.6", texto: "Seguros compuerta tanque" },
      { codigo: "D.7", texto: "Sistema desfogue" },
      { codigo: "D.8", texto: "Válvulas alivio Kunkle" },
      { codigo: "D.9", texto: "Operación del soplador" },
    ],
  },
];

export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const sigTecnico = useRef(null);
  const sigCliente = useRef(null);

  const [data, setData] = useState({
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
    puntosEquipo: [],
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
  });

  const update = (path, value) => {
    setData(prev => {
      const copy = structuredClone(prev);
      let ref = copy;
      for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
      ref[path[path.length - 1]] = value;
      return copy;
    });
  };

  /* ===== MARCAR DAÑOS ===== */
  const onImageClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;

    update(["puntosEquipo"], [
      ...data.puntosEquipo,
      { id: data.puntosEquipo.length + 1, x, y },
    ]);
  };

  const removePoint = (id) => {
    update(
      ["puntosEquipo"],
      data.puntosEquipo
        .filter(p => p.id !== id)
        .map((p, i) => ({ ...p, id: i + 1 }))
    );
  };

  const submit = (e) => {
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
    navigate("/inspeccion");
  };

  return (
    <form onSubmit={submit} className="max-w-6xl mx-auto p-6 bg-white space-y-6 text-xs">

      {/* ================= ENCABEZADO ================= */}
      <section className="border rounded overflow-hidden">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td rowSpan={4} className="w-32 border text-center">
                <img src="/astap-logo.jpg" className="mx-auto h-14" />
              </td>
              <td colSpan={3} className="border text-center font-bold">
                HOJA DE INSPECCIÓN HIDROSUCCIONADOR
              </td>
              <td rowSpan={2} className="border w-44 p-2 text-[10px]">
                Fecha versión: 01-01-26<br />Versión: 01
              </td>
            </tr>
            <tr>
              <td className="border font-semibold">REFERENCIA DE CONTRATO</td>
              <td colSpan={2} className="border">
                <input className="w-full border" onChange={e => update(["referenciaContrato"], e.target.value)} />
              </td>
            </tr>
            <tr>
              <td className="border font-semibold">DESCRIPCIÓN</td>
              <td colSpan={3} className="border">
                <input className="w-full border" onChange={e => update(["descripcion"], e.target.value)} />
              </td>
            </tr>
            <tr>
              <td className="border font-semibold">COD. INF.</td>
              <td colSpan={3} className="border">
                <input className="w-full border" onChange={e => update(["codInf"], e.target.value)} />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <section className="border p-4 space-y-2">
        <div className="relative border cursor-crosshair" onClick={onImageClick}>
          <img src="/estado-equipo.png" className="w-full" />
          {data.puntosEquipo.map(p => (
            <div
              key={p.id}
              onDoubleClick={() => removePoint(p.id)}
              className="absolute bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center"
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
            >
              {p.id}
            </div>
          ))}
        </div>
        <textarea
          placeholder="Detalle del estado del equipo"
          className="w-full border p-2"
          onChange={e => update(["estadoEquipoDetalle"], e.target.value)}
        />
      </section>

      {/* ================= TABLAS ================= */}
      {secciones.map(sec => (
        <section key={sec.id} className="border p-4">
          <h3 className="font-semibold mb-2">{sec.titulo}</h3>
          <table className="w-full border text-xs">
            <thead>
              <tr>
                <th>Ítem</th><th>Detalle</th><th>Sí</th><th>No</th><th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map(it => (
                <tr key={it.codigo}>
                  <td>{it.codigo}</td>
                  <td>{it.texto}</td>
                  <td><input type="radio" name={it.codigo} onChange={() => update(["items", it.codigo, "estado"], "SI")} /></td>
                  <td><input type="radio" name={it.codigo} onChange={() => update(["items", it.codigo, "estado"], "NO")} /></td>
                  <td><input className="w-full border" onChange={e => update(["items", it.codigo, "obs"], e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* ================= DESCRIPCIÓN EQUIPO ================= */}
      <section className="border p-4">
        <h3 className="font-semibold text-center mb-2">DESCRIPCIÓN DEL EQUIPO</h3>
        {Object.entries(data.equipo).map(([k]) => (
          <input
            key={k}
            placeholder={k.toUpperCase()}
            className="w-full border mb-1 p-1"
            onChange={e => update(["equipo", k], e.target.value)}
          />
        ))}
      </section>

      {/* ================= FIRMAS ================= */}
      <section className="border p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-center">FIRMA TÉCNICO</p>
            <SignatureCanvas ref={sigTecnico} canvasProps={{ width: 300, height: 120 }} />
          </div>
          <div>
            <p className="font-semibold text-center">FIRMA CLIENTE</p>
            <SignatureCanvas ref={sigCliente} canvasProps={{ width: 300, height: 120 }} />
          </div>
        </div>
      </section>

      {/* ================= BOTONES ================= */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => navigate("/inspeccion")} className="border px-4 py-2 rounded">
          Volver
        </button>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Guardar y completar
        </button>
      </div>

    </form>
  );
}
