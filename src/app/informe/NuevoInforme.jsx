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
  const auto = JSON.parse(localStorage.getItem("autoSaveInforme"));
  const current = JSON.parse(localStorage.getItem("currentReport"));

  if (auto) {
    setData(auto);
  } else if (current?.data) {
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
   AUTOGUARDADO AUTOMÁTICO
=========================== */
useEffect(() => {
  const timeout = setTimeout(() => {
    try {
      const json = JSON.stringify(data);

      // ⚠️ Validar tamaño antes de guardar
      const sizeInKB = new Blob([json]).size / 1024;

      if (sizeInKB < 4500) { // margen seguro
        localStorage.setItem("autoSaveInforme", json);
      } else {
        console.warn("Autoguardado omitido: tamaño demasiado grande");
      }

    } catch (err) {
      console.error("Error guardando autoguardado:", err);
    }
  }, 800);

  return () => clearTimeout(timeout);
}, [data]);

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
   COMPRESIÓN Y REDIMENSIÓN
=========================== */
const fileToBase64 = (file, cb) => {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;

    img.onload = () => {
      const canvas = document.createElement("canvas");

      const MAX_SIZE = 600; // 🔹 tamaño máximo 600x600 px

      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // 🔹 Calidad 0.6 = buena calidad pero liviana
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);

      cb(compressedBase64);
    };
  };

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

    const firmaTecnico =
      sigTecnico.current && !sigTecnico.current.isEmpty()
        ? sigTecnico.current.toDataURL()
        : "";

    const firmaCliente =
      sigCliente.current && !sigCliente.current.isEmpty()
        ? sigCliente.current.toDataURL()
        : "";

    const report = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      estado: "borrador",
      data: {
        ...data,
        firmas: {
          tecnico: firmaTecnico,
          cliente: firmaCliente,
        },
      },
    };

    localStorage.setItem("serviceReports", JSON.stringify([...stored, report]));
    localStorage.setItem("currentReport", JSON.stringify(report));
    navigate("/informe");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto space-y-6">

        <ReportHeader data={data} onChange={update} />

        {/* DATOS CLIENTE */}
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
  className="pdf-textarea w-full resize-none overflow-hidden"
  placeholder="Detalle"
  value={a.detalle}
  rows={3}
  onChange={(e) => {
    update(["actividades", i, "detalle"], e.target.value);

    // 🔥 Auto expandir altura
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }}
/>

                </td>
             <td className="text-center">

  <div className="flex flex-col gap-2 mb-2">

    {/* GALERÍA */}
    <label className="bg-gray-700 text-white text-xs px-3 py-1 rounded cursor-pointer text-center">
      📁 Galería
      <input
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
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

    {/* CÁMARA */}
    <label className="bg-blue-600 text-white text-xs px-3 py-1 rounded cursor-pointer text-center">
      📷 Cámara
      <input
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
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

  {/* PREVISUALIZACIÓN */}
  <div className="flex flex-wrap gap-2 justify-center">
    {a.imagenes?.map((img, imgIndex) => (
      <div key={imgIndex} className="relative">
        <img
          src={img}
          alt="actividad"
          style={{ maxWidth: 120 }}
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
          className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1"
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
      className="text-red-600 text-xs mt-2"
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
          onClick={addActividad}
          className="border px-3 py-1 text-xs rounded"
        >
          + Agregar actividad
        </button>

               {/* CONCLUSIONES Y RECOMENDACIONES */}
        <h3 className="font-bold text-sm">CONCLUSIONES Y RECOMENDACIONES</h3>

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
                <td style={{ width: 30, textAlign: "center" }}>{i + 1}</td>
                <td>
                  <textarea
                    className="pdf-textarea"
                    value={data.conclusiones[i]}
                    onChange={(e) =>
                      update(["conclusiones", i], e.target.value)
                    }
                  />
                </td>
                <td style={{ width: 30, textAlign: "center" }}>{i + 1}</td>
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

        {/* DESCRIPCIÓN DEL EQUIPO */}
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
            document.activeElement?.blur();
            document.body.style.overflow = "hidden";
          }}
          onEnd={() => {
            document.body.style.overflow = "";
          }}
          canvasProps={{ className: "w-full h-full" }}
        />

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              sigTecnico.current?.clear();
              setData((prev) => ({
                ...prev,
                firmas: {
                  ...prev.firmas,
                  tecnico: "",
                },
              }));
            }}
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
            document.activeElement?.blur();
            document.body.style.overflow = "hidden";
          }}
          onEnd={() => {
            document.body.style.overflow = "";
          }}
          canvasProps={{ className: "w-full h-full" }}
        />

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              sigCliente.current?.clear();
              setData((prev) => ({
                ...prev,
                firmas: {
                  ...prev.firmas,
                  cliente: "",
                },
              }));
            }}
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
