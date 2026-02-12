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
     CONTROL FOCO Y SCROLL
  =========================== */
  const blurActiveElement = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const disableScroll = () => {
    document.body.style.overflow = "hidden";
  };

  const enableScroll = () => {
    document.body.style.overflow = "";
  };

/* ===========================
   CARGAR BORRADOR SOLO SI EXISTE
=========================== */
useEffect(() => {
  const current = JSON.parse(localStorage.getItem("currentReport"));

  // Solo cargar si NO estamos en /nuevo
  if (!window.location.pathname.includes("nuevo")) return;

  // Si es nuevo, limpiar estado completamente
  setData(emptyReport);

  // Limpiar cualquier firma anterior
  sigTecnico.current?.clear();
  sigCliente.current?.clear();

}, []);
  /* ===========================
     UPDATE GENÉRICO
  =========================== */
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

  /* ===========================
     IMAGEN → BASE64
  =========================== */
  const fileToBase64 = (file, cb) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => cb(reader.result);
    reader.readAsDataURL(file);
  };

  /* ===========================
     ACTIVIDADES
  =========================== */
  const addActividad = () =>
    setData((p) => ({
      ...p,
      actividades: [...p.actividades, { titulo: "", detalle: "", imagen: "" }],
    }));

  const removeActividad = (index) =>
    setData((p) => ({
      ...p,
      actividades: p.actividades.filter((_, i) => i !== index),
    }));

  /* ===========================
     CONCLUSIONES / RECOMENDACIONES
  =========================== */
  const addConclusionRow = () =>
    setData((p) => ({
      ...p,
      conclusiones: [...p.conclusiones, ""],
      recomendaciones: [...p.recomendaciones, ""],
    }));

  const removeConclusionRow = (index) =>
    setData((p) => ({
      ...p,
      conclusiones: p.conclusiones.filter((_, i) => i !== index),
      recomendaciones: p.recomendaciones.filter((_, i) => i !== index),
    }));

  /* ===========================
     GUARDAR INFORME
  =========================== */
  const saveReport = () => {
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];

    const report = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      estado: "borrador",
      data: {
        ...data,
        firmas: {
          tecnico: sigTecnico.current?.isEmpty()
            ? ""
            : sigTecnico.current.toDataURL(),
          cliente: sigCliente.current?.isEmpty()
            ? ""
            : sigCliente.current.toDataURL(),
        },
      },
    };

    localStorage.setItem("serviceReports", JSON.stringify([...stored, report]));
    localStorage.setItem("currentReport", JSON.stringify(report));

    navigate(`/informe/pdf/${report.id}`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto space-y-6">

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
        <h3 className="font-bold text-sm">ACTIVIDADES REALIZADAS</h3>

        <table className="pdf-table">
          <thead>
            <tr>
              <th>ÍTEM</th>
              <th>DESCRIPCIÓN</th>
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

                <td className="text-center space-y-2">
                  <div className="flex gap-2 justify-center">

                    <label className="bg-blue-600 text-white px-3 py-1 text-xs rounded cursor-pointer">
                      📷 Cámara
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) =>
                          fileToBase64(e.target.files[0], (b64) =>
                            update(["actividades", i, "imagen"], b64)
                          )
                        }
                      />
                    </label>

                    <label className="bg-gray-600 text-white px-3 py-1 text-xs rounded cursor-pointer">
                      🖼️ Galería
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          fileToBase64(e.target.files[0], (b64) =>
                            update(["actividades", i, "imagen"], b64)
                          )
                        }
                      />
                    </label>

                  </div>

                  {a.imagen && (
                    <img
                      src={a.imagen}
                      alt="actividad"
                      style={{ maxWidth: 120 }}
                    />
                  )}

                  {data.actividades.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeActividad(i)}
                      className="text-red-600 text-xs"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={addActividad}
          className="border px-3 py-1 text-xs rounded"
        >
          + Agregar actividad
        </button>

        {/* ================= CONCLUSIONES ================= */}
        <h3 className="font-bold text-sm">
          CONCLUSIONES Y RECOMENDACIONES
        </h3>

        <table className="pdf-table">
          <thead>
            <tr>
              <th colSpan={2}>CONCLUSIONES</th>
              <th colSpan={2}>RECOMENDACIONES</th>
            </tr>
          </thead>
          <tbody>
            {data.conclusiones.map((_, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <textarea
                    className="pdf-textarea"
                    value={data.conclusiones[i]}
                    onChange={(e) =>
                      update(["conclusiones", i], e.target.value)
                    }
                  />
                </td>

                <td>{i + 1}</td>
                <td>
                  <textarea
                    className="pdf-textarea"
                    value={data.recomendaciones[i]}
                    onChange={(e) =>
                      update(["recomendaciones", i], e.target.value)
                    }
                  />

                  {data.conclusiones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeConclusionRow(i)}
                      className="text-red-600 text-xs mt-1"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          type="button"
          onClick={addConclusionRow}
          className="border px-3 py-1 text-xs rounded"
        >
          + Agregar conclusión / recomendación
        </button>

        {/* ================= DESCRIPCIÓN EQUIPO ================= */}
        <h3 className="font-bold text-sm">DESCRIPCIÓN DEL EQUIPO</h3>

        <table className="pdf-table">
          <tbody>
            {[
              ["NOTA", "nota"],
              ["MARCA", "marca"],
              ["MODELO", "modelo"],
              ["N° SERIE", "serie"],
              ["AÑO MODELO", "anio"],
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
      <th>FIRMA TÉCNICO ASTAP</th>
      <th>FIRMA CLIENTE</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style={{ height: 160 }}>
        <SignatureCanvas
          ref={sigTecnico}
          onBegin={() => {
            blurActiveElement();
            disableScroll();
          }}
          onEnd={enableScroll}
          canvasProps={{ className: "w-full h-full" }}
        />

        <div className="text-center">
          <button
            type="button"
            onClick={() => sigTecnico.current?.clear()}
            className="text-xs text-red-600 mt-2"
          >
            Borrar firma
          </button>
        </div>
      </td>

      <td style={{ height: 160 }}>
        <SignatureCanvas
          ref={sigCliente}
          onBegin={() => {
            blurActiveElement();
            disableScroll();
          }}
          onEnd={enableScroll}
          canvasProps={{ className: "w-full h-full" }}
        />

        <div className="text-center">
          <button
            type="button"
            onClick={() => sigCliente.current?.clear()}
            className="text-xs text-red-600 mt-2"
          >
            Borrar firma
          </button>
        </div>
      </td>
    </tr>
  </tbody>
</table>

        {/* BOTONES */}
        <div className="flex justify-between pt-6">
          <button
            onClick={() => navigate("/informe")}
            className="border px-6 py-2 rounded"
          >
            Volver
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
