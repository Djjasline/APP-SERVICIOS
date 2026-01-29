import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import {
  markInspectionCompleted,
  getInspectionById,
} from "@/utils/inspectionStorage";

/* =============================
   SECCIONES – BARREDORA
============================= */
const secciones = [
  {
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "Fugas de aceite hidráulico"],
      ["A.2", "Nivel de aceite del tanque AW68"],
      ["A.3", "Fugas en motores de cepillos"],
      ["A.4", "Fugas en motor de banda"],
      ["A.5", "Fugas en bombas hidráulicas"],
      ["A.6", "Fugas en motor John Deere"],
    ],
  },
  {
    id: "B",
    titulo: "B) SISTEMA DE CONTROL DE POLVO (AGUA)",
    items: [
      ["B.1", "Fugas de agua"],
      ["B.2", "Filtro de agua"],
      ["B.3", "Válvulas check"],
      ["B.4", "Solenoides"],
      ["B.5", "Bomba eléctrica"],
    ],
  },
];

export default function HojaInspeccionBarredora() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  const baseState = {
    cliente: "",
    fechaServicio: "",
    estadoEquipoPuntos: [],
    items: {},
    firmas: { tecnico: "", cliente: "" },
  };

  const [formData, setFormData] = useState(baseState);

  /* =========================
     CARGAR INSPECCIÓN
  ========================= */
  useEffect(() => {
    if (!id) return;
    const stored = getInspectionById("barredora", id);
    if (stored?.data) setFormData(stored.data);
  }, [id]);

  /* =========================
     RECARGAR FIRMAS
  ========================= */
  useEffect(() => {
    if (formData.firmas?.tecnico && firmaTecnicoRef.current) {
      firmaTecnicoRef.current.fromDataURL(formData.firmas.tecnico);
    }
    if (formData.firmas?.cliente && firmaClienteRef.current) {
      firmaClienteRef.current.fromDataURL(formData.firmas.cliente);
    }
  }, [formData.firmas]);

  /* =========================
     HANDLERS
  ========================= */
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
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: [
        ...p.estadoEquipoPuntos,
        { id: p.estadoEquipoPuntos.length + 1, x, y, nota: "" },
      ],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    markInspectionCompleted("barredora", id, {
      ...formData,
      firmas: {
        tecnico: firmaTecnicoRef.current?.toDataURL() || "",
        cliente: firmaClienteRef.current?.toDataURL() || "",
      },
    });

    navigate("/inspeccion");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white p-6 space-y-6"
    >
      {/* ESTADO DEL EQUIPO */}
      <section className="border p-4">
        <h2 className="font-semibold mb-2">Estado del equipo</h2>

        <div
          className="relative border cursor-crosshair"
          onClick={handleImageClick}
        >
          <img
            src="/estado equipo barredora.png"
            className="w-full"
            draggable={false}
          />

          {formData.estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              className="absolute bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded-full"
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

      {/* SECCIONES */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border p-4">
          <h3 className="font-semibold mb-2">{sec.titulo}</h3>
          <table className="w-full border text-sm">
            <tbody>
              {sec.items.map(([codigo, texto]) => (
                <tr key={codigo}>
                  <td>{codigo}</td>
                  <td>{texto}</td>
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[codigo]?.estado === "SI"}
                      onChange={() =>
                        handleItemChange(codigo, "estado", "SI")
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[codigo]?.estado === "NO"}
                      onChange={() =>
                        handleItemChange(codigo, "estado", "NO")
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* FIRMAS */}
      <section className="grid grid-cols-2 gap-6">
        <SignatureCanvas
          ref={firmaTecnicoRef}
          canvasProps={{ className: "border w-full h-32" }}
        />
        <SignatureCanvas
          ref={firmaClienteRef}
          canvasProps={{ className: "border w-full h-32" }}
        />
      </section>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate("/inspeccion")}
          className="border px-4 py-2"
        >
          Volver
        </button>
        <button className="bg-blue-600 text-white px-4 py-2">
          Guardar informe
        </button>
      </div>
    </form>
  );
}
