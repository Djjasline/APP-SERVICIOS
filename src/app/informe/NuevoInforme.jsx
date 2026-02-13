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

    actividades: [{ titulo: "", detalle: "", imagenes: [] }],

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

  const disableScroll = () => {
    document.body.style.overflow = "hidden";
  };

  const enableScroll = () => {
    document.body.style.overflow = "";
  };

  /* ===========================
     CARGAR BORRADOR
  =========================== */
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
      actividades: [
        ...p.actividades,
        { titulo: "", detalle: "", imagenes: [] },
      ],
    }));

  const removeActividad = (index) =>
    setData((p) => ({
      ...p,
      actividades: p.actividades.filter((_, i) => i !== index),
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

    localStorage.setItem(
      "serviceReports",
      JSON.stringify([...stored, report])
    );
    localStorage.setItem("currentReport", JSON.stringify(report));
    navigate("/informe");
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

                {/* IMÁGENES MULTIPLES */}
                <td className="text-center">

                  <div className="flex flex-col gap-2 mb-3">

                    <label className="bg-gray-700 hover:bg-gray-800 text-white text-xs px-3 py-1 rounded cursor-pointer text-center">
                      📁 Galería
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          files.forEach((file) => {
                            fileToBase64(file, (b64) => {
                              setData((prev) => {
                                const copy = structuredClone(prev);
                                copy.actividades[i].imagenes.push(b64);
                                return copy;
                              });
                            });
                          });
                        }}
                      />
                    </label>

                    <label className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded cursor-pointer text-center">
                      📷 Cámara
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          files.forEach((file) => {
                            fileToBase64(file, (b64) => {
                              setData((prev) => {
                                const copy = structuredClone(prev);
                                copy.actividades[i].imagenes.push(b64);
                                return copy;
                              });
                            });
                          });
                        }}
                      />
                    </label>

                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {a.imagenes?.map((img, imgIndex) => (
                      <div key={imgIndex} className="relative">
                        <img
                          src={img}
                          alt="actividad"
                          className="w-24 h-24 object-cover border rounded"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setData((prev) => {
                              const copy = structuredClone(prev);
                              copy.actividades[i].imagenes.splice(imgIndex, 1);
                              return copy;
                            });
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {data.actividades.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeActividad(i)}
                      className="text-red-600 text-xs mt-3"
                    >
                      Eliminar actividad
                    </button>
                  )}

                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          type="button"
          onClick={addActividad}
          className="border px-3 py-1 text-xs rounded"
        >
          + Agregar actividad
        </button>

        {/* BOTONES */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={() => navigate("/informe")}
            className="border px-6 py-2 rounded"
          >
            Volver
          </button>

          <button
            type="button"
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
