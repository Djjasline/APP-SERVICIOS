import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllInspections,
  createInspection,
} from "@/utils/inspectionStorage";
import generarInformePdf from "@/utils/generarInformePdf";

/* =========================
   Badge de estado
========================= */
const StatusBadge = ({ estado }) => {
  const styles = {
    borrador: "bg-yellow-100 text-yellow-800",
    completada: "bg-green-100 text-green-800",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        styles[estado] || "bg-gray-100 text-gray-700"
      }`}
    >
      {estado}
    </span>
  );
};

/* =========================
   Card por tipo
========================= */
const Card = ({ title, type, description }) => {
  const navigate = useNavigate();
  const inspections = getAllInspections().filter(
    (i) => i.type === type
  );

  const [filter, setFilter] = useState("todas");

  const filtered = inspections.filter((i) =>
    filter === "todas" ? true : i.estado === filter
  );

  const nuevaInspeccion = () => {
    const id = createInspection(type);
    navigate(`/inspeccion/${type}/${id}`);
  };

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-white shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-slate-600">{description}</p>
      </div>

      <button
        onClick={nuevaInspeccion}
        className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white"
      >
        + Nueva inspección
      </button>

      {/* Filtros */}
      <div className="flex gap-2 text-xs">
        {["todas", "borrador",
