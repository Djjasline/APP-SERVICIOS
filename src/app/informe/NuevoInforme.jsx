import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function NuevoInforme() {
  const navigate = useNavigate();

  const emptyReport = {
    referenciaContrato: "",
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

    actividades: [
      { titulo: "", detalle: "", imagen: "" },
    ],

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
    },

    firmas: {
      tecnico: "",
      cliente: "",
    },
  };

  const [data, setData] = useState(emptyReport);

  const sigTecnico = useRef(null);
  const sigCliente = useRef(null);

  useEffect(() => {
    const current = JSON.parse(localStorage.getItem("currentReport"));
    if (current?.data) {
      setData(current.data);
      setTimeout(() => {
        current.data.firmas?.tecnico && sigTecnico.current?.fromDataURL(current.data.firmas.tecnico);
        current.data.firmas?.cliente && sigCliente.current?.fromDataURL(current.data.firmas.cliente);
      }, 0);
    }
  }, []);

  const update = (path, value) => {
    setData(prev => {
      const copy = structuredClone(prev);
      let ref = copy;
      for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
      ref[path.at(-1)] = value;
      return copy;
    });
  };

  const fileToBase64 = (file, cb) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => cb(reader.result);
    reader.readAsDataURL(file);
  };

  const addActividad = () => {
    setData(p => ({
      ...p,
      actividades: [...p.actividades, { titulo: "", detalle: "", imagen: "" }],
    }));
  };

  const removeActividad = (index) => {
    setData(p => ({
      ...p,
      actividades: p.actividades.filter((_, i) => i !== index),
    }));
  };

  const saveReport = () => {
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];

    const report = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      estado:
        sigTecnico.current?.isEmpty() || sigCliente.current?.isEmpty()
          ? "borrador"
          : "completado",
      data: {
        ...data,
        firmas: {
          tecnico: sigTecnico.current?.toDataURL() || "",
          cliente: sigCliente.current?.toDataURL() || "",
        },
      },
    };

    localStorage.setItem("serviceReports", JSON.stringify([...stored, report]));
    localStorage.setItem("currentReport", JSON.stringify(report));

    navigate("/informe");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto space-y-6">

        <ReportHeader data={data} onChange={update} />

        {/* ACTIVIDADES */}
        <h2 className="text-lg font-bold">ACTIVIDADES REALIZADAS</h2>

        {data.actividades.map((a, i) => (
          <div key={i} className="border p-4 rounded space-y-2">
            <div className="flex justify-between">
              <strong>Actividad {i + 1}</strong>
              {data.actividades.length > 1 && (
                <button
                  className="text-red-600 text-sm"
                  onClick={() => removeActividad(i)}
                >
                  Eliminar
                </button>
              )}
            </div>

            <input
              className="pdf-input"
              placeholder="Título de la actividad"
              value={a.titulo}
              onChange={(e) => update(["actividades", i, "titulo"], e.target.value)}
            />

            <textarea
              className="pdf-textarea"
              placeholder="Detalle"
              value={a.detalle}
              onChange={(e) => update(["actividades", i, "detalle"], e.target.value)}
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                fileToBase64(e.target.files[0], (b64) =>
                  update(["actividades", i, "imagen"], b64)
                )
              }
            />

            {a.imagen && <img src={a.imagen} style={{ maxWidth: 200 }} />}
          </div>
        ))}

        <button
          className="border px-4 py-2 rounded"
          onClick={addActividad}
        >
          + Agregar actividad
        </button>

        {/* FIRMAS */}
        <div className="grid grid-cols-2 gap-4">
          <SignatureCanvas ref={sigTecnico} canvasProps={{ height: 150 }} />
          <SignatureCanvas ref={sigCliente} canvasProps={{ height: 150 }} />
        </div>

        <div className="flex justify-between">
          <button onClick={() => navigate("/informe")} className="border px-6 py-2">
            Volver
          </button>
          <button onClick={saveReport} className="bg-blue-600 text-white px-6 py-2">
            Guardar informe
          </button>
        </div>

      </div>
    </div>
  );
}
