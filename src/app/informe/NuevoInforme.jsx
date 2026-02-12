import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function NuevoInforme() {
  const navigate = useNavigate();

  /* ===========================
     ESTADO BASE
  =========================== */
  const emptyReport = {
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

    actividades: [{ titulo: "", detalle: "", imagen: "" }],

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

    firmas: {
      tecnico: "",
      cliente: "",
    },
  };

  const [data, setData] = useState(emptyReport);

  const sigTecnico = useRef(null);
  const sigCliente = useRef(null);

  /* ===========================
     CARGAR BORRADOR SOLO SI EXISTE
  =========================== */
  useEffect(() => {
    const current = JSON.parse(
      localStorage.getItem("currentReport")
    );

    if (current && current.id && current.data) {
      setData(current.data);

      setTimeout(() => {
        if (current.data.firmas?.tecnico) {
          sigTecnico.current?.fromDataURL(
            current.data.firmas.tecnico
          );
        }

        if (current.data.firmas?.cliente) {
          sigCliente.current?.fromDataURL(
            current.data.firmas.cliente
          );
        }
      }, 0);
    }
  }, []);

  /* ===========================
     UPDATE SEGURO (SIN structuredClone)
  =========================== */
  const update = (path, value) => {
    setData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let ref = copy;

      for (let i = 0; i < path.length - 1; i++) {
        if (!ref[path[i]]) ref[path[i]] = {};
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
    const stored =
      JSON.parse(localStorage.getItem("serviceReports")) || [];

    const current =
      JSON.parse(localStorage.getItem("currentReport"));

    const report = {
      id: current?.id || Date.now(),
      createdAt:
        current?.createdAt ||
        new Date().toISOString(),
      estado: "borrador",
      data: data,
    };

    let updated;

    if (current?.id) {
      updated = stored.map((r) =>
        r.id === current.id ? report : r
      );
    } else {
      updated = [...stored, report];
    }

    localStorage.setItem(
      "serviceReports",
      JSON.stringify(updated)
    );

    localStorage.setItem(
      "currentReport",
      JSON.stringify(report)
    );

    navigate(`/informe/pdf/${report.id}`);
  };

  /* ===========================
     NUEVO LIMPIO
  =========================== */
  const newCleanReport = () => {
    localStorage.removeItem("currentReport");
    setData(emptyReport);
    sigTecnico.current?.clear();
    sigCliente.current?.clear();
  };

  /* ===========================
     RENDER
  =========================== */
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto space-y-6">

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
                    onChange={(e) =>
                      update([key], e.target.value)
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
              <th>FIRMA TÉCNICO ASTAP</th>
              <th>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ height: 150 }}>
                <SignatureCanvas
                  ref={sigTecnico}
                  canvasProps={{ className: "w-full h-full border" }}
                />
                <button
                  type="button"
                  onClick={() => sigTecnico.current?.clear()}
                  className="text-xs text-red-600 mt-2"
                >
                  Borrar firma
                </button>
              </td>

              <td style={{ height: 150 }}>
                <SignatureCanvas
                  ref={sigCliente}
                  canvasProps={{ className: "w-full h-full border" }}
                />
                <button
                  type="button"
                  onClick={() => sigCliente.current?.clear()}
                  className="text-xs text-red-600 mt-2"
                >
                  Borrar firma
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= BOTONES ================= */}
        <div className="flex justify-between pt-6">
          <button
            onClick={() => navigate("/informe")}
            className="border px-6 py-2 rounded"
          >
            Volver
          </button>

          <button
            onClick={newCleanReport}
            className="border px-6 py-2 rounded"
          >
            Nuevo limpio
          </button>

          <button
            onClick={saveReport}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Guardar informe
          </button>
        </div>

      </div>
    </div>
  );
}
