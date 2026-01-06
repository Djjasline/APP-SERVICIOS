import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

const STORAGE_KEY = "ASTAP_SERVICE_REPORT";

export default function ServiceReportCreation() {
  const [data, setData] = useState({
    info: {
      cliente: "",
      contactoCliente: "",
      ubicacion: "",
      fecha: "",
      tecnico: "",
      equipo: "",
      marca: "",
      modelo: "",
      serie: "",
      placa: "",
      km: "",
      horas: "",
    },
    actividades: [
      { titulo: "", detalle: "", imagen: null },
    ],
    conclusiones: "",
    firmas: {
      tecnico: null,
      cliente: null,
    },
  });

  const sigTecRef = useRef(null);
  const sigCliRef = useRef(null);

  /* ================= STORAGE ================= */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const setInfo = (field, value) => {
    setData((p) => ({
      ...p,
      info: { ...p.info, [field]: value.toUpperCase() },
    }));
  };

  const setActividad = (i, field, value) => {
    const next = [...data.actividades];
    next[i][field] = value;
    setData((p) => ({ ...p, actividades: next }));
  };

  const addActividad = () => {
    setData((p) => ({
      ...p,
      actividades: [...p.actividades, { titulo: "", detalle: "", imagen: null }],
    }));
  };

  const setImage = (i, file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setActividad(i, "imagen", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveFirma = (tipo, ref) => {
    if (!ref.current) return;
    setData((p) => ({
      ...p,
      firmas: {
        ...p.firmas,
        [tipo]: ref.current.getTrimmedCanvas().toDataURL(),
      },
    }));
  };

  /* ================= RENDER ================= */
  return (
    <div className="bg-slate-100 min-h-screen p-6">
      <div id="pdf-content" className="bg-white p-6 text-sm space-y-6">

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <img src="/astap-logo.jpg" alt="ASTAP" className="h-12" />
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">INFORME GENERAL DE SERVICIOS</p>
            <p className="text-xs">DEPARTAMENTO DE SERVICIO TÉCNICO</p>
          </div>
          <div className="text-xs text-right">
            <p><strong>CÓDIGO:</strong> AST-SRV-001</p>
            <p><strong>VERSIÓN:</strong> 01</p>
            <p><strong>FECHA:</strong> 01-01-26</p>
          </div>
        </div>

        {/* ================= INFORMACIÓN GENERAL ================= */}
        <div>
          <p className="font-bold mb-2">1. INFORMACIÓN GENERAL DEL SERVICIO</p>
          <table className="w-full border text-xs">
            <tbody>
              {[
                ["CLIENTE", "cliente"],
                ["CONTACTO CLIENTE", "contactoCliente"],
                ["UBICACIÓN", "ubicacion"],
                ["FECHA", "fecha"],
                ["TÉCNICO RESPONSABLE", "tecnico"],
                ["EQUIPO / UNIDAD", "equipo"],
                ["MARCA", "marca"],
                ["MODELO", "modelo"],
                ["SERIE", "serie"],
                ["PLACA", "placa"],
                ["KILOMETRAJE", "km"],
                ["HORAS DE TRABAJO", "horas"],
              ].map(([label, key]) => (
                <tr key={key}>
                  <td className="border px-2 py-1 font-semibold w-1/3">{label}</td>
                  <td className="border px-2 py-1">
                    <input
                      className="w-full uppercase outline-none"
                      value={data.info[key]}
                      onChange={(e) => setInfo(key, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= ACTIVIDADES ================= */}
        <div>
          <p className="font-bold mb-2">2. ACTIVIDADES REALIZADAS</p>
          {data.actividades.map((a, i) => (
            <div key={i} className="border p-3 mb-3">
              <p className="font-semibold mb-1">ACTIVIDAD {i + 1}</p>
              <input
                placeholder="TÍTULO DE LA ACTIVIDAD"
                className="w-full uppercase border px-2 py-1 mb-2"
                value={a.titulo}
                onChange={(e) => setActividad(i, "titulo", e.target.value.toUpperCase())}
              />
              <textarea
                placeholder="DETALLE DE LA ACTIVIDAD"
                rows={3}
                className="w-full uppercase border px-2 py-1 mb-2"
                value={a.detalle}
                onChange={(e) => setActividad(i, "detalle", e.target.value.toUpperCase())}
              />
              {a.imagen && <img src={a.imagen} className="max-h-40 mb-2" />}
              <input type="file" onChange={(e) => setImage(i, e.target.files[0])} />
            </div>
          ))}
          <button onClick={addActividad} className="border px-3 py-1 text-xs">
            + AGREGAR ACTIVIDAD
          </button>
        </div>

        {/* ================= CONCLUSIONES ================= */}
        <div>
          <p className="font-bold mb-2">3. CONCLUSIONES</p>
          <textarea
            rows={4}
            className="w-full uppercase border px-2 py-1"
            value={data.conclusiones}
            onChange={(e) =>
              setData((p) => ({ ...p, conclusiones: e.target.value.toUpperCase() }))
            }
          />
        </div>

        {/* ================= FIRMAS ================= */}
        <div className="grid grid-cols-2 gap-6 pt-6">
          <div className="text-center">
            <SignatureCanvas
              ref={sigTecRef}
              canvasProps={{ className: "border w-full h-32" }}
              onEnd={() => saveFirma("tecnico", sigTecRef)}
            />
            <p className="mt-2 font-semibold">FIRMA DEL TÉCNICO</p>
          </div>

          <div className="text-center">
            <SignatureCanvas
              ref={sigCliRef}
              canvasProps={{ className: "border w-full h-32" }}
              onEnd={() => saveFirma("cliente", sigCliRef)}
            />
            <p className="mt-2 font-semibold">FIRMA DEL CLIENTE</p>
          </div>
        </div>

      </div>
    </div>
  );
}
