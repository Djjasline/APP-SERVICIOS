import { useState } from "react";

export default function ServiceReportCreation() {
  const [form, setForm] = useState({
    codigo: "AST-SRV-001",
    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    fechaServicio: "",
    actividades: [
      { titulo: "", detalle: "", imagen: null }
    ],
    conclusiones: "",
  });

  return (
    <div className="flex justify-center bg-slate-100 py-6">
      <div className="bg-white p-6 w-[900px] border border-black">

        {/* ================= HEADER ================= */}
        <table className="w-full border border-black text-sm mb-4">
          <tbody>
            <tr>
              <td className="border border-black w-1/5 text-center">
                <img
                  src="/astap-logo.jpg"
                  alt="ASTAP"
                  className="mx-auto h-12"
                />
              </td>

              <td className="border border-black w-3/5 text-center">
                <div className="font-bold uppercase">
                  INFORME GENERAL DE SERVICIOS
                </div>
                <div className="text-xs uppercase">
                  DEPARTAMENTO DE SERVICIO TÉCNICO
                </div>
              </td>

              <td className="border border-black w-1/5 text-xs">
                <div><b>VERSIÓN:</b> 01</div>
                <div><b>FECHA:</b> 26-11-25</div>
                <div><b>PÁGINA:</b> 1</div>
              </td>
            </tr>

            <tr>
              <td className="border border-black text-xs p-1">
                <b>CÓDIGO:</b> {form.codigo}
              </td>
              <td colSpan={2} className="border border-black text-center text-xs">
                DOCUMENTO CONTROLADO – USO INTERNO
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= DATOS CLIENTE ================= */}
        <table className="w-full border border-black text-sm mb-4">
          <tbody>
            {[
              ["CLIENTE", "cliente"],
              ["DIRECCIÓN", "direccion"],
              ["CONTACTO", "contacto"],
              ["TELÉFONO", "telefono"],
              ["CORREO", "correo"],
              ["FECHA DE SERVICIO", "fechaServicio"],
            ].map(([label, key]) => (
              <tr key={key}>
                <td className="border border-black w-1/4 p-2 font-semibold uppercase">
                  {label}
                </td>
                <td className="border border-black p-2">
                  <input
                    className="w-full outline-none uppercase"
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value.toUpperCase() })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= ACTIVIDADES ================= */}
        <table className="w-full border border-black text-sm mb-4">
          <thead>
            <tr>
              <th className="border border-black p-2 uppercase">ÍTEM</th>
              <th className="border border-black p-2 uppercase">DESCRIPCIÓN DE ACTIVIDADES</th>
              <th className="border border-black p-2 uppercase">IMAGEN</th>
            </tr>
          </thead>
          <tbody>
            {form.actividades.map((act, i) => (
              <tr key={i}>
                <td className="border border-black text-center">{i + 1}</td>
                <td className="border border-black p-2">
                  <input
                    placeholder="TÍTULO"
                    className="w-full mb-2 border p-1 uppercase"
                  />
                  <textarea
                    placeholder="DETALLE"
                    className="w-full border p-1 uppercase"
                    rows={3}
                  />
                </td>
                <td className="border border-black p-2 text-center">
                  <input type="file" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= CONCLUSIONES ================= */}
        <table className="w-full border border-black text-sm">
          <thead>
            <tr>
              <th className="border border-black p-2 uppercase">
                CONCLUSIONES
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2">
                <textarea
                  className="w-full uppercase outline-none"
                  rows={4}
                  value={form.conclusiones}
                  onChange={(e) =>
                    setForm({ ...form, conclusiones: e.target.value.toUpperCase() })
                  }
                />
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
}
