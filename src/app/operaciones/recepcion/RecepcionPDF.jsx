import { supabase } from "@/lib/supabase";
import { printPdf } from "@/utils/printPdf";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generarPDFRecepcion } from "./generarPDFRecepcion";
import { ControlVehicularSheet } from "./HojaRecepcion";
import { cloneRecepcionSchema } from "./recepcionSchema";

const mergeDeep = (base, value) => {
  if (Array.isArray(base)) return Array.isArray(value) ? value : [...base];
  if (!base || typeof base !== "object") return value ?? base;

  const source = value && typeof value === "object" ? value : {};
  const merged = { ...source };

  Object.keys(base).forEach((key) => {
    merged[key] = mergeDeep(base[key], source[key]);
  });

  return merged;
};

const fileSafe = (value, fallback) =>
  (value || fallback)
    .toString()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

export default function RecepcionPDF() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .eq("tipo", "recepcion")
        .eq("subtipo", "control_vehicular")
        .single();

      if (error || !data) {
        console.error("No se encontró la recepción:", error);
        setReport(null);
        setLoading(false);
        return;
      }

      setReport({
        id: data.id,
        estado: data.estado,
        data: mergeDeep(cloneRecepcionSchema(), data.data || {}),
        createdAt: data.created_at,
      });

      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-gray-600">
        Cargando hoja de control vehicular...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6 text-center">
        <p>No se encontró la recepción.</p>
        <button
          type="button"
          onClick={() => navigate("/operaciones/recepcion")}
          className="border px-4 py-2 rounded mt-4"
        >
          Volver
        </button>
      </div>
    );
  }

  const form = report.data;

  const handlePrint = () => {
    const conductor = fileSafe(form.conductor, "conductor");
    const placa = fileSafe(form.placa, "placa");
    const pedido = fileSafe(form.pedidoDemanda, "pedido");

    printPdf(
      "pdf-content",
      `Control_Vehicular_${conductor}_${placa}_${pedido}_ASTAP`
    );
  };

  const handleDownload = () => {
    generarPDFRecepcion(form);
  };

  return (
    <div
      style={{
        background: "#f3f4f6",
        minHeight: "100vh",
        padding: "24px 16px",
      }}
    >
      <div
        id="pdf-content"
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          background: "#fff",
          padding: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          borderRadius: 6,
          overflowX: "auto",
        }}
      >
        <ControlVehicularSheet
          data={form}
          setData={() => {}}
          readOnly
          signatureRefs={{}}
        />
      </div>

      <div
        className="no-print"
        style={{
          maxWidth: 1040,
          margin: "24px auto 0",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/operaciones/recepcion")}
          className="border px-6 py-2 rounded"
        >
          Volver
        </button>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handlePrint}
            className="border px-6 py-2 rounded"
          >
            Imprimir
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
