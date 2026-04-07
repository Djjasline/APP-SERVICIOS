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

  /* ===========================
     AUTO RESIZE TEXTAREA
  =========================== */
  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
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
        actividades: Array.isArray(report.data?.actividades)
          ? report.data.actividades.map((a) => ({
              titulo: a?.titulo || "",
              detalle: a?.detalle || "",
              imagenes: Array.isArray(a?.imagenes) ? a.imagenes : [],
            }))
          : [{ titulo: "", detalle: "", imagenes: [] }],
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
     SUBIDA DE IMÁGENES
  =========================== */
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
        id || "temp",
        "actividad"
      );

      if (!url) return;

      setData((prev) => {
        if (!prev.actividades[actividadIndex]) return prev;
        const copy = { ...prev };
        copy.actividades = [...copy.actividades];
        const actividad = { ...copy.actividades[actividadIndex] };
        if (!Array.isArray(actividad.imagenes)) actividad.imagenes = [];
        actividad.imagenes = [...actividad.imagenes, url];
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
     ACTIVIDADES
  =========================== */
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
        tecnico: firmaTecnicoFinal,
        cliente: firmaClienteFinal,
      },
    };

    try {
      await saveOrUpdateReport({
        id: isEditing ? id : null,
        tipo: "informe",
        subtipo: "general",
        data: finalData,
        estado: estadoFinal,
      });

      alert(
        isEditing
          ? "Informe actualizado correctamente ✅"
          : "Informe guardado correctamente ✅"
      );
      navigate("/informe");
    } catch (error) {
      console.error(error);
      alert("Error guardando informe ❌");
    }
  };

  /* ===========================
     RENDER
  =========================== */
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto space-y-6">

        {/* ── ENCABEZADO ── */}
        {/* FIX: logo centrado via ReportHeader (ya usa margin: "0 auto") */}
        <ReportHeader data={data} onChange={update} />

        {/* ── DATOS DEL CLIENTE Y TÉCNICO ── */}
        {/* FIX: se agrega título de sección y se reorganiza en 2 columnas */}
        <h3 className="font-bold text-sm border-b pb-1">DATOS DEL CLIENTE Y TÉCNICO RESPONSABLE</h3>

        <table className="pdf-table">
          <tbody>
            {/* Fila 1 */}
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
            {/* Fila 2 */}
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
            {/* Fila 3 */}
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
                <input
                  className="pdf-input w-full bg-gray-100"
                  value={data.tecnicoNombre}
                  readOnly
                />
              </td>
            </tr>
            {/* Fila 4 */}
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
            {/* Fila 5 - Fecha */}
            <tr>
              <td className="pdf-label">FECHA DE SERVICIO</td>
              <td colSpan={3}>
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

        {/* ── DESCRIPCIÓN DEL EQUIPO ── */}
        {/* FIX: movida antes de actividades, campos completos según PDF */}
        <h3 className="font-bold text-sm border-b pb-1">DESCRIPCIÓN DEL EQUIPO</h3>

        <table className="pdf-table">
          <thead>
            <tr>
              <th colSpan={4} style={{ textAlign: "center" }}>
                DESCRIPCIÓN DEL EQUIPO
              </th>
            </tr>
          </thead>
          <tbody>
            {/* 2 columnas para compactar */}
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

        {/* ── ACTIVIDADES REALIZADAS ── */}
        {/* FIX: botones galería + cámara ya existentes, se mantienen y mejoran visualmente */}
        <h3 className="font-bold text-sm border-b pb-1">ACTIVIDADES REALIZADAS</h3>

        <table className="pdf-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>ÍTEM</th>
              <th>DESCRIPCIÓN</th>
              <th style={{ width: 220 }}>IMÁGENES</th>
            </tr>
          </thead>
          <tbody>
            {data.actividades.map((a, i) => (
              <tr key={i}>
                {/* ÍTEM */}
                <td className="text-center align-top">{i + 1}</td>

                {/* DESCRIPCIÓN */}
                <td className="align-top">
                  <textarea
                    className="pdf-textarea w-full resize-none overflow-hidden"
                    placeholder="Título de la actividad"
                    value={a.titulo}
                    rows={1}
                    style={{ minHeight: "28px" }}
                    onInput={autoResize}
                    onChange={(e) =>
                      update(["actividades", i, "titulo"], e.target.value)
                    }
                  />
                  <textarea
                    className="pdf-textarea w-full resize-none overflow-hidden mt-1"
                    placeholder="Detalle de la actividad"
                    value={a.detalle}
                    rows={2}
                    style={{ minHeight: "40px" }}
                    onInput={autoResize}
                    onChange={(e) =>
                      update(["actividades", i, "detalle"], e.target.value)
                    }
                  />

                  {/* FIX: botón eliminar actividad dentro de la celda descripción */}
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

                {/* IMÁGENES */}
                {/* FIX: botones Galería y Cámara claramente diferenciados */}
                <td className="align-top">
                  <div className="flex flex-col gap-2 mb-2">
                    {/* GALERÍA */}
                    <label className="bg-gray-600 text-white text-xs px-3 py-1.5 rounded cursor-pointer text-center hover:bg-gray-700 transition">
                      📁 Seleccionar de galería
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach((file) => handleImageUpload(file, i));
                          e.target.value = null;
                        }}
                      />
                    </label>

                    {/* CÁMARA */}
                    <label className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded cursor-pointer text-center hover:bg-blue-700 transition">
                      📷 Tomar foto con cámara
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
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
                              const copy = { ...prev };
                              copy.actividades = [...copy.actividades];
                              const actividad = { ...copy.actividades[i] };
                              actividad.imagenes = [
                                ...(actividad.imagenes || []),
                              ];
                              actividad.imagenes.splice(imgIndex, 1);
                              copy.actividades[i] = actividad;
                              return copy;
                            });
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
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

        {/* FIX: botón agregar actividad más visible */}
        <button
          type="button"
          onClick={addActividad}
          className="bg-gray-100 border border-gray-300 hover:bg-gray-200 px-4 py-1.5 text-xs rounded transition"
        >
          + Agregar actividad
        </button>

        {/* ── CONCLUSIONES Y RECOMENDACIONES ── */}
        {/* FIX: título de sección agregado, botones agregar/eliminar por fila */}
        <h3 className="font-bold text-sm border-b pb-1">CONCLUSIONES Y RECOMENDACIONES</h3>

        <table className="pdf-table">
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
                    rows={2}
                    style={{ minHeight: "40px" }}
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
                    rows={2}
                    style={{ minHeight: "40px" }}
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
                        firmas: { ...prev.firmas, tecnico: "" },
                      }));
                    }}
                    className="text-xs text-red-600 mt-2 hover:underline"
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
        <div className="flex justify-between pt-6">
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
