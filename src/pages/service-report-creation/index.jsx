import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function ServiceReportCreation() {
  // =============================
  // ESTADO ÚNICO DEL INFORME
  // =============================
  const [data, setData] = useState({
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

    responsables: {
      astap: { nombre: "", cargo: "", telefono: "", correo: "" },
      cliente: { nombre: "", cargo: "", telefono: "", correo: "" },
    },

    firmas: {
      tecnico: null,
      cliente: null,
    },
  });

  // =============================
  // FIRMA REFS
  // =============================
  const sigTecnicoRef = useRef(null);
  const sigClienteRef = useRef(null);

  // =============================
  // HANDLER GENERAL
  // =============================
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
    if (!ref.current) return;
    ref.current.clear();
    update(["firmas", tipo], null);
  };

  // =============================
  // RENDER
  // =============================
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 max-w-5xl mx-auto space-y-6">

        <ReportHeader />

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

        {/* ================= CONCLUSIONES ================= */}
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
            onClick={() =>
              setData((p) => ({
                ...p,
                conclusiones: [...p.conclusiones, ""],
                recomendaciones: [...p.recomendaciones, ""],
              }))
            }
            className="px-3 py-1 border"
          >
            + Fila
          </button>

          <button
            onClick={() =>
              setData((p) => ({
                ...p,
                conclusiones: p.conclusiones.slice(0, -1),
                recomendaciones: p.recomendaciones.slice(0, -1),
              }))
            }
            className="px-3 py-1 border"
          >
            − Fila
          </button>
        </div>

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th colSpan="2">DESCRIPCIÓN DEL EQUIPO</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["MARCA", "marca"],
              ["MODELO", "modelo"],
              ["N° SERIE", "serie"],
              ["AÑO", "anio"],
              ["VIN", "vin"],
              ["PLACA", "placa"],
              ["HORAS MÓDULO", "horasModulo"],
              ["HORAS CHASIS", "horasChasis"],
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

        {/* ================= FIRMAS ================= */}
        <table className="pdf-table">
          <tbody>
            <tr>
              <th colSpan="2">FIRMA TÉCNICO</th>
              <th colSpan="2">FIRMA CLIENTE</th>
            </tr>
            <tr>
              <td colSpan="2">
                <SignatureCanvas ref={sigTecnicoRef} canvasProps={{ className: "border w-full h-32" }} />
                <button onClick={() => saveFirma("tecnico", sigTecnicoRef)}>Guardar</button>
                <button onClick={() => clearFirma("tecnico", sigTecnicoRef)}>Limpiar</button>
              </td>
              <td colSpan="2">
                <SignatureCanvas ref={sigClienteRef} canvasProps={{ className: "border w-full h-32" }} />
                <button onClick={() => saveFirma("cliente", sigClienteRef)}>Guardar</button>
                <button onClick={() => clearFirma("cliente", sigClienteRef)}>Limpiar</button>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= RESPONSABLES ================= */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th colSpan="2">ELABORADO POR</th>
              <th colSpan="2">APROBADO POR</th>
            </tr>
          </thead>
          <tbody>
            {["nombre", "cargo", "telefono", "correo"].map((key) => (
              <tr key={key}>
                <td className="pdf-label">{key.toUpperCase()}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data.responsables.astap[key]}
                    onChange={(e) =>
                      update(["responsables", "astap", key], e.target.value)
                    }
                  />
                </td>
                <td className="pdf-label">{key.toUpperCase()}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data.responsables.cliente[key]}
                    onChange={(e) =>
                      update(["responsables", "cliente", key], e.target.value)
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
