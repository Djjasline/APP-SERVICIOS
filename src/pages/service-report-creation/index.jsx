import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function ServiceReportCreation() {
  const sigTecnicoRef = useRef(null);
  const sigClienteRef = useRef(null);

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

    tecnicoResponsable: "",
    telefonoTecnico: "",
    correoTecnico: "",

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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto space-y-6">

        {/* ================= HEADER ================= */}
        <ReportHeader />

        {/* ================= DATOS PRINCIPALES ================= */}
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

        {/* ================= CLIENTE ================= */}
        <table className="pdf-table">
          <tbody>
            {[
              ["CLIENTE", "cliente"],
              ["DIRECCIÓN", "direccion"],
              ["CONTACTO", "contacto"],
              ["TELÉFONO", "telefono"],
              ["CORREO", "correo"],
              ["TÉCNICO RESPONSABLE", "tecnicoResponsable"],
              ["TELÉFONO TÉCNICO", "telefonoTecnico"],
              ["CORREO TÉCNICO", "correoTecnico"],
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
              <th>ARTÍCULO</th>
              <th>DESCRIPCIÓN DE ACTIVIDADES</th>
              <th>IMAGEN</th>
            </tr>
          </thead>
          <tbody>
            {data.actividades.map((act, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <input
                    className="pdf-input"
                    placeholder="Título"
                    value={act.titulo}
                    onChange={(e) =>
                      update(["actividades", i, "titulo"], e.target.value)
                    }
                  />
                  <textarea
                    className="pdf-textarea"
                    placeholder="Detalle"
                    value={act.detalle}
                    onChange={(e) =>
                      update(["actividades", i, "detalle"], e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        update(["actividades", i, "imagen"], reader.result);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {act.imagen && (
                    <img
                      src={act.imagen}
                      alt="Actividad"
                      className="mt-2 max-h-40 border"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-4">
          <button
            className="border px-4 py-2"
            onClick={() =>
              setData((p) => ({
                ...p,
                actividades: [...p.actividades, { titulo: "", detalle: "", imagen: null }],
              }))
            }
          >
            + Agregar actividad
          </button>

          <button
            className="border px-4 py-2"
            onClick={() =>
              setData((p) => ({
                ...p,
                actividades: p.actividades.slice(0, -1),
              }))
            }
          >
            − Quitar actividad
          </button>
        </div>

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
            className="border px-4 py-2"
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
            className="border px-4 py-2"
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

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th colSpan={2}>DESCRIPCIÓN DEL EQUIPO</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries({
              MARCA: "marca",
              MODELO: "modelo",
              "N° SERIE": "serie",
              "AÑO MODELO": "anio",
              "VIN CHASIS": "vin",
              PLACA: "placa",
              "HORAS TRABAJO MÓDULO": "horasModulo",
              "HORAS TRABAJO CHASIS": "horasChasis",
              KILOMETRAJE: "kilometraje",
            }).map(([label, key]) => (
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
              <th>FIRMA TÉCNICO</th>
              <th>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <SignatureCanvas
                  ref={sigTecnicoRef}
                  penColor="black"
                  canvasProps={{
                    width: 400,
                    height: 180,
                    className: "border bg-white",
                  }}
                />
                <button
                  className="border px-2 py-1 mt-2"
                  onClick={() => sigTecnicoRef.current.clear()}
                >
                  Limpiar
                </button>
              </td>
              <td>
                <SignatureCanvas
                  ref={sigClienteRef}
                  penColor="black"
                  canvasProps={{
                    width: 400,
                    height: 180,
                    className: "border bg-white",
                  }}
                />
                <button
                  className="border px-2 py-1 mt-2"
                  onClick={() => sigClienteRef.current.clear()}
                >
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
