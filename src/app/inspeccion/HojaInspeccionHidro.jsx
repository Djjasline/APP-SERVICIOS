import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted, getInspectionById } from "@/utils/inspectionStorage";

/* =============================
   PRUEBAS PREVIAS AL SERVICIO
============================= */
const pruebasPrevias = [
  ["1.1", "Prueba de encendido general del equipo"],
  ["1.2", "Verificación de funcionamiento de controles principales"],
  ["1.3", "Revisión de alarmas o mensajes de fallo"],
];

/* =============================
   SECCIONES – HIDROSUCCIONADOR
============================= */
const secciones = [ /* ⬅️ EXACTAMENTE LAS MISMAS QUE YA TENÍAS */ ];

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
  });

  /* =============================
     🔹 CARGA DESDE STORAGE
  ============================= */
  useEffect(() => {
    if (!id || id === "0") return;
    const stored = getInspectionById("hidro", id);
    if (stored?.data) setFormData(stored.data);
  }, [id]);

  /* =============================
     HANDLERS
  ============================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    markInspectionCompleted("hidro", id, {
      ...formData,
      firmas: {
        tecnico: firmaTecnicoRef.current?.toDataURL() || "",
        cliente: firmaClienteRef.current?.toDataURL() || "",
      },
    });
    navigate("/inspeccion");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 space-y-4">
      {/* EJEMPLO DE INPUT CONTROLADO */}
      <input
        name="cliente"
        value={formData.cliente}
        onChange={handleChange}
        className="border p-1 w-full"
        placeholder="Cliente"
      />

      {/* EJEMPLO DE PLACEHOLDER CORRECTO */}
      {formData.estadoEquipoPuntos.map((pt) => (
        <input
          key={pt.id}
          value={pt.nota}
          placeholder={`Observación punto ${pt.id}`}
          onChange={(e) => {
            setFormData((p) => ({
              ...p,
              estadoEquipoPuntos: p.estadoEquipoPuntos.map((x) =>
                x.id === pt.id ? { ...x, nota: e.target.value } : x
              ),
            }));
          }}
        />
      ))}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2">
        Guardar informe
      </button>
    </form>
  );
}
