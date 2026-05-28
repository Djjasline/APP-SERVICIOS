import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { useTechnicians } from "@/hooks/useTechnicians";
import { saveOrUpdateReport } from "@/services/reportService";
import { uploadRegistroImage } from "@/utils/storage";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import imageCompression from "browser-image-compression";

/* ═══════════════════════════════════════
   SECCIONES – BARREDORA
═══════════════════════════════════════ */
const secciones = [
  {
    id: "1",
    titulo: "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    tipo: "simple",
    items: [
      ["1.1", "Encendido general del equipo"],
      ["1.2", "Funcionamiento de controles y tablero"],
      ["1.3", "Revisión de alarmas o fallas"],
    ],
  },
  {
    id: "2",
    titulo: "2. RECAMBIO DE ELEMENTOS DE LOS SISTEMAS DEL MÓDULO",
    tipo: "cantidad",
    items: [
      ["2.1",  "Filtro de combustible primario (trampa de agua)"],
      ["2.2",  "Filtro de combustible secundario (bomba)"],
      ["2.3",  "Aceite de motor 15W40 (4 GL)"],
      ["2.4",  "Filtro de aceite de motor"],
      ["2.5",  "Filtro de aire primario interno"],
      ["2.6",  "Filtro de aire secundario exterior"],
      ["2.7",  "Reemplazo de filtros de combustible"],
      ["2.8",  "Comprobación tensión tensor de correa y desgaste de banda"],
      ["2.9",  "Reemplazo de aceite de motor"],
      ["2.10", "Reemplazo filtro de aceite de motor"],
      ["2.11", "Mantenimiento por 250 Hrs"],
      ["2.12", "Mano de obra mantenimiento por 1000 Hrs motor"],
      ["2.13", "Inspección visual de bomba de agua"],
      ["2.14", "Verificación manguera respiradero cárter y válvula"],
      ["2.15", "Calibración de válvulas del motor"],
      ["2.16", "Cambio de empaque tapa de válvulas"],
      ["2.17", "Limpieza de inyectores por método de recirculación"],
      ["2.18", "Reemplazo de termostato"],
      ["2.19", "Cambio de refrigerante"],
      ["2.20", "Reemplazo de filtros de aire"],
      ["2.21", "Aceite hidráulico AW 68"],
      ["2.22", "Kit filtro hidráulico"],
      ["2.23", "Aceite sintético SHC 629 cubo de ruedas"],
      ["2.24", "Filtro de aire acondicionado"],
      ["2.25", "Refrigerante JD tanque 2 1/2 gal"],
      ["2.26", "Grasa JD multipropósito"],
      ["2.27", "Termostato"],
      ["2.28", "Empaque tapa de válvula"],
      ["2.29", "Junta del termostato"],
      ["2.30", "Elemento filtrante"],
      ["2.31", "Aditivo limpieza de inyectores"],
      ["2.32", "Set segmento cepillo lateral"],
      ["2.33", "Cepillo central"],
      ["2.34", "Caucho zapata lateral"],
      ["2.35", "Caucho zapata esquinera"],
      ["2.36", "Cadena banda transportadora"],
      ["2.37", "Piñón hidromotor banda transportadora"],
      ["2.38", "Piñón rodillo superior banda"],
      ["2.39", "Filtro de agua"],
      ["2.40", "Chumacera eje cepillo"],
      ["2.41", "Chumacera rodillo superior"],
      ["2.42", "Chumacera eje inferior banda"],
      ["2.43", "Banda transportadora"],
    ],
  },
  {
    id: "3",
    titulo: "3. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, POST SERVICIO",
    tipo: "simple",
    items: [
      ["3.1", "Encendido general del equipo"],
      ["3.2", "Funcionamiento del sistema de barrido"],
      ["3.3", "Funcionamiento del sistema hidráulico"],
    ],
  },
];

/* Ítems fijos para calcular progreso */
const todosLosItemsFijos = secciones.flatMap((s) => s.items.map(([c]) => c));

/* ═══════════════════════════════════════
   ESTADO INICIAL
═══════════════════════════════════════ */
const emptyForm = {
  referenciaContrato: "", pedidoDemanda: "", descripcion: "", codInf: "",
  cliente: "", direccion: "", contacto: "", telefono: "", correo: "",
  fechaServicio: "",
  tecnicoNombre: "", tecnicoTelefono: "", tecnicoCorreo: "",
  equipo: {
    nota: "", marca: "", modelo: "", serie: "",
    anio: "", vin: "", placa: "",
    horasModulo: "", horasChasis: "", kilometraje: "",
  },
  estadoEquipo: { imagenes: [] },
  items: {},
  notaFinal: "",
  firmas: { tecnico: "", cliente: "", clienteCedula: "" },
};

/* ═══════════════════════════════════════
   COMPONENTE
═══════════════════════════════════════ */
export default function HojaMantenimientoBarredora() {
  const { id }    = useParams();
  const navigate  = useNavigate();
 const { user, isSuperAdmin } = useAuth();

const superAdminActivo =
  typeof isSuperAdmin === "function"
    ? isSuperAdmin()
    : !!isSuperAdmin;
  const isEditing = !!id;

  const { technicians, loading: loadingTecnicos } = useTechnicians();

  const sigTecnico = useRef(null);
  const sigCliente = useRef(null);

  const [data, setData]                     = useState(emptyForm);
  const [guardando, setGuardando]           = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [successMsg, setSuccessMsg]         = useState("");
  const [firmaTecnicoEditada, setFirmaTecnicoEditada] = useState(false);
  const [firmaClienteEditada, setFirmaClienteEditada] = useState(false);  
  const uploading = uploadingCount > 0;

  /* ── PROGRESO ── */
  const itemsMarcados    = todosLosItemsFijos.filter((c) => data.items[c]?.estado).length;
  const totalItems       = todosLosItemsFijos.length;
  const progresoPct      = Math.round((itemsMarcados / totalItems) * 100);
  const mantenimientoListo =
  !!(
    sigTecnico.current?.isEmpty?.() === false ||
    data.firmas?.tecnico
  ) &&
  !!(
    sigCliente.current?.isEmpty?.() === false ||
    data.firmas?.cliente
  );

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
        .from("registros").select("*").eq("id", id).single();
      if (error || !reg) return;

      const d = { ...emptyForm, ...(reg.data || {}) };
      d.equipo = { ...emptyForm.equipo, ...(reg.data?.equipo || {}) };
      d.firmas = { ...emptyForm.firmas, ...(reg.data?.firmas || {}) };
      d.estadoEquipo = {
        imagenes: Array.isArray(reg.data?.estadoEquipo?.imagenes)
          ? reg.data.estadoEquipo.imagenes.map((img, i) => ({
              id:     img?.id  || `img-${i}`,
              url:    img?.url || "",
              puntos: Array.isArray(img?.puntos)
                ? img.puntos.map((p, j) => ({
                    id: p?.id || `p-${i}-${j}`,
                    x:  p?.x  ?? 0,
                    y:  p?.y  ?? 0,
                    observacion: p?.observacion || "",
                  }))
                : [],
            }))
          : [],
      };
      setData(d);

      setTimeout(() => {
        if (reg.data?.firmas?.tecnico) sigTecnico.current?.fromDataURL(reg.data.firmas.tecnico);
        if (reg.data?.firmas?.cliente) sigCliente.current?.fromDataURL(reg.data.firmas.cliente);
      }, 300);
    };
    load();
  }, [id]);

  /* ── AUTO-RELLENAR TÉCNICO LOGUEADO ── */
  useEffect(() => {
    if (!user?.email || isEditing || loadingTecnicos) return;

    const loggedTech = (technicians || []).find((t) => {
      const email = t.email || t.correo || "";
      return email.toLowerCase() === user.email.toLowerCase();
    });

    if (!loggedTech) return;

    setData((prev) => ({
      ...prev,
      tecnicoNombre:   loggedTech.name     || loggedTech.nombre  || "",
      tecnicoTelefono: loggedTech.phone    || loggedTech.telefono || "",
      tecnicoCorreo:   loggedTech.email    || loggedTech.correo   || "",
    }));
  }, [user?.email, isEditing, loadingTecnicos, technicians]);

  /* ── LIMPIAR SCROLL LOCK ── */
  useEffect(() => {
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* ── COMPRIMIR Y SUBIR ── */
  const compressAndUpload = async (file, folder = "estado-equipo") => {
const compressed = await imageCompression(file, {
  maxSizeMB: 0.18,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
  fileType: "image/jpeg",
  initialQuality: 0.7,
  exifOrientation: 1,
});
    return await uploadRegistroImage(compressed, id || "temp-mant-barredora", folder);
  };

 /* ── ESTADO EQUIPO — IMÁGENES ── */
const handleEstadoUpload = async (files) => {
  const arr = Array.from(files || []);
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

        if (actuales.some((img) => img.url === url)) return prev;

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

const removeEstadoImg = (imgId) =>
  setData((prev) => ({
    ...prev,
    estadoEquipo: {
      ...prev.estadoEquipo,
      imagenes: (prev.estadoEquipo?.imagenes || []).filter(
        (i) => i.id !== imgId
      ),
    },
  }));

const handleEstadoClick = (e, imgId) => {
  const r = e.currentTarget.getBoundingClientRect();
  const x = Number(((e.clientX - r.left) / r.width).toFixed(4));
  const y = Number(((e.clientY - r.top) / r.height).toFixed(4));

  setData((prev) => ({
    ...prev,
    estadoEquipo: {
      ...prev.estadoEquipo,
      imagenes: (prev.estadoEquipo?.imagenes || []).map((img) =>
        img.id === imgId
          ? {
              ...img,
              puntos: [
                ...(img.puntos || []),
                {
                  id: `p-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 6)}`,
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

const removePoint = (imgId, ptId) =>
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

const updatePointObs = (imgId, ptId, value) =>
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

  /* ── ÍTEMS SECCIONES ── */
  const handleItem = (codigo, campo, valor) =>
    setData((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [codigo]: { ...(prev.items?.[codigo] || {}), [campo]: valor },
      },
    }));

  /* ── GUARDAR ── */
  const handleGuardar = async () => {
    if (uploading)           { alert("Espera que terminen de subir las imágenes"); return; }
    if (!data.cliente)       { alert("Cliente es obligatorio"); return; }
    if (!data.tecnicoNombre) { alert("Técnico es obligatorio"); return; }
    if (!data.fechaServicio) { alert("Fecha de servicio es obligatoria"); return; }

    setGuardando(true);
    try {
const firmaTecnico =
  firmaTecnicoEditada && sigTecnico.current?.isEmpty?.() === false
    ? sigTecnico.current.toDataURL()
    : data.firmas?.tecnico || "";

const firmaCliente =
  firmaClienteEditada && sigCliente.current?.isEmpty?.() === false
    ? sigCliente.current.toDataURL()
    : data.firmas?.cliente || "";

      const estadoFinal = firmaTecnico && firmaCliente ? "completado" : "borrador";

const result = await saveOrUpdateReport({
  id: isEditing ? id : null,

  area: "vehiculos",

  tipo: "mantenimiento",
  subtipo: "barredora",

  data: {
    ...data,
    firmas: {
      tecnico: firmaTecnico,
      cliente: firmaCliente,
      clienteCedula: data.firmas?.clienteCedula || "",
    },
  },

  estado: estadoFinal,
});

      setSuccessMsg(
        estadoFinal === "completado" ? "Mantenimiento completado ✅" : "Borrador guardado ✅"
      );
      setTimeout(() => {
        if (!isEditing && result?.id) navigate(`/mantenimiento/barredora/${result.id}`);
        else navigate("/mantenimiento");
      }, 1200);
    } catch (err) {
      console.error(err);
      setSuccessMsg("Error al guardar ❌");
      setTimeout(() => setSuccessMsg(""), 3000);
    } finally { setGuardando(false); }
  };

  /* ═══════════════════════════════════════
     RENDER
  ═══════════════════════════════════════ */
  return (
    <>
      {/* TOAST */}
      {successMsg && (
        <div
          className={`fixed top-6 right-6 px-4 py-3 rounded shadow-lg z-50 text-white transition-all ${
            successMsg.includes("Error") ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {successMsg}
        </div>
      )}

      <div className="p-3 md:p-6 bg-gray-100 min-h-screen">
        <div className="bg-white p-4 md:p-6 rounded shadow w-full max-w-screen-xl mx-auto space-y-6">

          {/* ── BANNER PROGRESO ── */}
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

          {/* ══ 1. ENCABEZADO ══ */}
          <table className="pdf-table w-full">
            <tbody>
              <tr>
                <td rowSpan={5} style={{ width: 130, verticalAlign: "middle", textAlign: "center" }}>
                  <img
                    src="/astap-logo.jpg"
                    alt="ASTAP"
                    className="object-contain mx-auto"
                    style={{ maxHeight: 90 }}
                  />
                </td>
                <td
                  colSpan={2}
                  style={{ textAlign: "center", fontWeight: "bold", fontSize: 16, verticalAlign: "middle" }}
                >
                  HOJA DE MANTENIMIENTO BARREDORA
                </td>
                <td className="text-[10px]" style={{ width: 160 }}>
                  <div>Fecha versión: <strong>01-01-26</strong></div>
                  <div>Versión: <strong>01</strong></div>
                </td>
              </tr>
              {[
                ["REFERENCIA DE CONTRATO", "referenciaContrato"],
                ["PEDIDO / DEMANDA",       "pedidoDemanda"],
                ["DESCRIPCIÓN",            "descripcion"],
                ["CÓDIGO INFORME",         "codInf"],
              ].map(([label, key]) => (
                <tr key={key}>
                  <td className="pdf-label">{label}</td>
                  <td colSpan={2}>
                    <input
                      className="pdf-input w-full"
                      value={data[key]}
                      onChange={(e) => update([key], e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ 2. DATOS CLIENTE / TÉCNICO ══ */}
          <h3 className="font-bold text-sm border-b pb-1">
            DATOS DEL CLIENTE Y TÉCNICO RESPONSABLE
          </h3>
          <table className="pdf-table w-full">
            <tbody>
              <tr>
                <td className="pdf-label">CLIENTE</td>
                <td>
                  <input className="pdf-input w-full" value={data.cliente}
                    onChange={(e) => update(["cliente"], e.target.value)} />
                </td>
                <td className="pdf-label">DIRECCIÓN</td>
                <td>
                  <input className="pdf-input w-full" value={data.direccion}
                    onChange={(e) => update(["direccion"], e.target.value)} />
                </td>
              </tr>
              <tr>
                <td className="pdf-label">CONTACTO</td>
                <td>
                  <input className="pdf-input w-full" value={data.contacto}
                    onChange={(e) => update(["contacto"], e.target.value)} />
                </td>
                <td className="pdf-label">TELÉFONO</td>
                <td>
                  <input className="pdf-input w-full" value={data.telefono}
                    onChange={(e) => update(["telefono"], e.target.value)} />
                </td>
              </tr>
              <tr>
                <td className="pdf-label">CORREO</td>
                <td>
                  <input className="pdf-input w-full" value={data.correo}
                    onChange={(e) => update(["correo"], e.target.value)} />
                </td>
                <td className="pdf-label">TÉCNICO RESPONSABLE</td>
                <td>
                  <select
                    className="pdf-input w-full"
                    value={data.tecnicoNombre || ""}
                   disabled={loadingTecnicos || !superAdminActivo}
                    onChange={(e) => {
                      const t = (technicians || []).find((x) => {
                        const nombre = x.name || x.nombre || "";
                        return nombre === e.target.value;
                      });
                      update(["tecnicoNombre"],   t?.name     || t?.nombre   || "");
                      update(["tecnicoTelefono"], t?.phone    || t?.telefono || "");
                      update(["tecnicoCorreo"],   t?.email    || t?.correo   || "");
                    }}
                  >
                    <option value="">
                      {loadingTecnicos ? "Cargando..." : "Seleccionar técnico"}
                    </option>
                    {(technicians || []).map((t, i) => {
                      const nombre = t.name || t.nombre || "";
                      const correo = t.email || t.correo || "";
                      return (
                        <option key={correo || i} value={nombre}>{nombre}</option>
                      );
                    })}
                  </select>
                </td>
              </tr>
              <tr>
                <td className="pdf-label">TELÉFONO TÉCNICO</td>
                <td>
                  <input className="pdf-input w-full bg-gray-100" value={data.tecnicoTelefono} readOnly />
                </td>
                <td className="pdf-label">CORREO TÉCNICO</td>
                <td>
                  <input className="pdf-input w-full bg-gray-100" value={data.tecnicoCorreo} readOnly />
                </td>
              </tr>
              <tr>
                <td className="pdf-label">FECHA DE SERVICIO</td>
                <td colSpan={3}>
                  <input type="date" className="pdf-input w-full" value={data.fechaServicio}
                    onChange={(e) => update(["fechaServicio"], e.target.value)} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ 3. DESCRIPCIÓN DEL EQUIPO ══ */}
          <h3 className="font-bold text-sm border-b pb-1">DESCRIPCIÓN DEL EQUIPO</h3>
          <table className="pdf-table w-full">
            <thead>
              <tr>
                <th colSpan={4} style={{ textAlign: "center" }}>DESCRIPCIÓN DEL EQUIPO</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["NOTA",         "nota"],    ["MARCA",        "marca"],
                ["MODELO",       "modelo"],  ["N° SERIE",     "serie"],
                ["AÑO MODELO",   "anio"],    ["VIN / CHASIS", "vin"],
                ["PLACA",        "placa"],   ["HORAS MÓDULO", "horasModulo"],
                ["HORAS CHASIS", "horasChasis"], ["KILOMETRAJE", "kilometraje"],
              ].reduce((rows, field, idx, arr) => {
                if (idx % 2 === 0) {
                  const next = arr[idx + 1];
                  rows.push(
                    <tr key={field[1]}>
                      <td className="pdf-label">{field[0]}</td>
                      <td>
                        <input className="pdf-input w-full"
                          value={data.equipo[field[1]] || ""}
                          onChange={(e) => update(["equipo", field[1]], e.target.value)} />
                      </td>
                      {next ? (
                        <>
                          <td className="pdf-label">{next[0]}</td>
                          <td>
                            <input className="pdf-input w-full"
                              value={data.equipo[next[1]] || ""}
                              onChange={(e) => update(["equipo", next[1]], e.target.value)} />
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

          {/* ══ 4. ESTADO DEL EQUIPO ══ */}
          <h3 className="font-bold text-sm border-b pb-1">ESTADO DEL EQUIPO</h3>
          <div className="border rounded bg-white p-3 space-y-4 print:block">
            <div className="flex gap-2">
              <label className="bg-gray-600 text-white text-xs px-3 py-2 rounded cursor-pointer hover:bg-gray-700">
                📁 Subir fotografías
                <input type="file" accept="image/*" multiple style={{ display: "none" }}
                  onChange={(e) => { handleEstadoUpload(e.target.files); e.target.value = null; }} />
              </label>
              <label className="bg-blue-600 text-white text-xs px-3 py-2 rounded cursor-pointer hover:bg-blue-700">
                📷 Tomar fotos
                <input type="file" accept="image/*" capture="environment" multiple style={{ display: "none" }}
                  onChange={(e) => { handleEstadoUpload(e.target.files); e.target.value = null; }} />
              </label>
              {uploading && (
                <span className="text-xs text-gray-500 self-center">
                  Subiendo {uploadingCount} imagen(es)…
                </span>
              )}
            </div>

            {(data.estadoEquipo?.imagenes || []).length === 0 ? (
              <div className="border rounded bg-gray-50 h-[120px] flex items-center justify-center text-sm text-gray-400">
                Sin fotografías cargadas
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 print:block">
                {(data.estadoEquipo?.imagenes || []).map((img, idx) => (
                  <div key={img.id} className="border rounded p-2 bg-gray-50 space-y-2 mb-3 print:mb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600">Imagen {idx + 1}</span>
                      <button type="button" onClick={() => removeEstadoImg(img.id)}
                        className="text-[11px] text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50">
                        Eliminar foto
                      </button>
                    </div>
                    <div className="relative border rounded overflow-hidden bg-white flex items-center justify-center">
                      <img src={img.url} alt={`estado-${idx + 1}`}
                        className="w-auto max-w-full max-h-[320px] object-contain cursor-crosshair mx-auto"
                        onClick={(e) => handleEstadoClick(e, img.id)} />
                      {(img.puntos || []).map((p, pi) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => removePoint(img.id, p.id)}
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
                      Toque la fotografía para marcar puntos. Toque el número para eliminar.
                    </p>
                    {(img.puntos || []).map((p, pi) => (
                      <div key={p.id} className="flex items-start gap-2">
                        <span className="text-sm text-gray-700 pt-2 min-w-[24px]">{pi + 1})</span>
                        <input className="pdf-input w-full"
                          placeholder={`Observación punto ${pi + 1}`}
                          value={p.observacion}
                          onChange={(e) => updatePointObs(img.id, p.id, e.target.value)} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══ 5. SECCIONES DE MANTENIMIENTO ══ */}
          {secciones.map((sec) => (
            <section key={sec.id}>
              <h3 className="font-bold text-xs border-b pb-1 mb-2">{sec.titulo}</h3>
              <table className="pdf-table w-full">
                <thead>
                  <tr>
                    <th className="text-left" style={{ width: 50 }}>ÍTEM</th>
                    <th className="text-left">DETALLE</th>
                    {sec.tipo === "cantidad" && <th style={{ width: 80 }}>CANTIDAD</th>}
                    <th style={{ width: 40 }}>SI</th>
                    <th style={{ width: 40 }}>NO</th>
                    <th className="text-left">OBSERVACIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {sec.items.map(([codigo, texto]) => (
                    <tr key={codigo} className="hover:bg-gray-50">
                      <td className="pdf-label">{codigo}</td>
                      <td style={{ border: "1px solid #d1d5db", padding: "4px 8px", fontSize: 12 }}>
                        {texto}
                      </td>
                      {sec.tipo === "cantidad" && (
                        <td style={{ border: "1px solid #d1d5db", padding: "4px", textAlign: "center" }}>
                          <input
                            type="number"
                            className="pdf-input w-16 text-center"
                            value={data.items?.[codigo]?.cantidad || ""}
                            onChange={(e) => handleItem(codigo, "cantidad", e.target.value)}
                          />
                        </td>
                      )}
                      <td style={{ border: "1px solid #d1d5db", padding: "4px", width: 40, textAlign: "center" }}>
                        <input
                          type="radio"
                          name={`e-${codigo}`}
                          checked={data.items?.[codigo]?.estado === "SI"}
                          onChange={() => handleItem(codigo, "estado", "SI")}
                        />
                      </td>
                      <td style={{ border: "1px solid #d1d5db", padding: "4px", width: 40, textAlign: "center" }}>
                        <input
                          type="radio"
                          name={`e-${codigo}`}
                          checked={data.items?.[codigo]?.estado === "NO"}
                          onChange={() => handleItem(codigo, "estado", "NO")}
                        />
                      </td>
                      <td style={{ border: "1px solid #d1d5db", padding: "2px 4px" }}>
                        <textarea
                          value={data.items?.[codigo]?.observacion || ""}
                          onChange={(e) => {
                            handleItem(codigo, "observacion", e.target.value);
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
                          className="w-full border-0 outline-none text-xs p-1 overflow-hidden resize-none min-h-[34px]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}

          {/* ══ 6. NOTA FINAL ══ */}
          <h3 className="font-bold text-sm border-b pb-1">
            NOTA / OBSERVACIÓN FINAL DEL TÉCNICO
          </h3>
          <textarea
            value={data.notaFinal || ""}
            onChange={(e) => {
              update(["notaFinal"], e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            ref={(el) => {
              if (el) {
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }
            }}
            placeholder="Escriba aquí cualquier observación general, novedad adicional o comentario de cierre..."
            className="w-full border rounded p-2 text-sm outline-none overflow-hidden resize-none min-h-[80px]"
          />

          {/* ══ 7. FIRMAS ══ */}
          <table className="pdf-table w-full">
            <thead>
              <tr>
                <th>FIRMA TÉCNICO ASTAP</th>
                <th>FIRMA CLIENTE / CONTACTO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* TÉCNICO */}
                <td className="align-top" style={{ height: 190 }}>
                  <div className="border rounded bg-white h-[120px]">
                    <SignatureCanvas
                      ref={sigTecnico}
                      penColor="black"
                      minWidth={0.5}
                      maxWidth={1.5}
                      onBegin={() => {
  setFirmaTecnicoEditada(true);
  document.body.style.overflow = "hidden";
}}
                      onEnd={() => { document.body.style.overflow = ""; }}
                      canvasProps={{ className: "w-full h-full touch-none" }}
                    />
                  </div>
                  <div className="mt-2 text-sm text-center font-medium">
                    {data.tecnicoNombre || "—"}
                  </div>
                  <div className="text-center">
                    <button type="button" 
                       onClick={() => {
  sigTecnico.current?.clear();
  setFirmaTecnicoEditada(true);
  setData((prev) => ({
    ...prev,
    firmas: { ...prev.firmas, tecnico: "" },
  }));
}}
                      className="text-xs text-red-600 mt-1 hover:underline">
                      Borrar firma
                    </button>
                  </div>
                </td>

                {/* CLIENTE */}
                <td className="align-top" style={{ height: 190 }}>
                  <div className="border rounded bg-white h-[120px]">
                    <SignatureCanvas
                      ref={sigCliente}
                      penColor="black"
                      minWidth={0.5}
                      maxWidth={1.5}
                      onBegin={() => {
  setFirmaClienteEditada(true);
  document.body.style.overflow = "hidden";
}}
                      onEnd={() => { document.body.style.overflow = ""; }}
                      canvasProps={{ className: "w-full h-full touch-none" }}
                    />
                  </div>
                  <div className="mt-2 space-y-1 text-center">
                    <input
                      className="pdf-input w-full bg-gray-100"
                      value={data.contacto}
                      readOnly
                      placeholder="Nombre del contacto"
                    />
                    <input
                      className="pdf-input w-full"
                      value={data.firmas?.clienteCedula || ""}
                      onChange={(e) => update(["firmas", "clienteCedula"], e.target.value)}
                      placeholder="Número de cédula del cliente"
                    />
                  </div>
                  <div className="text-center">
                    <button type="button" 
                       onClick={() => {
  sigCliente.current?.clear();
  setFirmaClienteEditada(true);
  setData((prev) => ({
    ...prev,
    firmas: { ...prev.firmas, cliente: "" },
  }));
}}
                      className="text-xs text-red-600 mt-1 hover:underline">
                      Borrar firma
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ 8. BOTONES ══ */}
          <div className="flex flex-col md:flex-row justify-between gap-3 pt-4">
            <button type="button" onClick={() => navigate("/mantenimiento")}
              className="border px-6 py-2 rounded hover:bg-gray-50 transition">
              ← Volver
            </button>
            <div className="flex gap-3">
              {isEditing && mantenimientoListo && (
                <button type="button"
                  onClick={() => navigate(`/mantenimiento/barredora/${id}/pdf`)}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
                  Ver PDF
                </button>
              )}
              <button type="button" onClick={handleGuardar}
                disabled={guardando || uploading}
                className={`px-6 py-2 rounded text-white transition ${
                  guardando || uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}>
                {guardando
                  ? "Guardando..."
                  : uploading
                  ? `Subiendo (${uploadingCount})...`
                  : mantenimientoListo
                  ? "Guardar y completar"
                  : isEditing
                  ? "Actualizar borrador"
                  : "Guardar borrador"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
