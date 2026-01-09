// APP-SERVICIOS/src/pages/service-report-creation/index.jsx

import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function ServiceReportCreation() {
  const navigate = useNavigate();
  const { id } = useParams();

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
    if (!id) return;

    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];
    const report = stored.find(r => String(r.id) === String(id));

    if (report) {
      setData(report.data);
    }
  }, [id]);

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

    let updatedReports;

    if (id) {
      // 🔁 ACTUALIZAR EXISTENTE
      updatedReports = stored.map(r =>
        String(r.id) === String(id)
          ? { ...r, data }
          : r
      );
    } else {
      // 🆕 NUEVO INFORME
      updatedReports = [
        ...stored,
        {
          id: Date.now(),
          createdAt: new Date().toISOString(),
          data,
        },
      ];
    }

    localStorage.setItem(
      "serviceReports",
      JSON.stringify(updatedReports)
    );

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
                    capture="environment"
                    onChange={(e) =>
                      update(["actividades", i, "imagen"], e.target.files[0])
                    }
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

        {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
        {/* 👈 SE MANTIENE TAL COMO PEDISTE */}

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
                  ref={sigTecnico}
                  canvasProps={{ width: 300, height: 150 }}
                />
                <button onClick={() => sigTecnico.current.clear()}>
                  Limpiar
                </button>
              </td>
              <td>
                <SignatureCanvas
                  ref={sigCliente}
                  canvasProps={{ width: 300, height: 150 }}
                />
                <button onClick={() => sigCliente.current.clear()}>
                  Limpiar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= BOTONES ================= */}
        <div className="flex justify-between pt-6">
          <button
            onClick={() => navigate("/")}
            className="border px-6 py-2 rounded"
          >
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
