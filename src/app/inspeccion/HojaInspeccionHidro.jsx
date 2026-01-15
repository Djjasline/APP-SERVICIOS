import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";

/* =============================
   PRUEBAS PREVIAS
============================= */
const pruebasPrevias = [
  ["1.1", "Prueba de encendido general del equipo"],
  ["1.2", "Funcionamiento de controles principales"],
  ["1.3", "Revisión de alarmas o fallas"],
];

/* =============================
   SECCIONES
============================= */
const secciones = [
  {
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico"],
      ["A.2", "Nivel de aceite hidráulico"],
      ["A.3", "Bancos hidráulicos"],
    ],
  },
  {
    id: "B",
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      ["B.1", "Filtros de agua"],
      ["B.2", "Fugas de agua"],
      ["B.3", "Manómetros"],
    ],
  },
];

export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  /* =============================
     ESTADO BASE
  ============================= */
  const [formData, setFormData] = useState({
    referenciaContrato: "",
    descripcion: "",
    codInf: "",

    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    tecnicoResponsable: "",
    telefonoTecnico: "",
    correoTecnico: "",
    fechaServicio: "",

    estadoEquipoPuntos: [],
    items: {},

    equipo: {
      marca: "",
      modelo: "",
      serie: "",
      anioModelo: "",
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
  });

  /* =============================
     CARGAR DESDE HISTORIAL
  ============================= */
  useEffect(() => {
    if (!id) return;

    const stored = JSON.parse(localStorage.getItem("inspections_hidro")) || [];
    const found = stored.find((i) => String(i.id) === String(id));

    if (found) {
      setFormData(found.data);

      setTimeout(() => {
        if (found.data.firmas?.tecnico) {
          firmaTecnicoRef.current?.fromDataURL(found.data.firmas.tecnico);
        }
        if (found.data.firmas?.cliente) {
          firmaClienteRef.current?.fromDataURL(found.data.firmas.cliente);
        }
      }, 0);
    }
  }, [id]);

  /* =============================
     HANDLERS
  ============================= */
  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleItemChange = (codigo, campo, valor) => {
    setFormData((p) => ({
      ...p,
      items: {
        ...p.items,
        [codigo]: {
          ...p.items[codigo],
          [campo]: valor,
        },
      },
    }));
  };

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

  const handleNotaChange = (id, value) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos.map((pt) =>
        pt.id === id ? { ...pt, nota: value } : pt
      ),
    }));
  };

  /* =============================
     GUARDAR
  ============================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    const tecnico = firmaTecnicoRef.current?.isEmpty()
      ? ""
      : firmaTecnicoRef.current.toDataURL();

    const cliente = firmaClienteRef.current?.isEmpty()
      ? ""
      : firmaClienteRef.current.toDataURL();

    const estado =
      tecnico && cliente ? "Completado" : "Borrador";

    const stored = JSON.parse(localStorage.getItem("inspections_hidro")) || [];

    const payload = {
      id: id ? Number(id) : Date.now(),
      tipo: "hidro",
      estado,
      createdAt: new Date().toISOString(),
      data: {
        ...formData,
        firmas: { tecnico, cliente },
      },
    };

    const updated = id
      ? stored.map((i) => (i.id === payload.id ? payload : i))
      : [...stored, payload];

    localStorage.setItem("inspections_hidro", JSON.stringify(updated));

    navigate("/inspeccion");
  };

  /* =============================
     RENDER
  ============================= */
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >
      <h1 className="text-xl font-bold">Hoja de inspección – Hidrosuccionador</h1>

      {/* DATOS */}
      <section className="grid md:grid-cols-2 gap-3 border rounded p-4">
        {[
          ["cliente", "Cliente"],
          ["direccion", "Dirección"],
          ["contacto", "Contacto"],
          ["telefono", "Teléfono"],
          ["correo", "Correo"],
          ["tecnicoResponsable", "Técnico responsable"],
        ].map(([n, p]) => (
          <input
            key={n}
            name={n}
            placeholder={p}
            value={formData[n]}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        ))}
        <input
          type="date"
          name="fechaServicio"
          value={formData.fechaServicio}
          onChange={handleChange}
          className="border p-2 rounded md:col-span-2"
        />
      </section>

      {/* ESTADO DEL EQUIPO */}
      <section className="border rounded p-4 space-y-3">
        <p className="font-semibold">Estado del equipo</p>
        <div
          className="relative border rounded cursor-crosshair"
          onClick={handleImageClick}
        >
          <img src="/estado-equipo.png" className="w-full" />
          {formData.estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              className="absolute bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full"
              style={{
                left: `${pt.x}%`,
                top: `${pt.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {pt.id}
            </div>
          ))}
        </div>

        {formData.estadoEquipoPuntos.map((pt) => (
          <input
            key={pt.id}
            className="w-full border p-1"
            placeholder={`Observación punto ${pt.id}`}
            value={pt.nota}
            onChange={(e) => handleNotaChange(pt.id, e.target.value)}
          />
        ))}
      </section>

      {/* TABLAS */}
      {[...pruebasPrevias.map(p => ({ titulo: "Pruebas previas", items:[p] })), ...secciones].map((sec, i) => (
        <section key={i} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
          <table className="w-full text-xs border">
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Detalle</th>
                <th>SI</th>
                <th>NO</th>
                <th>Obs.</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map(([c, t]) => (
                <tr key={c}>
                  <td>{c}</td>
                  <td>{t}</td>
                  <td><input type="radio" onChange={() => handleItemChange(c,"estado","SI")} /></td>
                  <td><input type="radio" onChange={() => handleItemChange(c,"estado","NO")} /></td>
                  <td><input className="border w-full" onChange={(e)=>handleItemChange(c,"observacion",e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* FIRMAS */}
      <section className="grid md:grid-cols-2 gap-6 border rounded p-4">
        <div>
          <p className="font-semibold mb-1">Firma Técnico</p>
          <SignatureCanvas ref={firmaTecnicoRef} canvasProps={{ className: "border w-full h-32" }} />
        </div>
        <div>
          <p className="font-semibold mb-1">Firma Cliente</p>
          <SignatureCanvas ref={firmaClienteRef} canvasProps={{ className: "border w-full h-32" }} />
        </div>
      </section>

      {/* BOTONES */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => navigate("/inspeccion")} className="border px-4 py-2 rounded">
          Volver
        </button>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Guardar
        </button>
      </div>
    </form>
  );
}
