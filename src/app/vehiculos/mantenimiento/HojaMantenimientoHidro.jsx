import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { saveOrUpdateReport } from "@/services/reportService";
import { uploadRegistroImage } from "@/utils/storage";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";
import { TECHNICIANS } from "@/data/technicians";

/* =============================
   SECCIONES – MANTENIMIENTO HIDRO
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

export default function HojaMantenimientoHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  const [guardando, setGuardando] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [formData, setFormData] = useState({
    referenciaContrato: "",
     pedidoDemanda: "",
    descripcion: "",
    codInf: "",
    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    tecnicoNombre: "",
    telefonoTecnico: "",
    correoTecnico: "",
    fechaServicio: "",
    estadoEquipoPuntos: [],
    estadoEquipoImagenUrl: null, // ← igual que inspección
    estadoEquipoDetalle: "",
    items: {},
    nota: "",
    marca: "",
    modelo: "",
    serie: "",
    anioModelo: "",
    vin: "",
    placa: "",
    horasModulo: "",
    horasChasis: "",
    kilometraje: "",
  });

  /* =============================
     CARGAR DESDE SUPABASE
  ============================= */
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) return;

      if (data.data) {
        setFormData((prev) => ({
  ...prev,
  ...data.data,
  tecnicoNombre:
    data.data.tecnicoNombre ||
    data.data.tecnicoResponsable ||
    "",
}));

        setTimeout(() => {
          if (data.data.firmas?.tecnico && firmaTecnicoRef.current)
            firmaTecnicoRef.current.fromDataURL(data.data.firmas.tecnico);
          if (data.data.firmas?.cliente && firmaClienteRef.current)
            firmaClienteRef.current.fromDataURL(data.data.firmas.cliente);
        }, 300);
      }
    };

    load();
  }, [id]);

  /* =============================
     HANDLERS GENERALES
  ============================= */
  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleItemChange = (codigo, campo, valor) => {
    setFormData((p) => ({
      ...p,
      items: { ...p.items, [codigo]: { ...p.items[codigo], [campo]: valor } },
    }));
  };

  /* =============================
     ESTADO DEL EQUIPO — IMAGEN
  ============================= */
  const handleImageEquipo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });
      const url = await uploadRegistroImage(compressed, id || "temp-hidro-" + Date.now(), "estado-equipo");
      if (url) {
        setFormData((p) => ({
          ...p,
          estadoEquipoImagenUrl: url,
          estadoEquipoPuntos: [],
        }));
      }
    } catch (err) {
      console.error("Error subiendo imagen:", err);
      alert("Error subiendo imagen");
    } finally {
      setUploadingImg(false);
    }
  };

  /* =============================
     ESTADO DEL EQUIPO — PUNTOS ROJOS
  ============================= */
  const handleImageClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: [
        ...p.estadoEquipoPuntos,
        { id: p.estadoEquipoPuntos.length + 1, x, y, nota: "" },
      ],
    }));
  };

  const handleRemovePoint = (ptId) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos
        .filter((pt) => pt.id !== ptId)
        .map((pt, i) => ({ ...pt, id: i + 1 })),
    }));
  };

  const clearAllPoints = () =>
    setFormData((p) => ({ ...p, estadoEquipoPuntos: [] }));

  const handleNotaChange = (ptId, value) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos.map((pt) =>
        pt.id === ptId ? { ...pt, nota: value } : pt
      ),
    }));
  };

  /* =============================
     GUARDAR EN SUPABASE
  ============================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const payload = {
        ...formData,
        firmas: {
          tecnico: firmaTecnicoRef.current?.isEmpty()
            ? ""
            : firmaTecnicoRef.current.toDataURL(),
          cliente: firmaClienteRef.current?.isEmpty()
            ? ""
            : firmaClienteRef.current.toDataURL(),
        },
      };

      await saveOrUpdateReport({
        id: id || null,
        tipo: "mantenimiento",
        subtipo: "hidro",
        data: payload,
        estado: "completado",
      });

      alert("Mantenimiento guardado correctamente ✅");
      navigate("/mantenimiento");
    } catch (err) {
      console.error(err);
      alert("Error al guardar ❌");
    } finally {
      setGuardando(false);
    }
  };

  /* =============================
     RENDER
  ============================= */
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >
      {/* ── ENCABEZADO ── */}
<section className="border rounded overflow-hidden">
  <table className="w-full text-xs border-collapse">
    <tbody>
      <tr className="border-b">
        <td rowSpan={5} className="w-32 border-r p-3 text-center align-middle">
          <img
            src="/astap-logo.jpg"
            className="mx-auto max-h-20"
            alt="ASTAP"
          />
        </td>

        <td colSpan={2} className="border-r text-center font-bold p-2">
          HOJA DE MANTENIMIENTO HIDROSUCCIONADOR
        </td>

        <td className="p-2">
          <div>
            Fecha versión: <strong>01-01-2026</strong>
          </div>
          <div>
            Versión: <strong>01</strong>
          </div>
        </td>
      </tr>

      {[
        ["REFERENCIA DE CONTRATO", "referenciaContrato"],
        ["PEDIDO / DEMANDA", "pedidoDemanda"],
        ["DESCRIPCIÓN", "descripcion"],
        ["CÓDIGO INFORME", "codInf"],
      ].map(([label, name]) => (
        <tr key={name} className="border-b">
          <td className="border-r p-2 font-semibold uppercase">
            {label}
          </td>

          <td colSpan={2} className="p-1">
            <input
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              className="w-full border p-1 rounded"
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</section>

      {/* ── DATOS CLIENTE / TÉCNICO ── */}
<section className="border rounded overflow-hidden">
  <div className="bg-gray-100 border-b px-3 py-2 font-bold text-xs uppercase">
    Datos del cliente y técnico responsable
  </div>

  <table className="w-full text-xs border-collapse">
    <tbody>
      <tr className="border-b">
        <td className="border-r p-2 font-semibold w-40">CLIENTE</td>
        <td className="border-r p-1">
          <input
            name="cliente"
            value={formData.cliente || ""}
            onChange={handleChange}
            className="w-full border p-1 rounded"
          />
        </td>

        <td className="border-r p-2 font-semibold w-40">DIRECCIÓN</td>
        <td className="p-1">
          <input
            name="direccion"
            value={formData.direccion || ""}
            onChange={handleChange}
            className="w-full border p-1 rounded"
          />
        </td>
      </tr>

      <tr className="border-b">
        <td className="border-r p-2 font-semibold">CONTACTO</td>
        <td className="border-r p-1">
          <input
            name="contacto"
            value={formData.contacto || ""}
            onChange={handleChange}
            className="w-full border p-1 rounded"
          />
        </td>

        <td className="border-r p-2 font-semibold">TELÉFONO</td>
        <td className="p-1">
          <input
            name="telefono"
            value={formData.telefono || ""}
            onChange={handleChange}
            className="w-full border p-1 rounded"
          />
        </td>
      </tr>

      <tr className="border-b">
        <td className="border-r p-2 font-semibold">CORREO</td>
        <td className="border-r p-1">
          <input
            name="correo"
            value={formData.correo || ""}
            onChange={handleChange}
            className="w-full border p-1 rounded"
          />
        </td>

        <td className="border-r p-2 font-semibold">TÉCNICO RESPONSABLE</td>
        <td className="p-1">
          <select
            name="tecnicoNombre"
            value={formData.tecnicoNombre || ""}
            onChange={(e) => {
              const selected = TECHNICIANS.find(
                (t) => t.nombre === e.target.value
              );

              setFormData((p) => ({
                ...p,
                tecnicoNombre: selected?.nombre || "",
                telefonoTecnico: selected?.telefono || "",
                correoTecnico: selected?.correo || "",
              }));
            }}
            className="w-full border p-1 rounded"
          >
            <option value="">Seleccione técnico</option>

            {TECHNICIANS.map((t) => (
              <option key={t.nombre} value={t.nombre}>
                {t.nombre}
              </option>
            ))}
          </select>
        </td>
      </tr>

      <tr className="border-b">
        <td className="border-r p-2 font-semibold">TELÉFONO TÉCNICO</td>
        <td className="border-r p-1">
          <input
            name="telefonoTecnico"
            value={formData.telefonoTecnico || ""}
            onChange={handleChange}
            className="w-full border p-1 rounded bg-gray-100"
            readOnly
          />
        </td>

        <td className="border-r p-2 font-semibold">CORREO TÉCNICO</td>
        <td className="p-1">
          <input
            name="correoTecnico"
            value={formData.correoTecnico || ""}
            onChange={handleChange}
            className="w-full border p-1 rounded bg-gray-100"
            readOnly
          />
        </td>
      </tr>

      <tr>
        <td className="border-r p-2 font-semibold">FECHA DE SERVICIO</td>
        <td colSpan={3} className="p-1">
          <input
            type="date"
            name="fechaServicio"
            value={formData.fechaServicio || ""}
            onChange={handleChange}
            className="w-full border p-1 rounded"
          />
        </td>
      </tr>
    </tbody>
  </table>
</section>

      {/* ── ESTADO DEL EQUIPO (igual que inspección) ── */}
      <section className="border rounded p-4 space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <p className="font-semibold">
            Estado del equipo
            <span className="text-xs text-gray-500 ml-2">
              (clic en la imagen para marcar puntos — doble clic para eliminar)
            </span>
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, estadoEquipoImagenUrl: null, estadoEquipoPuntos: [] }))}
              className={`text-xs px-2 py-1 rounded ${!formData.estadoEquipoImagenUrl ? "bg-blue-600 text-white" : "border"}`}
            >
              Imagen base
            </button>

            <label className={`text-xs px-2 py-1 rounded cursor-pointer ${formData.estadoEquipoImagenUrl ? "bg-green-600 text-white" : "border"}`}>
              {uploadingImg ? "Subiendo..." : "📷 Cámara / Galería"}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageEquipo} disabled={uploadingImg} />
            </label>

            {formData.estadoEquipoPuntos.length > 0 && (
              <button type="button" onClick={clearAllPoints} className="text-xs border px-2 py-1 rounded">
                Limpiar puntos
              </button>
            )}
          </div>
        </div>

        <div className="relative border rounded cursor-crosshair overflow-hidden" onClick={handleImageClick}>
          <img
            src={formData.estadoEquipoImagenUrl || "/estado-equipo.png"}
            crossOrigin="anonymous"
            className="w-full"
            draggable={false}
            alt="Estado del equipo"
          />
          {formData.estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              onDoubleClick={(e) => { e.stopPropagation(); handleRemovePoint(pt.id); }}
              className="absolute bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full cursor-pointer select-none shadow"
              style={{ left: `${pt.x}%`, top: `${pt.y}%`, transform: "translate(-50%, -50%)" }}
              title="Doble clic para eliminar"
            >
              {pt.id}
            </div>
          ))}
        </div>

        {formData.estadoEquipoPuntos.map((pt) => (
          <div key={pt.id} className="flex gap-2 items-center">
            <span className="font-semibold text-red-600 w-6 text-center shrink-0">{pt.id}</span>
            <input
              className="w-full border rounded px-2 py-1 text-xs"
              placeholder={`Observación punto ${pt.id}`}
              value={pt.nota}
              onChange={(e) => handleNotaChange(pt.id, e.target.value)}
            />
          </div>
        ))}
      </section>

      {/* ── TABLAS DE SECCIONES ── */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2 text-xs">{sec.titulo}</h2>
          <table className="w-full text-xs border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-1 text-left">Ítem</th>
                <th className="border p-1 text-left">Detalle</th>
                {sec.tipo === "cantidad" && <th className="border p-1">Cantidad</th>}
                <th className="border p-1">SI</th>
                <th className="border p-1">NO</th>
                <th className="border p-1 text-left">Observación</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map((it) => {
                const codigo = Array.isArray(it) ? it[0] : it;
                const texto  = Array.isArray(it) ? it[1] : "";
                return (
                  <tr key={codigo} className="border-t">
                    <td className="border p-1 whitespace-nowrap">{codigo}</td>
                    <td className="border p-1">
                      {sec.tipo === "otros" ? (
                        <input className="border w-full p-1 rounded" value={formData.items[codigo]?.detalle || ""} onChange={(e) => handleItemChange(codigo, "detalle", e.target.value)} />
                      ) : texto}
                    </td>
                    {sec.tipo === "cantidad" && (
                      <td className="border p-1 text-center">
                        <input type="number" className="border w-16 p-1 rounded text-center" value={formData.items[codigo]?.cantidad || ""} onChange={(e) => handleItemChange(codigo, "cantidad", e.target.value)} />
                      </td>
                    )}
                    <td className="border p-1 text-center">
                      <input type="radio" name={`estado-${codigo}`} checked={formData.items[codigo]?.estado === "SI"} onChange={() => handleItemChange(codigo, "estado", "SI")} />
                    </td>
                    <td className="border p-1 text-center">
                      <input type="radio" name={`estado-${codigo}`} checked={formData.items[codigo]?.estado === "NO"} onChange={() => handleItemChange(codigo, "estado", "NO")} />
                    </td>
                    <td className="border p-1">
                      <input className="border w-full p-1 rounded" value={formData.items[codigo]?.observacion || ""} onChange={(e) => handleItemChange(codigo, "observacion", e.target.value)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}

      {/* ── DESCRIPCIÓN DEL EQUIPO ── */}
      <section className="border rounded p-4">
        <h2 className="font-semibold text-center mb-3">DESCRIPCIÓN DEL EQUIPO</h2>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            ["NOTA",         "nota"],
            ["MARCA",        "marca"],
            ["MODELO",       "modelo"],
            ["N° SERIE",     "serie"],
            ["AÑO MODELO",   "anioModelo"],
            ["VIN / CHASIS", "vin"],
            ["PLACA",        "placa"],
            ["HORAS MÓDULO", "horasModulo"],
            ["HORAS CHASIS", "horasChasis"],
            ["KILOMETRAJE",  "kilometraje"],
          ].map(([label, name]) => (
            <div key={name} className="contents">
              <label className="font-semibold self-center">{label}</label>
              <input name={name} value={formData[name]} onChange={handleChange} className="col-span-3 border rounded p-1" />
            </div>
          ))}
        </div>
      </section>

      {/* ── FIRMAS ── */}
      <section className="border rounded p-4">
        <div className="grid md:grid-cols-2 gap-6 text-center">
          <div>
            <p className="font-semibold mb-1">Firma Técnico ASTAP</p>
            <SignatureCanvas ref={firmaTecnicoRef} canvasProps={{ className: "border w-full h-32 rounded" }} />
            <button type="button" onClick={() => firmaTecnicoRef.current?.clear()} className="text-xs text-red-600 mt-1 hover:underline">Borrar firma</button>
          </div>
          <div>
            <p className="font-semibold mb-1">Firma Cliente</p>
            <SignatureCanvas ref={firmaClienteRef} canvasProps={{ className: "border w-full h-32 rounded" }} />
            <button type="button" onClick={() => firmaClienteRef.current?.clear()} className="text-xs text-red-600 mt-1 hover:underline">Borrar firma</button>
          </div>
        </div>
      </section>

      {/* ── BOTONES ── */}
      <div className="flex justify-between items-center">
        <button type="button" onClick={() => navigate("/mantenimiento")} className="border px-4 py-2 rounded hover:bg-gray-50">
          ← Volver
        </button>
        <button type="submit" disabled={guardando} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded disabled:opacity-50">
          {guardando ? "Guardando..." : "💾 Guardar mantenimiento"}
        </button>
      </div>
    </form>
  );
}
