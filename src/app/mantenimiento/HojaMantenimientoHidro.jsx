import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES – MANTENIMIENTO HIDRO
============================= */
const secciones = [
  {
    id: "1",
    titulo: "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    tipo: "simple",
    items: [
      ["1.1", "Prueba de encendido general del equipo"],
      ["1.2", "Verificación de funcionamiento de controles principales"],
      ["1.3", "Revisión de alarmas o mensajes de fallo"],
    ],
  },
  {
    id: "2",
    titulo: "2. RECAMBIO DE ELEMENTOS DE LOS SISTEMAS DEL MÓDULO HIDROSUCCIONADOR",
    tipo: "cantidad",
    items: [
      ["2.1", "Tapón de expansión PN 45731-30"],
      ["2.2", "Empaque externo tapa filtro en Y 3\" PN 41272-30"],
      ["2.3", "Empaque externo tapa filtro en Y 3\" New Model PN 513726A-30"],
      ["2.4", "Empaque interno tapa filtro en Y 3\" New Model PN 513726B-31"],
      ["2.5", "Empaque interno tapa filtro en Y 3\" PN 41271-30"],
      ["2.6", "Empaque filtro de agua Y 2\" PN 46137-30"],
      ["2.7", "Empaque filtro de agua Y 2\" PN 46138-30"],
      ["2.8", "Malla filtro de agua 2\" PN 45803-30"],
      ["2.9", "O-Ring válvula check 2\" PN 29674-30"],
      ["2.10", "O-Ring válvula check 3\" PN 29640-30"],
      ["2.11", "Malla filtro de agua 3\" PN 41280-30"],
      ["2.12", "Filtro aceite hidráulico cartucho New Model PN 514335-30"],
      ["2.13", "Filtro aceite hidráulico cartucho PN 1099061"],
      ["2.14", "Aceite caja transferencia 80W90 (galones)"],
      ["2.15", "Aceite soplador ISO 220 (galones)"],
      ["2.16", "Aceite hidráulico AW 46 (galones)"],
    ],
  },
  {
    id: "3",
    titulo: "3. SERVICIOS DE MÓDULO HIDROSUCCIONADOR",
    tipo: "simple",
    items: [
      ["3.1", "Sistema de diálisis para limpieza de impurezas del sistema hidráulico"],
      ["3.2", "Limpieza de bomba Rodder y cambio de elementos"],
      ["3.3", "Inspección válvula paso de agua a bomba Rodder"],
    ],
  },
  {
    id: "4",
    titulo: "4. OTROS (ESPECIFICAR)",
    tipo: "otros",
    items: ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6"],
  },
  {
    id: "5",
    titulo: "5. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, POSTERIOR AL SERVICIO",
    tipo: "simple",
    items: [
      ["5.1", "Encendido general del equipo"],
      ["5.2", "Verificación de presiones de trabajo"],
      ["5.3", "Funcionamiento de sistemas hidráulicos"],
      ["5.4", "Funcionamiento de sistema de succión"],
      ["5.5", "Funcionamiento de sistema de agua"],
    ],
  },
];

export default function HojaMantenimientoHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  const [formData, setFormData] = useState({
    referenciaContrato: "",
    descripcion: "",
    codInf: "",
    estadoEquipoDetalle: "",
    estadoEquipoPuntos: [],
    items: {},
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
  });

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleItemChange = (codigo, campo, valor) => {
    setFormData((p) => ({
      ...p,
      items: {
        ...p.items,
        [codigo]: { ...p.items[codigo], [campo]: valor },
      },
    }));
  };

  const handleImageClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: [...p.estadoEquipoPuntos, { id: p.estadoEquipoPuntos.length + 1, x, y }],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    markInspectionCompleted("mantenimiento-hidro", id, {
      ...formData,
      firmas: {
        tecnico: firmaTecnicoRef.current?.toDataURL() || "",
        cliente: firmaClienteRef.current?.toDataURL() || "",
      },
    });

    navigate("/mantenimiento");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm">

      {/* ENCABEZADO */}
      <section className="border rounded overflow-hidden">
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr>
              <td rowSpan={3} className="w-32 border-r p-3 text-center">
                <img src="/astap-logo.jpg" className="mx-auto max-h-20" />
              </td>
              <td colSpan={2} className="border-r text-center font-bold">
                HOJA DE MANTENIMIENTO HIDROSUCCIONADOR
              </td>
              <td className="p-2">
                <div>Fecha versión: <strong>25-11-2025</strong></div>
                <div>Versión: <strong>01</strong></div>
              </td>
            </tr>
            {["referenciaContrato", "descripcion", "codInf"].map((n) => (
              <tr key={n}>
                <td className="border-r p-2 font-semibold">{n.toUpperCase()}</td>
                <td colSpan={2}><input name={n} onChange={handleChange} className="w-full border p-1" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* IMAGEN ESTADO EQUIPO */}
      <section className="border rounded p-4">
        <div className="relative border cursor-crosshair" onClick={handleImageClick}>
          <img src="/estado-equipo.png" className="w-full" />
          {formData.estadoEquipoPuntos.map((p) => (
            <div key={p.id} className="absolute bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)" }}>
              {p.id}
            </div>
          ))}
        </div>
        <textarea
          name="estadoEquipoDetalle"
          placeholder="Observaciones generales del estado del equipo"
          onChange={handleChange}
          className="w-full border p-2 mt-2"
        />
      </section>

      {/* TABLAS */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
          <table className="w-full text-xs border">
            <thead className="bg-gray-100">
              <tr>
                <th>Artículo</th>
                <th>Detalle</th>
                {sec.tipo === "cantidad" && <th>No. poder</th>}
                <th>SI</th>
                <th>NO</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map((it) => {
                const codigo = Array.isArray(it) ? it[0] : it;
                const texto = Array.isArray(it) ? it[1] : "";
                return (
                  <tr key={codigo}>
                    <td>{codigo}</td>
                    <td>
                      {sec.tipo === "otros" ? (
                        <input className="border w-full" onChange={(e) => handleItemChange(codigo, "detalle", e.target.value)} />
                      ) : texto}
                    </td>
                    {sec.tipo === "cantidad" && (
                      <td>
                        <input type="number" className="border w-16" onChange={(e) => handleItemChange(codigo, "cantidad", e.target.value)} />
                      </td>
                    )}
                    <td><input type="radio" onChange={() => handleItemChange(codigo, "estado", "SI")} /></td>
                    <td><input type="radio" onChange={() => handleItemChange(codigo, "estado", "NO")} /></td>
                    <td><input className="border w-full" onChange={(e) => handleItemChange(codigo, "obs", e.target.value)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}

      {/* DESCRIPCIÓN EQUIPO */}
      <section className="border rounded p-4">
        <h2 className="font-semibold text-center mb-2">DESCRIPCIÓN DEL EQUIPO</h2>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {["nota","marca","modelo","serie","anioModelo","vin","placa","horasModulo","horasChasis","kilometraje"].map((n) => (
            <div key={n} className="contents">
              <label className="font-semibold">{n.toUpperCase()}</label>
              <input name={n} onChange={handleChange} className="col-span-3 border p-1" />
            </div>
          ))}
        </div>
      </section>

      {/* FIRMAS */}
      <section className="border rounded p-4 grid md:grid-cols-2 gap-6 text-center">
        <div>
          <p className="font-semibold">Firma Técnico ASTAP</p>
          <SignatureCanvas ref={firmaTecnicoRef} canvasProps={{ className: "border w-full h-32" }} />
        </div>
        <div>
          <p className="font-semibold">Firma Cliente</p>
          <SignatureCanvas ref={firmaClienteRef} canvasProps={{ className: "border w-full h-32" }} />
        </div>
      </section>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => navigate("/mantenimiento")} className="border px-4 py-2">Volver</button>
        <button type="submit" className="bg-green-600 text-white px-4 py-2">Guardar mantenimiento</button>
      </div>
    </form>
  );
}
