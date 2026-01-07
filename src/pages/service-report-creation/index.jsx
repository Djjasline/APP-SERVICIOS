import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

/* =========================================================
   INFORME GENERAL DE SERVICIOS – ASTAP
========================================================= */

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

    actividades: [{ descripcion: "", detalle: "" }],

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

  /* =========================================================
     HANDLER GENERAL
  ========================================================= */
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
    ref.current?.clear();
    update(["firmas", tipo], null);
  };

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white max-w-5xl mx-auto p-6 space-y-6 shadow">

        {/* ================= HEADER ================= */}
        <ReportHeader />

        {/* ================= DATOS GENERALES ================= */}
        <table className="pdf-table">
          <tbody>
            {[
              ["REFERENCIA DE CONTRATO", "referenciaContrato"],
              ["DESCRIPCIÓN", "descripcion"],
              ["COD. INF.", "codigoInforme"],
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

        {/* ================= DATOS DEL CLIENTE ================= */}
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

        {/* ================= ACTIVIDADES ================= */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th>ACTIVIDAD</th>
              <th>DETALLE</th>
            </tr>
          </thead>
          <tbody>
            {data.actividades.map((_, i) => (
              <tr key={i}>
                <td>
                  <textarea
                    className="pdf-textarea"
                    value={data.actividades[i].descripcion}
                    onChange={(e) =>
                      update(["actividades", i, "descripcion"], e.target.value)
                    }
                  />
                </td>
                <td>
                  <textarea
                    className="pdf-textarea"
                    value={data.actividades[i].detalle}
                    onChange={(e) =>
                      update(["actividades", i, "detalle"], e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          className="border px-3 py-1"
          onClick={() =>
            setData((p) => ({
              ...p,
              actividades: [...p.actividades, { descripcion: "", detalle: "" }],
            }))
          }
        >
          + Agregar actividad
        </button>

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

        <button
          className="border px-3 py-1"
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
              ["VIN / CHASIS", "vin"],
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
          <thead>
            <tr>
              <th colSpan={2}>FIRMA TÉCNICO</th>
              <th colSpan={2}>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={2}>
                <SignatureCanvas ref={sigTecnicoRef} />
                <button onClick={() => saveFirma("tecnico", sigTecnicoRef)}>
                  Guardar
                </button>
                <button onClick={() => clearFirma("tecnico", sigTecnicoRef)}>
                  Limpiar
                </button>
              </td>
              <td colSpan={2}>
                <SignatureCanvas ref={sigClienteRef} />
                <button onClick={() => saveFirma("cliente", sigClienteRef)}>
                  Guardar
                </button>
                <button onClick={() => clearFirma("cliente", sigClienteRef)}>
                  Limpiar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= RESPONSABLES ================= */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th colSpan={2}>ELABORADO POR – ASTAP</th>
              <th colSpan={2}>APROBADO POR – CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            {["nombre", "cargo", "telefono", "correo"].map((k) => (
              <tr key={k}>
                <td className="pdf-label">{k.toUpperCase()}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data.responsables.astap[k]}
                    onChange={(e) =>
                      update(["responsables", "astap", k], e.target.value)
                    }
                  />
                </td>
                <td className="pdf-label">{k.toUpperCase()}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data.responsables.cliente[k]}
                    onChange={(e) =>
                      update(["responsables", "cliente", k], e.target.value)
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
