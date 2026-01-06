import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function ServiceReportCreation() {
  const sigTecnicoRef = useRef(null);
  const sigClienteRef = useRef(null);

  const [data, setData] = useState({
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
  });

  const update = (path, value) => {
    setData(prev => {
      const copy = structuredClone(prev);
      let ref = copy;
      for (let i = 0; i < path.length - 1; i++) {
        if (!ref[path[i]]) ref[path[i]] = {};
        ref = ref[path[i]];
      }
      ref[path[path.length - 1]] = value;
      return copy;
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto space-y-6">

        <ReportHeader />

        {/* CLIENTE */}
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
                  <input
                    className="pdf-input"
                    value={data[key]}
                    onChange={e => update([key], e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* CONCLUSIONES / RECOMENDACIONES */}
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
                <td>
                  <textarea
                    className="pdf-textarea"
                    value={data.conclusiones[i]}
                    onChange={e => update(["conclusiones", i], e.target.value)}
                  />
                </td>
                <td>
                  <textarea
                    className="pdf-textarea"
                    value={data.recomendaciones[i]}
                    onChange={e => update(["recomendaciones", i], e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* DESCRIPCIÓN DEL EQUIPO */}
        <table className="pdf-table">
          <thead>
            <tr><th colSpan="2">DESCRIPCIÓN DEL EQUIPO</th></tr>
          </thead>
          <tbody>
            {Object.entries({
              marca: "MARCA",
              modelo: "MODELO",
              serie: "N° SERIE",
              anio: "AÑO MODELO",
              vin: "VIN CHASIS",
              placa: "PLACA",
              horasModulo: "HORAS MÓDULO",
              horasChasis: "HORAS CHASIS",
              kilometraje: "KILOMETRAJE",
            }).map(([key, label]) => (
              <tr key={key}>
                <td className="pdf-label">{label}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data.equipo[key]}
                    onChange={e => update(["equipo", key], e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* FIRMAS */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th>FIRMA TÉCNICO</th>
              <th>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><SignatureCanvas ref={sigTecnicoRef} /></td>
              <td><SignatureCanvas ref={sigClienteRef} /></td>
            </tr>
          </tbody>
        </table>

        {/* RESPONSABLES */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th colSpan="2">ASTAP</th>
              <th colSpan="2">CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            {["nombre", "cargo", "telefono", "correo"].map(k => (
              <tr key={k}>
                <td className="pdf-label">{k.toUpperCase()}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data.responsables.astap[k]}
                    onChange={e => update(["responsables","astap",k], e.target.value)}
                  />
                </td>
                <td className="pdf-label">{k.toUpperCase()}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data.responsables.cliente[k]}
                    onChange={e => update(["responsables","cliente",k], e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}
