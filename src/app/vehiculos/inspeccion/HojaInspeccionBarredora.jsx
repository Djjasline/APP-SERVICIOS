import { useTechnicians } from "@/hooks/useTechnicians";
import { useAutoguardado, limpiarBorrador } from "@/hooks/useAutoguardado";
import BannerAutoguardado from "@/components/BannerAutoguardado";
import { saveOrUpdateReport } from "@/services/reportService";
import { uploadRegistroImage } from "@/utils/storage";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import imageCompression from "browser-image-compression";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import TechnicalReportGuidance from "@/components/TechnicalReportGuidance";
import ObservationImageField from "@/components/ObservationImageField";


/* =============================
   PRUEBAS PREVIAS AL SERVICIO
============================= */
const pruebasPrevias = [
  ["1.1", "Prueba de encendido general del equipo"],
  ["1.2", "Verificación de funcionamiento de controles principales"],
  ["1.3", "Revisión de alarmas o mensajes de fallo"],
];

/* =============================
   SECCIONES – BARREDORA
============================= */
const secciones = [
  {
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico (mangueras, acoples, bancos, cilindros y solenoides)"],
      ["A.2", "Nivel de aceite del tanque AW68, ¿se visualiza la mirilla?"],
      ["A.3", "Fugas de aceite en motores de cepillos"],
      ["A.4", "Fugas de aceite en motor de banda"],
      ["A.5", "Fugas de bombas hidráulicas"],
      ["A.6", "Fugas en motor John Deere"],
    ],
  },
  {
    id: "B",
    titulo: "B) SISTEMA DE CONTROL DE POLVO (AGUA)",
    items: [
      ["B.1", "Inspección de fugas de agua (mangueras, acoples)"],
      ["B.2", "Estado del filtro para agua"],
      ["B.3", "Estado de válvulas check"],
      ["B.4", "Estado de solenoides de apertura de agua"],
      ["B.5", "Estado de la bomba eléctrica de agua"],
      ["B.6", "Estado de los aspersores de cepillos"],
      ["B.7", "Estado de la manguera de carga de agua hidrante"],
      ["B.8", "Inspección del medidor de nivel del tanque"],
      ["B.9", "Inspección del sistema de llenado de agua"],
    ],
  },
  {
    id: "C",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      ["C.1", "Inspección visual de conectores de bancos de control"],
      ["C.2", "Evaluar funcionamiento al encender el equipo"],
      ["C.3", "Estado del tablero de control de cabina"],
      ["C.4", "Inspección de batería"],
      ["C.5", "Inspección de luces externas"],
      ["C.6", "Diagnóstico con service tool (opcional)"],
      ["C.7", "Estado del limpia parabrisas"],
      ["C.8", "Conexiones externas (GPS / radio)"],
    ],
  },
  {
    id: "D",
    titulo: "D) SISTEMA DE RECOLECCIÓN",
    items: [
      ["D.1", "Estado de la banda"],
      ["D.2", "Estado de las cerdas de los cepillos"],
      ["D.3", "Estado de la tolva"],
      ["D.4", "Funcionamiento de la tolva"],
      ["D.5", "Funcionamiento de la banda"],
      ["D.6", "Estado de zapatas de arrastre"],
    ],
  },
  {
    id: "E",
    titulo: "E) MOTOR JOHN DEERE",
    items: [
      ["E.1", "Estado de filtros de aire 1° y 2°"],
      ["E.2", "Filtro combustible trampa de agua"],
      ["E.3", "Filtro de combustible"],
      ["E.4", "Filtro de aceite"],
      ["E.5", "Nivel de aceite de motor"],
      ["E.6", "Estado y nivel del refrigerante"],
      ["E.7", "Filtro A/C cabina"],
    ],
  },
];

/* ── Lista plana para calcular progreso ── */
const todosLosItems = [
  ...pruebasPrevias.map(([c]) => c),
  ...secciones.flatMap((s) => s.items.map(([c]) => c)),
];

const barredoraVariants = {
  pelican: {
    subtipo: "barredora",
    routeSegment: "barredora",
    title: "INFORME DE INSPECCIÓN BARREDORA PELICAN",
    imagePath: "/barredora-base.png",
    imageAlt: "Vista general barredora Pelican",
    draftKey: "inspeccion_barredora",
  },
  roadWizard: {
    subtipo: "barredora-road-wizard",
    routeSegment: "barredora-road-wizard",
    title: "INFORME DE INSPECCIÓN BARREDORA ROAD WIZARD",
    imagePath: "/barredora-roadwizard-base.png",
    imageAlt: "Vista general barredora Road Wizard",
    draftKey: "inspeccion_barredora_road_wizard",
  },
};

const fieldPlaceholders = {
  referenciaContrato: "Ej: Contrato marco / cliente",
  pedidoDemanda: "Ej: P-23-046 o D-45821",
  descripcion: "Ej: Inspección técnica barredora",
  codInf: "Ej: P-23-046-001 o D-45821-001",
  cliente: "Nombre del cliente",
  direccion: "Dirección del servicio",
  contacto: "Nombre del contacto",
  telefono: "Ej: 0991234567",
  correo: "correo@empresa.com",
  nota: "Ej: Unidad operativa / referencia interna",
  marca: "Marca del equipo",
  modelo: "Modelo del equipo",
  serie: "Número de serie",
  anio: "Ej: 2021",
  vin: "Código VIN / chasis",
  placa: "Ej: ABC-1234",
  horasModulo: "Ej: 1250 h",
  horasChasis: "Ej: 3200 h",
  kilometraje: "Ej: 45000 km",
  horometro: "Ej: 1800 h",
};

/* ══════════════════════════════
   ESTADO INICIAL
══════════════════════════════ */
const emptyForm = {
  referenciaContrato: "",
  pedidoDemanda: "",
  descripcion: "",
  codInf: "",

  cliente: "",
  cedulaCliente: "",
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
    serie: "",
    anio: "",
    vin: "",
    placa: "",
    horasModulo: "",
    horasChasis: "",
    kilometraje: "",
    horometro: "",
  },

  estadoEquipo: {
    imagenes: [],
    puntosBase: [],
  },

  items: {},

  conclusiones: [""],
  recomendaciones: [""],

  notaFinal: "",

  firmas: {
    tecnico: "",
    cliente: "",
    clienteCedula: "",
  },
};

export default function HojaInspeccionBarredora({ variant = "pelican" }) {
const variantConfig = barredoraVariants[variant] || barredoraVariants.pelican;
const { id } = useParams();
const navigate = useNavigate();
const { user, isSuperAdmin } = useAuth();

const superAdminActivo =
  typeof isSuperAdmin === "function"
    ? isSuperAdmin()
    : !!isSuperAdmin;
const isEditing = !!id;
  const claveAutoguardado = `${variantConfig.draftKey}_${id ?? "new"}`;
  const {
    technicians,
    loading: loadingTechnicians,
  } = useTechnicians();

const sigTecnico = useRef(null);
const sigCliente = useRef(null);

const [guardando, setGuardando]           = useState(false);
const [uploadingCount, setUploadingCount] = useState(0);
const [successMsg, setSuccessMsg]         = useState("");
   const [firmaTecnicoEditada, setFirmaTecnicoEditada] = useState(false);
const [firmaClienteEditada, setFirmaClienteEditada] = useState(false);
const [data, setData] = useState(emptyForm);

  // Autoguardado automático cada 15 segundos
  useAutoguardado(claveAutoguardado, data, !isEditing);

/* ── PROGRESO ── */
const itemsMarcados = todosLosItems.filter(
  (c) => data.items?.[c]?.estado
).length;

const totalItems = todosLosItems.length;

const progresoPct = Math.round(
  (itemsMarcados / totalItems) * 100
);

const inspeccionLista =
  !!(
    sigTecnico.current?.isEmpty?.() === false ||
    data.firmas?.tecnico
  ) &&
  !!(
    sigCliente.current?.isEmpty?.() === false ||
    data.firmas?.cliente
  ); 

const uploading = uploadingCount > 0;

   /* ── UPDATE PATH-BASED ── */
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

/* ── CARGAR DESDE SUPABASE ── */
useEffect(() => {
  if (!id) return;

  const load = async () => {
    const { data: reg, error } = await supabase
  .from("registros")
  .select("*")
  .eq("id", id)
  .eq("area", "vehiculos")
  .eq("tipo", "inspeccion")
  .eq("subtipo", variantConfig.subtipo)
  .single();
    if (error || !reg) return;

    const d = {
      ...emptyForm,
      ...(reg.data || {}),
    };

    d.estadoEquipo = {
      imagenes: Array.isArray(reg.data?.estadoEquipo?.imagenes)
        ? reg.data.estadoEquipo.imagenes.map((img, i) => ({
            id: img?.id || `img-${i}`,
            url: img?.url || "",

            puntos: Array.isArray(img?.puntos)
              ? img.puntos.map((p, j) => ({
                  id: p?.id || `p-${i}-${j}`,
                  x: p?.x ?? 0,
                  y: p?.y ?? 0,
                  observacion: p?.observacion || "",
                }))
              : [],
          }))
        : [],

      puntosBase: Array.isArray(reg.data?.estadoEquipo?.puntosBase)
        ? reg.data.estadoEquipo.puntosBase.map((p, i) => ({
            id: p?.id || `base-${i}`,
            x: p?.x ?? 0,
            y: p?.y ?? 0,
            observacion: p?.observacion || "",
          }))
        : [],
    };

    setData(d);

    setTimeout(() => {
      if (reg.data?.firmas?.tecnico) {
        sigTecnico.current?.fromDataURL(
          reg.data.firmas.tecnico
        );
      }

      if (reg.data?.firmas?.cliente) {
        sigCliente.current?.fromDataURL(
          reg.data.firmas.cliente
        );
      }
      setFirmaTecnicoEditada(false);
setFirmaClienteEditada(false); 
    }, 300);
  };

  load();
}, [id]);

   /* ── AUTO-RELLENAR TÉCNICO LOGUEADO ── */
useEffect(() => {
  if (!user?.email || isEditing || loadingTechnicians) return;
  if (superAdminActivo) return;

  const loggedTech = (technicians || []).find((t) => {
    const email = t.email || t.correo || "";

    return (
      email.toLowerCase() ===
      user.email.toLowerCase()
    );
  });

  if (!loggedTech) return;

  setData((prev) => ({
    ...prev,

    tecnicoNombre:
      loggedTech.name ||
      loggedTech.nombre ||
      "",

    tecnicoTelefono:
      loggedTech.phone ||
      loggedTech.telefono ||
      "",

    tecnicoCorreo:
      loggedTech.email ||
      loggedTech.correo ||
      "",
  }));
}, [
  user?.email,
  isEditing,
  loadingTechnicians,
  technicians,
  superAdminActivo,
]);

/* ── LIMPIAR SCROLL LOCK ── */
useEffect(() => {
  return () => {
    document.body.style.overflow = "";
  };
}, []);

/* ── COMPRIMIR Y SUBIR ── */
const compressAndUpload = async (file, folder) => {

  const compressedFile = await imageCompression(file, {
  maxSizeMB: 0.18,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
  fileType: "image/jpeg",
  initialQuality: 0.7,
  exifOrientation: 1,
});
  return await uploadRegistroImage(
    compressedFile,
    id || `temp-insp-${variantConfig.routeSegment}`,
    folder
  );
};

/* ── ESTADO EQUIPO — MÚLTIPLES FOTOS ── */
const handleEstadoUpload = async (files) => {
  const arr = Array.from(files || []).filter((f) =>
    f.type.startsWith("image/")
  );

  if (!arr.length) return;

  const actualesCount = data.estadoEquipo?.imagenes?.length || 0;
  const disponibles = Math.max(0, 12 - actualesCount);

  if (disponibles <= 0) {
    alert("Máximo 12 fotografías");
    return;
  }

  const filesToUpload = arr.slice(0, disponibles);

  if (arr.length > disponibles) {
    alert("Máximo 12 fotografías");
  }

  setUploadingCount((p) => p + filesToUpload.length);

  try {
    for (const file of filesToUpload) {
      const url = await compressAndUpload(file, "estado-equipo");

      if (!url) continue;

      setData((prev) => {
        const actuales = prev.estadoEquipo?.imagenes || [];

        if (actuales.some((img) => img.url === url)) {
          return prev;
        }

        return {
          ...prev,
          estadoEquipo: {
            ...prev.estadoEquipo,
            imagenes: [
              ...actuales,
              {
                id: `img-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 6)}`,
                url,
                puntos: [],
              },
            ],
          },
        };
      });
    }
  } finally {
    setUploadingCount((p) => p - filesToUpload.length);
  }
};
/* ── ELIMINAR FOTO ── */
const removeEstadoImg = (imgId) =>
  setData((prev) => ({
    ...prev,

    estadoEquipo: {
      ...prev.estadoEquipo,

      imagenes: (
        prev.estadoEquipo?.imagenes || []
      ).filter((i) => i.id !== imgId),
    },
  }));

/* ── AGREGAR PUNTO ── */
const handleEstadoClick = (e, imgId) => {
  const r = e.currentTarget.getBoundingClientRect();
  const x = Number(
    ((e.clientX - r.left) / r.width).toFixed(4)
  );
  const y = Number(
    ((e.clientY - r.top) / r.height).toFixed(4)
  );
  setData((prev) => ({
    ...prev,

    estadoEquipo: {
      ...prev.estadoEquipo,

      imagenes: (
        prev.estadoEquipo?.imagenes || []
      ).map((img) =>
        img.id === imgId
          ? {
              ...img,

              puntos: [
                ...(img.puntos || []),

                {
                  id: `p-${Date.now()}`,
                  x,
                  y,
                  observacion: "",
                },
              ],
            }
          : img
      ),
    },
  }));
};

/* ── ELIMINAR PUNTO ── */
const removePoint = (imgId, ptId) =>
  setData((prev) => ({
    ...prev,

    estadoEquipo: {
      ...prev.estadoEquipo,

      imagenes: (
        prev.estadoEquipo?.imagenes || []
      ).map((img) =>
        img.id === imgId
          ? {
              ...img,

              puntos: (
                img.puntos || []
              ).filter((p) => p.id !== ptId),
            }
          : img
      ),
    },
  }));

/* ── ACTUALIZAR OBSERVACIÓN ── */
const updatePointObs = (
  imgId,
  ptId,
  value
) =>
  setData((prev) => ({
    ...prev,

    estadoEquipo: {
      ...prev.estadoEquipo,

      imagenes: (
        prev.estadoEquipo?.imagenes || []
      ).map((img) =>
        img.id === imgId
          ? {
              ...img,

              puntos: (
                img.puntos || []
              ).map((p) =>
                p.id === ptId
                  ? {
                      ...p,
                      observacion: value,
                    }
                  : p
              ),
            }
          : img
      ),
    },
  }));

/* ── PUNTOS SOBRE PLANTILLA BASE ── */

const handleBaseImageClick = (e) => {
  const r = e.currentTarget.getBoundingClientRect();

  const x = Number(
    ((e.clientX - r.left) / r.width).toFixed(4)
  );

  const y = Number(
    ((e.clientY - r.top) / r.height).toFixed(4)
  );

  setData((prev) => ({
    ...prev,
    estadoEquipo: {
      ...prev.estadoEquipo,
      puntosBase: [
        ...(prev.estadoEquipo?.puntosBase || []),
        {
          id: `base-${Date.now()}`,
          x,
          y,
          observacion: "",
        },
      ],
    },
  }));
};

const removeBasePoint = (ptId) =>
  setData((prev) => ({
    ...prev,
    estadoEquipo: {
      ...prev.estadoEquipo,
      puntosBase: (prev.estadoEquipo?.puntosBase || []).filter(
        (p) => p.id !== ptId
      ),
    },
  }));

const updateBasePointObs = (ptId, value) =>
  setData((prev) => ({
    ...prev,
    estadoEquipo: {
      ...prev.estadoEquipo,
      puntosBase: (prev.estadoEquipo?.puntosBase || []).map((p) =>
        p.id === ptId
          ? { ...p, observacion: value }
          : p
      ),
    },
  }));

  /* ── ITEM CHECKLIST ── */
const handleItem = (codigo, campo, valor) =>
  setData((prev) => ({
    ...prev,
    items: {
      ...prev.items,
      [codigo]: {
        ...(prev.items[codigo] || {}),
        [campo]: valor,
      },
    },
  }));

   
/* ── GUARDAR ── */
const handleSubmit = async (e) => {

  e.preventDefault();

  if (uploading) {
    alert(
      "Espere que terminen de subir las imágenes"
    );
    return;
  }

  if (!data.cliente) {
    alert("Cliente requerido");
    return;
  }

  if (!data.tecnicoNombre) {
    alert("Técnico requerido");
    return;
  }

  if (!data.fechaServicio) {
    alert("Fecha requerida");
    return;
  }

  if (!(data.conclusiones || []).some((txt) => (txt || "").trim().length >= 15)) {
    alert("Debe incluir una conclusión técnica concreta");
    return;
  }

  if (!(data.recomendaciones || []).some((txt) => (txt || "").trim().length >= 15)) {
    alert("Debe incluir una recomendación accionable");
    return;
  }

  setGuardando(true);

  try {

    const payload = {
      ...data,

      firmas: {
  ...data.firmas,

  tecnico:
    firmaTecnicoEditada &&
    sigTecnico.current?.isEmpty?.() === false
      ? sigTecnico.current.toDataURL()
      : data.firmas?.tecnico || "",

  cliente:
    firmaClienteEditada &&
    sigCliente.current?.isEmpty?.() === false
      ? sigCliente.current.toDataURL()
      : data.firmas?.cliente || "",
},
    };

    const estadoFinal =
      payload.firmas.tecnico &&
      payload.firmas.cliente
        ? "completado"
        : "borrador";

const result = await saveOrUpdateReport({
  id: isEditing ? id : null,
  area: "vehiculos",
  tipo: "inspeccion",
  subtipo: variantConfig.subtipo,
  data: payload,
  estado: estadoFinal,
});

limpiarBorrador(claveAutoguardado);

setSuccessMsg(
  estadoFinal === "completado"
    ? "Inspección completada ✅"
    : "Borrador guardado ✅"
);
setTimeout(() => {

  // 🔥 NUEVO REGISTRO
  if (!isEditing && result?.id) {
    navigate(`/vehiculos/inspeccion/${variantConfig.routeSegment}/${result.id}`);
  }

  // 🔥 EDICIÓN
  else {
    navigate("/vehiculos/inspeccion");
  }

}, 1200);


  } catch (err) {

    console.error(err);

    setSuccessMsg(
      "Error guardando inspección ❌"
    );

  } finally {

    setGuardando(false);
  }
};


   
 /* ── TABLA CHECKLIST (SI / NO / N/A) ── */
  const CheckRow = ({ codigo, descripcion }) => (
    <tr className="hover:bg-gray-50">
      <td className="pdf-label text-xs">{codigo}</td>
      <td style={{ border:"1px solid #d1d5db", padding:"4px 8px", fontSize:12 }}>{descripcion}</td>
      {["SI", "NO", "NA"].map((opt) => (
        <td key={opt} className="text-center" style={{ border:"1px solid #d1d5db", padding:"4px", width:40 }}>
          <input type="radio" name={`chk-${codigo}`}
            checked={data.items?.[codigo]?.estado === opt}
            onChange={() => handleItem(codigo, "estado", opt)} />
        </td>
      ))}
      <td style={{ border:"1px solid #d1d5db", padding:"2px 4px" }}>
        <textarea
          value={data.items?.[codigo]?.observacion || ""}
          onChange={(e) => {
            handleItem(codigo, "observacion", e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          ref={(el) => { if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; } }}
          placeholder="Observaciones..."
          className="w-full border-0 outline-none text-xs p-1 overflow-hidden resize-none min-h-[34px]"
        />
        <ObservationImageField
          value={data.items?.[codigo]?.imagenes || []}
          onChange={(imagenes) => handleItem(codigo, "imagenes", imagenes)}
          recordId={id || `temp-insp-${variantConfig.routeSegment}`}
          folder={`observacion-${codigo}`}
        />
      </td>
    </tr>
  );

  //* ── RENDER ── */
  return (
    <>
      {/* TOAST */}
      {successMsg && (
        <div className={`fixed top-6 right-6 px-4 py-3 rounded shadow-lg z-50 text-white transition-all ${
          successMsg.includes("Error") ? "bg-red-600" : "bg-green-600"
        }`}>
          {successMsg}
        </div>
      )}

      <div className="p-3 md:p-6 bg-gray-100 min-h-screen">
        <div className="bg-white p-4 md:p-6 rounded shadow w-full max-w-screen-xl mx-auto space-y-6">

      
        {/* ── BANNER PROGRESO ── */}
        <div className={`p-2 rounded text-xs flex items-center justify-between gap-2 ${inspeccionLista ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          <span>{inspeccionLista ? "✔ Inspección lista para completar" : "⚠ Pendiente de firmas para completar"}</span>
          <span className="font-semibold">{progresoPct}% ítems marcados ({itemsMarcados}/{totalItems})</span>
        </div>

        <TechnicalReportGuidance compact />


          {/* ══ 1. ENCABEZADO ══ */}
          <table className="pdf-table w-full">
            <tbody>
              <tr>
  <td rowSpan={5} style={{ width:130, textAlign:"center", verticalAlign:"middle" }}>
    <img src="/astap-logo.jpg" alt="ASTAP" className="object-contain mx-auto" style={{ maxHeight:90 }} />
  </td>

  <td colSpan={2} style={{ textAlign:"center", fontWeight:"bold", fontSize:16, verticalAlign:"middle" }}>
                    {variantConfig.title}
                 </td>

  <td className="text-[10px]" style={{ width:160 }}>
    <div>Fecha versión: <strong>01-01-26</strong></div>
    <div>Versión: <strong>01</strong></div>
  </td>
</tr>
              {[
                ["REFERENCIA DE CONTRATO","referenciaContrato"],
                ["PEDIDO / DEMANDA","pedidoDemanda"],
                ["DESCRIPCIÓN","descripcion"],
                ["CÓDIGO INFORME","codInf"],
              ].map(([label, key]) => (
                <tr key={key}>
                  <td className="pdf-label">{label}</td>
                  <td colSpan={2}><input className="pdf-input w-full" value={data[key]} placeholder={fieldPlaceholders[key] || ""} onChange={(e) => update([key], e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ 2. DATOS CLIENTE / TÉCNICO ══ */}
          <BannerAutoguardado
          clave={claveAutoguardado}
          onRestaurar={(datosGuardados) => setData(datosGuardados)}
          isEditing={isEditing}
        />

        <h3 className="font-bold text-sm border-b pb-1">DATOS DEL CLIENTE Y TÉCNICO RESPONSABLE</h3>
          <table className="pdf-table w-full">
            <tbody>
              <tr>
                <td className="pdf-label">CLIENTE</td>
                <td><input className="pdf-input w-full" value={data.cliente} placeholder={fieldPlaceholders.cliente} onChange={(e) => update(["cliente"], e.target.value)} /></td>
                <td className="pdf-label">DIRECCIÓN</td>
                <td><input className="pdf-input w-full" value={data.direccion} placeholder={fieldPlaceholders.direccion} onChange={(e) => update(["direccion"], e.target.value)} /></td>
              </tr>
              <tr>
                <td className="pdf-label">CONTACTO</td>
                <td><input className="pdf-input w-full" value={data.contacto} placeholder={fieldPlaceholders.contacto} onChange={(e) => update(["contacto"], e.target.value)} /></td>
                <td className="pdf-label">TELÉFONO</td>
                <td><input className="pdf-input w-full" value={data.telefono} placeholder={fieldPlaceholders.telefono} onChange={(e) => update(["telefono"], e.target.value)} /></td>
              </tr>
              <tr>
                <td className="pdf-label">CORREO</td>
                <td><input className="pdf-input w-full" value={data.correo} placeholder={fieldPlaceholders.correo} onChange={(e) => update(["correo"], e.target.value)} /></td>
                <td className="pdf-label">TÉCNICO RESPONSABLE</td>
                <td>
                 <select
  className="pdf-input w-full"
  value={data.tecnicoNombre || ""}
  disabled={loadingTechnicians || !superAdminActivo}
  onChange={(e) => {
    const t = (technicians || []).find((x) => {
      const nombre = x.name || x.nombre || "";
      return nombre === e.target.value;
    });

    update(["tecnicoNombre"], t?.name || t?.nombre || "");
    update(["tecnicoTelefono"], t?.phone || t?.telefono || "");
    update(["tecnicoCorreo"], t?.email || t?.correo || "");
  }}
>
  <option value="">
    {loadingTechnicians ? "Cargando..." : "Seleccionar técnico"}
  </option>

  {(technicians || []).map((t, i) => {
    const nombre = t.name || t.nombre || "";
    const correo = t.email || t.correo || "";

    return (
      <option key={correo || i} value={nombre}>
        {nombre}
      </option>
    );
  })}
</select>
                </td>
              </tr>
              <tr>
                <td className="pdf-label">TELÉFONO TÉCNICO</td>
                <td><input className="pdf-input w-full bg-gray-100" value={data.tecnicoTelefono} readOnly /></td>
                <td className="pdf-label">CORREO TÉCNICO</td>
                <td><input className="pdf-input w-full bg-gray-100" value={data.tecnicoCorreo} readOnly /></td>
              </tr>
              <tr>
                <td className="pdf-label">FECHA DE SERVICIO</td>
                <td colSpan={3}><input type="date" className="pdf-input w-full" value={data.fechaServicio} onChange={(e) => update(["fechaServicio"], e.target.value)} /></td>
              </tr>
            </tbody>
          </table>

           
          {/* ══ 3. DESCRIPCIÓN DEL EQUIPO ══ */}
          <h3 className="font-bold text-sm border-b pb-1">DESCRIPCIÓN DEL EQUIPO</h3>
          <table className="pdf-table w-full">
            <thead><tr><th colSpan={4} style={{ textAlign:"center" }}>DESCRIPCIÓN DEL EQUIPO</th></tr></thead>
            <tbody>
              {[
                ["NOTA","nota"],["MARCA","marca"],
                ["MODELO","modelo"],["N° SERIE","serie"],
                ["AÑO MODELO","anio"],["VIN / CHASIS","vin"],
                ["PLACA","placa"],["HORAS MÓDULO","horasModulo"],
                ["HORAS CHASIS","horasChasis"],["KILOMETRAJE","kilometraje"],
                ["HORÓMETRO","horometro"],[null,null],
              ].reduce((rows, field, idx, arr) => {
                if (idx % 2 === 0) {
                  const next = arr[idx + 1];
                  rows.push(
                    <tr key={idx}>
                      {field[0] ? <><td className="pdf-label">{field[0]}</td><td><input className="pdf-input w-full" value={data.equipo[field[1]]||""} placeholder={fieldPlaceholders[field[1]] || ""} onChange={(e) => update(["equipo", field[1]], e.target.value)} /></td></> : <td colSpan={2} />}
                      {next && next[0] ? <><td className="pdf-label">{next[0]}</td><td><input className="pdf-input w-full" value={data.equipo[next[1]]||""} placeholder={fieldPlaceholders[next[1]] || ""} onChange={(e) => update(["equipo", next[1]], e.target.value)} /></td></> : <td colSpan={2} />}
                    </tr>
                  );
                }
                return rows;
              }, [])}
            </tbody>
          </table>

          {/* ══ 4. ESTADO DEL EQUIPO — MÚLTIPLES FOTOS ══ */}
          <h3 className="font-bold text-sm border-b pb-1">ESTADO DEL EQUIPO</h3>
          {/* ── PLANTILLA BASE DEL HIDRO ── */}

<div className="border rounded bg-gray-50 p-3 mb-4 space-y-3">

  <div className="text-xs font-semibold text-gray-600">
    Vista general del equipo
  </div>

  <div
    className="relative border rounded overflow-hidden bg-white cursor-crosshair"
    onClick={handleBaseImageClick}
  >
    <img
      src={variantConfig.imagePath}
      alt={variantConfig.imageAlt}
      className="w-full max-h-[420px] object-contain"
    />

    {(data.estadoEquipo?.puntosBase || []).map((p, pi) => (
      <button
        key={p.id}
        type="button"
        onClick={() => removeBasePoint(p.id)}
        className="absolute w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow text-[10px] text-white font-bold flex items-center justify-center"
        style={{
          left: `${p.x * 100}%`,
          top: `${p.y * 100}%`,
          transform: "translate(-50%,-50%)",
        }}
      >
        {pi + 1}
      </button>
    ))}
  </div>

  <p className="text-[11px] text-gray-500">
    Toque la imagen para agregar novedades generales.
  </p>

  {(data.estadoEquipo?.puntosBase || []).map((p, pi) => (
    <div key={p.id} className="flex items-start gap-2">
      <span className="text-sm text-gray-700 pt-2 min-w-[24px]">
        {pi + 1})
      </span>

      <input
        className="pdf-input w-full"
        placeholder={`Observación punto ${pi + 1}`}
        value={p.observacion}
        onChange={(e) =>
          updateBasePointObs(p.id, e.target.value)
        }
      />
    </div>
  ))}
</div> 
          <div className="border bg-white p-3 space-y-4 print:block">
            <div className="flex gap-2">
              <label className="bg-gray-600 text-white text-xs px-3 py-2 rounded cursor-pointer hover:bg-gray-700">
                📁 Subir fotografías
                <input type="file" accept="image/*" multiple style={{ display:"none" }}
                  onChange={(e) => { handleEstadoUpload(e.target.files); e.target.value = null; }} />
              </label>
              <label className="bg-blue-600 text-white text-xs px-3 py-2 rounded cursor-pointer hover:bg-blue-700">
                📷 Tomar fotos
                <input type="file" accept="image/*" capture="environment" multiple style={{ display:"none" }}
                  onChange={(e) => { handleEstadoUpload(e.target.files); e.target.value = null; }} />
              </label>
            </div>

            {(data.estadoEquipo?.imagenes || []).length === 0 ? (
              <div className="border rounded bg-gray-50 h-[120px] flex items-center justify-center text-sm text-gray-400">
                Sin fotografías cargadas
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 print:block">
                {(data.estadoEquipo?.imagenes || []).map((img, idx) => (
                 <div
  key={img.id}
  className="border rounded p-2 bg-gray-50 space-y-2 mb-3 print:mb-2"
>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600">Imagen {idx + 1}</span>
                      <button type="button" onClick={() => removeEstadoImg(img.id)}
                        className="text-[11px] text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50">
                        Eliminar foto
                      </button>
                    </div>
                    <div className="relative border rounded overflow-hidden bg-white flex items-center justify-center">
                      <img src={img.url} alt={`estado-${idx+1}`}
                        className="w-auto max-w-full max-h-[320px] object-contain cursor-crosshair mx-auto"
                        onClick={(e) => handleEstadoClick(e, img.id)} />
                      {(img.puntos||[]).map((p, pi) => (
                        <button
  key={p.id}
  type="button"
  onClick={() => removePoint(img.id, p.id)}
  className="absolute w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow text-[10px] text-white font-bold flex items-center justify-center"
  style={{
    left:`${p.x*100}%`,
    top:`${p.y*100}%`,
    transform:"translate(-50%,-50%)"
  }}
>
  {pi + 1}
</button>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-500">Toque la fotografía para marcar puntos rojos.</p>
                    {(img.puntos||[]).map((p, pi) => (
                      <div key={p.id} className="flex items-start gap-2">
                        <span className="text-sm text-gray-700 pt-2 min-w-[24px]">{pi+1})</span>
                        <input className="pdf-input w-full" placeholder={`Observación punto ${pi+1}`}
                          value={p.observacion} onChange={(e) => updatePointObs(img.id, p.id, e.target.value)} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>


         {/* ══ 5. PRUEBAS PREVIAS ══ */}
          <h3 className="font-bold text-xs border-b pb-1">
            1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS
          </h3>
          <table className="pdf-table w-full">
            <thead><tr>
              <th className="text-left" style={{ width:50 }}>ÍTEM</th>
              <th className="text-left">DESCRIPCIÓN</th>
              <th style={{ width:40 }}>SI</th><th style={{ width:40 }}>NO</th><th style={{ width:40 }}>N/A</th>
              <th className="text-left">OBSERVACIÓN</th>
            </tr></thead>
            <tbody>{pruebasPrevias.map(([c,d]) => <CheckRow key={c} codigo={c} descripcion={d} />)}</tbody>
          </table>

          {/* ── SECCIONES A–E ── */}
          <h2 className="font-semibold text-sm px-1">
            2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O SISTEMAS
          </h2>

          {secciones.map((sec) => (
  <section key={sec.id}>

    <h3 className="font-bold text-xs border-b pb-1 mb-2">
      {sec.titulo}
    </h3>

    <table className="pdf-table w-full">

      <thead>
        <tr>
          <th
            className="text-left"
            style={{ width: 50 }}
          >
            ÍTEM
          </th>

          <th className="text-left">
            DESCRIPCIÓN
          </th>

          <th style={{ width: 40 }}>
            SI
          </th>

          <th style={{ width: 40 }}>
            NO
          </th>

          <th style={{ width: 40 }}>
            N/A
          </th>

          <th className="text-left">
            OBSERVACIÓN
          </th>
        </tr>
      </thead>

      <tbody>
        {sec.items.map(([c, d]) => (
          <CheckRow
            key={c}
            codigo={c}
            descripcion={d}
          />
        ))}
      </tbody>

    </table>

  </section>
))}

          {/* ══ 7. CONCLUSION Y RECOMENDACION ══ */}
          <h3 className="font-bold text-sm border-b pb-1">CONCLUSION TECNICA Y RECOMENDACION ACCIONABLE</h3>
          <table className="pdf-table w-full">
            <thead><tr>
              <th style={{ width:30 }}>#</th><th>CONCLUSION TECNICA</th>
              <th style={{ width:30 }}>#</th><th>RECOMENDACION ACCIONABLE</th>
              {data.conclusiones.length > 1 && <th style={{ width:60 }}></th>}
            </tr></thead>
            <tbody>
              {data.conclusiones.map((_, i) => (
                <tr key={i}>
                  <td style={{ textAlign:"center" }}>{i+1}</td>
                  <td><textarea className="pdf-textarea w-full resize-none" rows={3} style={{ minHeight:70 }}
                    placeholder="Qué significa técnicamente lo encontrado y cuál es el estado final del equipo"
                    value={data.conclusiones[i]} onChange={(e) => update(["conclusiones", i], e.target.value)} /></td>
                  <td style={{ textAlign:"center" }}>{i+1}</td>
                  <td><textarea className="pdf-textarea w-full resize-none" rows={3} style={{ minHeight:70 }}
                    placeholder="Acción sugerida, prioridad o próxima intervención recomendada"
                    value={data.recomendaciones[i]||""} onChange={(e) => update(["recomendaciones", i], e.target.value)} /></td>
                  {data.conclusiones.length > 1 && (
                    <td className="text-center">
                      <button type="button" onClick={() => {
                        update(["conclusiones"], data.conclusiones.filter((_,j) => j!==i));
                        update(["recomendaciones"], data.recomendaciones.filter((_,j) => j!==i));
                      }} className="text-red-600 text-xs hover:underline">− Eliminar</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={() => {
            update(["conclusiones"], [...data.conclusiones, ""]);
            update(["recomendaciones"], [...data.recomendaciones, ""]);
          }} className="bg-gray-100 border border-gray-300 hover:bg-gray-200 px-4 py-1.5 text-xs rounded">
            + Agregar fila
          </button>

           {/* ══ 8. NOTA FINAL ══ */}
          <h3 className="font-bold text-sm border-b pb-1">NOTA / OBSERVACIÓN FINAL DEL TÉCNICO</h3>
          <textarea
            value={data.notaFinal || ""}
            onChange={(e) => {
              update(["notaFinal"], e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            ref={(el) => { if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; } }}
            placeholder="Escriba aquí cualquier observación general..."
            className="w-full border rounded p-2 text-sm outline-none overflow-hidden resize-none min-h-[80px]"
          />

          {/* ══ 9. FIRMAS ══ */}
          <table className="pdf-table w-full">
            <thead><tr>
              <th>FIRMA TÉCNICO ASTAP</th>
              <th>FIRMA CLIENTE / CONTACTO</th>
            </tr></thead>
            <tbody>
              <tr>
                <td className="align-top" style={{ height:190 }}>
                  <div className="border rounded bg-white h-[120px]">
                    <SignatureCanvas ref={sigTecnico} penColor="black" minWidth={0.5} maxWidth={1.5}
                     onBegin={() => {
  setFirmaTecnicoEditada(true);
  document.body.style.overflow = "hidden";
}}
                     onEnd={() => {
  document.body.style.overflow = "";
}}
                      canvasProps={{ className:"w-full h-full touch-none" }} />
                  </div>
                  <div className="mt-2 text-sm text-center font-medium">{data.tecnicoNombre || "—"}</div>
                  <div className="text-center">
                    <button type="button" 
                       onClick={() => {
  sigTecnico.current?.clear();
  setFirmaTecnicoEditada(true);

  setData((prev) => ({
    ...prev,
    firmas: {
      ...prev.firmas,
      tecnico: "",
    },
  }));
}}
                      className="text-xs text-red-600 mt-1 hover:underline">Borrar firma</button>
                  </div>
                </td>
                <td className="align-top" style={{ height:190 }}>
                  <div className="border rounded bg-white h-[120px]">
                    <SignatureCanvas ref={sigCliente} penColor="black" minWidth={0.5} maxWidth={1.5}
                      onBegin={() => {
  setFirmaClienteEditada(true);
  document.body.style.overflow = "hidden";
}}
                     onEnd={() => {
  document.body.style.overflow = "";
}}
                      canvasProps={{ className:"w-full h-full touch-none" }} />
                  </div>
                  <div className="mt-2 space-y-1 text-center">
                    <input className="pdf-input w-full bg-gray-100" value={data.contacto} readOnly placeholder="Nombre del contacto" />
                    <input className="pdf-input w-full"
                      value={data.firmas?.clienteCedula || ""}
                      onChange={(e) => update(["firmas","clienteCedula"], e.target.value)}
                      placeholder="Número de cédula del cliente" />
                  </div>
                  <div className="text-center">
                    <button type="button" 
                       onClick={() => {
  sigCliente.current?.clear();
  setFirmaClienteEditada(true);

  setData((prev) => ({
    ...prev,
    firmas: {
      ...prev.firmas,
      cliente: "",
    },
  }));
}}
                      className="text-xs text-red-600 mt-1 hover:underline">Borrar firma</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

   {/* ══ 10. BOTONES ══ */}
          <div className="flex flex-col md:flex-row justify-between gap-3 pt-4">
            <button type="button" onClick={() => navigate("/vehiculos/inspeccion")}
              className="border px-6 py-2 rounded hover:bg-gray-50 transition">
              ← Volver
            </button>
            <div className="flex gap-3">
              {isEditing && inspeccionLista && (
                <button type="button"
                  onClick={() => navigate(`/vehiculos/inspeccion/${variantConfig.routeSegment}/${id}/pdf`)}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
                  Ver PDF
                </button>
              )}
              <button
  type="button"
  onClick={handleSubmit}
  disabled={guardando || uploading}
                className={`px-6 py-2 rounded text-white transition ${
                  guardando || uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}>
                {guardando   ? "Guardando..."
                 : uploading ? `Subiendo (${uploadingCount})...`
                 : inspeccionLista ? "Guardar y completar"
                 : isEditing ? "Actualizar borrador"
                 : "Guardar borrador"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
