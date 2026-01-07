import { useState } from "react";
import ReportHeader from "@/components/report/ReportHeader";

export default function ServiceReportCreation() {
  const [data, setData] = useState({
    // ================= HEADER =================
    referenciaContrato: "",
    descripcion: "",
    codInf: "",

    // ================= CLIENTE =================
    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    fechaServicio: "",

    // ================= TÉCNICO =================
    tecnicoResponsable: "",
    telefonoTecnico: "",
    correoTecnico: "",

    // ================= ACTIVIDADES =================
    actividades: [
      { titulo: "", detalle: "", imagen: null },
    ],

    // ================= CONCLUSIONES =================
    conclusiones: [""],
    recomendaciones: [""],

    // ================= EQUIPO =================
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

  // ================= HANDLER GENERAL =================
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
      <div className="bg-white p-6 max-w-6xl mx-auto space-y-6">

        {/* ================= HEADER ================= */}
        <ReportHeader data={data} update={update} />

        {/* ================= DATOS CLIENTE + TÉCNICO ================= */}
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
              <th style={{ width: 60 }}>ARTÍCULO</th>
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
                    onChange={(e) =>
                      update(["actividades", i, "imagen"], e.target.files[0])
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
                actividades: [...p.actividades, { titulo: "", detalle: "", imagen: null }],
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

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
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

        {/* ================= FIRMAS ================= */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th>FIRMA TÉCNICO</th>
              <th>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ height: 120 }}>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
}
