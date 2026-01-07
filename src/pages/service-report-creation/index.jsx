import { useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function ServiceReportCreation() {
  const [data, setData] = useState({
    referenciaContrato: "",
    descripcion: "",
    codInf: "",

    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    fechaServicio: "",

    actividades: [
      { titulo: "", detalle: "", imagen: null },
    ],

    conclusiones: [""],
    recomendaciones: [""],

    equipo: {
      marca: "",
      modelo: "",
      serie: "",
      año: "",
      vin: "",
      placa: "",
      horas Modulo: "",
      horas Chasis: "",
      kilometraje: "",
    },

    responsables: {
      astap: { nombre: "", cargo: "", telefono: "", correo: "" },
      cliente: { nombre: "", cargo: "", telefono: "", correo: "" },
    },
  });

  const sigTecnicoRef = useState(null)[0];
  const sigClienteRef = useState(null)[0];

  const update = (path, value) => {
    setData(prev => {
      const copy = structuredClone(prev);
      let ref = copy;
      for (let i = 0; i < path.length - 1; i++) {
        ref = ref[path[i]];
      }
      ref[path[path.length - 1]] = value;
      return copy;
    });
  };

  const addActividad = () =>
    setData(p => ({
      ...p,
      actividades: [...p.actividades, { titulo: "", detalle: "", imagen: null }],
    }));

  const removeActividad = () =>
    setData(p => ({
      ...p,
      actividades: p.actividades.slice(0, -1),
    }));

  const handleImage = (i, file) => {
    const reader = new FileReader();
    reader.onload = () =>
      update(["actividades", i, "imagen"], reader.result);
    reader.readAsDataURL(file);
  };

  const addFilaCR = () =>
    setData(p => ({
      ...p,
      conclusiones: [...p.conclusiones, ""],
      recomendaciones: [...p.recomendaciones, ""],
    }));

  const removeFilaCR = () =>
    setData(p => ({
      ...p,
      conclusiones: p.conclusiones.slice(0, -1),
      recomendaciones: p.recomendaciones.slice(0, -1),
    }));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-5xl mx-auto space-y-6">

        <ReportHeader data={data} />

        {/* DATOS CLIENTE */}
        <table className="pdf-table">
          <tbody>
            {[
              ["CLIENTE", "cliente"],
              ["DIRECCIÓN", "direccion"],
              ["CONTACTO", "contacto"],
              ["TELÉFONO", "telefono"],
              ["CORREO", "correo"],
              ["FECHA DE SERVICIO", "fechaServicio"],
            ].map(([l, k]) => (
              <tr key={k}>
                <td className="pdf-label">{l}</td>
                <td>
                  <input className="pdf-input" value={data[k]}
                    onChange={e => update([k], e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ACTIVIDADES */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th>ÍTEM</th>
              <th>DESCRIPCIÓN DE ACTIVIDADES</th>
              <th>IMAGEN</th>
            </tr>
          </thead>
          <tbody>
            {data.actividades.map((a, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <input className="pdf-input" placeholder="Título"
                    value={a.titulo}
                    onChange={e => update(["actividades", i, "titulo"], e.target.value)} />
                  <textarea className="pdf-textarea" placeholder="Detalle"
                    value={a.detalle}
                    onChange={e => update(["actividades", i, "detalle"], e.target.value)} />
                </td>
                <td>
                  <input type="file" accept="image/*"
                    onChange={e => handleImage(i, e.target.files[0])} />
                  {a.imagen && <img src={a.imagen} style={{ maxWidth: "100%" }} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-4">
          <button onClick={addActividad}>+ Agregar actividad</button>
          <button onClick={removeActividad}>− Quitar actividad</button>
        </div>

        {/* CONCLUSIONES / RECOMENDACIONES */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th>CONCLUSIONES</th>
              <th>RECOMENDACIONES</th>
            </tr>
          </thead>
          <tbody>
            {data.conclusiones.map((_, i) => (
              <tr key={i}>
                <td><textarea className="pdf-textarea"
                  value={data.conclusiones[i]}
                  onChange={e => update(["conclusiones", i], e.target.value)} /></td>
                <td><textarea className="pdf-textarea"
                  value={data.recomendaciones[i]}
                  onChange={e => update(["recomendaciones", i], e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-4">
          <button onClick={addFilaCR}>+ Agregar fila</button>
          <button onClick={removeFilaCR}>− Quitar fila</button>
        </div>

        {/* DESCRIPCIÓN EQUIPO */}
        <table className="pdf-table">
          <thead><tr><th colSpan="2">DESCRIPCIÓN DEL EQUIPO</th></tr></thead>
          <tbody>
            {Object.entries(data.equipo).map(([k]) => (
              <tr key={k}>
                <td className="pdf-label">{k.toUpperCase()}</td>
                <td>
                  <input className="pdf-input"
                    value={data.equipo[k]}
                    onChange={e => update(["equipo", k], e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* FIRMAS */}
        <table className="pdf-table">
          <thead>
            <tr><th>FIRMA TÉCNICO</th><th>FIRMA CLIENTE</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><SignatureCanvas ref={sigTecnicoRef} /></td>
              <td><SignatureCanvas ref={sigClienteRef} /></td>
            </tr>
          </tbody>
        </table>

        {/* RESPONSABLES */}
        <table className="pdf-table">
          <thead>
            <tr><th colSpan="2">ELABORADO POR</th><th colSpan="2">APROBADO POR</th></tr>
          </thead>
          <tbody>
            {["nombre", "cargo", "telefono", "correo"].map(k => (
              <tr key={k}>
                <td>{k.toUpperCase()}</td>
                <td><input className="pdf-input"
                  value={data.responsables.astap[k]}
                  onChange={e => update(["responsables", "astap", k], e.target.value)} /></td>
                <td>{k.toUpperCase()}</td>
                <td><input className="pdf-input"
                  value={data.responsables.cliente[k]}
                  onChange={e => update(["responsables", "cliente", k], e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}
