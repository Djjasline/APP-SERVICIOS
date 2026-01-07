import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function ServiceReportCreation() {
  const [data, setData] = useState({
    referenciaContrato: "",
    descripcion: "",
    codInf: "",

    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    fechaServicio: "",

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

    firmas: {
      tecnico: null,
      cliente: null,
    },

    responsables: {
      astap: { nombre: "", cargo: "", telefono: "", correo: "" },
      cliente: { nombre: "", cargo: "", telefono: "", correo: "" },
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

  const guardarFirma = (tipo, ref) => {
    if (!ref.current || ref.current.isEmpty()) return;
    update(["firmas", tipo], ref.current.toDataURL("image/png"));
  };

  const limpiarFirma = (tipo, ref) => {
    ref.current.clear();
    update(["firmas", tipo], null);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto space-y-6">

        <ReportHeader data={data} />

        {/* DATOS GENERALES */}
        <table className="pdf-table">
          <tbody>
            {[
              ["REFERENCIA DE CONTRATO", "referenciaContrato"],
              ["DESCRIPCIÓN", "descripcion"],
              ["COD. INF.", "codInf"],
            ].map(([label, key]) => (
              <tr key={key}>
                <td className="pdf-label">{label}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data[key]}
                    onChange={(e) => update([key], e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
                    onChange={(e) => update([key], e.target.value)}
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
                    onChange={(e) =>
                      update(["conclusiones", i], e.target.value)
                    }
                  />
                </td>
                <td>
                  <textarea
                    className="pdf-textarea"
                    value={data.recomendaciones[i]}
                    onChange={(e) =>
                      update(["recomendaciones", i], e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-4">
          <button
            className="px-4 py-2 border rounded"
            onClick={() =>
              setData((p) => ({
                ...p,
                conclusiones: [...p.conclusiones, ""],
                recomendaciones: [...p.recomendaciones, ""],
              }))
            }
          >
            + Agregar fila
          </button>

          <button
            className="px-4 py-2 border rounded"
            onClick={() =>
              setData((p) => ({
                ...p,
                conclusiones: p.conclusiones.slice(0, -1),
                recomendaciones: p.recomendaciones.slice(0, -1),
              }))
            }
          >
            − Quitar fila
          </button>
        </div>

        {/* DESCRIPCIÓN DEL EQUIPO */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th colSpan={2}>DESCRIPCIÓN DEL EQUIPO</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["MARCA", "marca"],
              ["MODELO", "modelo"],
              ["N° SERIE", "serie"],
              ["AÑO MODELO", "anio"],
              ["VIN CHASIS", "vin"],
              ["PLACA", "placa"],
              ["HORAS TRABAJO MÓDULO", "horasModulo"],
              ["HORAS TRABAJO CHASIS", "horasChasis"],
              ["KILOMETRAJE", "kilometraje"],
            ].map(([label, key]) => (
              <tr key={key}>
                <td className="pdf-label">{label}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data.equipo[key]}
                    onChange={(e) =>
                      update(["equipo", key], e.target.value)
                    }
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
              <th colSpan={2}>FIRMA TÉCNICO</th>
              <th colSpan={2}>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={2}>
                <SignatureCanvas
                  ref={sigTecnicoRef}
                  canvasProps={{ width: 400, height: 150, className: "border" }}
                />
                <button onClick={() => guardarFirma("tecnico", sigTecnicoRef)}>
                  Guardar
                </button>
                <button onClick={() => limpiarFirma("tecnico", sigTecnicoRef)}>
                  Limpiar
                </button>
              </td>
              <td colSpan={2}>
                <SignatureCanvas
                  ref={sigClienteRef}
                  canvasProps={{ width: 400, height: 150, className: "border" }}
                />
                <button onClick={() => guardarFirma("cliente", sigClienteRef)}>
                  Guardar
                </button>
                <button onClick={() => limpiarFirma("cliente", sigClienteRef)}>
                  Limpiar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
}
