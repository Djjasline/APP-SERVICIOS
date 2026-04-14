import { TECHNICIANS } from "@/data/technicians";
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

  const [uploadingCount, setUploadingCount] = useState(0);
  const uploading = uploadingCount > 0;

  const { id } = useParams();
  const isEditing = !!id;

  /* ===========================
     ESTADO BASE
  =========================== */
  const emptyReport = {
    referenciaContrato: "",
    pedidoDemanda: "",
    descripcion: "",
    codInf: "",

    // Datos cliente
    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    fechaServicio: "",

    // Datos técnico
    tecnicoNombre: "",
    tecnicoTelefono: "",
    tecnicoCorreo: "",

    // Estado del equipo
    estadoEquipo: {
      imagenes: [],
    },

    // Actividades
    actividades: [{ titulo: "", detalle: "", imagenes: [] }],

    // Cierre
    conclusiones: [""],
    recomendaciones: [""],

    // Equipo
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
      horometro: "",
    },

    // Firmas
    firmas: {
      tecnico: "",
      cliente: "",
      clienteCedula: "",
    },
  };

  const [data, setData] = useState(emptyReport);
  const sigTecnico = useRef(null);
  const sigCliente = useRef(null);

  /* ===========================
     AUTO RESIZE TEXTAREA
  =========================== */
  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  /* ===========================
     PRELLENAR TÉCNICO LOGUEADO
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
     LIMPIAR OVERFLOW AL DESMONTAR
  =========================== */
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* ===========================
     CARGAR INFORME EXISTENTE
  =========================== */
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

      const cleanData = {
        ...emptyReport,
        ...(report.data || {}),
        estadoEquipo: {
          imagenes: Array.isArray(report.data?.estadoEquipo?.imagenes)
            ? report.data.estadoEquipo.imagenes.map((img, imgIndex) => ({
                id: img?.id || `img-${imgIndex}-${Date.now()}`,
                url: img?.url || "",
                puntos: Array.isArray(img?.puntos)
                  ? img.puntos.map((p, pointIndex) => ({
                      id: p?.id || `p-${imgIndex}-${pointIndex}-${Date.now()}`,
                      x: typeof p?.x === "number" ? p.x : 0,
                      y: typeof p?.y === "number" ? p.y : 0,
                      observacion: p?.observacion || "",
                    }))
                  : [],
              }))
            : [],
        },
        actividades: Array.isArray(report.data?.actividades)
          ? report.data.actividades.map((a) => ({
              titulo: a?.titulo || "",
              detalle: a?.detalle || "",
              imagenes: Array.isArray(a?.imagenes) ? a.imagenes : [],
            }))
          : [{ titulo: "", detalle: "", imagenes: [] }],
        firmas: {
          tecnico: report.data?.firmas?.tecnico || "",
          cliente: report.data?.firmas?.cliente || "",
          clienteCedula: report.data?.firmas?.clienteCedula || "",
        },
      };

      setData(cleanData);

      setTimeout(() => {
        if (report.data?.firmas?.tecnico) {
          sigTecnico.current?.fromDataURL(report.data.firmas.tecnico);
        }
        if (report.data?.firmas?.cliente) {
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
     SUBIDA / COMPRESIÓN
  =========================== */
  const compressAndUploadImage = async (file, folder = "actividad") => {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: 0.75,
      exifOrientation: 1,
    });

    const url = await uploadRegistroImage(compressedFile, id || "temp", folder);
    return url;
  };

  /* ===========================
     SUBIDA DE IMÁGENES ACTIVIDADES
  =========================== */
  const handleImageUpload = async (file, actividadIndex) => {
    if (!file) return;

    const currentImages = data.actividades?.[actividadIndex]?.imagenes || [];
    if (currentImages.length >= 4) {
      alert("Máximo 4 imágenes por actividad");
      return;
    }

    setUploadingCount((prev) => prev + 1);

    try {
      const url = await compressAndUploadImage(file, "actividad");
      if (!url) return;

      setData((prev) => {
        if (!prev.actividades[actividadIndex]) return prev;

        const copy = { ...prev };
        copy.actividades = [...copy.actividades];

        const actividad = { ...copy.actividades[actividadIndex] };
        const imagenes = Array.isArray(actividad.imagenes)
          ? [...actividad.imagenes]
          : [];

        if (imagenes.length >= 4) return prev;

        imagenes.push(url);
        actividad.imagenes = imagenes;
        copy.actividades[actividadIndex] = actividad;

        return copy;
      });
    } catch (error) {
      console.error("Error subiendo imagen:", error);
    } finally {
      setUploadingCount((prev) => prev - 1);
    }
  };

  /* ===========================
     ESTADO DEL EQUIPO - FOTOS
  =========================== */
  const handleEstadoEquipoImagesUpload = async (files) => {
    const selectedFiles = Array.from(files || []);
    if (selectedFiles.length === 0) return;

    setUploadingCount((prev) => prev + selectedFiles.length);

    try {
      for (const file of selectedFiles) {
        const url = await compressAndUploadImage(file, "estado-equipo");
        if (!url) continue;

        setData((prev) => {
          const actuales = prev.estadoEquipo?.imagenes || [];

          const nuevaImagen = {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            url,
            puntos: [],
          };

          return {
            ...prev,
            estadoEquipo: {
              ...prev.estadoEquipo,
              imagenes: [...actuales, nuevaImagen],
            },
          };
        });
      }
    } catch (error) {
      console.error("Error subiendo imágenes de estado del equipo:", error);
    } finally {
      setUploadingCount((prev) => prev - selectedFiles.length);
    }
  };

  const removeEstadoEquipoImage = (imageId) => {
    setData((prev) => ({
      ...prev,
      estadoEquipo: {
        ...prev.estadoEquipo,
        imagenes: (prev.estadoEquipo?.imagenes || []).filter(
          (img) => img.id !== imageId
        ),
      },
    }));
  };

  const clearEstadoEquipoImagePoints = (imageId) => {
    setData((prev) => ({
      ...prev,
      estadoEquipo: {
        ...prev.estadoEquipo,
        imagenes: (prev.estadoEquipo?.imagenes || []).map((img) =>
          img.id === imageId ? { ...img, puntos: [] } : img
        ),
      },
    }));
  };

  const handleEstadoEquipoImageClick = (e, imageId) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const nuevoPunto = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      x: Number(x.toFixed(4)),
      y: Number(y.toFixed(4)),
      observacion: "",
    };

    setData((prev) => ({
      ...prev,
      estadoEquipo: {
        ...prev.estadoEquipo,
        imagenes: (prev.estadoEquipo?.imagenes || []).map((img) =>
          img.id === imageId
            ? { ...img, puntos: [...(img.puntos || []), nuevoPunto] }
            : img
        ),
      },
    }));
  };

  const removeEstadoEquipoPoint = (imageId, pointId) => {
    setData((prev) => ({
      ...prev,
      estadoEquipo: {
        ...prev.estadoEquipo,
        imagenes: (prev.estadoEquipo?.imagenes || []).map((img) =>
          img.id === imageId
            ? {
                ...img,
                puntos: (img.puntos || []).filter((p) => p.id !== pointId),
              }
            : img
        ),
      },
    }));
  };

  const updateEstadoEquipoPointObservation = (imageId, pointId, value) => {
    setData((prev) => ({
      ...prev,
      estadoEquipo: {
        ...prev.estadoEquipo,
        imagenes: (prev.estadoEquipo?.imagenes || []).map((img) =>
          img.id === imageId
            ? {
                ...img,
                puntos: (img.puntos || []).map((p) =>
                  p.id === pointId ? { ...p, observacion: value } : p
                ),
              }
            : img
        ),
      },
    }));
  };

  /* ===========================
     ACTIVIDADES
  =========================== */
  const addActividad = () =>
    setData((prev) => ({
      ...prev,
      actividades: [
        ...prev.actividades,
        { titulo: "", detalle: "", imagenes: [] },
      ],
    }));

  const removeActividad = (index) =>
    setData((prev) => ({
      ...prev,
      actividades: prev.actividades.filter((_, i) => i !== index),
    }));

  /* ===========================
     CONCLUSIONES / RECOMENDACIONES
  =========================== */
  const addConclusionRow = () =>
    setData((prev) => ({
      ...prev,
      conclusiones: [...prev.conclusiones, ""],
      recomendaciones: [...prev.recomendaciones, ""],
    }));

  const removeConclusionRow = (index) =>
    setData((prev) => ({
      ...prev,
      conclusiones: prev.conclusiones.filter((_, i) => i !== index),
      recomendaciones: prev.recomendaciones.filter((_, i) => i !== index),
    }));
const validateReport = () => {
  if (!data.cliente) return "Cliente es obligatorio";
  if (!data.tecnicoNombre) return "Técnico es obligatorio";
  if (!data.fechaServicio) return "Fecha es obligatoria";

  if (!data.actividades || data.actividades.length === 0) {
    return "Debe existir al menos una actividad";
  }

  const actividadValida = data.actividades.some(
    (a) => a.titulo || a.detalle
  );

  if (!actividadValida) {
    return "Debe completar al menos una actividad";
  }

  return null;
};
  /* ===========================
     GUARDAR INFORME
  =========================== */
  const saveReport = async () => {
    if (uploading) {
      alert("Espera que terminen de subir las imágenes");
      return;
    }
const error = validateReport();
if (error) {
  toast(error);
  return;
}
    try {
      const firmaTecnico =
        sigTecnico.current?.isEmpty?.() === false
          ? sigTecnico.current.toDataURL()
          : "";

      const firmaCliente =
        sigCliente.current?.isEmpty?.() === false
          ? sigCliente.current.toDataURL()
          : "";

      const firmaTecnicoFinal = firmaTecnico || data.firmas?.tecnico || "";
      const firmaClienteFinal = firmaCliente || data.firmas?.cliente || "";
      const estadoFinal = firmaTecnicoFinal ? "completado" : "borrador";

      const finalData = {
        ...data,
        firmas: {
          ...data.firmas,
          tecnico: firmaTecnicoFinal,
          cliente: firmaClienteFinal,
          clienteCedula: data.firmas?.clienteCedula || "",
        },
      };

      await saveOrUpdateReport({
        id: isEditing ? id : null,
        tipo: "informe",
        subtipo: "general",
        data: finalData,
        estado: estadoFinal,
        user_id: user?.id || null,
      });

      alert(
        isEditing
          ? "Informe actualizado correctamente ✅"
          : "Informe guardado correctamente ✅"
      );

      navigate("/informe");
    } catch (error) {
      console.error("❌ Error real al guardar:", error);
      alert(`Error guardando informe ❌\n${error.message || "Revisa la consola"}`);
    }
  };

  /* ===========================
     RENDER
  =========================== */
  return (
    <div className="p-3 md:p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 md:p-6 rounded shadow w-full max-w-screen-xl mx-auto space-y-6">
        <ReportHeader data={data} onChange={update} />

        {/* ── DATOS DEL CLIENTE Y TÉCNICO ── */}
        <h3 className="font-bold text-sm border-b pb-1">
          DATOS DEL CLIENTE Y TÉCNICO RESPONSABLE
        </h3>

        <table className="pdf-table w-full">
          <tbody>
            <tr>
              <td className="pdf-label">CLIENTE</td>
              <td>
                <input
                  className="pdf-input w-full"
                  value={data.cliente}
                  onChange={(e) => update(["cliente"], e.target.value)}
                />
              </td>
              <td className="pdf-label">DIRECCIÓN</td>
              <td>
                <input
                  className="pdf-input w-full"
                  value={data.direccion}
                  onChange={(e) => update(["direccion"], e.target.value)}
                />
              </td>
            </tr>

            <tr>
              <td className="pdf-label">CONTACTO</td>
              <td>
                <input
                  className="pdf-input w-full"
                  value={data.contacto}
                  onChange={(e) => update(["contacto"], e.target.value)}
                />
              </td>
              <td className="pdf-label">TELÉFONO</td>
              <td>
                <input
                  className="pdf-input w-full"
                  value={data.telefono}
                  onChange={(e) => update(["telefono"], e.target.value)}
                />
              </td>
            </tr>

            <tr>
              <td className="pdf-label">CORREO</td>
              <td>
                <input
                  className="pdf-input w-full"
                  value={data.correo}
                  onChange={(e) => update(["correo"], e.target.value)}
                />
              </td>
              <td className="pdf-label">TÉCNICO RESPONSABLE</td>
              <td>
                <select
                  className="pdf-input w-full"
                  value={data.tecnicoNombre}
                  onChange={(e) => {
                    const tech = TECHNICIANS.find(
                      (t) => t.name === e.target.value
                    );

                    update(["tecnicoNombre"], tech?.name || "");
                    update(["tecnicoTelefono"], tech?.phone || "");
                    update(["tecnicoCorreo"], tech?.email || "");
                  }}
                >
                  <option value="">Seleccionar técnico</option>
                  {TECHNICIANS.map((t, i) => (
                    <option key={i} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>

            <tr>
              <td className="pdf-label">TELÉFONO TÉCNICO</td>
              <td>
                <input
                  className="pdf-input w-full bg-gray-100"
                  value={data.tecnicoTelefono}
                  readOnly
                />
              </td>
              <td className="pdf-label">CORREO TÉCNICO</td>
              <td>
                <input
                  className="pdf-input w-full bg-gray-100"
                  value={data.tecnicoCorreo}
                  readOnly
                />
              </td>
            </tr>

            <tr>
              <td className="pdf-label">FECHA DE SERVICIO</td>
              <td colSpan={3}>
                <input
                  type="date"
                  className="pdf-input w-full"
                  value={data.fechaServicio}
                  onChange={(e) => update(["fechaServicio"], e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── DESCRIPCIÓN DEL EQUIPO ── */}
        <h3 className="font-bold text-sm border-b pb-1">
          DESCRIPCIÓN DEL EQUIPO
        </h3>

        <table className="pdf-table w-full">
          <thead>
            <tr>
              <th colSpan={4} style={{ textAlign: "center" }}>
                DESCRIPCIÓN DEL EQUIPO
              </th>
            </tr>
          </thead>
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
            ].reduce((rows, field, idx, arr) => {
              if (idx % 2 === 0) {
                const next = arr[idx + 1];
                rows.push(
                  <tr key={field[1]}>
                    <td className="pdf-label">{field[0]}</td>
                    <td>
                      <input
                        className="pdf-input w-full"
                        value={data.equipo[field[1]]}
                        onChange={(e) =>
                          update(["equipo", field[1]], e.target.value)
                        }
                      />
                    </td>
                    {next ? (
                      <>
                        <td className="pdf-label">{next[0]}</td>
                        <td>
                          <input
                            className="pdf-input w-full"
                            value={data.equipo[next[1]]}
                            onChange={(e) =>
                              update(["equipo", next[1]], e.target.value)
                            }
                          />
                        </td>
                      </>
                    ) : (
                      <td colSpan={2} />
                    )}
                  </tr>
                );
              }
              return rows;
            }, [])}
          </tbody>
        </table>

        {/* ── ESTADO DEL EQUIPO ── */}
        <h3 className="font-bold text-sm border-b pb-1">ESTADO DEL EQUIPO</h3>

        <div className="border rounded bg-white p-3 md:p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="bg-gray-600 text-white text-xs px-3 py-2 rounded cursor-pointer text-center hover:bg-gray-700 transition">
              📁 Subir fotografías
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  handleEstadoEquipoImagesUpload(e.target.files || []);
                  e.target.value = null;
                }}
              />
            </label>

            <label className="bg-blue-600 text-white text-xs px-3 py-2 rounded cursor-pointer text-center hover:bg-blue-700 transition">
              📷 Tomar fotos
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  handleEstadoEquipoImagesUpload(e.target.files || []);
                  e.target.value = null;
                }}
              />
            </label>
          </div>

          {(data.estadoEquipo?.imagenes || []).length === 0 ? (
            <div className="border rounded bg-gray-50 h-[220px] flex items-center justify-center text-sm text-gray-400">
              Sin fotografías cargadas
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {(data.estadoEquipo?.imagenes || []).map((img, imageIndex) => (
                  <div
                    key={img.id}
                    className="border rounded p-2 bg-gray-50 space-y-2"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">
                        Imagen {imageIndex + 1}
                      </span>

                      <div className="flex gap-2">
                        {!!img.puntos?.length && (
                          <button
                            type="button"
                            onClick={() => clearEstadoEquipoImagePoints(img.id)}
                            className="text-[11px] border px-2 py-1 rounded hover:bg-gray-100"
                          >
                            Limpiar puntos
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeEstadoEquipoImage(img.id)}
                          className="text-[11px] text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Eliminar foto
                        </button>
                      </div>
                    </div>

                    <div className="relative w-full border rounded overflow-hidden bg-white">
                      <img
                        src={img.url}
                        alt={`estado-equipo-${imageIndex + 1}`}
                        className="w-full aspect-[4/3] object-contain bg-white cursor-crosshair"
                        onClick={(e) => handleEstadoEquipoImageClick(e, img.id)}
                      />

                      {(img.puntos || []).map((p, pointIndex) => (
                        <button
                          key={p.id}
                          type="button"
                          title="Quitar punto"
                          onClick={() => removeEstadoEquipoPoint(img.id, p.id)}
                          className="absolute w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow"
                          style={{
                            left: `${p.x * 100}%`,
                            top: `${p.y * 100}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          <span className="sr-only">
                            Punto {pointIndex + 1}
                          </span>
                        </button>
                      ))}
                    </div>

                    <p className="text-[11px] text-gray-500">
                      Toque sobre la fotografía para agregar puntos rojos en las
                      novedades observadas.
                    </p>

                    <div className="space-y-2">
                      {(img.puntos || []).length === 0 ? (
                        <div className="text-xs text-gray-400">
                          Sin puntos marcados
                        </div>
                      ) : (
                        img.puntos.map((p, pointIndex) => (
                          <div key={p.id} className="flex items-start gap-2">
                            <div className="text-sm text-gray-700 pt-2 min-w-[24px]">
                              {pointIndex + 1})
                            </div>
                            <input
                              className="pdf-input w-full"
                              placeholder={`Observación punto ${pointIndex + 1}`}
                              value={p.observacion}
                              onChange={(e) =>
                                updateEstadoEquipoPointObservation(
                                  img.id,
                                  p.id,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── ACTIVIDADES REALIZADAS ── */}
        <h3 className="font-bold text-sm border-b pb-1">
          ACTIVIDADES REALIZADAS
        </h3>

        <table className="pdf-table w-full">
          <thead>
            <tr>
              <th style={{ width: 50 }}>ÍTEM</th>
              <th style={{ width: "35%" }}>DESCRIPCIÓN</th>
              <th style={{ width: "55%" }}>IMÁGENES</th>
            </tr>
          </thead>
          <tbody>
            {data.actividades.map((a, i) => (
              <tr key={i}>
                <td className="text-center align-top">{i + 1}</td>

                <td className="align-top">
                  <textarea
                    className="pdf-textarea w-full resize-none overflow-hidden"
                    placeholder="Título de la actividad"
                    value={a.titulo}
                    rows={2}
                    style={{ minHeight: "48px" }}
                    onInput={autoResize}
                    onChange={(e) =>
                      update(["actividades", i, "titulo"], e.target.value)
                    }
                  />

                  <textarea
                    className="pdf-textarea w-full resize-none overflow-hidden mt-2"
                    placeholder="Detalle de la actividad"
                    value={a.detalle}
                    rows={6}
                    style={{ minHeight: "150px" }}
                    onInput={autoResize}
                    onChange={(e) =>
                      update(["actividades", i, "detalle"], e.target.value)
                    }
                  />

                  {data.actividades.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeActividad(i)}
                      className="text-red-600 text-xs mt-2 hover:underline"
                    >
                      − Eliminar actividad
                    </button>
                  )}
                </td>

                <td className="align-top">
                  <div className="flex flex-col md:flex-row gap-2 mb-3">
                    <label className="bg-gray-600 text-white text-xs px-3 py-2 rounded cursor-pointer text-center hover:bg-gray-700 transition">
                      📁 Seleccionar de galería
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const actuales =
                            data.actividades?.[i]?.imagenes?.length || 0;
                          const disponibles = Math.max(0, 4 - actuales);

                          if (disponibles <= 0) {
                            alert("Máximo 4 imágenes por actividad");
                            e.target.value = null;
                            return;
                          }

                          files.slice(0, disponibles).forEach((file) => {
                            handleImageUpload(file, i);
                          });

                          if (files.length > disponibles) {
                            alert("Máximo 4 imágenes por actividad");
                          }

                          e.target.value = null;
                        }}
                      />
                    </label>

                    <label className="bg-blue-600 text-white text-xs px-3 py-2 rounded cursor-pointer text-center hover:bg-blue-700 transition">
                      📷 Tomar foto con cámara
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const actuales =
                            data.actividades?.[i]?.imagenes?.length || 0;
                          const disponibles = Math.max(0, 4 - actuales);

                          if (disponibles <= 0) {
                            alert("Máximo 4 imágenes por actividad");
                            e.target.value = null;
                            return;
                          }

                          files.slice(0, disponibles).forEach((file) => {
                            handleImageUpload(file, i);
                          });

                          if (files.length > disponibles) {
                            alert("Máximo 4 imágenes por actividad");
                          }

                          e.target.value = null;
                        }}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {(a.imagenes || []).map((img, imgIndex) => (
                      <div key={imgIndex} className="relative">
                        <img
                          src={img}
                          alt="actividad"
                          className="w-full aspect-[4/3] object-cover bg-gray-100 border rounded"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setData((prev) => {
                              const copy = { ...prev };
                              copy.actividades = [...copy.actividades];

                              const actividad = {
                                ...copy.actividades[i],
                                imagenes: [...(copy.actividades[i].imagenes || [])],
                              };

                              actividad.imagenes.splice(imgIndex, 1);
                              copy.actividades[i] = actividad;

                              return copy;
                            });
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {(a.imagenes || []).length === 0 && (
                    <div className="border rounded bg-gray-50 h-[170px] flex items-center justify-center text-sm text-gray-400">
                      Sin imágenes cargadas
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          type="button"
          onClick={addActividad}
          className="bg-gray-100 border border-gray-300 hover:bg-gray-200 px-4 py-1.5 text-xs rounded transition"
        >
          + Agregar actividad
        </button>

        {/* ── CONCLUSIONES Y RECOMENDACIONES ── */}
        <h3 className="font-bold text-sm border-b pb-1">
          CONCLUSIONES Y RECOMENDACIONES
        </h3>

        <table className="pdf-table w-full">
          <thead>
            <tr>
              <th style={{ width: 30 }}>#</th>
              <th>CONCLUSIONES</th>
              <th style={{ width: 30 }}>#</th>
              <th>RECOMENDACIONES</th>
              {data.conclusiones.length > 1 && (
                <th style={{ width: 60 }}></th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.conclusiones.map((_, i) => (
              <tr key={i}>
                <td style={{ textAlign: "center" }}>{i + 1}</td>
                <td>
                  <textarea
                    className="pdf-textarea w-full resize-none overflow-hidden"
                    placeholder="Conclusión"
                    value={data.conclusiones[i]}
                    rows={3}
                    style={{ minHeight: "70px" }}
                    onInput={autoResize}
                    onChange={(e) =>
                      update(["conclusiones", i], e.target.value)
                    }
                  />
                </td>

                <td style={{ textAlign: "center" }}>{i + 1}</td>
                <td>
                  <textarea
                    className="pdf-textarea w-full resize-none overflow-hidden"
                    placeholder="Recomendación"
                    value={data.recomendaciones[i]}
                    rows={3}
                    style={{ minHeight: "70px" }}
                    onInput={autoResize}
                    onChange={(e) =>
                      update(["recomendaciones", i], e.target.value)
                    }
                  />
                </td>

                {data.conclusiones.length > 1 && (
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => removeConclusionRow(i)}
                      className="text-red-600 text-xs hover:underline"
                    >
                      − Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <button
          type="button"
          onClick={addConclusionRow}
          className="bg-gray-100 border border-gray-300 hover:bg-gray-200 px-4 py-1.5 text-xs rounded transition"
        >
          + Agregar conclusión / recomendación
        </button>

        {/* ── FIRMAS ── */}
        <table className="pdf-table w-full">
          <thead>
            <tr>
              <th>FIRMA TÉCNICO ASTAP</th>
              <th>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ height: 220 }}>
                <div className="border rounded bg-white h-[160px]">
                  <SignatureCanvas
                    ref={sigTecnico}
                    onBegin={() => {
                      document.activeElement?.blur();
                      document.body.style.overflow = "hidden";
                    }}
                    onEnd={() => {
                      document.body.style.overflow = "";
                    }}
                    canvasProps={{
                      className: "w-full h-full",
                    }}
                  />
                </div>

                <div className="mt-2 text-sm">
                  <div className="font-medium">{data.tecnicoNombre || "—"}</div>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      sigTecnico.current?.clear();
                      setData((prev) => ({
                        ...prev,
                        firmas: { ...prev.firmas, tecnico: "" },
                      }));
                    }}
                    className="text-xs text-red-600 mt-2 hover:underline"
                  >
                    Borrar firma
                  </button>
                </div>
              </td>

              <td style={{ height: 220 }}>
                <div className="border rounded bg-white h-[160px]">
                  <SignatureCanvas
                    ref={sigCliente}
                    onBegin={() => {
                      document.activeElement?.blur();
                      document.body.style.overflow = "hidden";
                    }}
                    onEnd={() => {
                      document.body.style.overflow = "";
                    }}
                    canvasProps={{
                      className: "w-full h-full",
                    }}
                  />
                </div>

                <div className="mt-2 space-y-1">
                  <input
                    className="pdf-input w-full bg-gray-100"
                    value={data.cliente}
                    readOnly
                    placeholder="Nombre del cliente"
                  />

                  <input
                    className="pdf-input w-full"
                    value={data.firmas?.clienteCedula || ""}
                    onChange={(e) =>
                      update(["firmas", "clienteCedula"], e.target.value)
                    }
                    placeholder="Número de cédula del cliente"
                  />
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      sigCliente.current?.clear();
                      setData((prev) => ({
                        ...prev,
                        firmas: { ...prev.firmas, cliente: "" },
                      }));
                    }}
                    className="text-xs text-red-600 mt-2 hover:underline"
                  >
                    Borrar firma
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── BOTONES ── */}
        <div className="flex flex-col md:flex-row justify-between gap-3 pt-6">
          <button
            type="button"
            onClick={() => navigate("/informe")}
            className="border px-6 py-2 rounded hover:bg-gray-50 transition"
          >
            Volver
          </button>

          <button
            type="button"
            onClick={saveReport}
            disabled={uploading}
            className={`px-6 py-2 rounded text-white transition ${
              uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {uploading
              ? `Subiendo imágenes (${uploadingCount})...`
              : isEditing
              ? "Actualizar informe"
              : "Guardar informe"}
          </button>
        </div>
      </div>
    </div>
  );
}
