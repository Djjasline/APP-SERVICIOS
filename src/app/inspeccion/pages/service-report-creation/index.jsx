import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

const STORAGE_KEY = "serviceReport_general";

export default function ServiceReportCreation() {
  const [form, setForm] = useState({
    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    fechaServicio: "",
    actividades: [{ item: "1", titulo: "", detalle: "" }],
    conclusiones: ["", "", ""],
    recomendaciones: ["", "", ""],
  });

  const sigTecnicoRef = useRef(null);
  const sigClienteRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setForm(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const handleUpperChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value.toUpperCase() }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div id="pdf-content" className="bg-white p-4">

        {/* ================= HEADER ================= */}
        <table className="w-full border border-black text-xs mb-4">
          <tbody>
            <tr>
              <td className="border border-black p-2 w-1/5 text-center">
                <img src="/astap-logo.jpg" alt="ASTAP" className="mx-auto h-12" />
              </td>

              <td className="border border-black p-2 text-center">
                <p className="font-bold text-sm">INFORME GENERAL DE SERVICIOS</p>
                <p>DEPARTAMENTO DE SERVICIO TÉCNICO</p>
              </td>

              <td className="border border-black p-2 w-1/4">
                <p><strong>VERSIÓN:</strong> 01</p>
                <p><strong>FECHA:</strong> 01-01-26</p>
                <p><strong>PÁGINA:</strong> 1</p>
              </td>
            </tr>

            <tr>
              <td className="border border-black p-1">
                <strong>CÓDIGO:</strong> AST-SRV-001
              </td>
              <td className="border border-black p-1 text-center">
                DOCUMENTO CONTROLADO – USO INTERNO
              </td>
              <td className="border border-black p-1 text-center">
                ASTAP
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= DATOS DEL CLIENTE ================= */}
        <table className="w-full border border-black text-sm mb-6">
          <tbody>
            <tr>
              <td className="border border-black p-2 w-1/4 font-bold">CLIENTE:</td>
              <td className="border border-black p-2">
                <input name="cliente" value={form.cliente} onChange={handleUpperChange} className="w-full uppercase outline-none" />
              </td>
            </tr>

            <tr>
              <td className="border border-black p-2 font-bold">DIRECCIÓN:</td>
              <td className="border border-black p-2">
                <input name="direccion" value={form.direccion} onChange={handleUpperChange} className="w-full uppercase outline-none" />
              </td>
            </tr>

            <tr>
              <td className="border border-black p-2 font-bold">CONTACTO:</td>
              <td className="border border-black p-2">
                <input name="contacto" value={form.contacto} onChange={handleUpperChange} className="w-full uppercase outline-none" />
              </td>
            </tr>

            <tr>
              <td className="border border-black p-2 font-bold">TELÉFONO:</td>
              <td className="border border-black p-2">
                <input name="telefono" value={form.telefono} onChange={handleChange} className="w-full outline-none" />
              </td>
            </tr>

            <tr>
              <td className="border border-black p-2 font-bold">CORREO:</td>
              <td className="border border-black p-2">
                <input name="correo" value={form.correo} onChange={handleUpperChange} className="w-full uppercase outline-none" />
              </td>
            </tr>

            <tr>
              <td className="border border-black p-2 font-bold">FECHA DE SERVICIO:</td>
              <td className="border border-black p-2">
                <input type="date" name="fechaServicio" value={form.fechaServicio} onChange={handleChange} className="outline-none" />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= CONCLUSIONES ================= */}
        <table className="w-full border border-black text-sm mb-6">
          <thead>
            <tr>
              <th className="border border-black p-2">CONCLUSIONES</th>
              <th className="border border-black p-2">RECOMENDACIONES</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2].map((i) => (
              <tr key={i}>
                <td className="border border-black p-2">
                  <textarea
                    rows={3}
                    value={form.conclusiones[i]}
                    onChange={(e) => {
                      const arr = [...form.conclusiones];
                      arr[i] = e.target.value.toUpperCase();
                      setForm((p) => ({ ...p, conclusiones: arr }));
                    }}
                    className="w-full uppercase outline-none resize-none"
                  />
                </td>

                <td className="border border-black p-2">
                  <textarea
                    rows={3}
                    value={form.recomendaciones[i]}
                    onChange={(e) => {
                      const arr = [...form.recomendaciones];
                      arr[i] = e.target.value.toUpperCase();
                      setForm((p) => ({ ...p, recomendaciones: arr }));
                    }}
                    className="w-full uppercase outline-none resize-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= FIRMAS ================= */}
        <table className="w-full border border-black text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-4 text-center">
                FIRMA DEL TÉCNICO
                <SignatureCanvas ref={sigTecnicoRef} canvasProps={{ className: "border w-full h-32 mt-2" }} />
              </td>
              <td className="border border-black p-4 text-center">
                FIRMA DEL CLIENTE
                <SignatureCanvas ref={sigClienteRef} canvasProps={{ className: "border w-full h-32 mt-2" }} />
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
}
