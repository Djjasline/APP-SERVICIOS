import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";

/* =============================
   PRUEBAS PREVIAS
============================= */
const pruebasPrevias = [
  ["1.1", "Prueba de encendido general del equipo"],
  ["1.2", "Funcionamiento de controles principales"],
  ["1.3", "Alarmas o mensajes de fallo"],
];

/* =============================
   SECCIONES HIDRO
============================= */
const secciones = [
  {
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico"],
      ["A.2", "Nivel de aceite del soplador"],
      ["A.3", "Nivel de aceite hidráulico"],
      ["A.4", "Aceite caja de transferencia"],
    ],
  },
  {
    id: "B",
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      ["B.1", "Filtros de agua"],
      ["B.2", "Empaques de filtros"],
      ["B.3", "Fugas de agua"],
    ],
  },
];

export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

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

    items: {},
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

    const stored =
      JSON.parse(localStorage.getItem("inspections_hidro")) || [];

    const found = stored.find(
      (i) => String(i.id) === String(id)
    );

    if (found) {
      setFormData(found.data);

      setTimeout(() => {
        found.data.firmas?.tecnico &&
          firmaTecnicoRef.current?.fromDataURL(
            found.data.firmas.tecnico
          );
        found.data.firmas?.cliente &&
          firmaClienteRef.current?.fromDataURL(
            found.data.firmas.cliente
          );
      }, 0);
    }
  }, [id]);

  /* =============================
     HANDLERS
  ============================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

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

  /* =============================
     ESTADO EQUIPO (PUNTOS)
  ============================= */
  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: [
        ...p.estadoEquipoPuntos,
        {
          id: p.estadoEquipoPuntos.length + 1,
          x,
          y,
          nota: "",
        },
      ],
    }));
  };

  const removePoint = (id) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos
        .filter((pt) => pt.id !== id)
        .map((pt, i) => ({ ...pt, id: i + 1 })),
    }));
  };

  /* =============================
     GUARDAR
  ============================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    const tecnico =
      firmaTecnicoRef.current?.isEmpty()
        ? ""
        : firmaTecnicoRef.current.toDataURL();

    const cliente =
      firmaClienteRef.current?.isEmpty()
        ? ""
        : firmaClienteRef.current.toDataURL();

    const estado =
      tecnico && cliente ? "Completado" : "Borrador";

    const stored =
      JSON.parse(localStorage.getItem("inspections_hidro")) || [];

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
      ? stored.map((i) =>
          i.id === payload.id ? payload : i
        )
      : [...stored, payload];

    localStorage.setItem(
      "inspections_hidro",
      JSON.stringify(updated)
    );

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
      <h1 className="text-xl font-bold">
        Hoja de inspección – Hidrosuccionador
      </h1>

      {/* DATOS */}
      <section className="grid md:grid-cols-2 gap-3">
        {[
          ["cliente", "Cliente"],
          ["direccion", "Dirección"],
          ["contacto", "Contacto"],
          ["telefono", "Teléfono"],
          ["correo", "Correo"],
          ["tecnicoResponsable", "Técnico"],
          ["telefonoTecnico", "Teléfono técnico"],
          ["correoTecnico", "Correo técnico"],
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

      {/* ESTADO EQUIPO */}
      <section>
        <h2 className="font-semibold">Estado del equipo</h2>
        <div
          className="relative border rounded cursor-crosshair"
          onClick={handleImageClick}
        >
          <img
            src="/estado-equipo.png"
            className="w-full"
            draggable={false}
          />
          {formData.estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              onDoubleClick={() => removePoint(pt.id)}
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
      </section>

      {/* PRUEBAS */}
      <section>
        <h2 className="font-semibold">Pruebas previas</h2>
        <table className="w-full border text-xs">
          <tbody>
            {pruebasPrevias.map(([c, t]) => (
              <tr key={c}>
                <td>{c}</td>
                <td>{t}</td>
                <td>
                  <input
                    type="radio"
                    onChange={() =>
                      handleItemChange(c, "estado", "SI")
                    }
                  />
                </td>
                <td>
                  <input
                    type="radio"
                    onChange={() =>
                      handleItemChange(c, "estado", "NO")
                    }
                  />
                </td>
                <td>
                  <input
                    className="border w-full"
                    onChange={(e) =>
                      handleItemChange(
                        c,
                        "observacion",
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* FIRMAS */}
      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="font-semibold">Firma Técnico</p>
          <SignatureCanvas
            ref={firmaTecnicoRef}
            canvasProps={{
              className: "border w-full h-32",
            }}
          />
        </div>
        <div>
          <p className="font-semibold">Firma Cliente</p>
          <SignatureCanvas
            ref={firmaClienteRef}
            canvasProps={{
              className: "border w-full h-32",
            }}
          />
        </div>
      </section>

      {/* BOTONES */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => navigate("/inspeccion")}
          className="border px-4 py-2 rounded"
        >
          Volver
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
