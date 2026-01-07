import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function ServiceReportCreation() {
  const [data, setData] = useState({
    referenciaContrato: "",
    descripcionInforme: "",
    codigoInf: "",

    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    fechaServicio: "",

    actividades: [
      { titulo: "", detalle: "", imagen: null },
    ],

    conclusiones: [""],
    recomendaciones: [""],

    equipo: {
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

    responsables: {
      astap: { nombre: "", cargo: "", telefono: "", correo: "" },
      cliente: { nombre: "", cargo: "", telefono: "", correo: "" },
    },

    firmas: {
      tecnico: null,
      cliente: null,
    },
  });

  const sigTecnicoRef = useRef(null);
  const sigClienteRef = useRef(null);

  const update = (path, value) => {
    setData((prev) => {
      const copy = structuredClone(prev);
      let ref = copy;
      for (let i = 0; i < path.length - 1; i++) {
        ref = ref[path[i]];
      }
      ref[path[path.length - 1]] = value;
      return copy;
    });
  };

  const saveFirma = (tipo, ref) => {
    if (!ref.current) return;
    update(["firmas", tipo], ref.current.toDataURL());
  };

  const clearFirma = (tipo, ref) => {
    ref.current.clear();
    update(["firmas", tipo], null);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto space-y-6">

        <ReportHeader />

        {/* ================= ENCABEZADO EDITABLE ================= */}
        <table className="pdf-table">
          <tbody>
            <tr>
              <td className="pdf-label">REFERENCIA DE CONTRATO</td>
              <td><input className="pdf-input" value={data.referenciaContrato}
                onChange={(e) => update(["referenciaContrato"], e.target.value)} /></td>
            </tr>
            <tr>
              <td className="pdf-label">DESCRIPCIÓN</td>
              <td><input className="pdf-input" value={data.descripcionInforme}
                onChange={(e) => update(["descripcionInforme"], e.target.value)} /></td>
            </tr>
            <tr>
              <td className="pdf-label">COD. INF.</td>
              <td><input className="pdf-input" value={data.codigoInf}
                onChange={(e) => update(["codigoInf"], e.target.value)} /></td>
            </tr>
          </tbody>
        </table>

        {/* ================= CLIENTE ================= */}
        <table className="pdf-table">
          <tbody>
            {[
              ["CLIENTE", "cliente"],
              ["DIRECCIÓN", "direccion"],
              ["CONTACTO", "contacto"],
              ["TELÉFONO", "telefono"],
              ["CORREO", "correo"],
              ["FECHA DE SERVICIO", "fechaServicio"],
            ].map(([label, key]) => (
              <tr key={key}>
                <td className="pdf-label">{label}</td>
                <td>
                  <input className="pdf-input" value={data[key]}
                    onChange={(e) => update([key], e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= ACTIVIDADES ================= */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th>ÍTEM</th>
              <th>DESCRIPCIÓN DE ACTIVIDADES</th>
              <th>IMAGEN</th>
            </tr>
          </thead>
          <tbody>
            {data.actividades.map((act, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <input className="pdf-input" placeholder="Título"
                    value={act.titulo}
                    onChange={(e) => update(["actividades", i, "titulo"], e.target.value)} />
                  <textarea className="pdf-textarea" placeholder="Detalle"
                    value={act.detalle}
                    onChange={(e) => update(["actividades", i, "detalle"], e.target.value)} />
                </td>
                <td>
                  <input type="file"
                    onChange={(e) => update(["actividades", i, "imagen"], e.target.files[0])} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={() =>
          setData(p => ({ ...p, actividades: [...p.actividades, { titulo: "", detalle: "", imagen: null }] }))
        }>+ Agregar actividad</button>

        {/* ================= CONCLUSIONES / RECOMENDACIONES ================= */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th>CONCLUSIONES</th>
              <th>RECOMENDACIONES</th>
            </tr>
          </thead>
          <tbody>
            {data.conclusiones.map((_, i) => (
              <tr key={i}>
                <td><textarea className="pdf-textarea"
                  value={data.conclusiones[i]}
                  onChange={(e) => update(["conclusiones", i], e.target.value)} /></td>
                <td><textarea className="pdf-textarea"
                  value={data.recomendaciones[i]}
                  onChange={(e) => update(["recomendaciones", i], e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
        <table className="pdf-table">
          <thead><tr><th colSpan="2">DESCRIPCIÓN DEL EQUIPO</th></tr></thead>
          <tbody>
            {Object.entries(data.equipo).map(([k, v]) => (
              <tr key={k}>
                <td className="pdf-label">{k.toUpperCase()}</td>
                <td>
                  <input className="pdf-input" value={v}
                    onChange={(e) => update(["equipo", k], e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= FIRMAS ================= */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th>FIRMA TÉCNICO</th>
              <th>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <SignatureCanvas ref={sigTecnicoRef} canvasProps={{ width: 300, height: 120 }} />
                <button onClick={() => saveFirma("tecnico", sigTecnicoRef)}>Guardar</button>
                <button onClick={() => clearFirma("tecnico", sigTecnicoRef)}>Limpiar</button>
              </td>
              <td>
                <SignatureCanvas ref={sigClienteRef} canvasProps={{ width: 300, height: 120 }} />
                <button onClick={() => saveFirma("cliente", sigClienteRef)}>Guardar</button>
                <button onClick={() => clearFirma("cliente", sigClienteRef)}>Limpiar</button>
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
}
