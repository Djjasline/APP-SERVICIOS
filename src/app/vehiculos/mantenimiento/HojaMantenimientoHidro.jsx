import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { TECHNICIANS } from "@/data/technicians";
import { saveOrUpdateReport } from "@/services/reportService";
import { uploadRegistroImage } from "@/utils/storage";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";

/* =============================
   SECCIONES
============================= */
const secciones = [
  {
    id: "1",
    titulo: "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    tipo: "simple",
    items: [
      ["1.1", "Prueba de encendido general del equipo"],
      ["1.2", "Verificación de funcionamiento de controles principales"],
      ["1.3", "Revisión de alarmas o mensajes de fallo"],
    ],
  },
  {
    id: "2",
    titulo: "2. RECAMBIO DE ELEMENTOS DE LOS SISTEMAS DEL MÓDULO HIDROSUCCIONADOR",
    tipo: "cantidad",
    items: [
      ["2.1",  "Tapón de expansión PN 45731-30"],
      ["2.2",  "Empaque externo tapa filtro en Y 3\" PN 41272-30"],
      ["2.3",  "Empaque externo tapa filtro en Y 3\" New Model PN 513726A-30"],
      ["2.4",  "Empaque interno tapa filtro en Y 3\" New Model PN 513726B-31"],
      ["2.5",  "Empaque interno tapa filtro en Y 3\" PN 41271-30"],
      ["2.6",  "Empaque filtro de agua Y 2\" PN 46137-30"],
      ["2.7",  "Empaque filtro de agua Y 2\" PN 46138-30"],
      ["2.8",  "Malla filtro de agua 2\" PN 45803-30"],
      ["2.9",  "O-Ring válvula check 2\" PN 29674-30"],
      ["2.10", "O-Ring válvula check 3\" PN 29640-30"],
      ["2.11", "Malla filtro de agua 3\" PN 41280-30"],
      ["2.12", "Filtro aceite hidráulico cartucho New Model PN 514335-30"],
      ["2.13", "Filtro aceite hidráulico cartucho PN 1099061"],
      ["2.14", "Aceite caja transferencia 80W90 (galones)"],
      ["2.15", "Aceite soplador ISO 220 (galones)"],
      ["2.16", "Aceite hidráulico AW 46 (galones)"],
    ],
  },
  {
    id: "3",
    titulo: "3. SERVICIOS DE MÓDULO HIDROSUCCIONADOR",
    tipo: "simple",
    items: [
      ["3.1", "Sistema de diálisis para limpieza de impurezas del sistema hidráulico"],
      ["3.2", "Limpieza de bomba Rodder y cambio de elementos"],
      ["3.3", "Inspección válvula paso de agua a bomba Rodder"],
    ],
  },
  {
    id: "4",
    titulo: "4. OTROS (ESPECIFICAR)",
    tipo: "otros",
    items: ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6"],
  },
  {
    id: "5",
    titulo: "5. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, POSTERIOR AL SERVICIO",
    tipo: "simple",
    items: [
      ["5.1", "Encendido general del equipo"],
      ["5.2", "Verificación de presiones de trabajo"],
      ["5.3", "Funcionamiento de sistemas hidráulicos"],
      ["5.4", "Funcionamiento de sistema de succión"],
      ["5.5", "Funcionamiento de sistema de agua"],
    ],
  },
];

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
    nota: "", marca: "", modelo: "", serie: "",
    anio: "", vin: "", placa: "",
    horasModulo: "", horasChasis: "", kilometraje: "",
  },
  estadoEquipo: { imagenes: [] },
  items: {},
  firmas: { tecnico: "", cliente: "" },
};

export default function HojaMantenimientoHidro() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const isEditing  = !!id;

  const sigTecnico = useRef(null);
  const sigCliente = useRef(null);

  const [data, setData]                   = useState(emptyForm);
  const [guardando, setGuardando]         = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
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
        .single();

      if (error || !reg) return;

      const d = { ...emptyForm, ...(reg.data || {}) };
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

  /* ── COMPRIMIR Y SUBIR ── */
  const compressAndUpload = async (file, folder = "estado-equipo") => {
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.25, maxWidthOrHeight: 1024,
      useWebWorker: true, fileType: "image/jpeg", initialQuality: 0.7,
    });
    return await uploadRegistroImage(compressed, id || "temp-hidro", folder);
  };

  /* ── ESTADO EQUIPO — IMÁGENES ── */
  const handleEstadoUpload = async (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    setUploadingCount((p) => p + arr.length);
    try {
      for (const file of arr) {
        const url = await compressAndUpload(file, "estado-equipo");
        if (!url) continue;
        setData((prev) => ({
          ...prev,
          estadoEquipo: {
            ...prev.estadoEquipo,
            imagenes: [
              ...(prev.estadoEquipo?.imagenes || []),
              { id: `img-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, url, puntos: [] },
            ],
          },
        }));
      }
    } finally {
      setUploadingCount((p) => p - arr.length);
    }
  };

  const removeEstadoImg = (imgId) =>
    setData((prev) => ({
      ...prev,
      estadoEquipo: {
        ...prev.estadoEquipo,
        imagenes: (prev.estadoEquipo?.imagenes || []).filter((i) => i.id !== imgId),
      },
    }));

  const handleEstadoClick = (e, imgId) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Number(((e.clientX - r.left) / r.width).toFixed(4));
    const y = Number(((e.clientY - r.top)  / r.height).toFixed(4));
    setData((prev) => ({
      ...prev,
      estadoEquipo: {
        ...prev.estadoEquipo,
        imagenes: (prev.estadoEquipo?.imagenes || []).map((img) =>
          img.id === imgId
            ? { ...img, puntos: [...(img.puntos||[]), { id:`p-${Date.now()}`, x, y, observacion:"" }] }
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
            ? { ...img, puntos: (img.puntos||[]).filter((p) => p.id !== ptId) }
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
            ? { ...img, puntos: (img.puntos||[]).map((p) => p.id===ptId ? {...p, observacion:value} : p) }
            : img
        ),
      },
    }));

  /* ── ITEMS SECCIONES ── */
  const handleItem = (codigo, campo, valor) =>
    setData((prev) => ({
      ...prev,
      items: { ...prev.items, [codigo]: { ...prev.items?.[codigo], [campo]: valor } },
    }));

  /* ── GUARDAR ── */
  const handleGuardar = async () => {
    if (uploading)           { alert("Espera que terminen de subir las imágenes"); return; }
    if (!data.cliente)       { alert("Cliente es obligatorio"); return; }
    if (!data.tecnicoNombre) { alert("Técnico es obligatorio"); return; }
    if (!data.fechaServicio) { alert("Fecha de servicio es obligatoria"); return; }

    setGuardando(true);
    try {
      const firmaTecnico = sigTecnico.current?.isEmpty?.() === false
        ? sigTecnico.current.toDataURL() : data.firmas?.tecnico || "";
      const firmaCliente = sigCliente.current?.isEmpty?.() === false
        ? sigCliente.current.toDataURL() : data.firmas?.cliente || "";

      await saveOrUpdateReport({
        id:      isEditing ? id : null,
        tipo:    "mantenimiento",
        subtipo: "hidro",
        data:    { ...data, firmas: { tecnico: firmaTecnico, cliente: firmaCliente } },
        estado:  firmaTecnico ? "completado" : "borrador",
      });

      alert(isEditing ? "Mantenimiento actualizado ✅" : "Mantenimiento guardado ✅");
      navigate("/mantenimiento");
    } catch (err) {
      console.error(err);
      alert(`Error al guardar ❌\n${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  /* ── RENDER ── */
  return (
    <div className="p-3 md:p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 md:p-6 rounded shadow w-full max-w-screen-xl mx-auto space-y-6">

        {/* ══════════════════════════════
            1. ENCABEZADO
        ══════════════════════════════ */}
        <table className="pdf-table w-full">
          <tbody>
            <tr>
              <td rowSpan={5} style={{ width: 130, verticalAlign: "middle", textAlign: "center" }}>
                <div className="flex items-center justify-center h-[160px]">
                  <img src="/astap-logo.jpg" alt="ASTAP"
                    className="object-contain" style={{ maxHeight: "90px" }} />
                </div>
              </td>
              <td colSpan={2} style={{ textAlign: "center", fontWeight: "bold", fontSize: "16px", letterSpacing: "0.5px", verticalAlign: "middle" }}>
                HOJA DE MANTENIMIENTO HIDROSUCCIONADOR
              </td>
              <td className="text-[10px] md:text-[11px]" style={{ width: 160 }}>
                <div>Fecha versión: <strong>01-01-26</strong></div>
                <div>Versión: <strong>01</strong></div>
              </td>
            </tr>
            <tr>
              <td className="pdf-label">REFERENCIA DE CONTRATO</td>
              <td colSpan={2}>
                <input className="pdf-input w-full" value={data.referenciaContrato}
                  placeholder="Ej: Contrato marco / cliente"
                  onChange={(e) => update(["referenciaContrato"], e.target.value)} />
              </td>
            </tr>
            <tr>
              <td className="pdf-label">PEDIDO / DEMANDA</td>
              <td colSpan={2}>
                <input className="pdf-input w-full" value={data.pedidoDemanda}
                  placeholder="Ej: P-23-046 o D-45821"
                  onChange={(e) => update(["pedidoDemanda"], e.target.value)} />
              </td>
            </tr>
            <tr>
              <td className="pdf-label">DESCRIPCIÓN</td>
              <td colSpan={2}>
                <input className="pdf-input w-full" value={data.descripcion}
                  onChange={(e) => update(["descripcion"], e.target.value)} />
              </td>
            </tr>
            <tr>
              <td className="pdf-label">CÓDIGO INFORME</td>
              <td colSpan={2}>
                <input className="pdf-input w-full" value={data.codInf}
                  placeholder={data.pedidoDemanda ? `${data.pedidoDemanda}-001` : "Ej: P-23-046-001"}
                  onChange={(e) => update(["codInf"], e.target.value)} />
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
              <td><input className="pdf-input w-full" value={data.cliente}
                onChange={(e) => update(["cliente"], e.target.value)} /></td>
              <td className="pdf-label">DIRECCIÓN</td>
              <td><input className="pdf-input w-full" value={data.direccion}
                onChange={(e) => update(["direccion"], e.target.value)} /></td>
            </tr>
            <tr>
              <td className="pdf-label">CONTACTO</td>
              <td><input className="pdf-input w-full" value={data.contacto}
                onChange={(e) => update(["contacto"], e.target.value)} /></td>
              <td className="pdf-label">TELÉFONO</td>
              <td><input className="pdf-input w-full" value={data.telefono}
                onChange={(e) => update(["telefono"], e.target.value)} /></td>
            </tr>
            <tr>
              <td className="pdf-label">CORREO</td>
              <td><input className="pdf-input w-full" value={data.correo}
                onChange={(e) => update(["correo"], e.target.value)} /></td>
              <td className="pdf-label">TÉCNICO RESPONSABLE</td>
              <td>
                {/* ← arranca en blanco, auto-rellena teléfono y correo al seleccionar */}
                <select className="pdf-input w-full" value={data.tecnicoNombre}
                  onChange={(e) => {
                    const tech = TECHNICIANS.find((t) => t.name === e.target.value);
                    update(["tecnicoNombre"],   tech?.name  || "");
                    update(["tecnicoTelefono"], tech?.phone || "");
                    update(["tecnicoCorreo"],   tech?.email || "");
                  }}>
                  <option value="">Seleccionar técnico</option>
                  {TECHNICIANS.map((t, i) => (
                    <option key={i} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td className="pdf-label">TELÉFONO TÉCNICO</td>
              <td><input className="pdf-input w-full bg-gray-100"
                value={data.tecnicoTelefono} readOnly /></td>
              <td className="pdf-label">CORREO TÉCNICO</td>
              <td><input className="pdf-input w-full bg-gray-100"
                value={data.tecnicoCorreo} readOnly /></td>
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

        {/* ══════════════════════════════
            3. DESCRIPCIÓN DEL EQUIPO
        ══════════════════════════════ */}
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
                    <td><input className="pdf-input w-full" value={data.equipo[field[1]]}
                      onChange={(e) => update(["equipo", field[1]], e.target.value)} /></td>
                    {next ? (
                      <>
                        <td className="pdf-label">{next[0]}</td>
                        <td><input className="pdf-input w-full" value={data.equipo[next[1]]}
                          onChange={(e) => update(["equipo", next[1]], e.target.value)} /></td>
                      </>
                    ) : <td colSpan={2} />}
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
        <h3 className="font-bold text-sm border-b pb-1">ESTADO DEL EQUIPO</h3>

        <div className="border rounded bg-white p-3 md:p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="bg-gray-600 text-white text-xs px-3 py-2 rounded cursor-pointer text-center hover:bg-gray-700 transition">
              📁 Subir fotografías
              <input type="file" accept="image/*" multiple style={{ display: "none" }}
                onChange={(e) => { handleEstadoUpload(e.target.files); e.target.value = null; }} />
            </label>
            <label className="bg-blue-600 text-white text-xs px-3 py-2 rounded cursor-pointer text-center hover:bg-blue-700 transition">
              📷 Tomar fotos
              <input type="file" accept="image/*" capture="environment" multiple style={{ display: "none" }}
                onChange={(e) => { handleEstadoUpload(e.target.files); e.target.value = null; }} />
            </label>
          </div>

          {(data.estadoEquipo?.imagenes || []).length === 0 ? (
            <div className="border rounded bg-gray-50 h-[220px] flex items-center justify-center text-sm text-gray-400">
              Sin fotografías cargadas
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(data.estadoEquipo?.imagenes || []).map((img, imgIdx) => (
                <div key={img.id} className="border rounded p-2 bg-gray-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Imagen {imgIdx + 1}</span>
                    <button type="button" onClick={() => removeEstadoImg(img.id)}
                      className="text-[11px] text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50">
                      Eliminar foto
                    </button>
                  </div>
                  <div className="relative w-full border rounded overflow-hidden bg-white">
                    <img src={img.url} alt={`estado-${imgIdx + 1}`}
                      className="w-full aspect-[4/3] object-contain bg-white cursor-crosshair"
                      onClick={(e) => handleEstadoClick(e, img.id)} />
                    {(img.puntos || []).map((p, pIdx) => (
                      <button key={p.id} type="button"
                        onClick={() => removePoint(img.id, p.id)}
                        className="absolute w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow"
                        style={{ left:`${p.x*100}%`, top:`${p.y*100}%`, transform:"translate(-50%,-50%)" }}>
                        <span className="sr-only">Punto {pIdx + 1}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Toque sobre la fotografía para agregar puntos rojos en las novedades.
                  </p>
                  {(img.puntos || []).map((p, pIdx) => (
                    <div key={p.id} className="flex items-start gap-2">
                      <div className="text-sm text-gray-700 pt-2 min-w-[24px]">{pIdx + 1})</div>
                      <input className="pdf-input w-full"
                        placeholder={`Observación punto ${pIdx + 1}`}
                        value={p.observacion}
                        onChange={(e) => updatePointObs(img.id, p.id, e.target.value)} />
                    </div>
                  ))}
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
            <h3 className="font-bold text-xs border-b pb-1 mb-2">{sec.titulo}</h3>
            <table className="pdf-table w-full">
              <thead>
                <tr>
                  <th className="text-left" style={{ width: 50 }}>ÍTEM</th>
                  <th className="text-left">DETALLE</th>
                  {sec.tipo === "cantidad" && <th style={{ width: 80 }}>CANTIDAD</th>}
                  <th style={{ width: 50 }}>SI</th>
                  <th style={{ width: 50 }}>NO</th>
                  <th className="text-left">OBSERVACIÓN</th>
                </tr>
              </thead>
              <tbody>
                {sec.items.map((it) => {
                  const codigo = Array.isArray(it) ? it[0] : it;
                  const texto  = Array.isArray(it) ? it[1] : "";
                  return (
                    <tr key={codigo}>
                      <td className="pdf-label">{codigo}</td>
                      <td>
                        {sec.tipo === "otros"
                          ? <input className="pdf-input w-full"
                              value={data.items?.[codigo]?.detalle || ""}
                              onChange={(e) => handleItem(codigo, "detalle", e.target.value)} />
                          : texto}
                      </td>
                      {sec.tipo === "cantidad" && (
                        <td className="text-center">
                          <input type="number" className="pdf-input w-16 text-center"
                            value={data.items?.[codigo]?.cantidad || ""}
                            onChange={(e) => handleItem(codigo, "cantidad", e.target.value)} />
                        </td>
                      )}
                      <td className="text-center">
                        <input type="radio" name={`e-${codigo}`}
                          checked={data.items?.[codigo]?.estado === "SI"}
                          onChange={() => handleItem(codigo, "estado", "SI")} />
                      </td>
                      <td className="text-center">
                        <input type="radio" name={`e-${codigo}`}
                          checked={data.items?.[codigo]?.estado === "NO"}
                          onChange={() => handleItem(codigo, "estado", "NO")} />
                      </td>
                      <td>
                        <input className="pdf-input w-full"
                          value={data.items?.[codigo]?.observacion || ""}
                          onChange={(e) => handleItem(codigo, "observacion", e.target.value)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        ))}

        {/* ══════════════════════════════
            6. FIRMAS
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
                  <SignatureCanvas ref={sigTecnico} penColor="black"
                    minWidth={0.5} maxWidth={1.5}
                    canvasProps={{ className: "w-full h-full touch-none" }} />
                </div>
                <div className="mt-2 text-sm text-center font-medium">
                  {data.tecnicoNombre || "—"}
                </div>
                <div className="text-center">
                  <button type="button" onClick={() => sigTecnico.current?.clear()}
                    className="text-xs text-red-600 mt-1 hover:underline">
                    Borrar firma
                  </button>
                </div>
              </td>
              <td className="align-top" style={{ height: 240 }}>
                <div className="border rounded bg-white h-[150px] flex items-center justify-center">
                  <SignatureCanvas ref={sigCliente} penColor="black"
                    minWidth={0.5} maxWidth={1.5}
                    canvasProps={{ className: "w-full h-full touch-none" }} />
                </div>
                <div className="mt-2 text-center">
                  <input className="pdf-input w-full bg-gray-100"
                    value={data.contacto} readOnly placeholder="Nombre del contacto" />
                </div>
                <div className="text-center">
                  <button type="button" onClick={() => sigCliente.current?.clear()}
                    className="text-xs text-red-600 mt-1 hover:underline">
                    Borrar firma
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ══════════════════════════════
            7. BOTONES
        ══════════════════════════════ */}
        <div className="flex flex-col md:flex-row justify-between gap-3 pt-4">
          <button type="button" onClick={() => navigate("/mantenimiento")}
            className="border px-6 py-2 rounded hover:bg-gray-50 transition">
            ← Volver
          </button>
          <button type="button" onClick={handleGuardar}
            disabled={guardando || uploading}
            className={`px-6 py-2 rounded text-white transition ${
              guardando || uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}>
            {guardando   ? "Guardando..."
             : uploading ? `Subiendo imágenes (${uploadingCount})...`
             : isEditing ? "Actualizar mantenimiento"
             :             "Guardar mantenimiento"}
          </button>
        </div>

      </div>
    </div>
  );
}
