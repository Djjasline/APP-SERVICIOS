import { useTechnicians } from "@/hooks/useTechnicians";
import { saveOrUpdateReport } from "@/services/reportService";
import { uploadRegistroImage } from "@/utils/storage";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";
import PdfInspeccionButtons from "./components/PdfInspeccionButtons";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";

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
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    technicians,
    loading: loadingTechnicians,
  } = useTechnicians();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  const [uploadingImg, setUploadingImg] = useState(false);
  const [successMsg, setSuccessMsg]     = useState("");

  /* ─── ESTADO BASE ─── */
  const baseState = {
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

  estadoEquipo: {
  imagenes: [],
},

    notaFinal: "",

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

    items: {},

    firmas: {
      tecnico: "",
      cliente: "",
    },
  };

  const [formData, setFormData] = useState(baseState);

    /* ─── CARGAR REGISTRO EXISTENTE ─── */
  useEffect(() => {
    const loadInspection = async () => {
      if (!id || id === "nuevo") return;

      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) return;

      setFormData({
        ...baseState,
        ...(data.data || {}),

        equipo: {
          ...baseState.equipo,
          ...(data.data?.equipo || {}),
        },

        estadoEquipo: {
          imagenes: data.data?.estadoEquipo?.imagenes || [],
        },

        items: data.data?.items || {},

        firmas: {
          tecnico: "",
          cliente: "",
          ...(data.data?.firmas || {}),
        },
      });

      setTimeout(() => {
        if (data.data?.firmas?.tecnico && firmaTecnicoRef.current) {
          firmaTecnicoRef.current.clear();
          firmaTecnicoRef.current.fromDataURL(
            data.data.firmas.tecnico
          );
        }

        if (data.data?.firmas?.cliente && firmaClienteRef.current) {
          firmaClienteRef.current.clear();
          firmaClienteRef.current.fromDataURL(
            data.data.firmas.cliente
          );
        }
      }, 100);
    };

    loadInspection();
  }, [id]);
 
  /* ─── HELPERS ─── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleItemChange = (codigo, campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [codigo]: {
          ...(prev.items[codigo] || {}),
          [campo]: valor,
        },
      },
    }));
  };

  /* ─── PROGRESO CHECKLIST ─── */
  const itemsMarcados = todosLosItems.filter((c) => formData.items[c]?.estado).length;
  const totalItems    = todosLosItems.length;
  const progresoPct   = Math.round((itemsMarcados / totalItems) * 100);

  /* ─── SUBIR IMÁGENES ESTADO EQUIPO ─── */
  const handleImageEquipo = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = null;

    if (!files.length) return;

    setUploadingImg(true);

    try {
      const realId =
        id && id !== "nuevo"
          ? id
          : crypto.randomUUID();

      const nuevasImagenes = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;

        const compressed = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1400,
          useWebWorker: true,
          fileType: "image/jpeg",
          initialQuality: 0.8,
        });

        const url = await uploadRegistroImage(
          compressed,
          realId,
          "estado-equipo"
        );

        if (url) {
          nuevasImagenes.push({
            id: crypto.randomUUID(),
            url,
            puntos: [],
          });
        }
      }

      if (nuevasImagenes.length) {
        setFormData((prev) => ({
          ...prev,
          estadoEquipo: {
            imagenes: [
              ...(prev.estadoEquipo?.imagenes || []),
              ...nuevasImagenes,
            ],
          },
        }));
      }

    } catch (err) {
      console.error("Error subiendo imágenes:", err);
      alert("Error subiendo imágenes");
    } finally {
      setUploadingImg(false);
    }
  };
  /* ─── AGREGAR PUNTO EN IMAGEN ─── */
  const handleImageClick = (e, imageId) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x =
      ((e.clientX - rect.left) / rect.width) * 100;

    const y =
      ((e.clientY - rect.top) / rect.height) * 100;

    setFormData((prev) => ({
      ...prev,

      estadoEquipo: {
        imagenes: prev.estadoEquipo.imagenes.map((img) => {

          if (img.id !== imageId) return img;

          const puntos = img.puntos || [];

          return {
            ...img,

            puntos: [
              ...puntos,
              {
                id: puntos.length + 1,
                x,
                y,
                nota: "",
              },
            ],
          };
        }),
      },
    }));
  };

  /* ─── ELIMINAR PUNTO ─── */
  const handleRemovePoint = (imageId, pointId) => {

    setFormData((prev) => ({
      ...prev,

      estadoEquipo: {
        imagenes: prev.estadoEquipo.imagenes.map((img) => {

          if (img.id !== imageId) return img;

          const nuevosPuntos = (img.puntos || [])
            .filter((pt) => pt.id !== pointId)
            .map((pt, i) => ({
              ...pt,
              id: i + 1,
            }));

          return {
            ...img,
            puntos: nuevosPuntos,
          };
        }),
      },
    }));
  };

  /* ─── OBSERVACIÓN PUNTO ─── */
  const handleNotaChange = (
    imageId,
    pointId,
    value
  ) => {

    setFormData((prev) => ({
      ...prev,

      estadoEquipo: {
        imagenes: prev.estadoEquipo.imagenes.map((img) => {

          if (img.id !== imageId) return img;

          return {
            ...img,

            puntos: (img.puntos || []).map((pt) =>
              pt.id === pointId
                ? { ...pt, nota: value }
                : pt
            ),
          };
        }),
      },
    }));
  };

  /* ─── GUARDAR ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError =
      !formData.cliente       ? "Cliente requerido"  :
      !formData.tecnicoNombre ? "Técnico requerido"  :
      !formData.fechaServicio ? "Fecha requerida"    : null;

    if (validationError) { alert(validationError); return; }
   if (uploadingImg) {
  alert("Espera que terminen de subir las imágenes");
  return;
}
    const isTecnicoEmpty = firmaTecnicoRef.current?.isEmpty();
    const isClienteEmpty = firmaClienteRef.current?.isEmpty();

    const payload = {
      ...formData,
      firmas: {
        tecnico: !isTecnicoEmpty ? firmaTecnicoRef.current.toDataURL() : formData.firmas.tecnico,
        cliente: !isClienteEmpty ? firmaClienteRef.current.toDataURL() : formData.firmas.cliente,
      },
    };

    const estadoFinal =
      payload.firmas.tecnico && payload.firmas.cliente ? "completado" : "borrador";

    const { data: { user } } = await supabase.auth.getUser();

    try {
      await saveOrUpdateReport({
        id: id && id !== "nuevo" ? id : null,
        tipo: "inspeccion",
        subtipo: "barredora",
        data: payload,
        estado: estadoFinal,
        user_id: user?.id,
      });

      setSuccessMsg("Guardado correctamente ✅");
      setTimeout(() => navigate("/inspeccion"), 1200);
    } catch (err) {
      console.error("Error guardando:", err);
      setSuccessMsg("Error al guardar ❌");
    }
  };

  /* ─── RENDER ─── */
  const inspeccionLista = formData.firmas?.tecnico && formData.firmas?.cliente;

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
        className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
      >
        {/* ── BANNER ESTADO ── */}
        <div className={`p-2 rounded text-xs flex items-center justify-between gap-2 ${inspeccionLista ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          <span>{inspeccionLista ? "✔ Inspección lista para completar" : "⚠ Pendiente de firmas para completar"}</span>
          <span className="font-semibold">{progresoPct}% ítems marcados ({itemsMarcados}/{totalItems})</span>
        </div>

        <div id="pdf-inspeccion-barredora" className="print-area space-y-6">

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
                        value={formData[name] || ""}
                        onChange={handleChange}
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
            <h2 className="font-semibold text-sm mb-3 uppercase">Datos del cliente y técnico responsable</h2>
            <table className="w-full text-sm border-collapse border">
              <tbody>
                <tr>
                  <td className="border p-2 font-semibold bg-gray-50 w-40">CLIENTE</td>
                  <td className="border p-1">
                    <input name="cliente" value={formData.cliente} onChange={handleChange} className="w-full border-0 p-1 outline-none" />
                  </td>
                  <td className="border p-2 font-semibold bg-gray-50 w-40">DIRECCIÓN</td>
                  <td className="border p-1">
                    <input name="direccion" value={formData.direccion} onChange={handleChange} className="w-full border-0 p-1 outline-none" />
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold bg-gray-50">CONTACTO</td>
                  <td className="border p-1">
                    <input name="contacto" value={formData.contacto} onChange={handleChange} className="w-full border-0 p-1 outline-none" />
                  </td>
                  <td className="border p-2 font-semibold bg-gray-50">TELÉFONO</td>
                  <td className="border p-1">
                    <input name="telefono" value={formData.telefono} onChange={handleChange} className="w-full border-0 p-1 outline-none" />
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold bg-gray-50">CORREO</td>
                  <td className="border p-1">
                    <input name="correo" value={formData.correo} onChange={handleChange} className="w-full border-0 p-1 outline-none" />
                  </td>
                  <td className="border p-2 font-semibold bg-gray-50">TÉCNICO RESPONSABLE</td>
                  <td className="border p-1">
                   <select
  className="w-full border-0 p-1 outline-none bg-white"
  value={formData.tecnicoNombre}
  disabled={loadingTechnicians}
  onChange={(e) => {
    const tech = (technicians || []).find(
      (t) => t.name === e.target.value
    );

    setFormData((p) => ({
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
                </tr>
                <tr>
                  <td className="border p-2 font-semibold bg-gray-50">TELÉFONO TÉCNICO</td>
                  <td className="border p-1">
                    <input value={formData.tecnicoTelefono} readOnly className="w-full border-0 p-1 outline-none bg-gray-100" />
                  </td>
                  <td className="border p-2 font-semibold bg-gray-50">CORREO TÉCNICO</td>
                  <td className="border p-1">
                    <input value={formData.tecnicoCorreo} readOnly className="w-full border-0 p-1 outline-none bg-gray-100" />
                  </td>
                </tr>
                <tr>
                  <td className="border p-2 font-semibold bg-gray-50">FECHA DE SERVICIO</td>
                  <td colSpan={3} className="border p-1">
                    <input type="date" name="fechaServicio" value={formData.fechaServicio} onChange={handleChange} className="w-full border-0 p-1 outline-none" />
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

                   {/* ── ESTADO DEL EQUIPO ── */}
          <section className="border rounded p-4 space-y-4">

            <div className="flex justify-between items-center flex-wrap gap-2">
              <p className="font-semibold">
                Estado del equipo
              </p>

              <label
                className={`text-xs px-3 py-2 rounded cursor-pointer ${
                  uploadingImg
                    ? "bg-gray-300 text-gray-600"
                    : "bg-green-600 text-white"
                }`}
              >
                {uploadingImg
                  ? "Subiendo imágenes..."
                  : "📷 Agregar imágenes"}

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="hidden"
                  onChange={handleImageEquipo}
                  disabled={uploadingImg}
                />
              </label>
            </div>

            {/* IMAGEN BASE BARREDORA */}
{!formData.estadoEquipo?.imagenes?.length && (

  <div className="border rounded bg-white p-3">

    <img
      src="/img/barredora-base.png"
      alt="Estado base barredora"
      className="w-full max-h-[320px] object-contain mx-auto"
      draggable={false}
    />

    <p className="text-xs text-gray-500 mt-2 text-center">
      Toque “Agregar imágenes” para registrar novedades del equipo.
    </p>

  </div>

)}
            {/* IMÁGENES */}
            <div className="grid grid-cols-1 gap-4">

              {(formData.estadoEquipo?.imagenes || []).map((img) => (

                <div
                  key={img.id}
                  className="border rounded p-3 bg-gray-50 space-y-3"
                >

                                   {/* IMAGEN */}
                  <div
                    className="relative border rounded overflow-hidden bg-white flex items-center justify-center cursor-crosshair"
                    onClick={(e) => handleImageClick(e, img.id)}
                  >

                    <img
                      src={img.url}
                      alt="Estado equipo"
                      className="w-auto max-w-full max-h-[180px] object-contain mx-auto"
                      draggable={false}
                    />

                    {/* PUNTOS */}
                    {(img.puntos || []).map((pt) => (
                      <div
                        key={pt.id}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleRemovePoint(img.id, pt.id);
                        }}
                        className="absolute bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full shadow cursor-pointer select-none"
                        style={{
                          left: `${pt.x}%`,
                          top: `${pt.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        title="Doble clic para eliminar"
                      >
                        {pt.id}
                      </div>
                    ))}
                  </div>

                  {/* OBSERVACIONES */}
                  {(img.puntos || []).length > 0 && (
                    <div className="space-y-2">

                      {(img.puntos || []).map((pt) => (

                        <div
                          key={pt.id}
                          className="flex gap-2 items-start"
                        >

                          <div className="bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1">
                            {pt.id}
                          </div>

                          <textarea
                            value={pt.nota || ""}
                            ref={(el) => {
  if (el) {
    el.style.height = "auto";
    el.style.height =
      el.scrollHeight + "px";
  }
}} 
                            onChange={(e) => {

  handleNotaChange(
    img.id,
    pt.id,
    e.target.value
  );

  e.target.style.height = "auto";

  e.target.style.height =
    e.target.scrollHeight + "px";
}}
                            placeholder={`Observación punto ${pt.id}`}
                            className="w-full border rounded p-2 text-xs resize-none overflow-hidden min-h-[60px]"
                          />
                        </div>

                      ))}

                    </div>
                  )}

                  {/* BOTONES */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          estadoEquipo: {
                            imagenes: prev.estadoEquipo.imagenes.filter(
                              (i) => i.id !== img.id
                            ),
                          },
                        }));
                      }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Eliminar imagen
                    </button>
                  </div>

                </div>

              ))}

            </div>

          </section>
          {/* ── PRUEBAS PREVIAS ── */}
          <section className="border rounded p-4 no-break">
            <h2 className="font-semibold mb-3">
              1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS
            </h2>
            <TablaItems
              lista={pruebasPrevias}
              items={formData.items}
              onItemChange={handleItemChange}
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
                items={formData.items}
                onItemChange={handleItemChange}
              />
            </section>
          ))}

          {/* ── DESCRIPCIÓN DEL EQUIPO ── */}
          <section className="border rounded p-4 no-break">
            <h2 className="font-semibold text-center mb-3 uppercase">Descripción del equipo</h2>
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
                    <td className="border p-2 font-semibold bg-gray-50 w-36">{l1}</td>
                    <td className="border p-1">
                      <input
                        value={formData.equipo[f1] || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, equipo: { ...p.equipo, [f1]: e.target.value } }))}
                        className="w-full border-0 p-1 outline-none"
                      />
                    </td>
                    {l2 ? (
                      <>
                        <td className="border p-2 font-semibold bg-gray-50 w-36">{l2}</td>
                        <td className="border p-1">
                          <input
                            value={formData.equipo[f2] || ""}
                            onChange={(e) => setFormData((p) => ({ ...p, equipo: { ...p.equipo, [f2]: e.target.value } }))}
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

          {/* ── NOTA FINAL ── */}
          <section className="border rounded p-4 no-break">
            <h2 className="font-semibold mb-2 uppercase">Nota / Observación final del técnico</h2>
            <textarea
              name="notaFinal"
              value={formData.notaFinal || ""}
              onChange={(e) => {
                handleChange(e);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              placeholder="Escriba aquí cualquier observación general, novedad adicional o comentario de cierre..."
              className="w-full border rounded p-2 text-sm outline-none overflow-hidden resize-none min-h-[80px]"
            />
          </section>

          {/* ── FIRMAS ── */}
          <table className="pdf-table w-full no-break">
            <thead>
              <tr>
                <th className="border p-2 text-center">FIRMA TÉCNICO ASTAP</th>
                <th className="border p-2 text-center">FIRMA CLIENTE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* Técnico */}
                <td className="border p-2 align-top" style={{ height: 110 }}>
                  <SignatureCanvas
                    ref={firmaTecnicoRef}
                    penColor="black"
                    minWidth={0.5}
                    maxWidth={1.5}
                    onBegin={() => { document.activeElement?.blur(); document.body.style.overflow = "hidden"; }}
                    onEnd={() => { document.body.style.overflow = ""; }}
                    canvasProps={{
  className: "w-full h-24 border rounded touch-none bg-white"
}}
                  />
                  <div className="text-center mt-1">
                    <button type="button" onClick={() => firmaTecnicoRef.current?.clear()} className="text-xs text-red-600 hover:underline">
                      Borrar firma
                    </button>
                  </div>
                  <input value={formData.tecnicoNombre || ""} readOnly className="w-full border mt-2 text-xs p-1 bg-gray-100 rounded" />
                </td>

                {/* Cliente */}
                <td className="border p-2 align-top" style={{ height: 110 }}>
                  <SignatureCanvas
                    ref={firmaClienteRef}
                    penColor="black"
                    minWidth={0.5}
                    maxWidth={1.5}
                    onBegin={() => { document.activeElement?.blur(); document.body.style.overflow = "hidden"; }}
                    onEnd={() => { document.body.style.overflow = ""; }}
                    canvasProps={{
  className: "w-full h-24 border rounded touch-none bg-white"
}}
                  />
                  <div className="text-center mt-1">
                    <button type="button" onClick={() => firmaClienteRef.current?.clear()} className="text-xs text-red-600 hover:underline">
                      Borrar firma
                    </button>
                  </div>
                  <input value={formData.cliente || ""} readOnly className="w-full border mt-2 text-xs p-1 bg-gray-100 rounded" />
                  <input
                    placeholder="Cédula cliente"
                    value={formData.cedulaCliente || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, cedulaCliente: e.target.value }))}
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
  disabled={uploadingImg}
  className={`px-4 py-2 rounded text-white transition ${
    uploadingImg
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700"
  }`}
>
  {uploadingImg
    ? "Subiendo imágenes..."
    : inspeccionLista
      ? "Guardar y completar"
      : "Guardar borrador"}
</button>
        </div>
      </form>
       <PdfInspeccionButtons
  targetId="pdf-inspeccion-barredora"
  fileName="INSPECCION_BARREDORA"
/>
    </>
  );
}
