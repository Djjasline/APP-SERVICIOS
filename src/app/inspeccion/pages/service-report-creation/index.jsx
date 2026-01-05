import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

const STORAGE_KEY = "serviceReport_general";

export default function ServiceReportCreation() {
  const [form, setForm] = useState({
    Cliente: "",
    Direccion: "",
    Contacto: "",
    Telefono: "",
    Correo: "",
    Fecha de Servicio: "",
    CodigoInterno: "",
    CodigoIN: "",
    ReferenciaContrato: "",
    Descripcion: "",
    Ubicacion: "",
    Técnico Responsable: "",
    Responsable Cliente: "",
    actividades: [
      { item: "1", codigo: "1.1", titulo: "", detalle: "", imagen: null },
    ],
  });

  const sigTecnicoRef = useRef(null);
  const sigClienteRef = useRef(null);

  /* ================= STORAGE ================= */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setForm(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleActividadChange = (index, field, value) => {
    const updated = [...form.actividades];
    updated[index][field] = value;
    setForm((p) => ({ ...p, actividades: updated }));
  };

  const addActividad = () => {
    setForm((p) => ({
      ...p,
      actividades: [
        ...p.actividades,
        {
          item: `${p.actividades.length + 1}`,
          codigo: `${p.actividades.length + 1}.1`,
          titulo: "",
          detalle: "",
          imagen: null,
        },
      ],
    }));
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div id="pdf-content" className="bg-white border">

        {/* ================= HEADER ================= */}
        <ReportHeader
          titulo="INFORME TÉCNICO"
          fechaVersion="01-01-26"
          version="01"
        />

        {/* ================= DATOS GENERALES ================= */}
        <table className="w-full border border-black text-sm">
          <tbody>
            <tr>
              <td className="border p-2 font-bold">REFERENCIA DE CONTRATO:</td>
              <td className="border p-2" colSpan={3}>
                <input className="w-full" name="referenciaContrato" value={form.referenciaContrato} onChange={handleChange} />
              </td>
            </tr>

            <tr>
              <td className="border p-2 font-bold">DESCRIPCIÓN:</td>
              <td className="border p-2" colSpan={3}>
                <input className="w-full" name="descripcion" value={form.descripcion} onChange={handleChange} />
              </td>
            </tr>

            <tr>
              <td className="border p-2 font-bold">CÓDIGO IN:</td>
              <td className="border p-2">
                <input className="w-full" name="codigoIN" value={form.codigoIN} onChange={handleChange} />
              </td>

              <td className="border p-2 font-bold">FECHA DE SERVICIO:</td>
              <td className="border p-2">
                <input type="date" className="w-full" name="fechaServicio" value={form.fechaServicio} onChange={handleChange} />
              </td>
            </tr>

            <tr>
              <td className="border p-2 font-bold">UBICACIÓN:</td>
              <td className="border p-2">
                <input className="w-full" name="ubicacion" value={form.ubicacion} onChange={handleChange} />
              </td>

              <td className="border p-2 font-bold">TÉCNICO RESPONSABLE:</td>
              <td className="border p-2">
                <input className="w-full" name="tecnicoResponsable" value={form.tecnicoResponsable} onChange={handleChange} />
              </td>
            </tr>

            <tr>
              <td className="border p-2 font-bold">CLIENTE:</td>
              <td className="border p-2">
                <input className="w-full" name="cliente" value={form.cliente} onChange={handleChange} />
              </td>

              <td className="border p-2 font-bold">RESPONSABLE CLIENTE:</td>
              <td className="border p-2">
                <input className="w-full" name="responsableCliente" value={form.responsableCliente} onChange={handleChange} />
              </td>
            </tr>

            <tr>
              <td className="border p-2 font-bold">DIRECCIÓN:</td>
              <td className="border p-2">
                <input className="w-full" name="direccion" value={form.direccion} onChange={handleChange} />
              </td>

              <td className="border p-2 font-bold">CONTACTO:</td>
              <td className="border p-2">
                <input className="w-full" name="contacto" value={form.contacto} onChange={handleChange} />
              </td>
            </tr>

            <tr>
              <td className="border p-2 font-bold">TELÉFONO:</td>
              <td className="border p-2">
                <input className="w-full" name="telefono" value={form.telefono} onChange={handleChange} />
              </td>

              <td className="border p-2 font-bold">CORREO:</td>
              <td className="border p-2">
                <input className="w-full" name="correo" value={form.correo} onChange={handleChange} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= ACTIVIDADES ================= */}
        <table className="w-full border border-black mt-6 text-sm">
          <thead>
            <tr>
              <th className="border p-2 w-12">ÍTEM</th>
              <th className="border p-2 w-20">CÓDIGO</th>
              <th className="border p-2">DESCRIPCIÓN DE ACTIVIDADES</th>
              <th className="border p-2 w-1/3">IMAGEN</th>
            </tr>
          </thead>

          <tbody>
            {form.actividades.map((a, i) => (
              <tr key={i}>
                <td className="border p-2 text-center">{a.item}</td>
                <td className="border p-2 text-center">{a.codigo}</td>
                <td className="border p-2 space-y-2">
                  <input
                    className="w-full font-semibold"
                    placeholder="TÍTULO DE ACTIVIDAD"
                    value={a.titulo}
                    onChange={(e) => handleActividadChange(i, "titulo", e.target.value)}
                  />
                  <textarea
                    className="w-full"
                    rows={3}
                    placeholder="DETALLE DE ACTIVIDAD"
                    value={a.detalle}
                    onChange={(e) => handleActividadChange(i, "detalle", e.target.value)}
                  />
                </td>
                <td className="border p-2 text-center">
                  <input type="file" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addActividad} className="mt-4 px-4 py-2 border rounded">
          + AGREGAR ACTIVIDAD
        </button>
{/* ================= CONCLUSIONES Y RECOMENDACIONES ================= */}
<table className="w-full border border-black mt-6 text-sm">
  <thead>
    <tr>
      <th className="border border-black p-2 text-center font-bold">
        CONCLUSIONES
      </th>
      <th className="border border-black p-2 text-center font-bold">
        RECOMENDACIONES
      </th>
    </tr>
  </thead>

  <tbody>
    {[0, 1, 2].map((i) => (
      <tr key={i}>
        {/* CONCLUSIONES */}
        <td className="border border-black p-2 align-top">
          <div className="flex gap-2">
            <span className="font-bold">{i + 1}.</span>
            <textarea
              rows={3}
              className="w-full uppercase outline-none resize-none"
              placeholder="CONCLUSIÓN"
              value={form.conclusiones[i]}
              onChange={(e) => {
                const updated = [...form.conclusiones];
                updated[i] = e.target.value.toUpperCase();
                setForm((p) => ({ ...p, conclusiones: updated }));
              }}
            />
          </div>
        </td>

        {/* RECOMENDACIONES */}
        <td className="border border-black p-2 align-top">
          <div className="flex gap-2">
            <span className="font-bold">{i + 1}.</span>
            <textarea
              rows={3}
              className="w-full uppercase outline-none resize-none"
              placeholder="RECOMENDACIÓN"
              value={form.recomendaciones[i]}
              onChange={(e) => {
                const updated = [...form.recomendaciones];
                updated[i] = e.target.value.toUpperCase();
                setForm((p) => ({ ...p, recomendaciones: updated }));
              }}
            />
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>

        {/* ================= FIRMAS ================= */}
        <div className="grid grid-cols-2 gap-6 mt-8 p-4">
          <div>
            <p className="font-bold mb-2">FIRMA DEL TÉCNICO:</p>
            <SignatureCanvas ref={sigTecnicoRef} canvasProps={{ className: "border w-full h-40" }} />
          </div>

          <div>
            <p className="font-bold mb-2">FIRMA DEL CLIENTE:</p>
            <SignatureCanvas ref={sigClienteRef} canvasProps={{ className: "border w-full h-40" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
