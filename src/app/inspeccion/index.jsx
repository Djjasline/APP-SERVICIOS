// src/app/inspeccion/index.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import astapLogo from "../../astap-logo.jpg";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

const initialForm = {
  referenciaContrato: "",
  descripcion: "",
  codInf: "",
  fechaInspeccion: "",
  ubicacion: "",
  cliente: "",
  tecnicoAstap: "",
  clienteResponsable: "",
  estadoEquipoTexto: "",
};

// Componente para una imagen clicable con puntos numerados
const EquipoDiagram = ({ id, src, label, points, onAddPoint, onRemovePoint }) => {
  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    onAddPoint(id, { x, y });
  };

  return (
    <div className="relative bg-white border rounded-xl overflow-hidden shadow-sm">
      <div
        className="relative w-full bg-slate-50 cursor-crosshair"
        style={{ aspectRatio: "4 / 3" }}
        onClick={handleClick}
      >
        <img
          src={src}
          alt={label}
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />

        {/* Puntos numerados */}
        {points.map((p, index) => (
          <button
            key={p.id}
            type="button"
            onDoubleClick={(e) => {
              e.stopPropagation();
              onRemovePoint(id, p.id);
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 text-[10px] text-white flex items-center justify-center shadow-md"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            title="Doble clic para eliminar"
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="border-t bg-slate-50 px-3 py-2">
        <p className="text-[11px] text-slate-600">{label}</p>
      </div>
    </div>
  );
};

const InspeccionHidro = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);

  // Un arreglo de diagramas (puedes añadir/quitar los que quieras)
  const [diagrams, setDiagrams] = useState([
    {
      id: "lateral",
      label: "Vista lateral del equipo",
      src: "/imagenes/estado-equipo-lateral.png",
      points: [],
    },
    {
      id: "posterior",
      label: "Vista posterior del equipo",
      src: "/imagenes/estado-equipo-posterior.png",
      points: [],
    },
    {
      id: "superior",
      label: "Vista superior / tanque",
      src: "/imagenes/estado-equipo-superior.png",
      points: [],
    },
    {
      id: "panel",
      label: "Panel de control / accesorios",
      src: "/imagenes/estado-equipo-panel.png",
      points: [],
    },
  ]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPoint = (diagramId, point) => {
    setDiagrams((prev) =>
      prev.map((d) =>
        d.id === diagramId
          ? {
              ...d,
              points: [
                ...d.points,
                { id: `${diagramId}-${Date.now()}-${Math.random()}`, ...point },
              ],
            }
          : d
      )
    );
  };

  const handleRemovePoint = (diagramId, pointId) => {
    setDiagrams((prev) =>
      prev.map((d) =>
        d.id === diagramId
          ? { ...d, points: d.points.filter((p) => p.id !== pointId) }
          : d
      )
    );
  };

  const handleBackToPanel = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Encabezado de la página */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Reporte de inspección
            </h1>
            <p className="text-sm text-slate-600">
              Inspección y valoración de equipos Vactor / hidrosuccionador.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            iconName="ArrowLeft"
            onClick={handleBackToPanel}
          >
            Volver al panel
          </Button>
        </header>

        {/* Tarjeta principal de la hoja */}
        <section className="bg-white rounded-2xl shadow border px-6 py-6 space-y-6">
          {/* Encabezado de la hoja con logo */}
          <div className="flex items-start justify-between gap-4 border-b pb-4">
            <div className="flex items-center gap-3">
              <img
                src={astapLogo}
                alt="ASTAP"
                className="h-10 w-auto rounded-md bg-white object-contain"
              />
              <div>
                <h2 className="text-base md:text-lg font-semibold text-slate-900 tracking-wide uppercase">
                  Hoja de inspección hidrosuccionadora
                </h2>
                <p className="text-[11px] text-slate-500">
                  Formato para registrar el estado del equipo, condiciones
                  generales y observaciones.
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-500">
              <div>Fecha de versión: 25-11-2025</div>
              <div>Versión: 01</div>
            </div>
          </div>

          {/* Bloque de datos generales */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Referencia de contrato
                </label>
                <input
                  type="text"
                  value={form.referenciaContrato}
                  onChange={(e) =>
                    handleChange("referenciaContrato", e.target.value)
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Descripción
                </label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) =>
                    handleChange("descripcion", e.target.value)
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Cód. INF.
              </label>
              <input
                type="text"
                value={form.codInf}
                onChange={(e) => handleChange("codInf", e.target.value)}
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Fecha de inspección
                </label>
                <input
                  type="date"
                  value={form.fechaInspeccion}
                  onChange={(e) =>
                    handleChange("fechaInspeccion", e.target.value)
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={form.ubicacion}
                  onChange={(e) => handleChange("ubicacion", e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Cliente
                </label>
                <input
                  type="text"
                  value={form.cliente}
                  onChange={(e) => handleChange("cliente", e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Técnico ASTAP
                </label>
                <input
                  type="text"
                  value={form.tecnicoAstap}
                  onChange={(e) =>
                    handleChange("tecnicoAstap", e.target.value)
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Cliente responsable
                </label>
                <input
                  type="text"
                  value={form.clienteResponsable}
                  onChange={(e) =>
                    handleChange("clienteResponsable", e.target.value)
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>
            </div>
          </div>

          {/* Estado del equipo */}
          <div className="space-y-3 mt-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Estado del equipo
            </h3>
            <p className="text-[11px] text-slate-500">
              Haga clic sobre las imágenes para marcar puntos con daños o
              defectos. Haga doble clic sobre un número para eliminarlo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diagrams.map((d) => (
                <EquipoDiagram
                  key={d.id}
                  id={d.id}
                  src={d.src}
                  label={d.label}
                  points={d.points}
                  onAddPoint={handleAddPoint}
                  onRemovePoint={handleRemovePoint}
                />
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Comentarios / observaciones generales
              </label>
              <textarea
                rows={3}
                value={form.estadoEquipoTexto}
                onChange={(e) =>
                  handleChange("estadoEquipoTexto", e.target.value)
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
                placeholder="Describa daños generales, condiciones especiales u observaciones adicionales."
              />
            </div>
          </div>

          {/* Nota final / pie */}
          <div className="pt-4 border-t mt-4 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Esta hoja forma parte del expediente de inspección del equipo.
            </span>
            <span className="inline-flex items-center gap-1">
              <Icon name="Info" size={12} />
              Para imprimir o generar PDF se integrará en una fase posterior.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InspeccionHidro;
