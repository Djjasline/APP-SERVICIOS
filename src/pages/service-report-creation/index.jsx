import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function ServiceReportCreation() {
  const sigTecnicoRef = useRef(null);
  const sigClienteRef = useRef(null);

  const [data, setData] = useState({
    referenciaContrato: "",
    descripcion: "",
    codigoInforme: "",

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
      tecnico: {
        nombre: "",
        cargo: "",
        telefono: "",
        correo: "",
        firma: null,
      },
      cliente: {
        nombre: "",
        cargo: "",
        telefono: "",
        correo: "",
        firma: null,
      },
    },
  });

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
    if (!ref.current.isEmpty()) {
      update(["responsables", tipo, "firma"], ref.current.toDataURL());
    }
  };

  const clearFirma = (tipo, ref) => {
    ref.current.clear();
    update(["responsables", tipo, "firma"], null);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto space-y-6">

        <ReportHeader data={data} update={update} />

        {/* ================= FIRMAS ================= */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th colSpan="2">FIRMA TÉCNICO</th>
              <th colSpan="2">FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="2">
                <SignatureCanvas
                  ref={sigTecnicoRef}
                  canvasProps={{ className: "border w-full h-32" }}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => saveFirma("tecnico", sigTecnicoRef)}
                  >
                    Guardar
                  </button>
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => clearFirma("tecnico", sigTecnicoRef)}
                  >
                    Limpiar
                  </button>
                </div>
              </td>

              <td colSpan="2">
                <SignatureCanvas
                  ref={sigClienteRef}
                  canvasProps={{ className: "border w-full h-32" }}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => saveFirma("cliente", sigClienteRef)}
                  >
                    Guardar
                  </button>
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => clearFirma("cliente", sigClienteRef)}
                  >
                    Limpiar
                  </button>
                </div>
              </td>
            </tr>

            {["nombre", "cargo", "telefono", "correo"].map((field) => (
              <tr key={field}>
                <td className="pdf-label">{field.toUpperCase()}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data.responsables.tecnico[field]}
                    onChange={(e) =>
                      update(["responsables", "tecnico", field], e.target.value)
                    }
                  />
                </td>
                <td className="pdf-label">{field.toUpperCase()}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data.responsables.cliente[field]}
                    onChange={(e) =>
                      update(["responsables", "cliente", field], e.target.value)
                    }
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
