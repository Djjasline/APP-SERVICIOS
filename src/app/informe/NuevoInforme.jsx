import imageCompression from "browser-image-compression";
import { uploadRegistroImage } from "@/utils/storage";
import { supabase } from "@/lib/supabase";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function NuevoInforme() {
  const navigate = useNavigate();
  const currentReport = JSON.parse(localStorage.getItem("currentReport"));
  const isEditing = !!currentReport?.id;

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

  /* ================= IMÁGENES ================= */
  const handleImageUpload = async (file, index) => {
    if (!file) return;

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });

      const url = await uploadRegistroImage(
        compressed,
        "informe",
        "actividad"
      );

      if (!url) return;

      setData((prev) => {
        const copy = structuredClone(prev);
        copy.actividades[index].imagenes.push(url);
        return copy;
      });

    } catch (err) {
      console.error("Error imagen:", err);
    }
  };

  /* ================= UPDATE ================= */
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

  /* ================= SAVE ================= */
  const saveReport = async () => {
    const firmaTecnico = sigTecnico.current?.toDataURL() || "";
    const firmaCliente = sigCliente.current?.toDataURL() || "";

    const payload = {
      ...data,
      firmas: {
        tecnico: firmaTecnico || data.firmas?.tecnico,
        cliente: firmaCliente || data.firmas?.cliente,
      },
    };

    try {
      await supabase.from("registros").insert([
        {
          tipo: "informe",
          subtipo: "general",
          data: payload,
        },
      ]);
    } catch (err) {
      console.error(err);
    }

    navigate("/informe");
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto space-y-6">

        <ReportHeader data={data} onChange={update} />

        {/* CLIENTE */}
        <table className="pdf-table">
          <tbody>
            {[
              ["CLIENTE", "cliente"],
              ["DIRECCIÓN", "direccion"],
              ["CONTACTO", "contacto"],
              ["TELÉFONO", "telefono"],
              ["CORREO", "correo"],
              ["TÉCNICO", "tecnicoNombre"],
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
        <h3 className="font-bold text-sm">ACTIVIDADES</h3>

        <table className="pdf-table">
          <tbody>
            {data.actividades.map((a, i) => (
              <tr key={i}>

                <td>{i + 1}</td>

                <td>
                  <input
                    className="pdf-input"
                    value={a.titulo}
                    onChange={(e) =>
                      update(["actividades", i, "titulo"], e.target.value)
                    }
                  />

                  <textarea
                    className="pdf-textarea"
                    value={a.detalle}
                    onChange={(e) =>
                      update(["actividades", i, "detalle"], e.target.value)
                    }
                  />
                </td>

                <td>

                  {/* BOTONES */}
                  <div className="flex gap-2 mb-2">

                    <label className="bg-gray-700 text-white px-2 py-1 text-xs rounded cursor-pointer">
                      📁
                      <input
                        type="file"
                        multiple
                        hidden
                        onChange={(e) => {
                          Array.from(e.target.files).forEach((file) =>
                            handleImageUpload(file, i)
                          );
                        }}
                      />
                    </label>

                    <label className="bg-blue-600 text-white px-2 py-1 text-xs rounded cursor-pointer">
                      📷
                      <input
                        type="file"
                        capture="environment"
                        hidden
                        onChange={(e) => {
                          Array.from(e.target.files).forEach((file) =>
                            handleImageUpload(file, i)
                          );
                        }}
                      />
                    </label>

                  </div>

                  {/* PREVIEW */}
                  <div className="grid grid-cols-2 gap-2">
                    {a.imagenes.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img}
                          className="w-full h-24 object-contain border rounded"
                        />

                        <button
                          onClick={() => {
                            setData((prev) => {
                              const copy = structuredClone(prev);
                              copy.actividades[i].imagenes.splice(idx, 1);
                              return copy;
                            });
                          }}
                          className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* FIRMAS */}
        <div className="grid grid-cols-2 gap-6">
          <SignatureCanvas ref={sigTecnico} />
          <SignatureCanvas ref={sigCliente} />
        </div>

        {/* BOTÓN */}
        <button
          onClick={saveReport}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          {isEditing ? "Actualizar informe" : "Guardar informe"}
        </button>

      </div>
    </div>
  );
}
