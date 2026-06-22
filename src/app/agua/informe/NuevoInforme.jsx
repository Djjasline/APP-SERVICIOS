import { useTechnicians } from "@/hooks/useTechnicians";
import { useAutoguardado, limpiarBorrador } from "@/hooks/useAutoguardado";
import BannerAutoguardado from "@/components/BannerAutoguardado";
import { useAuth } from "@/context/AuthContext";
import { saveOrUpdateReport } from "@/services/reportService";
import { uploadRegistroImage } from "@/utils/storage";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
  
const Input = ({ value, onChange, placeholder = "", readOnly = false, className = "" }) => (
  <input
    value={value || ""}
    onChange={onChange}
    readOnly={readOnly}
    placeholder={placeholder}
    className={`w-full border-0 outline-none p-1 text-sm ${readOnly ? "bg-gray-100" : ""} ${className}`}
  />
);

const validInformeTipos = ["bomba", "valvula"];

export default function NuevoInformeBombaValvula({
  tipo = null,
  area = "agua",
  basePath = "/agua/informe",
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const routeTipo = validInformeTipos.includes(tipo) ? tipo : null;
   const { user, isSuperAdmin } = useAuth();
const superAdminActivo =
  typeof isSuperAdmin === "function"
    ? isSuperAdmin()
    : !!isSuperAdmin;

  const {
    technicians,
    loading: loadingTechnicians,
  } = useTechnicians();

  const sigTecnico = useRef(null);
  const sigCliente = useRef(null);

  const [uploadingCount, setUploadingCount] = useState(0);
const [successMsg, setSuccessMsg] = useState("");

const [firmaTecnicoEditada, setFirmaTecnicoEditada] = useState(false);
const [firmaClienteEditada, setFirmaClienteEditada] = useState(false);

const isEditing = !!id;
  const claveAutoguardado = `informe_${area}_${routeTipo || "general"}_${id ?? "new"}`;
   
  /* ─── ESTADO BASE ─── */
  const emptyReport = {
    // Encabezado
    referenciaContrato: "",
    descripcion: "",
    codInf: "",
    pedidoDemanda: "",

    // Cliente
    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    fechaServicio: "",

    // Técnico
    tecnicoNombre: "",
    tecnicoTelefono: "",
    tecnicoCorreo: "",

    // Tipo de informe: "bomba" | "valvula"
    tipoInforme: routeTipo || "bomba",

    // ── EQUIPO BOMBA ──
    bomba: {
      fluido: "",
      marca: "",
      modeloTipo: "",
      serie: "",
      lugarProcedencia: "",
      caudal: "",
      tdh: "",
      velocidadGiro: "",
      orientacion: "",
      fotoPlacaBomba: "",       // URL Supabase
      // Motor
      marcaMotor: "",
      modeloTipoMotor: "",
      voltajeFaseFrecuencia: "",
      factorServicio: "",
      gradoProteccion: "",
      tipoConstruccionMotor: "",
      fotoPlacaMotor: "",       // URL Supabase
      // Accesorio
      accesorio: "",
      dimensionesAccesorio: "",
      obraCivil: "",
      dimensionesObraCivil: "",
      fotoPlacaBaseMetalica: "", // URL Supabase
      fotoBaseConcrete: "",      // URL Supabase
    },

    // ── EQUIPO VÁLVULA ──
    valvula: {
      fluido: "",
      marca: "",
      modeloTipo: "",
      serie: "",
      lugarProcedencia: "",
      diametro: "",
      presion: "",
      conexion: "",
      normaBridado: "",
      operacion: "",
      operacionActuador: "",
      tipoActuador: "",
      voltajeFaseFrecuencia: "",
      protocoloComunicacion: "",
      fotoPlacaValvula: "",      // URL Supabase
      fotoPlacaActuador1: "",    // URL Supabase
      fotoPlacaActuador2: "",    // URL Supabase
      // Dimensiones
      distanciaEntreCaras: "",
      longitudCuerpo: "",
      espesorContraBridas: "",
      numPerforaciones: "",
      diametroAgujero: "",
      materialTornilleria: "",
      registroFotoDimensional: [], // URLs Supabase
    },

    // Estado del equipo
estadoEquipo: {
  imagenes: [],
}, 
     
    // Actividades
    actividades: [{ titulo: "", detalle: "", imagenes: [] }],

    // Conclusiones y recomendaciones
    conclusiones: [""],
    recomendaciones: [""],

    // Firmas
    firmas: {
      tecnico: "",
      cliente: "",
      clienteCedula: "",
    },
  };

  const [data, setData] = useState(emptyReport);

  // Autoguardado automático cada 15 segundos
  useAutoguardado(claveAutoguardado, data, !isEditing);

 /* ─── CARGAR EXISTENTE ─── */
useEffect(() => {
  const load = async () => {
    if (!id) return;

    const { data: report, error } = await supabase
      .from("registros")
      .select("*")
      .eq("id", id)
      .eq("area", area)
      .eq("tipo", "informe")
      .single();

    if (error || !report) return;

    const d = report.data || {};

    setData({
      ...emptyReport,
      ...d,
      tipoInforme: d.tipoInforme || routeTipo || emptyReport.tipoInforme,
      bomba: { ...emptyReport.bomba, ...(d.bomba || {}) },
      valvula: { ...emptyReport.valvula, ...(d.valvula || {}) },
       estadoEquipo: {
  imagenes: Array.isArray(d.estadoEquipo?.imagenes)
    ? d.estadoEquipo.imagenes
    : [],
},
      actividades: Array.isArray(d.actividades)
        ? d.actividades
        : emptyReport.actividades,
      conclusiones: Array.isArray(d.conclusiones)
        ? d.conclusiones
        : emptyReport.conclusiones,
      recomendaciones: Array.isArray(d.recomendaciones)
        ? d.recomendaciones
        : emptyReport.recomendaciones,
      firmas: { ...emptyReport.firmas, ...(d.firmas || {}) },
    });

    setTimeout(() => {
      if (d.firmas?.tecnico) {
        sigTecnico.current?.fromDataURL(d.firmas.tecnico);
      }

      if (d.firmas?.cliente) {
        sigCliente.current?.fromDataURL(d.firmas.cliente);
      }

      setFirmaTecnicoEditada(false);
      setFirmaClienteEditada(false);
    }, 100);
  };

  load();
}, [id, area, routeTipo]);

   /* ─── AUTO-RELLENAR TÉCNICO LOGUEADO ─── */
useEffect(() => {
  if (
    !user?.email ||
    superAdminActivo ||
    isEditing ||
    loadingTechnicians
  ) return;

  const loggedTech = (technicians || []).find((t) => {
    const email = t.email || t.correo || "";
    return email.toLowerCase() === user.email.toLowerCase();
  });

  if (!loggedTech) return;

  setData((prev) => ({
    ...prev,
    tecnicoNombre: loggedTech.name || loggedTech.nombre || "",
    tecnicoTelefono: loggedTech.phone || loggedTech.telefono || "",
    tecnicoCorreo: loggedTech.email || loggedTech.correo || "",
  }));
}, [
  user?.email,
  superAdminActivo,
  isEditing,
  loadingTechnicians,
  technicians,
]);
  /* ─── HELPERS ESTADO ─── */
  const set = (field, value) => setData((p) => ({ ...p, [field]: value }));

  const setBomba = (field, value) =>
    setData((p) => ({ ...p, bomba: { ...p.bomba, [field]: value } }));

  const setValvula = (field, value) =>
    setData((p) => ({ ...p, valvula: { ...p.valvula, [field]: value } }));

  /* ─── SUBIDA DE IMÁGENES ─── */
  const compress = async (file) =>
  imageCompression(file, {
    maxSizeMB: 0.18,
    useWebWorker: true,

    alwaysKeepResolution: true,

    initialQuality: 0.7,

    maxWidthOrHeight: undefined,

    fileType: file.type || "image/jpeg",
  });

  const uploadSingle = async (file, folder) => {
    setUploadingCount((c) => c + 1);
    try {
      const compressed = await compress(file);
      return await uploadRegistroImage(compressed, id || "temp", folder);
    } catch {
      return null;
    } finally {
      setUploadingCount((c) => c - 1);
    }
  };

  const handleSingleImage = async (e, setter, folder) => {
  const file = e.target.files?.[0];
    e.target.value = null;
    if (!file) return;
     if (!file.type.startsWith("image/")) {
  alert("Solo se permiten imágenes");
  return;
}
    const url = await uploadSingle(file, folder);
    if (url) setter(url);
  };

  const handleMultiImages = async (e, currentList, setter, folder, maxCount = 4) => {
    const files = Array.from(e.target.files || []).filter((file) =>
  file.type.startsWith("image/")
);
    e.target.value = null;
    if (!files.length) return;

    const disponibles = maxCount - currentList.length;
    if (disponibles <= 0) { alert(`Máximo ${maxCount} imágenes`); return; }

    for (const file of files.slice(0, disponibles)) {
      const url = await uploadSingle(file, folder);
      if (url) setter((prev) => [...prev, url]);
    }
  };

  /* ─── ACTIVIDADES ─── */
  const handleActividadImageUpload = async (e, idx) => {
    const files = Array.from(e.target.files || []).filter((file) =>
  file.type.startsWith("image/")
);
    e.target.value = null;
    const actuales = data.actividades[idx]?.imagenes?.length || 0;
    const disponibles = 4 - actuales;
    if (disponibles <= 0) { alert("Máximo 4 imágenes por actividad"); return; }

    for (const file of files.slice(0, disponibles)) {
      const url = await uploadSingle(file, "actividad");
      if (url) {
        setData((p) => {
          const acts = [...p.actividades];
          acts[idx] = { ...acts[idx], imagenes: [...(acts[idx].imagenes || []), url] };
          return { ...p, actividades: acts };
        });
      }
    }
  };

  const removeActividadImage = (actIdx, imgIdx) => {
    setData((p) => {
      const acts = [...p.actividades];
      const imgs = [...(acts[actIdx].imagenes || [])];
      imgs.splice(imgIdx, 1);
      acts[actIdx] = { ...acts[actIdx], imagenes: imgs };
      return { ...p, actividades: acts };
    });
  };

 /* ─── ESTADO DEL EQUIPO - FOTOS Y PUNTOS ─── */
const handleEstadoEquipoImagesUpload = async (e) => {
  const files = Array.from(e.target.files || []).filter((file) =>
    file.type.startsWith("image/")
  );

  e.target.value = null;

  if (!files.length) return;

  const actuales = data.estadoEquipo?.imagenes?.length || 0;
  const disponibles = 12 - actuales;

  if (disponibles <= 0) {
    alert("Máximo 12 fotografías");
    return;
  }

  if (files.length > disponibles) {
    alert("Máximo 12 fotografías");
  }

  for (const file of files.slice(0, disponibles)) {
    const url = await uploadSingle(file, "estado-equipo");

    if (url) {
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

   /* ─── GUARDAR ─── */
const save = async () => {
  if (!data.cliente) { alert("Cliente requerido"); return; }
  if (!data.tecnicoNombre) { alert("Técnico requerido"); return; }
  if (!data.fechaServicio) { alert("Fecha requerida"); return; }
  if (uploadingCount > 0) { alert("Espera que terminen las imágenes"); return; }

  const firmaTecnico =
    firmaTecnicoEditada &&
    sigTecnico.current?.isEmpty?.() === false
      ? sigTecnico.current.toDataURL()
      : data.firmas.tecnico || "";

  const firmaCliente =
    firmaClienteEditada &&
    sigCliente.current?.isEmpty?.() === false
      ? sigCliente.current.toDataURL()
      : data.firmas.cliente || "";

  const finalData = {
    ...data,
    area,
    modulo: area,
    firmas: {
      ...data.firmas,
      tecnico: firmaTecnico,
      cliente: firmaCliente,
    },
  };

  const estadoFinal = firmaTecnico ? "completado" : "borrador";

  try {
    await saveOrUpdateReport({
      id: isEditing ? id : null,
      area,
      tipo: "informe",
      subtipo: data.tipoInforme === "bomba" ? "bomba" : "valvula",
      data: finalData,
      estado: estadoFinal,
    });

    setSuccessMsg(isEditing ? "Informe actualizado ✅" : "Informe guardado ✅");

      limpiarBorrador(claveAutoguardado);
    setTimeout(() => navigate(`${basePath}/${finalData.tipoInforme}`), 1200);
  } catch (err) {
    console.error(err);
    setSuccessMsg("Error al guardar ❌");
  }
};

  const uploading = uploadingCount > 0;
  const isBomba   = data.tipoInforme === "bomba";

  /* ─── RENDER ─── */
  return (
    <>
      {successMsg && (
        <div className={`fixed top-6 right-6 px-4 py-3 rounded shadow-lg z-50 text-white transition-all ${successMsg.includes("Error") ? "bg-red-600" : "bg-green-600"}`}>
          {successMsg}
        </div>
      )}

      <div className="p-3 md:p-6 bg-gray-100 min-h-screen">
        <div className="bg-white p-4 md:p-6 rounded shadow w-full max-w-screen-xl mx-auto space-y-6">

          {/* ── SELECTOR TIPO ── */}
          {routeTipo ? (
            <div className="inline-flex items-center gap-2 rounded border bg-blue-50 px-3 py-2 text-sm text-blue-800">
              <span className="font-semibold">Tipo de informe:</span>
              <span>{routeTipo === "bomba" ? "🔧 Bomba" : "🔩 Válvula"}</span>
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <span className="font-semibold text-sm">Tipo de informe:</span>
              {["bomba", "valvula"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("tipoInforme", t)}
                  className={`px-4 py-1.5 rounded text-sm font-medium border transition ${
                    data.tipoInforme === t
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {t === "bomba" ? "🔧 Bomba" : "🔩 Válvula"}
                </button>
              ))}
            </div>
          )}

          {/* ── ENCABEZADO ── */}
        <section className="border rounded overflow-hidden">
  <table className="w-full text-sm border-collapse">
    <tbody>

      {/* FILA SUPERIOR */}
      <tr className="border-b">
        <td
          rowSpan={5}
          className="w-32 border-r p-3 text-center align-middle"
        >
          <img
            src="/astap-logo.jpg"
            className="mx-auto max-h-20"
            alt="ASTAP"
          />
        </td>

        <td
          colSpan={3}
          className="border-r text-center font-bold py-3 text-base"
        >
          INFORME GENERAL DE CAMPO
        </td>

        <td className="p-2 text-xs w-40">
          <div>Fecha versión: <strong>01-01-26</strong></div>
          <div>Versión: <strong>01</strong></div>
        </td>
      </tr>

      {/* REFERENCIA */}
      <tr className="border-b">
        <td className="border-r p-2 font-semibold bg-gray-50 w-44">
          REFERENCIA DE CONTRATO
        </td>
        <td colSpan={3} className="border p-1">
          <Input
            value={data.referenciaContrato}
            onChange={(e) =>
              set("referenciaContrato", e.target.value)
            }
            placeholder="Ej: Contrato marco / cliente"
          />
        </td>
      </tr>

      {/* PEDIDO */}
      <tr className="border-b">
        <td className="border-r p-2 font-semibold bg-gray-50">
          PEDIDO / DEMANDA
        </td>
        <td colSpan={3} className="border p-1">
          <Input
            value={data.pedidoDemanda}
            onChange={(e) =>
              set("pedidoDemanda", e.target.value)
            }
            placeholder="Ej: P-23-046 o D-45821"
          />
        </td>
      </tr>

      {/* DESCRIPCIÓN */}
      <tr className="border-b">
        <td className="border-r p-2 font-semibold bg-gray-50">
          DESCRIPCIÓN
        </td>
        <td colSpan={3} className="border p-1">
          <Input
            value={data.descripcion}
            onChange={(e) =>
              set("descripcion", e.target.value)
            }
          />
        </td>
      </tr>

      {/* CODIGO */}
      <tr className="border-b">
        <td className="border-r p-2 font-semibold bg-gray-50">
          CÓDIGO INFORME
        </td>
        <td colSpan={3} className="border p-1">
          <Input
            value={data.codInf}
            onChange={(e) => set("codInf", e.target.value)}
            placeholder="Ej: P-23-046-001 o D-45821-001"
          />
        </td>
      </tr>

    </tbody>
  </table>
</section> 

 {/* ── DATOS CLIENTE Y TÉCNICO ── */}
<section className="border rounded overflow-hidden">
   
  {/* 🔥 TÍTULO */}
  <div className="bg-gray-100 p-2 font-semibold text-sm uppercase">
    DATOS DEL CLIENTE Y TÉCNICO RESPONSABLE
  </div>

  <table className="w-full text-sm border-collapse">
    <tbody>
      <tr className="border-b">
        <td className="border p-2 font-semibold bg-gray-50 w-44">
          CLIENTE
        </td>
        <td className="border p-1">
          <Input
            value={data.cliente}
            onChange={(e) => set("cliente", e.target.value)}
          />
        </td>

        <td className="border p-2 font-semibold bg-gray-50 w-44">
          DIRECCIÓN
        </td>
        <td className="border p-1">
          <Input
            value={data.direccion}
            onChange={(e) => set("direccion", e.target.value)}
          />
        </td>
      </tr>

      <tr className="border-b">
        <td className="border p-2 font-semibold bg-gray-50">
          CONTACTO
        </td>
        <td className="border p-1">
          <Input
            value={data.contacto}
            onChange={(e) => set("contacto", e.target.value)}
          />
        </td>

        <td className="border p-2 font-semibold bg-gray-50">
          TELÉFONO
        </td>
        <td className="border p-1">
          <Input
            value={data.telefono}
            onChange={(e) => set("telefono", e.target.value)}
          />
        </td>
      </tr>

      <tr className="border-b">
        <td className="border p-2 font-semibold bg-gray-50">
          CORREO
        </td>
        <td colSpan={3} className="border p-1">
          <Input
            value={data.correo}
            onChange={(e) => set("correo", e.target.value)}
          />
        </td>
      </tr>

      <tr className="border-b">
        <td className="border p-2 font-semibold bg-gray-50">
          TÉCNICO RESPONSABLE
        </td>
        <td className="border p-1">
         <select
  className="w-full border-0 p-1 outline-none bg-white text-sm"
  value={data.tecnicoNombre}
 disabled={loadingTechnicians || !superAdminActivo}
  onChange={(e) => {
    const tech = (technicians || []).find(
      (t) => t.name === e.target.value
    );

    setData((p) => ({
      ...p,
      tecnicoNombre: tech?.name || "",
      tecnicoTelefono: tech?.phone || "",
      tecnicoCorreo: tech?.email || "",
    }));
  }}
>
  <option value="">
    {loadingTechnicians
      ? "Cargando técnicos..."
      : "Seleccionar técnico"}
  </option>

  {(technicians || []).map((t, i) => (
    <option key={t.email || i} value={t.name}>
      {t.name}
    </option>
  ))}
</select>
        </td>

        <td className="border p-2 font-semibold bg-gray-50">
          TELÉFONO TÉCNICO
        </td>
        <td className="border p-1">
          <Input value={data.tecnicoTelefono} readOnly />
        </td>
      </tr>

      <tr className="border-b">
        <td className="border p-2 font-semibold bg-gray-50">
          CORREO TÉCNICO
        </td>
        <td className="border p-1">
          <Input value={data.tecnicoCorreo} readOnly />
        </td>

        <td className="border p-2 font-semibold bg-gray-50">
          FECHA DE SERVICIO
        </td>
        <td className="border p-1">
          <input
            type="date"
            value={data.fechaServicio}
            onChange={(e) => set("fechaServicio", e.target.value)}
            className="w-full border-0 outline-none p-1 text-sm"
          />
        </td>
      </tr>
    </tbody>
  </table>
</section>         
           
          {/* ════════════════════════════════════
    DESCRIPCIÓN DEL EQUIPO — BOMBA
════════════════════════════════════ */}
{isBomba && (
  <section className="border rounded overflow-hidden">
    <div className="bg-gray-100 p-2 font-semibold text-sm text-center uppercase">
      Descripción del Equipo
    </div>

    <table className="w-full text-sm border-collapse">
      <tbody>

        {/* ── BOMBA ── */}
        <tr className="border-b bg-blue-50">
          <td colSpan={4} className="p-2 font-bold text-blue-800">
            🔧 BOMBA
          </td>
        </tr>

        {[
          ["FLUIDO", "fluido", "MARCA", "marca"],

          ["MODELO / TIPO", "modeloTipo", "N° SERIE", "serie"],

          ["LUGAR DE PROCEDENCIA", "lugarProcedencia", "Q (Caudal)", "caudal"],

          ["TDH (cabeza)", "tdh", "VELOCIDAD DE GIRO", "velocidadGiro"],

          ["ORIENTACIÓN", "orientacion", null, null],

        ].map(([l1, f1, l2, f2], i) => (
          <tr key={i} className="border-b">

            {/* CAMPO IZQUIERDO */}
            <td className="border p-2 font-semibold bg-gray-50 w-44">
              {l1}
            </td>

            <td className="border p-1">
              <Input
                value={data.bomba[f1]}
                onChange={(e) =>
                  setBomba(f1, e.target.value)
                }
                placeholder={
                  f1 === "orientacion"
                    ? "Vertical / Horizontal"
                    : ""
                }
              />
            </td>

            {/* CAMPO DERECHO */}
            {l2 ? (
              <>
                <td className="border p-2 font-semibold bg-gray-50 w-44">
                  {l2}
                </td>

                <td className="border p-1">
                  <Input
                    value={data.bomba[f2]}
                    onChange={(e) =>
                      setBomba(f2, e.target.value)
                    }
                  />
                </td>
              </>
            ) : (
              <td colSpan={2} className="border bg-white" />
            )}

          </tr>
        ))}

        {/* FOTO PLACA BOMBA */}
        <tr className="border-b">
          <td className="border p-2 font-semibold bg-gray-50">
            FOTO PLACA BOMBA
          </td>

          <td colSpan={3} className="border p-2">
            <ImageUploadField
              url={data.bomba.fotoPlacaBomba}
              onUpload={(e) =>
                handleSingleImage(
                  e,
                  (url) =>
                    setBomba("fotoPlacaBomba", url),
                  "placa-bomba"
                )
              }
              onRemove={() =>
                setBomba("fotoPlacaBomba", "")
              }
              label="Foto placa bomba"
            />
          </td>
        </tr>

        {/* ── MOTOR ── */}
        <tr className="border-b bg-blue-50">
          <td colSpan={4} className="p-2 font-bold text-blue-800">
            ⚡ MOTOR
          </td>
        </tr>

        {[
          [
            "MARCA",
            "marcaMotor",
            "MODELO / TIPO",
            "modeloTipoMotor",
          ],

          [
            "VOLTAJE / FASE / FREC.",
            "voltajeFaseFrecuencia",
            "S.F (FACTOR DE SERVICIO)",
            "factorServicio",
          ],

          [
            "GRADO DE PROTECCIÓN",
            "gradoProteccion",
            "TIPO DE CONSTRUCCIÓN",
            "tipoConstruccionMotor",
          ],
        ].map(([l1, f1, l2, f2], i) => (
          <tr key={i} className="border-b">

            <td className="border p-2 font-semibold bg-gray-50">
              {l1}
            </td>

            <td className="border p-1">
              <Input
                value={data.bomba[f1]}
                onChange={(e) =>
                  setBomba(f1, e.target.value)
                }
              />
            </td>

            <td className="border p-2 font-semibold bg-gray-50">
              {l2}
            </td>

            <td className="border p-1">
              <Input
                value={data.bomba[f2]}
                onChange={(e) =>
                  setBomba(f2, e.target.value)
                }
              />
            </td>

          </tr>
        ))}

        {/* FOTO PLACA MOTOR */}
        <tr className="border-b">
          <td className="border p-2 font-semibold bg-gray-50">
            FOTO PLACA DEL MOTOR
          </td>

          <td colSpan={3} className="border p-2">
            <ImageUploadField
              url={data.bomba.fotoPlacaMotor}
              onUpload={(e) =>
                handleSingleImage(
                  e,
                  (url) =>
                    setBomba("fotoPlacaMotor", url),
                  "placa-motor"
                )
              }
              onRemove={() =>
                setBomba("fotoPlacaMotor", "")
              }
              label="Foto placa motor"
            />
          </td>
        </tr>

        {/* ── ACCESORIO / OBRA CIVIL ── */}
        <tr className="border-b bg-blue-50">
          <td colSpan={4} className="p-2 font-bold text-blue-800">
            🏗️ ACCESORIO / OBRA CIVIL
          </td>
        </tr>

        {[
          [
            "ACCESORIO",
            "accesorio",
            "DIMENSIONES ACCESORIO (L/A/H)",
            "dimensionesAccesorio",
          ],

          [
            "OBRA CIVIL",
            "obraCivil",
            "DIMENSIONES OBRA CIVIL (L/A/H)",
            "dimensionesObraCivil",
          ],
        ].map(([l1, f1, l2, f2], i) => (
          <tr key={i} className="border-b">

            <td className="border p-2 font-semibold bg-gray-50">
              {l1}
            </td>

            <td className="border p-1">
              <Input
                value={data.bomba[f1]}
                onChange={(e) =>
                  setBomba(f1, e.target.value)
                }
              />
            </td>

            <td className="border p-2 font-semibold bg-gray-50">
              {l2}
            </td>

            <td className="border p-1">
              <Input
                value={data.bomba[f2]}
                onChange={(e) =>
                  setBomba(f2, e.target.value)
                }
              />
            </td>

          </tr>
        ))}

        {/* FOTOS BASE */}
        <tr className="border-b">

          <td className="border p-2 font-semibold bg-gray-50">
            FOTO PLACA BASE METÁLICA
          </td>

          <td className="border p-2">
            <ImageUploadField
              url={data.bomba.fotoPlacaBaseMetalica}
              onUpload={(e) =>
                handleSingleImage(
                  e,
                  (url) =>
                    setBomba(
                      "fotoPlacaBaseMetalica",
                      url
                    ),
                  "base-metalica"
                )
              }
              onRemove={() =>
                setBomba(
                  "fotoPlacaBaseMetalica",
                  ""
                )
              }
              label="Foto base metálica"
            />
          </td>

          <td className="border p-2 font-semibold bg-gray-50">
            FOTO BASE DE CONCRETO
          </td>

          <td className="border p-2">
            <ImageUploadField
              url={data.bomba.fotoBaseConcrete}
              onUpload={(e) =>
                handleSingleImage(
                  e,
                  (url) =>
                    setBomba(
                      "fotoBaseConcrete",
                      url
                    ),
                  "base-concreto"
                )
              }
              onRemove={() =>
                setBomba("fotoBaseConcrete", "")
              }
              label="Foto base concreto"
            />
          </td>

        </tr>

      </tbody>
    </table>
  </section>
)}

          {/* ════════════════════════════════════
              DESCRIPCIÓN DEL EQUIPO — VÁLVULA
          ════════════════════════════════════ */}
          {!isBomba && (
            <section className="border rounded overflow-hidden">
              <div className="bg-gray-100 p-2 font-semibold text-sm text-center uppercase">
                Descripción del Equipo
              </div>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b bg-blue-50">
                    <td colSpan={4} className="p-2 font-bold text-blue-800">🔩 VÁLVULA</td>
                  </tr>
                  {[
                    ["FLUIDO",                    "fluido",                "MARCA",                  "marca"],
                    ["MODELO / TIPO",             "modeloTipo",            "N° SERIE",               "serie"],
                    ["LUGAR DE PROCEDENCIA",      "lugarProcedencia",      "DIÁMETRO",               "diametro"],
                    ["PRESIÓN",                   "presion",               "CONEXIÓN",               "conexion"],
                    ["NORMA DE BRIDADO",          "normaBridado",          "OPERACIÓN",              "operacion"],
                    ["OPERACIÓN ACTUADOR",        "operacionActuador",     "TIPO DE ACTUADOR",       "tipoActuador"],
                    ["VOLTAJE / FASE / FREC.",    "voltajeFaseFrecuencia", "PROTOCOLO COMUNICACIÓN", "protocoloComunicacion"],
                  ].map(([l1, f1, l2, f2], i) => (
                    <tr key={i} className="border-b">
                      <td className="border p-2 font-semibold bg-gray-50 w-44">{l1}</td>
                      <td className="border p-1"><Input value={data.valvula[f1]} onChange={(e) => setValvula(f1, e.target.value)} /></td>
                      <td className="border p-2 font-semibold bg-gray-50 w-44">{l2}</td>
                      <td className="border p-1"><Input value={data.valvula[f2]} onChange={(e) => setValvula(f2, e.target.value)} /></td>
                    </tr>
                  ))}

                  {/* Foto placa válvula */}
                  <tr className="border-b">
                    <td className="border p-2 font-semibold bg-gray-50">FOTO PLACA VÁLVULA</td>
                    <td colSpan={3} className="border p-2">
                      <ImageUploadField
                        url={data.valvula.fotoPlacaValvula}
                        onUpload={(e) => handleSingleImage(e, (url) => setValvula("fotoPlacaValvula", url), "placa-valvula")}
                        onRemove={() => setValvula("fotoPlacaValvula", "")}
                        label="Foto placa válvula"
                      />
                    </td>
                  </tr>

                  {/* Fotos actuador (siempre dos) */}
                  <tr className="border-b">
                    <td className="border p-2 font-semibold bg-gray-50">FOTO PLACA ACTUADOR 1</td>
                    <td className="border p-2">
                      <ImageUploadField
                        url={data.valvula.fotoPlacaActuador1}
                        onUpload={(e) => handleSingleImage(e, (url) => setValvula("fotoPlacaActuador1", url), "actuador-1")}
                        onRemove={() => setValvula("fotoPlacaActuador1", "")}
                        label="Actuador 1"
                      />
                    </td>
                    <td className="border p-2 font-semibold bg-gray-50">FOTO PLACA ACTUADOR 2</td>
                    <td className="border p-2">
                      <ImageUploadField
                        url={data.valvula.fotoPlacaActuador2}
                        onUpload={(e) => handleSingleImage(e, (url) => setValvula("fotoPlacaActuador2", url), "actuador-2")}
                        onRemove={() => setValvula("fotoPlacaActuador2", "")}
                        label="Actuador 2"
                      />
                    </td>
                  </tr>

                  {/* ── DIMENSIONES ── */}
                  <tr className="border-b bg-blue-50">
                    <td colSpan={4} className="p-2 font-bold text-blue-800">📐 DIMENSIONES</td>
                  </tr>
                  {[
                    ["DIST. ENTRE CARAS (F2F)",      "distanciaEntreCaras",  "LONGITUD CUERPO VÁLVULA",   "longitudCuerpo"],
                    ["ESPESOR CONTRA BRIDAS",         "espesorContraBridas",  "N° PERFORACIONES EN BRIDA", "numPerforaciones"],
                    ["DIÁMETRO AGUJERO EN BRIDA",     "diametroAgujero",      "MATERIAL TORNILLERÍA",      "materialTornilleria"],
                  ].map(([l1, f1, l2, f2], i) => (
                    <tr key={i} className="border-b">
                      <td className="border p-2 font-semibold bg-gray-50">{l1}</td>
                      <td className="border p-1"><Input value={data.valvula[f1]} onChange={(e) => setValvula(f1, e.target.value)} /></td>
                      <td className="border p-2 font-semibold bg-gray-50">{l2}</td>
                      <td className="border p-1"><Input value={data.valvula[f2]} onChange={(e) => setValvula(f2, e.target.value)} /></td>
                    </tr>
                  ))}

                  {/* Registro fotográfico dimensional */}
                  <tr className="border-b">
                    <td className="border p-2 font-semibold bg-gray-50 align-top">REGISTRO FOTOGRÁFICO DIMENSIONAL</td>
                    <td colSpan={3} className="border p-2">
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <label className="bg-gray-600 text-white text-xs px-3 py-1.5 rounded cursor-pointer hover:bg-gray-700">
                          📁 Galería
                          <input type="file" accept="image/*" multiple className="hidden"
                            onChange={(e) => handleMultiImages(e, data.valvula.registroFotoDimensional,
                              (cb) => setData((p) => {
                                const updated = typeof cb === "function"
                                  ? cb(p.valvula.registroFotoDimensional)
                                  : cb;
                                return { ...p, valvula: { ...p.valvula, registroFotoDimensional: updated } };
                              }), "registro-dimensional"
                            )}
                          />
                        </label>
                        <label className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded cursor-pointer hover:bg-blue-700">
                          📷 Cámara
                          <input type="file" accept="image/*" capture="environment" multiple className="hidden"
                            onChange={(e) => handleMultiImages(e, data.valvula.registroFotoDimensional,
                              (cb) => setData((p) => {
                                const updated = typeof cb === "function"
                                  ? cb(p.valvula.registroFotoDimensional)
                                  : cb;
                                return { ...p, valvula: { ...p.valvula, registroFotoDimensional: updated } };
                              }), "registro-dimensional"
                            )}
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(data.valvula.registroFotoDimensional || []).map((url, i) => (
                          <div key={i} className="relative">
                            <img src={url} className="w-full h-32 object-cover rounded border" />
                            <button type="button"
                              onClick={() => setData((p) => ({
                                ...p,
                                valvula: {
                                  ...p.valvula,
                                  registroFotoDimensional: p.valvula.registroFotoDimensional.filter((_, j) => j !== i)
                                }
                              }))}
                              className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                            >✕</button>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

<BannerAutoguardado
          clave={claveAutoguardado}
          onRestaurar={(datosGuardados) => setData(datosGuardados)}
          isEditing={isEditing}
        />

        <h3 className="font-bold text-sm border-b pb-1">ESTADO DEL EQUIPO</h3>

<div className="border rounded-xl p-4 bg-white space-y-4">
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Fotografías del estado del equipo
    </label>

    <input
      type="file"
      accept="image/*"
      multiple
      onChange={handleEstadoEquipoImagesUpload}
      className="block w-full text-sm"
    />
  </div>

  {(data.estadoEquipo?.imagenes || []).length > 0 && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {(data.estadoEquipo?.imagenes || []).map((img, imgIndex) => (
        <div key={img.id} className="border rounded-lg p-3 space-y-3">
          <div
            className="relative w-full border rounded overflow-hidden bg-gray-100 cursor-crosshair"
            onClick={(e) => handleEstadoEquipoImageClick(e, img.id)}
          >
            <img
              src={img.url}
              alt={`Estado del equipo ${imgIndex + 1}`}
              className="w-full max-h-[320px] object-contain"
            />

            {(img.puntos || []).map((punto, puntoIndex) => (
              <span
                key={punto.id}
                className="absolute w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center -translate-x-1/2 -translate-y-1/2 shadow"
                style={{
                  left: `${punto.x * 100}%`,
                  top: `${punto.y * 100}%`,
                }}
              >
                {puntoIndex + 1}
              </span>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => removeEstadoEquipoImage(img.id)}
              className="px-3 py-1 text-xs rounded bg-red-600 text-white"
            >
              Eliminar foto
            </button>

            <button
              type="button"
              onClick={() => clearEstadoEquipoImagePoints(img.id)}
              className="px-3 py-1 text-xs rounded bg-gray-700 text-white"
            >
              Limpiar puntos
            </button>
          </div>

          {(img.puntos || []).length > 0 && (
            <div className="space-y-2">
              {(img.puntos || []).map((punto, puntoIndex) => (
                <div key={punto.id} className="flex gap-2 items-start">
                  <span className="mt-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                    {puntoIndex + 1}
                  </span>

                  <textarea
                    value={punto.observacion || ""}
                    onChange={(e) =>
                      updateEstadoEquipoPointObservation(
                        img.id,
                        punto.id,
                        e.target.value
                      )
                    }
                    placeholder="Observación del punto marcado"
                    className="flex-1 border rounded px-2 py-1 text-sm min-h-[44px]"
                  />

                  <button
                    type="button"
                    onClick={() => removeEstadoEquipoPoint(img.id, punto.id)}
                    className="mt-1 px-2 py-1 text-xs rounded bg-red-100 text-red-700"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</div>
           
          {/* ── ACTIVIDADES REALIZADAS ── */}
          <h3 className="font-bold text-sm border-b pb-1">ACTIVIDADES REALIZADAS</h3>
          <table className="w-full text-sm border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 w-12">ÍTEM</th>
                <th className="border p-2 w-2/5">DESCRIPCIÓN</th>
                <th className="border p-2">IMÁGENES</th>
              </tr>
            </thead>
            <tbody>
              {data.actividades.map((act, i) => (
                <tr key={i}>
                  <td className="border p-2 text-center align-top">{i + 1}</td>
                  <td className="border p-2 align-top">
                    <input
                      className="w-full border rounded p-1 text-xs mb-1"
                      placeholder="Título de la actividad"
                      value={act.titulo}
                      onChange={(e) => {
                        const acts = [...data.actividades];
                        acts[i] = { ...acts[i], titulo: e.target.value };
                        set("actividades", acts);
                      }}
                    />
                    <textarea
                      className="w-full border rounded p-1 text-xs resize-none"
                      rows={5}
                      placeholder="Detalle de la actividad"
                      value={act.detalle}
                      onChange={(e) => {
                        const acts = [...data.actividades];
                        acts[i] = { ...acts[i], detalle: e.target.value };
                        set("actividades", acts);
                      }}
                    />
                    {data.actividades.length > 1 && (
                      <button type="button"
                        onClick={() => set("actividades", data.actividades.filter((_, j) => j !== i))}
                        className="text-red-600 text-xs mt-1 hover:underline"
                      >− Eliminar actividad</button>
                    )}
                  </td>
                  <td className="border p-2 align-top">
                    <div className="flex gap-2 mb-2 flex-wrap">
                      <label className="bg-gray-600 text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-gray-700">
                        📁 Seleccionar de galería
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleActividadImageUpload(e, i)} />
                      </label>
                      <label className="bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-blue-700">
                        📷 Tomar foto con cámara
                        <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => handleActividadImageUpload(e, i)} />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(act.imagenes || []).map((url, j) => (
                        <div key={j} className="relative">
                          <img src={url} className="w-full h-36 object-cover rounded border" />
                          <button type="button"
                            onClick={() => removeActividadImage(i, j)}
                            className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                    {!(act.imagenes?.length) && (
                      <div className="border rounded bg-gray-50 h-28 flex items-center justify-center text-xs text-gray-400">
                        Sin imágenes cargadas
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button"
            onClick={() => set("actividades", [...data.actividades, { titulo: "", detalle: "", imagenes: [] }])}
            className="bg-gray-100 border border-gray-300 hover:bg-gray-200 px-4 py-1.5 text-xs rounded"
          >+ Agregar actividad</button>

          {/* ── CONCLUSIONES Y RECOMENDACIONES ── */}
          <h3 className="font-bold text-sm border-b pb-1">CONCLUSIONES Y RECOMENDACIONES</h3>
          <table className="w-full text-sm border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 w-8">#</th>
                <th className="border p-2">CONCLUSIONES</th>
                <th className="border p-2 w-8">#</th>
                <th className="border p-2">RECOMENDACIONES</th>
                {data.conclusiones.length > 1 && <th className="border p-2 w-16"></th>}
              </tr>
            </thead>
            <tbody>
              {data.conclusiones.map((_, i) => (
                <tr key={i}>
                  <td className="border p-2 text-center">{i + 1}</td>
                  <td className="border p-1">
                    <textarea className="w-full border-0 outline-none text-xs p-1 resize-none" rows={3}
                      value={data.conclusiones[i]}
                      onChange={(e) => {
                        const c = [...data.conclusiones]; c[i] = e.target.value; set("conclusiones", c);
                      }}
                    />
                  </td>
                  <td className="border p-2 text-center">{i + 1}</td>
                  <td className="border p-1">
                    <textarea className="w-full border-0 outline-none text-xs p-1 resize-none" rows={3}
                      value={data.recomendaciones[i]}
                      onChange={(e) => {
                        const r = [...data.recomendaciones]; r[i] = e.target.value; set("recomendaciones", r);
                      }}
                    />
                  </td>
                  {data.conclusiones.length > 1 && (
                    <td className="border p-2 text-center">
                      <button type="button" className="text-red-600 text-xs hover:underline"
                        onClick={() => {
                          set("conclusiones", data.conclusiones.filter((_, j) => j !== i));
                          set("recomendaciones", data.recomendaciones.filter((_, j) => j !== i));
                        }}
                      >− Eliminar</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button"
            onClick={() => { set("conclusiones", [...data.conclusiones, ""]); set("recomendaciones", [...data.recomendaciones, ""]); }}
            className="bg-gray-100 border border-gray-300 hover:bg-gray-200 px-4 py-1.5 text-xs rounded"
          >+ Agregar conclusión / recomendación</button>

          {/* ── FIRMAS ── */}
          <table className="w-full text-sm border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-center">FIRMA TÉCNICO ASTAP</th>
                <th className="border p-2 text-center">FIRMA CLIENTE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 align-top" style={{ height: 200 }}>
                  <div className="border rounded bg-white h-36">
                    <SignatureCanvas ref={sigTecnico} penColor="black" minWidth={0.5} maxWidth={1.5}
                      onBegin={() => {
  setFirmaTecnicoEditada(true);
  document.activeElement?.blur();
  document.body.style.overflow = "hidden";
}}
                       onEnd={() => { document.body.style.overflow = ""; }}
                      canvasProps={{ className: "w-full h-full touch-none" }}
                    />
                  </div>
                  <div className="text-center font-medium text-sm mt-2">{data.tecnicoNombre || "—"}</div>
                  <div className="text-center">
                    <button type="button" onClick={() => { sigTecnico.current?.clear(); set("firmas", { ...data.firmas, tecnico: "" }); }}
                      className="text-xs text-red-600 hover:underline">Borrar firma</button>
                  </div>
                </td>
                <td className="border p-2 align-top" style={{ height: 200 }}>
                  <div className="border rounded bg-white h-36">
                    <SignatureCanvas ref={sigCliente} penColor="black" minWidth={0.5} maxWidth={1.5}
                      onBegin={() => {
  setFirmaClienteEditada(true);
  document.activeElement?.blur();
  document.body.style.overflow = "hidden";
}}
                      onEnd={() => { document.body.style.overflow = ""; }}
                      canvasProps={{ className: "w-full h-full touch-none" }}
                    />
                  </div>
                  <input className="w-full border rounded mt-2 text-xs p-1 bg-gray-100" value={data.contacto} readOnly placeholder="Nombre del contacto" />
                  <input className="w-full border rounded mt-1 text-xs p-1"
                    value={data.firmas.clienteCedula || ""}
                    onChange={(e) => set("firmas", { ...data.firmas, clienteCedula: e.target.value })}
                    placeholder="Cédula del cliente"
                  />
                  <div className="text-center mt-1">
                    <button type="button" onClick={() => { sigCliente.current?.clear(); set("firmas", { ...data.firmas, cliente: "" }); }}
                      className="text-xs text-red-600 hover:underline">Borrar firma</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

            {/* ── BOTONES ── */}
          <div className="border-t pt-4 mt-6 flex flex-col md:flex-row justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(`${basePath}/${data.tipoInforme || routeTipo || "bomba"}`)}
              className="border px-6 py-2 rounded hover:bg-gray-50 transition"
            >
              ← Volver
            </button>

            <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => navigate(`${basePath}/pdf/${id}`)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
                >
                  Ver PDF
                </button>
              )}

              <button
                type="button"
                onClick={save}
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
      </div>
    </>
  );
}

/* ─── Componente reutilizable para imagen única ─── */
function ImageUploadField({ url, onUpload, onRemove, label }) {
  return (
    <div>
      {url ? (
        <div className="relative inline-block">
          <img
            src={url}
            alt={label}
            className="max-h-48 rounded border object-contain"
          />

          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <label className="bg-gray-600 text-white text-xs px-3 py-1.5 rounded cursor-pointer hover:bg-gray-700">
            📁 Galería
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onUpload}
            />
          </label>

          <label className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded cursor-pointer hover:bg-blue-700">
            📷 Cámara
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onUpload}
            />
          </label>
        </div>
      )}
    </div>
  );
}
