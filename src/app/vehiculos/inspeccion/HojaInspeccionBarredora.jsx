import { useTechnicians } from "@/hooks/useTechnicians";
import { saveOrUpdateReport } from "@/services/reportService";
import { uploadRegistroImage } from "@/utils/storage";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { useAuth } from "@/context/AuthContext";


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

/* ── IMAGEN BASE BARREDORA ── */
const EQUIPO_IMG_PATH = "/barredora-base.png";

/* ── Lista plana para calcular progreso ── */
const todosLosItems = [
  ...pruebasPrevias.map(([c]) => c),
  ...secciones.flatMap((s) => s.items.map(([c]) => c)),
];

/* ── Tabla de ítems SI / NO / N/A con textarea auto-resize ── */
const TablaItems = ({ lista, items, onItemChange }) => (
  <table className="w-full text-sm border border-collapse">
    <thead className="bg-gray-100">
      <tr>
        <th className="border p-1 w-14 text-center">Artículo</th>
        <th className="border p-1 text-left">Detalle</th>
        <th className="border p-1 w-10 text-center">SI</th>
        <th className="border p-1 w-10 text-center">NO</th>
        <th className="border p-1 w-10 text-center">N/A</th>
        <th className="border p-1 text-left">Observación</th>
      </tr>
    </thead>
    <tbody>
      {lista.map(([codigo, texto]) => (
        <tr key={codigo} className="hover:bg-gray-50">
          <td className="border p-1 text-center font-mono text-xs">{codigo}</td>
          <td className="border p-1">{texto}</td>
          {["SI", "NO", "N/A"].map((op) => (
            <td key={op} className="border p-1 text-center">
              <input
                type="radio"
                name={`${codigo}-estado`}
                checked={items[codigo]?.estado === op}
                onChange={() => onItemChange(codigo, "estado", op)}
                className="cursor-pointer"
              />
            </td>
          ))}
          <td className="border p-1">
            <textarea
              value={items[codigo]?.observacion || ""}
              onChange={(e) => {
                onItemChange(codigo, "observacion", e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              ref={(el) => {
                if (el) {
                  el.style.height = "auto";
                  el.style.height = el.scrollHeight + "px";
                }
              }}
              placeholder="Observaciones..."
              className="w-full border-0 outline-none text-xs p-1 overflow-hidden resize-none min-h-[40px]"
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default function HojaInspeccionBarredora() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const isEditing  = !!id;

  const {
    technicians,
    loading: loadingTechnicians,
  } = useTechnicians();

const sigTecnico = useRef(null);
const sigCliente = useRef(null);

const [guardando, setGuardando]           = useState(false);
const [uploadingCount, setUploadingCount] = useState(0);
const [successMsg, setSuccessMsg]         = useState("");

const uploading = uploadingCount > 0;



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

const [data, setData] = useState(emptyForm);


/* ── CARGAR DESDE SUPABASE ── */
useEffect(() => {
  if (!id) return;

  const load = async () => {
    const { data: reg, error } = await supabase
      .from("registros")
      .select("*")
      .eq("id", id)
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
    }, 300);
  };

  load();
}, [id]);

/* ── AUTO-RELLENAR TÉCNICO LOGUEADO ── */
useEffect(() => {
  if (!user?.email || isEditing || loadingTechnicians) return;

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
]);


/* ── LIMPIAR SCROLL LOCK ── */
useEffect(() => {
  return () => {
    document.body.style.overflow = "";
  };
}, []);

   
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


/* ── PROGRESO ── */
const itemsMarcados = todosLosItems.filter(
  (c) => data.items?.[c]?.estado
).length;

const totalItems = todosLosItems.length;

const progresoPct = Math.round(
  (itemsMarcados / totalItems) * 100
);


/* ── COMPRIMIR Y SUBIR ── */
const compressAndUpload = async (file, folder) => {

  const compressedFile = await imageCompression(file, {
    maxSizeMB: 0.8,
    useWebWorker: true,
    alwaysKeepResolution: true,
    initialQuality: 0.92,
    maxWidthOrHeight: undefined,
    fileType: file.type || "image/jpeg",
  });

  return await uploadRegistroImage(
    compressedFile,
    id || "temp-insp-barredora",
    folder
  );
};

/* ── ESTADO EQUIPO — MÚLTIPLES FOTOS ── */
const handleEstadoUpload = async (files) => {

  const arr = Array.from(files || []);

  if (!arr.length) return;

  setUploadingCount((p) => p + arr.length);

  try {

    for (const file of arr) {

      const url = await compressAndUpload(
        file,
        "estado-equipo"
      );

      if (!url) continue;

      setData((prev) => ({
        ...prev,

        estadoEquipo: {
          ...prev.estadoEquipo,

          imagenes: [
            ...(prev.estadoEquipo?.imagenes || []),

            {
              id: `img-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 6)}`,

              url,
              puntos: [],
            },
          ],
        },
      }));
    }

  } finally {

    setUploadingCount((p) => p - arr.length);
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

  setGuardando(true);

  try {

    const payload = {
      ...data,

      firmas: {
        ...data.firmas,

        tecnico: sigTecnico.current?.isEmpty()
          ? data.firmas?.tecnico || ""
          : sigTecnico.current
              ?.getTrimmedCanvas()
              .toDataURL("image/png"),

        cliente: sigCliente.current?.isEmpty()
          ? data.firmas?.cliente || ""
          : sigCliente.current
              ?.getTrimmedCanvas()
              .toDataURL("image/png"),
      },
    };

    const estadoFinal =
      payload.firmas.tecnico &&
      payload.firmas.cliente
        ? "completado"
        : "borrador";

    await saveOrUpdateReport({
      id: isEditing ? id : null,

      tipo: "inspeccion",
      subtipo: "barredora",

      data: payload,

      estado: estadoFinal,

      user_id: user?.id,
    });

    setSuccessMsg(
      "Inspección guardada correctamente ✅"
    );

    setTimeout(() => {
      navigate("/inspeccion");
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


  /* ─── RENDER ─── */
  const inspeccionLista =
  data.firmas?.tecnico &&
  data.firmas?.cliente;

  return (
    <>
      {/* ── TOAST ── */}
      {successMsg && (
        <div className={`fixed top-6 right-6 px-4 py-3 rounded shadow-lg z-50 text-white transition-all duration-300 ${successMsg.includes("Error") ? "bg-red-600" : "bg-green-600"}`}>
          {successMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-4 text-sm"
      >
        {/* ── BANNER ESTADO ── */}
        <div className={`p-2 rounded text-xs flex items-center justify-between gap-2 ${inspeccionLista ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          <span>{inspeccionLista ? "✔ Inspección lista para completar" : "⚠ Pendiente de firmas para completar"}</span>
          <span className="font-semibold">{progresoPct}% ítems marcados ({itemsMarcados}/{totalItems})</span>
        </div>

        <div id="pdf-inspeccion-barredora" className="print-area space-y-4">

          {/* ── ENCABEZADO ── */}
          <section className="border rounded overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b">
                  <td rowSpan={5} className="w-32 border-r p-3 text-center align-middle">
                    <img src="/astap-logo.jpg" className="mx-auto max-h-20" alt="ASTAP" />
                  </td>
                  <td colSpan={2} className="border-r text-center font-bold py-3 text-base">
                    HOJA DE INSPECCIÓN BARREDORA
                  </td>
                  <td className="p-2 text-xs w-40">
                    <div>Fecha versión: <strong>01-01-26</strong></div>
                    <div>Versión: <strong>01</strong></div>
                  </td>
                </tr>
                {[
                  ["REFERENCIA DE CONTRATO", "referenciaContrato"],
                  ["PEDIDO / DEMANDA",       "pedidoDemanda"],
                  ["DESCRIPCIÓN",            "descripcion"],
                  ["COD. INF.",              "codInf"],
                ].map(([label, name]) => (
                  <tr key={name} className="border-b">
                    <td className="border-r p-2 font-semibold bg-gray-50 w-52">{label}</td>
                    <td colSpan={2} className="p-1">
                      <input
                        name={name}
                 
value={data[name] || ""}

onChange={(e) =>
  update([name], e.target.value)
}

                        className="w-full border-0 outline-none p-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

{/* ── DATOS CLIENTE Y TÉCNICO ── */}
<section className="border rounded p-4">

  <h2 className="font-semibold text-sm mb-3 uppercase">
    Datos del cliente y técnico responsable
  </h2>

  <table className="w-full text-sm border-collapse border">

    <tbody>

      <tr>
        <td className="border p-2 font-semibold bg-gray-50 w-40">
          CLIENTE
        </td>

        <td className="border p-1">
          <input
            value={data.cliente || ""}
            onChange={(e) =>
              update(["cliente"], e.target.value)
            }
            className="w-full border-0 p-1 outline-none"
          />
        </td>

        <td className="border p-2 font-semibold bg-gray-50 w-40">
          DIRECCIÓN
        </td>

        <td className="border p-1">
          <input
            value={data.direccion || ""}
            onChange={(e) =>
              update(["direccion"], e.target.value)
            }
            className="w-full border-0 p-1 outline-none"
          />
        </td>
      </tr>

      <tr>

        <td className="border p-2 font-semibold bg-gray-50">
          CONTACTO
        </td>

        <td className="border p-1">
          <input
            value={data.contacto || ""}
            onChange={(e) =>
              update(["contacto"], e.target.value)
            }
            className="w-full border-0 p-1 outline-none"
          />
        </td>

        <td className="border p-2 font-semibold bg-gray-50">
          TELÉFONO
        </td>

        <td className="border p-1">
          <input
            value={data.telefono || ""}
            onChange={(e) =>
              update(["telefono"], e.target.value)
            }
            className="w-full border-0 p-1 outline-none"
          />
        </td>

      </tr>

      <tr>

        <td className="border p-2 font-semibold bg-gray-50">
          CORREO
        </td>

        <td className="border p-1">
          <input
            value={data.correo || ""}
            onChange={(e) =>
              update(["correo"], e.target.value)
            }
            className="w-full border-0 p-1 outline-none"
          />
        </td>

        <td className="border p-2 font-semibold bg-gray-50">
          TÉCNICO RESPONSABLE
        </td>

        <td className="border p-1">

          <select
            className="w-full border-0 p-1 outline-none bg-white"
            value={data.tecnicoNombre || ""}
            disabled={loadingTechnicians}

            onChange={(e) => {

              const tech = (
                technicians || []
              ).find(
                (t) => t.name === e.target.value
              );

              setData((prev) => ({
                ...prev,

                tecnicoNombre:
                  tech?.name || "",

                tecnicoTelefono:
                  tech?.phone || "",

                tecnicoCorreo:
                  tech?.email || "",
              }));
            }}
          >

            <option value="">
              {loadingTechnicians
                ? "Cargando técnicos..."
                : "Seleccionar técnico"}
            </option>

            {(technicians || []).map((t, i) => (

              <option
                key={t.email || i}
                value={t.name}
              >
                {t.name}
              </option>

            ))}

          </select>

        </td>

      </tr>

      <tr>

        <td className="border p-2 font-semibold bg-gray-50">
          TELÉFONO TÉCNICO
        </td>

        <td className="border p-1">
          <input
            value={data.tecnicoTelefono || ""}
            readOnly
            className="w-full border-0 p-1 outline-none bg-gray-100"
          />
        </td>

        <td className="border p-2 font-semibold bg-gray-50">
          CORREO TÉCNICO
        </td>

        <td className="border p-1">
          <input
            value={data.tecnicoCorreo || ""}
            readOnly
            className="w-full border-0 p-1 outline-none bg-gray-100"
          />
        </td>

      </tr>

      <tr>

        <td className="border p-2 font-semibold bg-gray-50">
          FECHA DE SERVICIO
        </td>

        <td
          colSpan={3}
          className="border p-1"
        >

          <input
            type="date"
            value={data.fechaServicio || ""}
            onChange={(e) =>
              update(
                ["fechaServicio"],
                e.target.value
              )
            }
            className="w-full border-0 p-1 outline-none"
          />

        </td>

      </tr>

    </tbody>

  </table>

</section>
           {/* ── DESCRIPCIÓN DEL EQUIPO ── */}
<section className="border rounded p-4 no-break">

  <h2 className="font-semibold text-center mb-3 uppercase">
    Descripción del equipo
  </h2>

  <table className="w-full text-sm border-collapse border">

    <tbody>

      {[
        ["NOTA",         "nota",        "MARCA",        "marca"],
        ["MODELO",       "modelo",      "N° SERIE",     "serie"],
        ["AÑO MODELO",   "anio",        "VIN / CHASIS", "vin"],
        ["PLACA",        "placa",       "HORAS MÓDULO", "horasModulo"],
        ["HORAS CHASIS", "horasChasis", "KILOMETRAJE",  "kilometraje"],
        ["HORÓMETRO",    "horometro",   null,           null],
      ].map(([l1, f1, l2, f2], i) => (

        <tr key={i}>

          <td className="border p-2 font-semibold bg-gray-50 w-36">
            {l1}
          </td>

          <td className="border p-1">

            <input
              value={data.equipo?.[f1] || ""}
              onChange={(e) =>
                update(
                  ["equipo", f1],
                  e.target.value
                )
              }
              className="w-full border-0 p-1 outline-none"
            />

          </td>

          {l2 ? (
            <>

              <td className="border p-2 font-semibold bg-gray-50 w-36">
                {l2}
              </td>

              <td className="border p-1">

                <input
                  value={data.equipo?.[f2] || ""}
                  onChange={(e) =>
                    update(
                      ["equipo", f2],
                      e.target.value
                    )
                  }
                  className="w-full border-0 p-1 outline-none"
                />

              </td>

            </>
          ) : (
            <td colSpan={2} className="border" />
          )}

        </tr>

      ))}

    </tbody>

  </table>

</section>

{/* ── ESTADO DEL EQUIPO ── */}
<section className="border rounded p-4 space-y-3">

  <h2 className="font-semibold text-sm uppercase">
    Estado del equipo
  </h2>

  {/* IMAGEN BASE */}
  {!(data.estadoEquipo?.imagenes || []).length && (

    <div className="border rounded bg-white p-3">

      <div className="border rounded bg-gray-50 p-3">

        <p className="text-xs text-gray-500 mb-2">
          Vista general del equipo
        </p>

        <div className="flex justify-center">

          <img
            src={EQUIPO_IMG_PATH}
            alt="Estado base barredora"
            className="w-full max-w-[380px] object-contain"
            draggable={false}
          />

        </div>

      </div>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Utilice “Agregar imágenes” para registrar novedades del equipo.
      </p>

    </div>

  )}

  {/* IMÁGENES */}
  <div className="grid grid-cols-1 gap-3">

    {(data.estadoEquipo?.imagenes || []).map((img) => (

      <div
        key={img.id}
        className="border rounded p-2 bg-gray-50 space-y-2"
      >

        {/* IMAGEN */}
        <div
          className="relative border rounded overflow-hidden bg-white flex items-center justify-center cursor-crosshair"
          onClick={(e) => handleEstadoClick(e, img.id)}
        >

          <img
            src={img.url}
            alt="Estado equipo"
            className="w-auto max-w-full max-h-[120px] object-contain mx-auto"
            draggable={false}
          />

          {/* PUNTOS */}
          {(img.puntos || []).map((pt, index) => (

            <div
              key={pt.id}
              onDoubleClick={(e) => {
                e.stopPropagation();
                removePoint(img.id, pt.id);
              }}
              className="absolute bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow cursor-pointer select-none"
              style={{
                left: `${pt.x * 100}%`,
                top: `${pt.y * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
              title="Doble clic para eliminar"
            >
              {index + 1}
            </div>

          ))}
        </div>

        {/* OBSERVACIONES */}
        {(img.puntos || []).length > 0 && (

          <div className="space-y-1">

            {(img.puntos || []).map((pt, index) => (

              <div
                key={pt.id}
                className="flex gap-2 items-start"
              >

                <div className="bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1">
                  {index + 1}
                </div>

                <textarea
                  value={pt.observacion || ""}
                  ref={(el) => {
                    if (el) {
                      el.style.height = "auto";
                      el.style.height =
                        el.scrollHeight + "px";
                    }
                  }}
                  onChange={(e) => {

                    updatePointObs(
                      img.id,
                      pt.id,
                      e.target.value
                    );

                    e.target.style.height = "auto";

                    e.target.style.height =
                      e.target.scrollHeight + "px";
                  }}
                  placeholder={`Observación punto ${index + 1}`}
                  className="w-full border rounded p-1 text-xs resize-none overflow-hidden min-h-[50px]"
                />
              </div>

            ))}

          </div>

        )}

        {/* ELIMINAR */}
        <div className="flex justify-end">

          <button
            type="button"
            onClick={() => removeEstadoImg(img.id)}
            className="text-[11px] text-red-600 hover:underline"
          >
            Eliminar imagen
          </button>

        </div>

      </div>

    ))}

  </div>

  {/* BOTONES */}
  <div className="flex gap-2 pt-1">

    <label
      className={`text-xs px-3 py-2 rounded cursor-pointer ${
        uploading
          ? "bg-gray-300 text-gray-600"
          : "bg-yellow-500 text-black"
      }`}
    >
      📁 Subir fotografías

      <input
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"

        onChange={(e) => {
          handleEstadoUpload(e.target.files);
          e.target.value = null;
        }}

        disabled={uploading}
      />
    </label>

  </div>

</section>


          {/* ── PRUEBAS PREVIAS ── */}
          <section className="border rounded p-4 no-break">
            <h2 className="font-semibold mb-3">
              1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS
            </h2>
            <TablaItems
              lista={pruebasPrevias}
              items={data.items}
              onItemChange={handleItem}
            />
          </section>

          {/* ── SECCIONES A–E ── */}
          <h2 className="font-semibold text-sm px-1">
            2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O SISTEMAS
          </h2>

          {secciones.map((sec) => (
           <section key={sec.id} className="border rounded p-4 no-break">
              <h2 className="font-semibold mb-3">{sec.titulo}</h2>
              <TablaItems
                lista={sec.items}
                items={data.items}
                onItemChange={handleItem}
              />
            </section>
          ))}

           {/* ── CONCLUSIONES ── */}
<section className="border rounded p-4 no-break space-y-3">

  <div className="flex justify-between items-center">

    <h2 className="font-semibold uppercase">
      Conclusiones
    </h2>

    <button
      type="button"
      onClick={() =>
        update(
          ["conclusiones"],
          [...(data.conclusiones || []), ""]
        )
      }
      className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
    >
      + Agregar
    </button>

  </div>

  {(data.conclusiones || []).map((c, i) => (

    <div
      key={i}
      className="flex gap-2"
    >

      <textarea
        value={c}

        onChange={(e) => {

          const arr = [
            ...(data.conclusiones || [])
          ];

          arr[i] = e.target.value;

          update(["conclusiones"], arr);

          e.target.style.height = "auto";

          e.target.style.height =
            e.target.scrollHeight + "px";
        }}

        className="w-full border rounded p-2 text-sm resize-none overflow-hidden min-h-[60px]"

        placeholder={`Conclusión ${i + 1}`}
      />

      {(data.conclusiones || []).length > 1 && (

        <button
          type="button"
          onClick={() => {

            const arr = (
              data.conclusiones || []
            ).filter((_, idx) => idx !== i);

            update(["conclusiones"], arr);
          }}

          className="text-red-600 text-xs"
        >
          ✕
        </button>

      )}

    </div>

  ))}

</section>

           {/* ── RECOMENDACIONES ── */}
<section className="border rounded p-4 no-break space-y-3">

  <div className="flex justify-between items-center">

    <h2 className="font-semibold uppercase">
      Recomendaciones
    </h2>

    <button
      type="button"
      onClick={() =>
        update(
          ["recomendaciones"],
          [...(data.recomendaciones || []), ""]
        )
      }
      className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
    >
      + Agregar
    </button>

  </div>

  {(data.recomendaciones || []).map((r, i) => (

    <div
      key={i}
      className="flex gap-2"
    >

      <textarea
        value={r}

        onChange={(e) => {

          const arr = [
            ...(data.recomendaciones || [])
          ];

          arr[i] = e.target.value;

          update(["recomendaciones"], arr);

          e.target.style.height = "auto";

          e.target.style.height =
            e.target.scrollHeight + "px";
        }}

        className="w-full border rounded p-2 text-sm resize-none overflow-hidden min-h-[60px]"

        placeholder={`Recomendación ${i + 1}`}
      />

      {(data.recomendaciones || []).length > 1 && (

        <button
          type="button"
          onClick={() => {

            const arr = (
              data.recomendaciones || []
            ).filter((_, idx) => idx !== i);

            update(["recomendaciones"], arr);
          }}

          className="text-red-600 text-xs"
        >
          ✕
        </button>

      )}

    </div>

  ))}

</section>

           {/* ── NOTA FINAL ── */}
<section className="border rounded p-4 no-break">

  <h2 className="font-semibold mb-2 uppercase">
    Nota / Observación final del técnico
  </h2>

  <textarea
    value={data.notaFinal || ""}

    onChange={(e) => {

      update(
        ["notaFinal"],
        e.target.value
      );

      e.target.style.height = "auto";

      e.target.style.height =
        e.target.scrollHeight + "px";
    }}

    placeholder="Escriba aquí cualquier observación general, novedad adicional o comentario de cierre..."

    className="w-full border rounded p-2 text-sm outline-none overflow-hidden resize-none min-h-[80px]"
  />

</section>

           {/* ── FIRMAS ── */}
<table className="pdf-table w-full no-break">

  <thead>

    <tr>

      <th className="border p-2 text-center">
        FIRMA TÉCNICO ASTAP
      </th>

      <th className="border p-2 text-center">
        FIRMA CLIENTE
      </th>

    </tr>

  </thead>

  <tbody>

    <tr>

      {/* TÉCNICO */}
      <td
        className="border p-2 align-top"
       style={{ height: 85 }}
      >

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
           className:
  "w-full h-20 border rounded touch-none bg-white"
          }}
        />

        <div className="text-center mt-1">

          <button
            type="button"
            onClick={() =>
              sigTecnico.current?.clear()
            }
            className="text-xs text-red-600 hover:underline"
          >
            Borrar firma
          </button>

        </div>

        <input
          value={data.tecnicoNombre || ""}
          readOnly
          className="w-full border mt-2 text-xs p-1 bg-gray-100 rounded"
        />

      </td>

      {/* CLIENTE */}
      <td
        className="border p-2 align-top"
        style={{ height: 85 }}
      >

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
           className:
  "w-full h-20 border rounded touch-none bg-white"
          }}
        />

        <div className="text-center mt-1">

          <button
            type="button"
            onClick={() =>
              sigCliente.current?.clear()
            }
            className="text-xs text-red-600 hover:underline"
          >
            Borrar firma
          </button>

        </div>

        <input
          value={data.cliente || ""}
          readOnly
          className="w-full border mt-2 text-xs p-1 bg-gray-100 rounded"
        />

        <input
          placeholder="Cédula cliente"

          value={
            data.firmas?.clienteCedula || ""
          }

          onChange={(e) =>
            update(
              ["firmas", "clienteCedula"],
              e.target.value
            )
          }

          className="w-full border mt-1 text-xs p-1 rounded"
        />

      </td>

    </tr>

  </tbody>

</table>

           
</div>{/* fin pdf-container */}

         {/* ── ACCIONES ── */}
<div className="flex justify-between gap-4 pt-2">

  <button
    type="button"
    onClick={() => navigate("/inspeccion")}
    className="border px-4 py-2 rounded hover:bg-gray-50 transition"
  >
    Volver
  </button>

  <button
    type="submit"

    disabled={uploading || guardando}

    className={`px-4 py-2 rounded text-white transition ${
      uploading || guardando
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }`}
  >

    {uploading
      ? "Subiendo imágenes..."
      : guardando
        ? "Guardando..."
        : inspeccionLista
          ? "Guardar y completar"
          : "Guardar borrador"}

  </button>

</div>

</form>

</>

);
}
