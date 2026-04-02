import { useAuth } from "@/context/AuthContext";
import { getLoggedTechnician } from "@/utils/getLoggedTechnician";
import { saveOrUpdateReport } from "@/services/reportService";
import imageCompression from "browser-image-compression";
import { uploadRegistroImage } from "@/utils/storage";
import { supabase } from "@/lib/supabase";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function NuevoInforme() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const isEditing = !!id;

  const sigTecnico = useRef(null);
  const sigCliente = useRef(null);

  const [uploadingCount, setUploadingCount] = useState(0);
  const uploading = uploadingCount > 0;

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

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
      horasModulo: "",
    },

    firmas: {
      tecnico: "",
      cliente: "",
    },
  };

  const [data, setData] = useState(emptyReport);

  /* ===========================
     TECNICO AUTO
  =========================== */
  useEffect(() => {
    if (!user || id) return;

    const tech = getLoggedTechnician(user);
    if (!tech) return;

    setData((prev) => ({
      ...prev,
      tecnicoNombre: tech.name,
      tecnicoTelefono: tech.phone,
      tecnicoCorreo: tech.email,
    }));
  }, [user, id]);

  /* ===========================
     CARGA EDICIÓN
  =========================== */
  useEffect(() => {
    const load = async () => {
      if (!id) return;

      const { data: report } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .single();

      if (!report) return;

      setData({
        ...emptyReport,
        ...(report.data || {}),
      });

      setTimeout(() => {
        if (report.data?.firmas?.tecnico)
          sigTecnico.current?.fromDataURL(report.data.firmas.tecnico);

        if (report.data?.firmas?.cliente)
          sigCliente.current?.fromDataURL(report.data.firmas.cliente);
      }, 0);
    };

    load();
  }, [id]);

  /* ===========================
     UPDATE
  =========================== */
  const update = (path, value) => {
    setData((prev) => {
      const copy = { ...prev };
      let ref = copy;

      for (let i = 0; i < path.length - 1; i++) {
        if (Array.isArray(ref[path[i]])) {
          ref[path[i]] = [...ref[path[i]]];
        } else {
          ref[path[i]] = { ...ref[path[i]] };
        }
        ref = ref[path[i]];
      }

      ref[path[path.length - 1]] = value;
      return copy;
    });
  };

  /* ===========================
     IMÁGENES
  =========================== */
  const handleImageUpload = async (file, i) => {
    setUploadingCount((p) => p + 1);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1280,
      });

      const url = await uploadRegistroImage(
        compressed,
        id || "temp",
        "actividad"
      );

      setData((prev) => {
        const copy = { ...prev };
        copy.actividades = [...copy.actividades];

        const actividad = { ...copy.actividades[i] };
        actividad.imagenes = [...(actividad.imagenes || []), url];

        copy.actividades[i] = actividad;
        return copy;
      });

    } finally {
      setUploadingCount((p) => p - 1);
    }
  };

  /* ===========================
     GUARDAR
  =========================== */
  const saveReport = async () => {
    if (uploading) return alert("Subiendo imágenes...");

    const firmaTecnico =
      sigTecnico.current?.isEmpty?.() === false
        ? sigTecnico.current.toDataURL()
        : "";

    const firmaCliente =
      sigCliente.current?.isEmpty?.() === false
        ? sigCliente.current.toDataURL()
        : "";

    await saveOrUpdateReport({
      id,
      tipo: "informe",
      subtipo: "agua",
      data: {
        ...data,
        firmas: {
          tecnico: firmaTecnico,
          cliente: firmaCliente,
        },
      },
      estado: firmaTecnico ? "completado" : "borrador",
    });

    navigate("/agua/informe");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex justify-center">
      <div className="bg-white p-8 shadow-lg w-full max-w-5xl space-y-6 border">

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
            ].map(([l, k]) => (
              <tr key={k}>
                <td className="pdf-label">{l}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data[k]}
                    onChange={(e) => update([k], e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* EQUIPO */}
        <h3 className="font-bold text-sm">DESCRIPCIÓN DEL EQUIPO</h3>

        <table className="pdf-table">
          <tbody>
            {[
              ["NOTA", "nota"],
              ["MARCA", "marca"],
              ["MODELO", "modelo"],
              ["N° SERIE", "serie"],
              ["HORÓMETRO", "horasModulo"],
            ].map(([label, key]) => (
              <tr key={key}>
                <td className="pdf-label">{label}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data.equipo[key] || ""}
                    onChange={(e) =>
                      update(["equipo", key], e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ACTIVIDADES TABLA PRO */}
        <h3 className="font-bold text-sm">ACTIVIDADES REALIZADAS</h3>

        <table className="pdf-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>ÍTEM</th>
              <th>DESCRIPCIÓN</th>
              <th style={{ width: 260 }}>IMÁGENES</th>
            </tr>
          </thead>

          <tbody>
            {data.actividades.map((a, i) => (
              <tr key={i}>
                <td className="text-center">{i + 1}</td>

                <td>
                  <textarea
                    className="pdf-textarea w-full"
                    value={a.titulo}
                    onInput={autoResize}
                    onChange={(e) =>
                      update(["actividades", i, "titulo"], e.target.value)
                    }
                  />
                  <textarea
                    className="pdf-textarea w-full"
                    value={a.detalle}
                    onInput={autoResize}
                    onChange={(e) =>
                      update(["actividades", i, "detalle"], e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleImageUpload(e.target.files[0], i)
                    }
                  />

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(a.imagenes || []).map((img, idx) => (
                      <img key={idx} src={img} className="w-full" />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* CONCLUSIONES */}
        <h3 className="font-bold text-sm">CONCLUSIONES</h3>

        {data.conclusiones.map((c, i) => (
          <textarea
            key={i}
            className="pdf-textarea w-full"
            value={c}
            onChange={(e) =>
              update(["conclusiones", i], e.target.value)
            }
          />
        ))}

        {/* RECOMENDACIONES */}
        <h3 className="font-bold text-sm">RECOMENDACIONES</h3>

        {data.recomendaciones.map((r, i) => (
          <textarea
            key={i}
            className="pdf-textarea w-full"
            value={r}
            onChange={(e) =>
              update(["recomendaciones", i], e.target.value)
            }
          />
        ))}

        {/* FIRMAS */}
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
                <SignatureCanvas ref={sigTecnico} />
              </td>
              <td>
                <SignatureCanvas ref={sigCliente} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* BOTONES */}
        <div className="flex justify-between">
          <button onClick={() => navigate("/agua/informe")}>
            Volver
          </button>

          <button
            onClick={saveReport}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Guardar
          </button>
        </div>

      </div>
    </div>
  );
}
