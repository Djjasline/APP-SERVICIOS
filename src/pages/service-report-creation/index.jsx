import { useState } from "react";
import ReportHeader from "@/components/report/ReportHeader";

export default function ServiceReportCreation() {
  const [data, setData] = useState({
    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    fechaServicio: "",

    actividades: [
      {
        titulo: "",
        detalle: "",
        imagen: null,
      },
    ],

    conclusiones: [""],
    recomendaciones: [""],
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
      <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto space-y-6">

        <ReportHeader />

        {/* ================= DATOS CLIENTE ================= */}
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
              <th style={{ width: 60 }}>ÍTEM</th>
              <th>DESCRIPCIÓN DE ACTIVIDADES</th>
              <th style={{ width: 220 }}>IMAGEN</th>
            </tr>
          </thead>
          <tbody>
            {data.actividades.map((act, i) => (
              <tr key={i}>
                <td>{i + 1}</td>

                <td>
                  <input
                    className="pdf-input"
                    placeholder="Título de la actividad"
                    value={act.titulo}
                    onChange={(e) =>
                      update(["actividades", i, "titulo"], e.target.value)
                    }
                  />
                  <textarea
                    className="pdf-textarea"
                    placeholder="Detalle de la actividad"
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
                    onChange={(e) =>
                      update(
                        ["actividades", i, "imagen"],
                        e.target.files[0]
                      )
                    }
                  />
                  {act.imagen && (
                    <img
                      src={URL.createObjectURL(act.imagen)}
                      alt="actividad"
                      style={{ marginTop: 6, maxWidth: "100%" }}
                    />
                  )}
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
                actividades: [
                  ...p.actividades,
                  { titulo: "", detalle: "", imagen: null },
                ],
              }))
            }
          >
            + Agregar actividad
          </button>

          <button
            className="px-4 py-2 border rounded"
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
      </div>
    </div>
  );
}
