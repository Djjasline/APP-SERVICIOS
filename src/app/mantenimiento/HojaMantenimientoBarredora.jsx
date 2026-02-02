import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { nanoid } from "nanoid";

/* =============================
   SECCIONES – MANTENIMIENTO BARREDORA
============================= */
const secciones = [
  {
    id: "1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    tipo: "simple",
    items: [
      ["1.1", "Encendido general del equipo"],
      ["1.2", "Funcionamiento de controles y tablero"],
      ["1.3", "Revisión de alarmas o fallas"],
    ],
  },
  {
    id: "2",
    titulo: "2. RECAMBIO DE ELEMENTOS DE LOS SISTEMAS DEL MÓDULO",
    tipo: "cantidad",
    items: [/* lista completa intacta */],
  },
  {
    id: "3",
    titulo:
      "3. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, POST SERVICIO",
    tipo: "simple",
    items: [
      ["3.1", "Encendido general del equipo"],
      ["3.2", "Funcionamiento del sistema de barrido"],
      ["3.3", "Funcionamiento del sistema hidráulico"],
    ],
  },
];

export default function HojaMantenimientoBarredora() {
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
     CARGA DESDE LOCALSTORAGE
  ============================= */
  useEffect(() => {
    if (!id) return;

    const stored =
      JSON.parse(localStorage.getItem("mantenimiento-barredora")) || [];

    const found = stored.find((r) => r.id === id);

    if (found?.data) {
      setFormData(found.data);

      if (found.data.firmas?.tecnico) {
        firmaTecnicoRef.current?.fromDataURL(found.data.firmas.tecnico);
      }
      if (found.data.firmas?.cliente) {
        firmaClienteRef.current?.fromDataURL(found.data.firmas.cliente);
      }
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
        [codigo]: { ...p.items[codigo], [campo]: valor },
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const stored =
      JSON.parse(localStorage.getItem("mantenimiento-barredora")) || [];

    const record = {
      id: id || nanoid(),
      estado: "completado",
      codInf: formData.codInf || "",
      cliente: formData.cliente || "",
      data: {
        ...formData,
        firmas: {
          tecnico: firmaTecnicoRef.current?.toDataURL() || "",
          cliente: firmaClienteRef.current?.toDataURL() || "",
        },
      },
      createdAt: new Date().toISOString(),
    };

    const updated = id
      ? stored.map((r) => (r.id === id ? record : r))
      : [...stored, record];

    localStorage.setItem(
      "mantenimiento-barredora",
      JSON.stringify(updated)
    );

    navigate("/mantenimiento");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >

      {/* ================= DATOS CLIENTE Y TÉCNICO ================= */}
      <section className="border rounded p-4 grid md:grid-cols-2 gap-3">
        {[
          ["cliente", "Cliente"],
          ["direccion", "Dirección"],
          ["contacto", "Contacto"],
          ["telefono", "Teléfono"],
          ["correo", "Correo"],
          ["tecnicoResponsable", "Técnico responsable"],
          ["telefonoTecnico", "Teléfono técnico"],
          ["correoTecnico", "Correo técnico"],
        ].map(([n, p]) => (
          <input
            key={n}
            name={n}
            value={formData[n]}
            placeholder={p}
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

      {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
      <section className="border rounded p-4">
        <h2 className="font-semibold text-center mb-2">DESCRIPCIÓN DEL EQUIPO</h2>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            ["nota", "NOTA"],
            ["marca", "MARCA"],
            ["modelo", "MODELO"],
            ["serie", "N° SERIE"],
            ["anioModelo", "AÑO MODELO"],
            ["vin", "VIN / CHASIS"],
            ["placa", "PLACA"],
            ["horasModulo", "HORAS MÓDULO"],
            ["horasChasis", "HORAS CHASIS"],
            ["kilometraje", "KILOMETRAJE"],
          ].map(([name, label]) => (
            <div key={name} className="contents">
              <label className="font-semibold">{label}</label>
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="col-span-3 border p-1"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ================= BOTONES ================= */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate("/mantenimiento")}
          className="border px-4 py-2 rounded"
        >
          Volver
        </button>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Guardar mantenimiento
        </button>
      </div>
    </form>
  );
}
