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

  const handleImageUpload = async (file, actividadIndex) => {
    if (!file) return;

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });

      const url = await uploadRegistroImage(
        compressedFile,
        "informe",
        "actividad"
      );

      if (!url) return;

      setData((prev) => {
        const copy = structuredClone(prev);
        copy.actividades[actividadIndex].imagenes.push(url);
        return copy;
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const current = JSON.parse(localStorage.getItem("currentReport"));
    if (current?.data) {
      setData(current.data);
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

  const addActividad = () =>
    setData((p) => ({
      ...p,
      actividades: [...p.actividades, { titulo: "", detalle: "", imagenes: [] }],
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

  const saveReport = async () => {
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];

    const firmaTecnico =
      sigTecnico.current && !sigTecnico.current.isEmpty()
        ? sigTecnico.current.toDataURL()
        : "";

    const firmaCliente =
      sigCliente.current && !sigCliente.current.isEmpty()
        ? sigCliente.current.toDataURL()
        : "";

    const reportData = {
      estado: firmaTecnico ? "completado" : "borrador",
      data: {
        ...data,
        firmas: {
          tecnico: firmaTecnico || data.firmas?.tecnico || "",
          cliente: firmaCliente || data.firmas?.cliente || "",
        },
      },
    };

    const localReport = {
      id: Date.now(),
      tipo: "informe",
      subtipo: "general",
      estado: reportData.estado,
      data: reportData.data,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "serviceReports",
      JSON.stringify([...stored, localReport])
    );

    try {
      await supabase.from("registros").insert([
        {
          tipo: "informe",
          subtipo: "general",
          estado: reportData.estado,
          data: reportData.data,
        },
      ]);
    } catch (err) {
      console.error(err);
    }

    navigate("/informe");
  };

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
            ].map(([label, key]) => (
              <tr key={key}>
                <td>{label}</td>
                <td>
                  <input
                    value={data[key]}
                    onChange={(e) => update([key], e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ACTIVIDADES */}
        <table className="pdf-table">
          <tbody>
            {data.actividades.map((a, i) => (
              <tr key={i}>
                <td>{i + 1}</td>

                <td>
                  <input
                    value={a.titulo}
                    onChange={(e) =>
                      update(["actividades", i, "titulo"], e.target.value)
                    }
                  />
                  <textarea
                    value={a.detalle}
                    onChange={(e) =>
                      update(["actividades", i, "detalle"], e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach((file) =>
                        handleImageUpload(file, i)
                      );
                    }}
                  />

                  {a.imagenes.map((img, idx) => (
                    <img key={idx} src={img} width={100} />
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addActividad}>+ Actividad</button>

        {/* CONCLUSIONES */}
        <table className="pdf-table">
          <tbody>
            {data.conclusiones.map((_, i) => (
              <tr key={i}>
                <td>
                  <textarea
                    value={data.conclusiones[i]}
                    onChange={(e) =>
                      update(["conclusiones", i], e.target.value)
                    }
                  />
                </td>
                <td>
                  <textarea
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

        {/* FIRMAS */}
        <table className="pdf-table">
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

        <button onClick={saveReport}>
          {isEditing ? "Actualizar" : "Guardar"}
        </button>

      </div>
    </div>
  );
}
```
