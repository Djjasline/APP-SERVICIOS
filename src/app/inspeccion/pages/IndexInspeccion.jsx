import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

import {
  getInspections,
  createInspection,
} from "@/utils/inspectionStorage";

export default function IndexInspeccion() {
  const navigate = useNavigate();

  const [previewPDF, setPreviewPDF] = useState(false);
  const pdfRef = useRef(null);

  /* =========================
     HANDLERS
  ========================= */

  const handleNuevaInspeccionHidro = () => {
    const newId = createInspection("hidro");
    navigate(`hidro/${newId}`);
  };

  const handleAbrirHidro = (id) => {
    navigate(`hidro/${id}`);
  };

  const generarPDF = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save("inspeccion-hidrosuccionador.pdf");
  };

  /* =========================
     DATA
  ========================= */

  const inspeccionesHidro = getInspections("hidro");

  const ultimoHidro = inspeccionesHidro.at(-1);

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Inspección y valoración</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* =================================================
            HIDROSUCCIONADOR
        ================================================= */}
        <div className="border rounded-lg p-4 space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Hidrosuccionador</h2>
            <p className="text-sm text-gray-600">
              Inspección del equipo hidrosuccionador.
            </p>
          </div>

          {/* NUEVA INSPECCIÓN */}
          <button
            onClick={handleNuevaInspeccionHidro}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            + Nueva inspección
          </button>

          {/* FILTROS (UI EXISTENTE) */}
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
              todas
            </button>
            <button className="border px-2 py-1 rounded text-xs">
              borrador
            </button>
            <button className="border px-2 py-1 rounded text-xs">
              completada
            </button>
          </div>

          <div className="text-sm text-gray-600">Histórico</div>

          {/* HISTÓRICO RESUMIDO */}
          {ultimoHidro ? (
            <div className="flex justify-between items-center border rounded p-2">
              <span>
                {ultimoHidro.data?.cliente || "Sin cliente"}
              </span>

              <div className
