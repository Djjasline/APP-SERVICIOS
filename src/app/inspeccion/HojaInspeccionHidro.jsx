import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES DE INSPECCIÓN HIDRO
============================= */
const secciones = [
  {
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico (mangueras, acoples, bancos)"],
      ["A.2", "Nivel de aceite del soplador"],
      ["A.3", "Nivel de aceite hidráulico"],
      ["A.4", "Nivel de aceite caja de transferencia"],
      ["A.5", "Manómetro filtro hidráulico (verde / amarillo / rojo)"],
      ["A.6", "Filtro hidráulico de retorno (fugas o daños)"],
      ["A.7", "Filtros de succión tanque hidráulico"],
      ["A.8", "Cilindros hidráulicos (fugas o daños)"],
      ["A.9", "Tapones de drenaje de lubricantes"],
      ["A.10", "Bancos hidráulicos (fugas o daños)"],
    ],
  },
];

export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const sigTecnico = useRef(null);
  const sigCliente = useRef(null);

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

    tecnicoResponsable: "",
    telefonoTecnico: "",
    correoTecnico: "",

    estadoEquipoDetalle: "",
    puntos: [],
    items: {},

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
  });

  const update = (name, value) =>
    setFormData((p) => ({ ...p, [name]: value }));

  const updateItem = (codigo, campo, valor) =>
    setFormData((p) => ({
      ...p,
      items: {
        ...p.items,
        [codigo]: { ...p.items[codigo], [campo]: valor },
      },
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    markInspectionCompleted("hidro", id, {
      ...formData,
      firmas: {
        tecnico: sigTecnico.current?.toDataURL(),
        cliente: sigCliente.current?.toDataURL(),
      },
    });
    navigate("/inspeccion");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto bg-white shadow rounded-xl p-6 space-y-6 text-xs"
    >
      {/* ================= ENCABEZADO CORREGIDO ================= */}
      <table className="w-full border-collapse border">
        <tbody>
          <tr>
            <td rowSpan={3} className="w-32 border p-3 text-center">
              <img src="/logotipo de astap.jpg" className="mx-auto h-16" />
            </td>
            <td colSpan={2} className="border p-2 font-bold text-center">
              HOJA DE INSPECCIÓN HIDROSUCCIONADORA
            </td>
            <td className="border p-2 w-48">
              <div>Fecha versión: 01-01-26</div>
              <div>Versión: 01</div>
            </td>
          </tr>
          <tr>
            <td className="border p-2 font-semibold">REFERENCIA DE CONTRATO</td>
            <td colSpan={2} className="border p-2">
              <input className="w-full border" onChange={e => update("referenciaContrato", e.target.value)} />
            </td>
          </tr>
          <tr>
            <td className="border p-2 font-semibold">DESCRIPCIÓN</td>
            <td colSpan={2} className="border p-2">
              <input className="w-full border" onChange={e => update("descripcion", e.target.value)} />
            </td>
          </tr>
          <tr>
            <td className="border p-2 font-semibold">COD. INF.</td>
            <td colSpan={3} className="border p-2">
              <input className="w-full border" onChange={e => update("codInf", e.target.value)} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= CONTEXTO INSPECCIÓN (COMPLETO) ================= */}
      <div className="grid grid-cols-2 gap-3">
        <input type="date" className="input" onChange={e => update("fechaInspeccion", e.target.value)} />
        <input placeholder="Ubicación" className="input" onChange={e => update("ubicacion", e.target.value)} />
        <input placeholder="Cliente" className="input" onChange={e => update("cliente", e.target.value)} />
        <input placeholder="Contacto con el cliente" className="input" onChange={e => update("contactoCliente", e.target.value)} />
        <input placeholder="Teléfono cliente" className="input" onChange={e => update("telefonoCliente", e.target.value)} />
        <input placeholder="Correo cliente" className="input" onChange={e => update("correoCliente", e.target.value)} />
        <input placeholder="Técnico responsable" className="input" onChange={e => update("tecnicoResponsable", e.target.value)} />
        <input placeholder="Teléfono técnico" className="input" onChange={e => update("telefonoTecnico", e.target.value)} />
        <input placeholder="Correo técnico" className="input col-span-2" onChange={e => update("correoTecnico", e.target.value)} />
      </div>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <section>
        <p className="font-semibold mb-2">Estado del equipo</p>
        <img src="/estado-equipo.png" className="border w-full" />
        <textarea
          className="w-full border mt-2 p-2"
          placeholder="Detalle del estado del equipo"
          onChange={e => update("estadoEquipoDetalle", e.target.value)}
        />
      </section>

      {/* ================= CHECKLIST ================= */}
      {secciones.map(sec => (
        <section key={sec.id} className="border p-4">
          <h3 className="font-semibold mb-2">{sec.titulo}</h3>
          <table className="w-full border text-xs">
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Detalle</th>
                <th>Sí</th>
                <th>No</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map(([cod, txt]) => (
                <tr key={cod}>
                  <td>{cod}</td>
                  <td>{txt}</td>
                  <td><input type="radio" onChange={() => updateItem(cod, "estado", "SI")} /></td>
                  <td><input type="radio" onChange={() => updateItem(cod, "estado", "NO")} /></td>
                  <td><input className="w-full border" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* ================= FIRMAS ================= */}
      <table className="w-full border">
        <thead>
          <tr>
            <th>FIRMA TÉCNICO</th>
            <th>FIRMA CLIENTE</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <SignatureCanvas ref={sigTecnico} canvasProps={{ width: 300, height: 120 }} />
            </td>
            <td>
              <SignatureCanvas ref={sigCliente} canvasProps={{ width: 300, height: 120 }} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= BOTONES ================= */}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => navigate("/inspeccion")} className="border px-4 py-2">
          Volver
        </button>
        <button type="submit" className="bg-green-600 text-white px-4 py-2">
          Guardar y completar
        </button>
      </div>
    </form>
  );
}
