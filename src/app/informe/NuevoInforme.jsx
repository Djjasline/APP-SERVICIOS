import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function NuevoInforme() {
  const navigate = useNavigate();

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

  useEffect(() => {
    const current = JSON.parse(localStorage.getItem("currentReport"));
    if (current?.data) {
      setData(current.data);
      setTimeout(() => {
        if (current.data.firmas?.tecnico) {
          sigTecnico.current?.fromDataURL(current.data.firmas.tecnico);
        }
        if (current.data.firmas?.cliente) {
          sigCliente.current?.fromDataURL(current.data.firmas.cliente);
        }
      }, 0);
    }
  }, []);

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

  const fileToBase64 = (file, cb) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => cb(reader.result);
    reader.readAsDataURL(file);
  };

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
    navigate(`/informe/${report.id}/pdf`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto space-y-6">

        <ReportHeader data={data} onChange={update} />

        {/* ACTIVIDADES */}
        <h3 className="font-bold text-sm">ACTIVIDADES REALIZADAS</h3>

        <table className="pdf-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>ÍTEM</th>
              <th>DESCRIPCIÓN</th>
              <th style={{ width: 260 }}>IMAGEN</th>
            </tr>
          </thead>
          <tbody>
            {data.actividades.map((a, i) => (
              <tr key={i}>
                <td className="text-center">{i + 1}</td>
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

                {/* 🔥 NUEVO BLOQUE CÁMARA / GALERÍA */}
                <td className="text-center space-y-2">

                  <div className="flex gap-2 justify-center">

                    {/* Cámara */}
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

                    {/* Galería */}
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
                      style={{ maxWidth: 120, margin: "0 auto" }}
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

      </div>
    </div>
  );
}
