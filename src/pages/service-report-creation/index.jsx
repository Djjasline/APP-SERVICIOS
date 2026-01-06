import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ServiceReportCreation() {
  const pdfRef = useRef(null);

  const [cliente, setCliente] = useState({
    nombre: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    fechaServicio: "",
    codigoInterno: "",
  });

  const [actividades, setActividades] = useState([
    { titulo: "", detalle: "", imagen: null },
  ]);

  const [conclusiones, setConclusiones] = useState("");

  const handleClienteChange = (e) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  const handleActividadChange = (index, field, value) => {
    const nuevas = [...actividades];
    nuevas[index][field] = value;
    setActividades(nuevas);
  };

  const handleImageChange = (index, file) => {
    const nuevas = [...actividades];
    nuevas[index].imagen = URL.createObjectURL(file);
    setActividades(nuevas);
  };

  const agregarActividad = () => {
    setActividades([
      ...actividades,
      { titulo: "", detalle: "", imagen: null },
    ]);
  };

  const generarPDF = async () => {
    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("INFORME_GENERAL_SERVICIOS.pdf");
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* BOTÓN PDF */}
      <div className="flex justify-end mb-4">
        <button
          onClick={generarPDF}
          className="px-4 py-2 bg-slate-900 text-white rounded"
        >
          GENERAR PDF
        </button>
      </div>

      {/* CONTENIDO PDF */}
      <div ref={pdfRef} className="bg-white p-6 border">

        {/* HEADER */}
        <table className="w-full border mb-4 text-sm">
          <tbody>
            <tr>
              <td className="border p-2 w-1/4 text-center font-bold">
                ASTAP
              </td>
              <td className="border p-2 text-center font-bold">
                INFORME GENERAL DE SERVICIOS<br />
                Departamento de Servicio Técnico
              </td>
              <td className="border p-2 w-1/4">
                Versión: 01<br />
                Fecha: 26-11-25<br />
                Página: 1
              </td>
            </tr>
          </tbody>
        </table>

        {/* DATOS CLIENTE */}
        <table className="w-full border text-sm mb-4">
          <tbody>
            {[
              ["CLIENTE", "nombre"],
              ["DIRECCIÓN", "direccion"],
              ["CONTACTO", "contacto"],
              ["TELÉFONO", "telefono"],
              ["CORREO", "correo"],
              ["FECHA DE SERVICIO", "fechaServicio"],
              ["CÓDIGO INTERNO", "codigoInterno"],
            ].map(([label, field]) => (
              <tr key={field}>
                <td className="border p-2 w-1/4 font-bold">
                  {label}
                </td>
                <td className="border p-2">
                  <input
                    name={field}
                    value={cliente[field]}
                    onChange={handleClienteChange}
                    className="w-full border px-2 py-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ACTIVIDADES */}
        <table className="w-full border text-sm mb-4">
          <thead>
            <tr>
              <th className="border p-2 w-12">ÍTEM</th>
              <th className="border p-2">DESCRIPCIÓN DE ACTIVIDADES</th>
              <th className="border p-2 w-1/4">IMAGEN</th>
            </tr>
          </thead>
          <tbody>
            {actividades.map((act, i) => (
              <tr key={i}>
                <td className="border p-2 text-center">
                  {i + 1}
                </td>
                <td className="border p-2">
                  <input
                    placeholder="TÍTULO"
                    className="w-full border mb-2 px-2 py-1"
                    value={act.titulo}
                    onChange={(e) =>
                      handleActividadChange(i, "titulo", e.target.value)
                    }
                  />
                  <textarea
                    placeholder="DETALLE"
                    className="w-full border px-2 py-1"
                    rows={4}
                    value={act.detalle}
                    onChange={(e) =>
                      handleActividadChange(i, "detalle", e.target.value)
                    }
                  />
                </td>
                <td className="border p-2 text-center">
                  <input
                    type="file"
                    onChange={(e) =>
                      handleImageChange(i, e.target.files[0])
                    }
                  />
                  {act.imagen && (
                    <img
                      src={act.imagen}
                      alt=""
                      className="mt-2 max-h-32 mx-auto"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={agregarActividad}
          className="px-3 py-1 border mb-4"
        >
          + AGREGAR ACTIVIDAD
        </button>

        {/* CONCLUSIONES */}
        <table className="w-full border text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-center">
                CONCLUSIONES
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">
                <textarea
                  className="w-full border px-2 py-2"
                  rows={5}
                  value={conclusiones}
                  onChange={(e) => setConclusiones(e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
}
