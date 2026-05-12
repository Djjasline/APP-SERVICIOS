import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import imageCompression from "browser-image-compression";

import { useAuth } from "@/context/AuthContext";
import { useTechnicians } from "@/hooks/useTechnicians";
import { saveOrUpdateReport } from "@/services/reportService";
import { uploadRegistroImage } from "@/utils/storage";
import { supabase } from "@/lib/supabase";

/* =============================
   HELPERS
============================= */
const newId = (prefix = "id") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const techName = (t) => t?.name || t?.nombre || "";
const techPhone = (t) => t?.phone || t?.telefono || "";
const techEmail = (t) => t?.email || t?.correo || "";

/* =============================
   SECCIONES – MANTENIMIENTO V-CAM6
============================= */
const secciones = [
  {
    id: "1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    tipo: "simple",
    items: [
      ["1.1", "Prueba de encendido general del equipo"],
      ["1.2", "Verificación de funcionamiento de controles principales"],
      ["1.3", "Verificación de pantalla / monitor"],
      ["1.4", "Verificación de iluminación LED del cabezal"],
      ["1.5", "Revisión de alarmas o mensajes de fallo"],
    ],
  },
  {
    id: "2",
    titulo: "2. MANTENIMIENTO DEL SISTEMA CÁMARA V-CAM6",
    tipo: "simple",
    items: [
      ["2.1", "Limpieza exterior del carrete"],
      ["2.2", "Limpieza de cable y guía de enrollado"],
      ["2.3", "Inspección visual del cable de 12 mm"],
      ["2.4", "Revisión de cortes, dobleces o zonas planas del cable"],
      ["2.5", "Revisión de marcadores de longitud"],
      ["2.6", "Revisión de conectores eléctricos"],
      ["2.7", "Limpieza de lente del cabezal de cámara"],
      ["2.8", "Verificación de estado del resorte de terminación"],
      ["2.9", "Verificación de estanqueidad del cabezal"],
      ["2.10", "Lubricación ligera de ejes y puntos móviles del carrete"],
      ["2.11", "Verificación de giro libre del carrete"],
      ["2.12", "Verificación de calidad de imagen"],
      ["2.13", "Verificación de señal sin interferencias"],
      ["2.14", "Revisión de caja / maleta de transporte"],
    ],
  },
  {
    id: "3",
    titulo: "3. REPUESTOS USADOS",
    tipo: "cantidad",
    items: [
      ["2.104.24.00006", "Kit base de terminación 12 mm"],
      [
        "3.02.01.000032",
        "Cordón de seguridad / lanyard usado en kits estándar de terminación 12 mm",
      ],
      [
        "2.104.24.00004",
        "Ensamble de cable espiralado estándar 12 mm",
      ],
      [
        "3.02.07.000014",
        "Resorte de terminación estándar 12 mm",
      ],
    ],
  },
  {
    id: "4",
    titulo:
      "4. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, POSTERIOR AL SERVICIO",
    tipo: "simple",
    items: [
      ["4.1", "Encendido general posterior al mantenimiento"],
      ["4.2", "Verificación de imagen estable y centrada"],
      ["4.3", "Verificación de iluminación LED"],
      ["4.4", "Verificación de avance y retroceso del cable"],
      ["4.5", "Verificación de funcionamiento de controles"],
      ["4.6", "Prueba final del sistema completo"],
    ],
  },
];

/* =============================
   LISTA PLANA PARA PROGRESO
============================= */
const todosLosItems = secciones.flatMap((sec) =>
  sec.items.map(([codigo]) => codigo)
);

/* =============================
   ESTADO INICIAL
============================= */
const emptyForm = {
  referenciaContrato: "",
  pedidoDemanda: "",
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

  equipo: {
    nota: "",
    marca: "",
    modelo: "",
    serieModulo: "",
    serieCarrete: "",
    serieCabezal: "",
    anio: "",
    longitudCable: "",
    diametroCable: "12 mm",
    versionSoftware: "",
    accesorios: "",
  },

  estadoEquipo: {
    imagenes: [],
  },

  items: {},

  notaFinal: "",

  firmas: {
    tecnico: "",
    cliente: "",
    clienteCedula: "",
  },
};

/* =============================
   TABLA DE ÍTEMS
============================= */
function TablaItems({ seccion, data, handleItem }) {
  return (
    <table className="pdf-table w-full">
      <thead>
        <tr>
          <th className="text-left" style={{ width: 120 }}>
            ÍTEM
          </th>

          <th className="text-left">DETALLE</th>

          {seccion.tipo === "cantidad" && (
            <th style={{ width: 90 }}>CANTIDAD</th>
          )}

          <th style={{ width: 55 }}>SI</th>
          <th style={{ width: 55 }}>NO</th>
          <th style={{ width: 60 }}>N/A</th>
          <th className="text-left">OBSERVACIÓN</th>
        </tr>
      </thead>

      <tbody>
        {seccion.items.map(([codigo, texto]) => (
          <tr key={codigo}>
            <td className="pdf-label">{codigo}</td>

            <td>{texto}</td>

            {seccion.tipo === "cantidad" && (
              <td className="text-center">
                <input
                  type="number"
                  min="0"
                  className="pdf-input w-20 text-center"
                  value={data.items?.[codigo]?.cantidad || ""}
                  onChange={(e) =>
                    handleItem(codigo, "cantidad", e.target.value)
                  }
                />
              </td>
            )}

            {["SI", "NO", "N/A"].map((op) => (
              <td key={op} className="text-center">
                <input
                  type="radio"
                  name={`estado-${codigo}`}
                  checked={data.items?.[codigo]?.estado === op}
                  onChange={() => handleItem(codigo, "estado", op)}
                />
              </td>
            ))}

            <td>
              <textarea
                className="pdf-textarea w-full resize-none overflow-hidden"
                value={data.items?.[codigo]?.observacion || ""}
                placeholder="Observación..."
                rows={1}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onChange={(e) =>
                  handleItem(codigo, "observacion", e.target.value)
                }
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* =============================
   COMPONENTE PRINCIPAL
============================= */
export default function HojaMantenimientoVCam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { user } = useAuth();
  const { technicians, loading: loadingTechnicians } = useTechnicians();

  const sigTecnico = useRef(null);
  const sigCliente = useRef(null);

  const [data, setData] = useState(emptyForm);
  const [guardando, setGuardando] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const uploading = uploadingCount > 0;

  /* =============================
     UPDATE PATH-BASED
  ============================= */
  const update = (path, value) => {
    setData((prev) => {
      const copy = { ...prev };
      let ref = copy;

      for (let i = 0; i < path.length - 1; i++) {
        ref[path[i]] = Array.isArray(ref[path[i]])
          ? [...ref[path[i]]]
          : { ...ref[path[i]] };

        ref = ref[path[i]];
      }

      ref[path[path.length - 1]] = value;
      return copy;
    });
  };

  /* =============================
     AUTO COMPLETAR TÉCNICO LOGUEADO
  ============================= */
  useEffect(() => {
    if (!user?.email || isEditing || loadingTechnicians) return;

    const loggedTech = (technicians || []).find(
      (t) => techEmail(t).toLowerCase() === user.email.toLowerCase()
    );

    if (!loggedTech) return;

    setData((prev) => ({
      ...prev,
      tecnicoNombre: techName(loggedTech),
      tecnicoTelefono: techPhone(loggedTech),
      tecnicoCorreo: techEmail(loggedTech),
    }));
  }, [user?.email, isEditing, technicians, loadingTechnicians]);

  /* =============================
     CARGAR REGISTRO
  ============================= */
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const { data: reg, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !reg) {
        console.error("Error cargando mantenimiento V-Cam6:", error);
        return;
      }

      const cleanData = {
        ...emptyForm,
        ...(reg.data || {}),
        equipo: {
          ...emptyForm.equipo,
          ...(reg.data?.equipo || {}),
        },
        estadoEquipo: {
          imagenes: Array.isArray(reg.data?.estadoEquipo?.imagenes)
            ? reg.data.estadoEquipo.imagenes.map((img, imgIndex) => ({
                id: img?.id || `img-${imgIndex}-${Date.now()}`,
                url: img?.url || "",
                puntos: Array.isArray(img?.puntos)
                  ? img.puntos.map((p, pointIndex) => ({
                      id: p?.id || `p-${imgIndex}-${pointIndex}-${Date.now()}`,
                      x: typeof p?.x === "number" ? p.x : 0,
                      y: typeof p?.y === "number" ? p.y : 0,
                      observacion: p?.observacion || p?.nota || "",
                    }))
                  : [],
              }))
            : [],
        },
        items: reg.data?.items || {},
        firmas: {
          tecnico: reg.data?.firmas?.tecnico || "",
          cliente: reg.data?.firmas?.cliente || "",
          clienteCedula:
            reg.data?.firmas?.clienteCedula ||
            reg.data?.cedulaCliente ||
            "",
        },
      };

      setData(cleanData);

      setTimeout(() => {
        if (cleanData.firmas?.tecnico) {
          sigTecnico.current?.clear();
          sigTecnico.current?.fromDataURL(cleanData.firmas.tecnico);
        }

        if (cleanData.firmas?.cliente) {
          sigCliente.current?.clear();
          sigCliente.current?.fromDataURL(cleanData.firmas.cliente);
        }
      }, 300);
    };

    load();
  }, [id]);

  /* =============================
     LIMPIAR OVERFLOW
  ============================= */
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* =============================
     SUBIDA DE IMÁGENES
  ============================= */
  const compressAndUpload = async (file, folder = "estado-equipo") => {
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.25,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: 0.75,
    });

    return await uploadRegistroImage(
      compressed,
      id || `temp-vcam-${Date.now()}`,
      folder
    );
  };

  const handleEstadoUpload = async (files) => {
    const selectedFiles = Array.from(files || []);
    if (selectedFiles.length === 0) return;

    setUploadingCount((prev) => prev + selectedFiles.length);

    try {
      for (const file of selectedFiles) {
        if (!file.type.startsWith("image/")) continue;

        const url = await compressAndUpload(file, "estado-equipo");
        if (!url) continue;

        const nuevaImagen = {
          id: newId("img"),
          url,
          puntos: [],
        };

        setData((prev) => ({
          ...prev,
          estadoEquipo: {
            ...prev.estadoEquipo,
            imagenes: [
              ...(prev.estadoEquipo?.imagenes || []),
              nuevaImagen,
            ],
          },
        }));
      }
    } catch (err) {
      console.error("Error subiendo imagen:", err);
      alert("Error subiendo imagen ❌");
    } finally {
      setUploadingCount((prev) => prev - selectedFiles.length);
    }
  };

  const addBaseImage = () => {
    const exists = (data.estadoEquipo?.imagenes || []).some(
      (img) => img.url === "/estado equipo camara.png"
    );

    if (exists) return;

    setData((prev) => ({
      ...prev,
      estadoEquipo: {
        ...prev.estadoEquipo,
        imagenes: [
          ...(prev.estadoEquipo?.imagenes || []),
          {
            id: newId("base"),
            url: "/estado equipo camara.png",
            puntos: [],
          },
        ],
      },
    }));
  };

  const removeEstadoImg = (imgId) => {
    setData((prev) => ({
      ...prev,
      estadoEquipo: {
        ...prev.estadoEquipo,
        imagenes: (prev.estadoEquipo?.imagenes || []).filter(
          (img) => img.id !== imgId
        ),
      },
    }));
  };

  const clearImagePoints = (imgId) => {
    setData((prev) => ({
      ...prev,
      estadoEquipo: {
        ...prev.estadoEquipo,
        imagenes: (prev.estadoEquipo?.imagenes || []).map((img) =>
          img.id === imgId ? { ...img, puntos: [] } : img
        ),
      },
    }));
  };

  const handleEstadoClick = (e, imgId) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = Number(((e.clientX - rect.left) / rect.width).toFixed(4));
    const y = Number(((e.clientY - rect.top) / rect.height).toFixed(4));

    const nuevoPunto = {
      id: newId("p"),
      x,
      y,
      observacion: "",
    };

    setData((prev) => ({
      ...prev,
      estadoEquipo: {
        ...prev.estadoEquipo,
        imagenes: (prev.estadoEquipo?.imagenes || []).map((img) =>
          img.id === imgId
            ? {
                ...img,
                puntos: [...(img.puntos || []), nuevoPunto],
              }
            : img
        ),
      },
    }));
  };

  const removePoint = (imgId, ptId) => {
    setData((prev) => ({
      ...prev,
      estadoEquipo: {
        ...prev.estadoEquipo,
        imagenes: (prev.estadoEquipo?.imagenes || []).map((img) =>
          img.id === imgId
            ? {
                ...img,
                puntos: (img.puntos || []).filter((p) => p.id !== ptId),
              }
            : img
        ),
      },
    }));
  };

  const updatePointObs = (imgId, ptId, value) => {
    setData((prev) => ({
      ...prev,
      estadoEquipo: {
        ...prev.estadoEquipo,
        imagenes: (prev.estadoEquipo?.imagenes || []).map((img) =>
          img.id === imgId
            ? {
                ...img,
                puntos: (img.puntos || []).map((p) =>
                  p.id === ptId ? { ...p, observacion: value } : p
                ),
              }
            : img
        ),
      },
    }));
  };

  /* =============================
     ITEMS
  ============================= */
  const handleItem = (codigo, campo, valor) => {
    setData((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [codigo]: {
          ...(prev.items?.[codigo] || {}),
          [campo]: valor,
        },
      },
    }));
  };

  /* =============================
     PROGRESO
  ============================= */
  const itemsMarcados = todosLosItems.filter(
    (codigo) => data.items?.[codigo]?.estado
  ).length;

  const totalItems = todosLosItems.length;
  const progresoPct =
    totalItems > 0 ? Math.round((itemsMarcados / totalItems) * 100) : 0;

  const mantenimientoListo =
    data.firmas?.tecnico && data.firmas?.cliente;

  /* =============================
     GUARDAR
  ============================= */
  const handleGuardar = async () => {
    if (uploading) {
      alert("Espera que terminen de subir las imágenes");
      return;
    }

    if (!data.cliente) {
      alert("Cliente es obligatorio");
      return;
    }

    if (!data.tecnicoNombre) {
      alert("Técnico es obligatorio");
      return;
    }

    if (!data.fechaServicio) {
      alert("Fecha de servicio es obligatoria");
      return;
    }

    setGuardando(true);

    try {
      const firmaTecnico =
        sigTecnico.current?.isEmpty?.() === false
          ? sigTecnico.current.toDataURL()
          : data.firmas?.tecnico || "";

      const firmaCliente =
        sigCliente.current?.isEmpty?.() === false
          ? sigCliente.current.toDataURL()
          : data.firmas?.cliente || "";

      const finalData = {
        ...data,
        firmas: {
          ...data.firmas,
          tecnico: firmaTecnico,
          cliente: firmaCliente,
          clienteCedula: data.firmas?.clienteCedula || "",
        },
      };

      await saveOrUpdateReport({
        id: isEditing ? id : null,
        tipo: "mantenimiento",
        subtipo: "vcam",
        data: finalData,
        estado: firmaTecnico && firmaCliente ? "completado" : "borrador",
        user_id: user?.id || null,
      });

      alert(
        isEditing
          ? "Mantenimiento V-Cam6 actualizado ✅"
          : "Mantenimiento V-Cam6 guardado ✅"
      );

      navigate("/mantenimiento");
    } catch (err) {
      console.error(err);
      alert(`Error al guardar ❌\n${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  /* =============================
     RENDER
  ============================= */
  return (
    <div className="p-3 md:p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 md:p-6 rounded shadow w-full max-w-screen-xl mx-auto space-y-6">
        {/* BANNER */}
        <div
          className={`p-2 rounded text-xs flex items-center justify-between gap-2 ${
            mantenimientoListo
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          <span>
            {mantenimientoListo
              ? "✔ Mantenimiento listo para completar"
              : "⚠ Pendiente de firmas para completar"}
          </span>

          <span className="font-semibold">
            {progresoPct}% ítems marcados ({itemsMarcados}/{totalItems})
          </span>
        </div>

        {/* ══════════════════════════════
            1. ENCABEZADO
        ══════════════════════════════ */}
        <table className="pdf-table w-full">
          <tbody>
            <tr>
              <td
                rowSpan={5}
                style={{
                  width: 130,
                  verticalAlign: "middle",
                  textAlign: "center",
                }}
              >
                <div className="flex items-center justify-center h-[160px]">
                  <img
                    src="/astap-logo.jpg"
                    alt="ASTAP"
                    className="object-contain"
                    style={{ maxHeight: "90px" }}
                  />
                </div>
              </td>

              <td
                colSpan={2}
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "16px",
                  letterSpacing: "0.5px",
                  verticalAlign: "middle",
                }}
              >
                HOJA DE MANTENIMIENTO CÁMARA V-CAM6
              </td>

              <td
                className="text-[10px] md:text-[11px]"
                style={{ width: 160 }}
              >
                <div>
                  Fecha versión: <strong>01-01-26</strong>
                </div>
                <div>
                  Versión: <strong>01</strong>
                </div>
              </td>
            </tr>

            <tr>
              <td className="pdf-label">REFERENCIA DE CONTRATO</td>
              <td colSpan={2}>
                <input
                  className="pdf-input w-full"
                  value={data.referenciaContrato}
                  placeholder="Ej: Contrato marco / cliente"
                  onChange={(e) =>
                    update(["referenciaContrato"], e.target.value)
                  }
                />
              </td>
            </tr>

            <tr>
              <td className="pdf-label">PEDIDO / DEMANDA</td>
              <td colSpan={2}>
                <input
                  className="pdf-input w-full"
                  value={data.pedidoDemanda}
                  placeholder="Ej: P-23-046 o D-45821"
                  onChange={(e) =>
                    update(["pedidoDemanda"], e.target.value)
                  }
                />
              </td>
            </tr>

            <tr>
              <td className="pdf-label">DESCRIPCIÓN</td>
              <td colSpan={2}>
                <input
                  className="pdf-input w-full"
                  value={data.descripcion}
                  onChange={(e) =>
                    update(["descripcion"], e.target.value)
                  }
                />
              </td>
            </tr>

            <tr>
              <td className="pdf-label">CÓDIGO INFORME</td>
              <td colSpan={2}>
                <input
                  className="pdf-input w-full"
                  value={data.codInf}
                  placeholder={
                    data.pedidoDemanda
                      ? `${data.pedidoDemanda}-001`
                      : "Ej: P-23-046-001"
                  }
                  onChange={(e) => update(["codInf"], e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ══════════════════════════════
            2. DATOS CLIENTE / TÉCNICO
        ══════════════════════════════ */}
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
                  disabled={loadingTechnicians}
                  onChange={(e) => {
                    const tech = (technicians || []).find(
                      (t) => techName(t) === e.target.value
                    );

                    update(["tecnicoNombre"], techName(tech));
                    update(["tecnicoTelefono"], techPhone(tech));
                    update(["tecnicoCorreo"], techEmail(tech));
                  }}
                >
                  <option value="">
                    {loadingTechnicians
                      ? "Cargando técnicos..."
                      : "Seleccionar técnico"}
                  </option>

                  {(technicians || []).map((t, i) => (
                    <option key={techEmail(t) || i} value={techName(t)}>
                      {techName(t)}
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
                  onChange={(e) =>
                    update(["fechaServicio"], e.target.value)
                  }
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ══════════════════════════════
            3. DESCRIPCIÓN DEL EQUIPO
        ══════════════════════════════ */}
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
              ["N° SERIE MÓDULO", "serieModulo"],
              ["N° SERIE CARRETE", "serieCarrete"],
              ["N° SERIE CABEZAL", "serieCabezal"],
              ["AÑO MODELO", "anio"],
              ["LONGITUD CABLE", "longitudCable"],
              ["DIÁMETRO CABLE", "diametroCable"],
              ["VERSIÓN SOFTWARE", "versionSoftware"],
              ["ACCESORIOS", "accesorios"],
            ].reduce((rows, field, idx, arr) => {
              if (idx % 2 === 0) {
                const next = arr[idx + 1];

                rows.push(
                  <tr key={field[1]}>
                    <td className="pdf-label">{field[0]}</td>
                    <td>
                      <input
                        className="pdf-input w-full"
                        value={data.equipo[field[1]] || ""}
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
                            value={data.equipo[next[1]] || ""}
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

        {/* ══════════════════════════════
            4. ESTADO DEL EQUIPO
        ══════════════════════════════ */}
        <h3 className="font-bold text-sm border-b pb-1">
          ESTADO DEL EQUIPO
        </h3>

        <div className="border rounded bg-white p-3 md:p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            <button
              type="button"
              onClick={addBaseImage}
              className="bg-indigo-600 text-white text-xs px-3 py-2 rounded hover:bg-indigo-700 transition"
            >
              🧩 Usar imagen base
            </button>

            <label className="bg-gray-600 text-white text-xs px-3 py-2 rounded cursor-pointer text-center hover:bg-gray-700 transition">
              📁 Subir fotografías
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  handleEstadoUpload(e.target.files);
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
                  handleEstadoUpload(e.target.files);
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(data.estadoEquipo?.imagenes || []).map((img, imgIdx) => (
                <div
                  key={img.id}
                  className="border rounded p-2 bg-gray-50 space-y-2"
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">
                      Imagen {imgIdx + 1}
                    </span>

                    <div className="flex gap-2">
                      {(img.puntos || []).length > 0 && (
                        <button
                          type="button"
                          onClick={() => clearImagePoints(img.id)}
                          className="text-[11px] border px-2 py-1 rounded hover:bg-gray-100"
                        >
                          Limpiar puntos
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => removeEstadoImg(img.id)}
                        className="text-[11px] text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                      >
                        Eliminar foto
                      </button>
                    </div>
                  </div>

                  <div className="relative w-full border rounded overflow-hidden bg-white">
                    <img
                      src={img.url}
                      alt={`estado-${imgIdx + 1}`}
                      className="w-full aspect-[4/3] object-contain bg-white cursor-crosshair"
                      onClick={(e) => handleEstadoClick(e, img.id)}
                    />

                    {(img.puntos || []).map((p, pIdx) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => removePoint(img.id, p.id)}
                        className="absolute w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow"
                        style={{
                          left: `${p.x * 100}%`,
                          top: `${p.y * 100}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <span className="sr-only">
                          Punto {pIdx + 1}
                        </span>
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-gray-500">
                    Toque sobre la fotografía para agregar puntos rojos en las novedades.
                  </p>

                  {(img.puntos || []).length === 0 ? (
                    <div className="text-xs text-gray-400">
                      Sin puntos marcados
                    </div>
                  ) : (
                    (img.puntos || []).map((p, pIdx) => (
                      <div key={p.id} className="flex items-start gap-2">
                        <div className="text-sm text-gray-700 pt-2 min-w-[24px]">
                          {pIdx + 1})
                        </div>

                        <input
                          className="pdf-input w-full"
                          placeholder={`Observación punto ${pIdx + 1}`}
                          value={p.observacion}
                          onChange={(e) =>
                            updatePointObs(img.id, p.id, e.target.value)
                          }
                        />
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════
            5. SECCIONES DE MANTENIMIENTO
        ══════════════════════════════ */}
        {secciones.map((sec) => (
          <section key={sec.id}>
            <h3 className="font-bold text-xs border-b pb-1 mb-2">
              {sec.titulo}
            </h3>

            <TablaItems
              seccion={sec}
              data={data}
              handleItem={handleItem}
            />
          </section>
        ))}

        {/* ══════════════════════════════
            6. NOTA FINAL
        ══════════════════════════════ */}
        <section>
          <h3 className="font-bold text-sm border-b pb-1">
            NOTA / OBSERVACIÓN FINAL DEL TÉCNICO
          </h3>

          <textarea
            className="pdf-textarea w-full border rounded p-2 resize-none overflow-hidden"
            value={data.notaFinal || ""}
            rows={4}
            placeholder="Escriba aquí observaciones generales del mantenimiento..."
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onChange={(e) => update(["notaFinal"], e.target.value)}
          />
        </section>

        {/* ══════════════════════════════
            7. FIRMAS
        ══════════════════════════════ */}
        <table className="pdf-table w-full">
          <thead>
            <tr>
              <th>FIRMA TÉCNICO ASTAP</th>
              <th>FIRMA CLIENTE / CONTACTO</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="align-top" style={{ height: 240 }}>
                <div className="border rounded bg-white h-[150px] flex items-center justify-center">
                  <SignatureCanvas
                    ref={sigTecnico}
                    penColor="black"
                    minWidth={0.5}
                    maxWidth={1.5}
                    onBegin={() => {
                      document.activeElement?.blur();
                      document.body.style.overflow = "hidden";
                    }}
                    onEnd={() => {
                      document.body.style.overflow = "";
                    }}
                    canvasProps={{
                      className: "w-full h-full touch-none",
                    }}
                  />
                </div>

                <div className="mt-2 text-sm text-center font-medium">
                  {data.tecnicoNombre || "—"}
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => sigTecnico.current?.clear()}
                    className="text-xs text-red-600 mt-1 hover:underline"
                  >
                    Borrar firma
                  </button>
                </div>
              </td>

              <td className="align-top" style={{ height: 240 }}>
                <div className="border rounded bg-white h-[150px] flex items-center justify-center">
                  <SignatureCanvas
                    ref={sigCliente}
                    penColor="black"
                    minWidth={0.5}
                    maxWidth={1.5}
                    onBegin={() => {
                      document.activeElement?.blur();
                      document.body.style.overflow = "hidden";
                    }}
                    onEnd={() => {
                      document.body.style.overflow = "";
                    }}
                    canvasProps={{
                      className: "w-full h-full touch-none",
                    }}
                  />
                </div>

                <div className="mt-2 space-y-1 text-center">
                  <input
                    className="pdf-input w-full bg-gray-100"
                    value={data.contacto || ""}
                    readOnly
                    placeholder="Nombre del contacto presente"
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
                    onClick={() => sigCliente.current?.clear()}
                    className="text-xs text-red-600 mt-1 hover:underline"
                  >
                    Borrar firma
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ══════════════════════════════
            8. BOTONES
        ══════════════════════════════ */}
        <div className="flex flex-col md:flex-row justify-between gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/mantenimiento")}
            className="border px-6 py-2 rounded hover:bg-gray-50 transition"
          >
            ← Volver
          </button>

          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando || uploading}
            className={`px-6 py-2 rounded text-white transition ${
              guardando || uploading
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {guardando
              ? "Guardando..."
              : uploading
              ? `Subiendo imágenes (${uploadingCount})...`
              : isEditing
              ? "Actualizar mantenimiento"
              : "Guardar mantenimiento"}
          </button>
        </div>
      </div>
    </div>
  );
}
