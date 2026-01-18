import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import {
  createInspection,
  saveInspectionDraft,
  markInspectionCompleted,
  getInspectionById,
} from "@/utils/inspectionStorage";

export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  const [formData, setFormData] = useState({
    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    fechaServicio: "",
    items: {},
  });

  /* =========================
     CREAR BORRADOR AL ENTRAR
  ========================= */
  useEffect(() => {
    createInspection("hidro", id);

    const existing = getInspectionById(id);
    if (existing?.data) {
      setFormData(existing.data);
    }
  }, [id]);

  /* =========================
     Handlers
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((p) => {
      const updated = { ...p, [name]: value };
      saveInspectionDraft("hidro", id, updated);
      return updated;
    });
  };

  /* =========================
     GUARDAR COMPLETADO
  ========================= */
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
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto my-6 bg-white p-6 rounded-xl space-y-4"
    >
      <h1 className="text-lg font-bold">
        Hoja de inspección – Hidrosuccionador
      </h1>

      <input
        name="cliente"
        placeholder="Cliente"
        value={formData.cliente}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <input
        name="direccion"
        placeholder="Dirección"
        value={formData.direccion}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <SignatureCanvas
        ref={firmaTecnicoRef}
        canvasProps={{ className: "border w-full h-32" }}
      />

      <SignatureCanvas
        ref={firmaClienteRef}
        canvasProps={{ className: "border w-full h-32" }}
      />

      <div className="flex justify-end gap-3">
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
          Guardar informe
        </button>
      </div>
    </form>
  );
}
