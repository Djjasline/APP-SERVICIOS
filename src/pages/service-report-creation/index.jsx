// APP-SERVICIOS/src/pages/service-report-creation/index.jsx

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function ServiceReportCreation() {
  const navigate = useNavigate();

  /* ===========================
     ESTADO DEL INFORME
  =========================== */
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

    tecnicoNombre: "",
    tecnicoTelefono: "",
    tecnicoCorreo: "",

    actividades: [{ titulo: "", detalle: "", imagen: null }],

    conclusiones: [""],
    recomendaciones: [""],

    equipo: {
      nota: "",
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

  const sigTecnico = useRef(null);
  const sigCliente = useRef(null);

  /* ===========================
     CARGAR INFORME SI EXISTE
  =========================== */
  useEffect(() => {
    const stored = localStorage.getItem("currentReport");
    if (stored) {
      const report = JSON.parse(stored);
      if (report?.data) {
        setData(report.data);
      }
    }
  }, []);

  /* ===========================
     UPDATE GENÉRICO
  =========================== */
  const update = (path, value) => {
    setData(prev => {
      const copy = structuredClone(prev);
      let ref = copy;
      for (let i = 0; i < path.length - 1; i++) {
        ref = ref[path[i]];
      }
      ref[path[path.length - 1]] = value;
      return copy;
    });
  };

  /* ===========================
     GUARDAR / ACTUALIZAR
  =========================== */
  const saveReport = () => {
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];
    const current = localStorage.getItem("currentReport");

    let reports;

    if (current) {
      const currentReport = JSON.parse(current);

      reports = stored.map(r =>
        r.id === currentReport.id
          ? { ...r, data }
          : r
      );

      localStorage.removeItem("currentReport");
    } else {
      const newReport = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        data,
      };
      reports = [...stored, newReport];
    }

    localStorage.setItem("serviceReports", JSON.stringify(reports));
    navigate("/service-report-history");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto space-y-6">

        {/* ================= HEADER ================= */}
        <ReportHeader data={data} onChange={update} />

        {/* ================= DATOS CLIENTE ================= */}
        <table className="pdf-table">
          <tbody>
            {[
              ["CLIENTE", "cliente"],
              ["DIRECCIÓN", "direccion"],
              ["CONTACTO", "contacto"],
              ["TELÉFONO", "telefono"],
              ["CORREO", "correo"],
              ["TÉCNICO RESPONSABLE", "tecnicoNombre"],
              ["TELÉFONO TÉCNICO", "tecnicoTelefono"],
              ["CORREO TÉCNICO", "tecnicoCorreo"],
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
            {data.actividades.map((a, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <input
                    className="pdf-input"
                    placeholder="Título"
                    value={a.titulo}
                    onChange={(e) =>
                      update(["actividades", i, "titulo"], e.target.value)
                    }
                  />
                  <textarea
                    className="pdf-textarea"
                    placeholder="Detalle"
                    value={a.detalle}
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
            onClick={() =>
              setData(p => ({
                ...p,
                actividades: [...p.actividades, { titulo: "", detalle: "", imagen: null }],
              }))
            }
            className="border px-4 py-2 rounded"
          >
            + Agregar actividad
          </button>

          <button
            onClick={() =>
              setData(p => ({
                ...p,
                actividades: p.actividades.slice(0, -1),
              }))
            }
            className="border px-4 py-2 rounded"
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

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
        <section className="border border-black mt-4">
          <h3 className="text-center font-semibold border-b border-black py-1">
            DESCRIPCIÓN DEL EQUIPO
          </h3>

          <table className="w-full text-xs border-collapse">
            <tbody>
              {[
                ["NOTA", "nota", true],
                ["MARCA", "marca"],
                ["MODELO", "modelo"],
                ["N° SERIE", "serie"],
                ["AÑO MODELO", "anio"],
                ["VIN / CHASIS", "vin"],
                ["PLACA N°", "placa"],
                ["HORAS TRABAJO MÓDULO", "horasModulo"],
                ["HORAS TRABAJO CHASIS", "horasChasis"],
                ["KILOMETRAJE", "kilometraje", true],
              ].map(([label, key, full], i) => (
                <tr key={i}>
                  <td className="border p-1 font-semibold">{label}</td>
                  <td className="border p-1" colSpan={full ? 3 : 1}>
                    <input
                      className="w-full outline-none"
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
        </section>

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
                <SignatureCanvas ref={sigTecnico} canvasProps={{ width: 300, height: 150 }} />
                <button onClick={() => sigTecnico.current.clear()}>Limpiar</button>
              </td>
              <td>
                <SignatureCanvas ref={sigCliente} canvasProps={{ width: 300, height: 150 }} />
                <button onClick={() => sigCliente.current.clear()}>Limpiar</button>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= BOTONES ================= */}
        <div className="flex justify-between pt-6">
          <button onClick={() => navigate("/")} className="border px-6 py-2 rounded">
            Volver
          </button>

          <button
            onClick={saveReport}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Guardar / continuar
          </button>
        </div>

      </div>
    </div>
  );
}
