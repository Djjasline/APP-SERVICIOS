import imageCompression from "browser-image-compression";
import { uploadRegistroImage } from "@/utils/storage";
import { supabase } from "@/lib/supabase";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";


export default function NuevoInforme() {
  const navigate = useNavigate();
  
const [uploadingCount, setUploadingCount] = useState(0);
const uploading = uploadingCount > 0;
 const { id } = useParams(); 
  const isEditing = !!id;
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
const handleImageUpload = async (file, actividadIndex) => {
  if (!file) return;

setUploadingCount((prev) => prev + 1);

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: 0.7,
      exifOrientation: 1,
    });

    const url = await uploadRegistroImage(
      compressedFile,
      "informe",
      "actividad"
    );

    if (!url) return;

    setData((prev) => {
      const copy = structuredClone(prev);
     if (!copy.actividades[actividadIndex]) return copy;

if (!Array.isArray(copy.actividades[actividadIndex].imagenes)) {
  copy.actividades[actividadIndex].imagenes = [];
}

copy.actividades[actividadIndex].imagenes = [
  ...copy.actividades[actividadIndex].imagenes,
  url,
];
      return copy;
    });

  } catch (error) {
    console.error("Error subiendo imagen:", error);
  } finally {
   setUploadingCount((prev) => prev - 1);
  }
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
useEffect(() => {
  const loadReport = async () => {
    if (!id) {
      setData(emptyReport);
      return;
    }

    const { data: report, error } = await supabase
      .from("registros")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !report) {
      console.error("Error cargando informe:", error);
      setData(emptyReport);
      return;
    }

    setData(report.data);

    setTimeout(() => {
      if (report.data.firmas?.tecnico) {
        sigTecnico.current?.fromDataURL(report.data.firmas.tecnico);
      }
      if (report.data.firmas?.cliente) {
        sigCliente.current?.fromDataURL(report.data.firmas.cliente);
      }
    }, 0);
  };

  loadReport();
}, [id]);
 

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
 const saveReport = async () => {

if (uploading) {
    alert("Espera que terminen de subir las imágenes");
    return;
  }
   
 const firmaTecnico =
  sigTecnico.current && !sigTecnico.current.isEmpty()
    ? sigTecnico.current.toDataURL()
    : "";

const firmaCliente =
  sigCliente.current && !sigCliente.current.isEmpty()
    ? sigCliente.current.toDataURL()
    : "";

/* ===========================
   🔒 VALIDACIÓN REAL FIRMA
=========================== */

// Si el canvas no tiene firma nueva,
// usar la que ya estaba guardada
const firmaTecnicoFinal =
  firmaTecnico || data.firmas?.tecnico || "";

const firmaClienteFinal =
  firmaCliente || data.firmas?.cliente || "";

// Estado depende de que exista firma técnico
const estadoFinal =
  firmaTecnicoFinal ? "completado" : "borrador";

const reportData = {
  estado: estadoFinal,
  data: {
    ...data,
    firmas: {
      tecnico: firmaTecnicoFinal,
      cliente: firmaClienteFinal,
    },
  },
};

 // 🔥 EDITAR
if (isEditing) {
  const { error } = await supabase
    .from("registros")
    .update({
      estado: reportData.estado,
      data: reportData.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

  alert("Informe actualizado correctamente ✅");
  navigate("/informe");
  return;
}

// 🔥 CREAR NUEVO
const { error } = await supabase.from("registros").insert([
  {
    tipo: "informe",
    subtipo: "general",
    estado: reportData.estado,
    data: reportData.data,
  },
]);

if (error) throw error;

alert("Informe guardado correctamente ✅");
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

  <tr>
    <td className="pdf-label">FECHA DE SERVICIO</td>
    <td>
      <input
        type="date"
        className="pdf-input"
        value={data.fechaServicio}
        onChange={(e) => update(["fechaServicio"], e.target.value)}
      />
    </td>
  </tr>

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

  {/* ÍTEM */}
  <td className="text-center align-top">
    {i + 1}
  </td>

  {/* DESCRIPCIÓN */}
  <td className="align-top">
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
    rows={2}
    onInput={(e) => {
      e.target.style.height = "auto";
      e.target.style.height = e.target.scrollHeight + "px";
    }}
    onChange={(e) =>
      update(["actividades", i, "detalle"], e.target.value)
    }
  />
</td>
{/* IMÁGENES */}
<td className="align-top">
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
  files.forEach((file) => handleImageUpload(file, i));

  e.target.value = null; // 🔥 CLAVE
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
    files.forEach((file) => handleImageUpload(file, i));
    e.target.value = null;
  }}
/>
    </label>

  </div>

  {/* PREVISUALIZACIÓN */}
  <div className="grid grid-cols-2 gap-2">
   {(a.imagenes || []).map((img, imgIndex) => (
      <div key={imgIndex} className="relative">

        <img
          src={img}
          alt="actividad"
          className="w-full h-[100px] object-contain bg-gray-100 border rounded"
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
  {uploading
  ? `Subiendo imágenes (${uploadingCount})...`
  : isEditing
  ? "Actualizar informe"
  : "Guardar informe"}
  className={`px-6 py-2 rounded text-white ${
    uploading ? "bg-gray-400" : "bg-blue-600"
  }`}
>
  {uploading
    ? "Subiendo imágenes..."
    : isEditing
    ? "Actualizar informe"
    : "Guardar informe"}
</button>
        </div>

      </div>
    </div>
  );
}
