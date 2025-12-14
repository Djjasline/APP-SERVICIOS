// src/app/inspeccion/HojaInspeccionHidro.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

// Imagen del estado del equipo está en public/estado-equipo.png
// Logo ASTAP está en public/astap-logo.jpg

const emptyChecklistItem = {
  seccion: "",
  descripcion: "",
  estado: "",
  observaciones: "",
};

const HojaInspeccionHidro = () => {
  const navigate = useNavigate();

  // ============================
  // 1. Datos del reporte
  // ============================
  const [datosReporte, setDatosReporte] = useState({
    empresa: "",
    contacto: "",
    cargoContacto: "",
    correoContacto: "",
    fechaServicio: "",
    codigoInterno: "",
    direccion: "",
    referencia: "",
    tecnico: "",
    telefonoTecnico: "",
    correoTecnico: "",
  });

  const handleDatosReporteChange = (field, value) => {
    setDatosReporte((prev) => ({ ...prev, [field]: value }));
  };

  // ============================
  // 2. Estado del equipo (marcadores sobre la imagen)
  // ============================
  const [puntosDanio, setPuntosDanio] = useState([]);

  const handleClickImagen = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const nuevo = {
      id: Date.now(),
      numero: puntosDanio.length + 1,
      x,
      y,
    };

    setPuntosDanio((prev) => [...prev, nuevo]);
  };

  const handleDoubleClickNumero = (id) => {
    setPuntosDanio((prev) => {
      const filtrado = prev.filter((p) => p.id !== id);
      // Reenumerar
      return filtrado.map((p, index) => ({
        ...p,
        numero: index + 1,
      }));
    });
  };

  const limpiarPuntos = () => {
    if (
      window.confirm(
        "¿Seguro que deseas eliminar todos los puntos marcados en la imagen?"
      )
    ) {
      setPuntosDanio([]);
    }
  };

  // ============================
  // 3. Checklist de componentes
  // ============================
  const [checklist, setChecklist] = useState([
    {
      seccion: "Sistema hidráulico",
      descripcion: "Revisar mangueras, conexiones y posibles fugas",
      estado: "",
      observaciones: "",
    },
    {
      seccion: "Bomba / equipo de succión",
      descripcion: "Funcionamiento general y ruidos anómalos",
      estado: "",
      observaciones: "",
    },
  ]);

  const addChecklistItem = () => {
    setChecklist((prev) => [...prev, { ...emptyChecklistItem }]);
  };

  const removeChecklistItem = (index) => {
    setChecklist((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index)
    );
  };

  const handleChecklistChange = (index, field, value) => {
    setChecklist((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const limpiarChecklist = () => {
    if (
      window.confirm(
        "¿Seguro que deseas limpiar los ítems del checklist? (No afecta los datos del reporte ni los puntos de la imagen)"
      )
    ) {
      setChecklist([{ ...emptyChecklistItem }]);
    }
  };

  // ============================
  // 4. Observaciones y conclusiones
  // ============================
  const [observaciones, setObservaciones] = useState("");
  const [conclusiones, setConclusiones] = useState("");

  // ============================
  // 5. Autorizaciones
  // ============================
  const [autorizaciones, setAutorizaciones] = useState({
    inspectorNombre: "",
    inspectorCargo: "",
    inspectorEmpresa: "ASTAP",
    inspectorFecha: "",
    clienteNombre: "",
    clienteCargo: "",
    clienteEmpresa: "",
    clienteFecha: "",
  });

  const handleAutorizacionChange = (field, value) => {
    setAutorizaciones((prev) => ({ ...prev, [field]: value }));
  };

  // ============================
  //  Acción principal (por ahora solo alert)
  // ============================
  const handleGuardar = (e) => {
    e.preventDefault();

    const payload = {
      datosReporte,
      puntosDanio,
      checklist,
      observaciones,
      conclusiones,
      autorizaciones,
    };

    console.log("Datos hoja inspección:", payload);
    alert(
      "Información de la hoja de inspección registrada en memoria del navegador.\n\nMás adelante podemos conectarlo a base de datos."
    );
  };

  const handleVolverPanel = () => {
    navigate("/"); // vuelve al panel principal
  };

  // ============================
  // Render
  // ============================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Encabezado superior */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/astap-logo.jpg"
              alt="ASTAP"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
                HOJA DE INSPECCIÓN HIDROSUCCIONADORA
              </h1>
              <p className="text-xs text-slate-500">
                Reporte de inspección y valoración de equipos Vactor /
                hidrosuccionadores.
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-500">
            <p>Fecha de versión: 01-01-2026</p>
            <p>Versión: 01</p>
          </div>
        </header>

        {/* Botón volver al panel */}
        <div>
          <Button
            variant="outline"
            size="sm"
            iconName="ArrowLeft"
            onClick={handleVolverPanel}
          >
            Volver al panel
          </Button>
        </div>

        {/* 1. Datos del reporte */}
        <section className="bg-white rounded-xl shadow border p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              1. Datos del reporte
            </h2>
            <p className="text-xs text-slate-500">
              Datos del cliente, contacto, servicio y técnico responsable.
            </p>
          </div>

          <div className="space-y-4">
            {/* Empresa */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Cliente (empresa) *
              </label>
              <input
                type="text"
                value={datosReporte.empresa}
                onChange={(e) =>
                  handleDatosReporteChange("empresa", e.target.value)
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Nombre de la empresa cliente"
              />
            </div>

            {/* Contacto + cargo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Contacto del cliente
                </label>
                <input
                  type="text"
                  value={datosReporte.contacto}
                  onChange={(e) =>
                    handleDatosReporteChange("contacto", e.target.value)
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Nombre de la persona de contacto"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Cargo del cliente
                </label>
                <input
                  type="text"
                  value={datosReporte.cargoContacto}
                  onChange={(e) =>
                    handleDatosReporteChange(
                      "cargoContacto",
                      e.target.value
                    )
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Cargo o rol de la persona de contacto"
                />
              </div>
            </div>

            {/* Correo */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Correo del cliente
              </label>
              <input
                type="email"
                value={datosReporte.correoContacto}
                onChange={(e) =>
                  handleDatosReporteChange(
                    "correoContacto",
                    e.target.value
                  )
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="correo@cliente.com"
              />
            </div>

            {/* Fecha + código */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Fecha de servicio / inspección
                </label>
                <input
                  type="date"
                  value={datosReporte.fechaServicio}
                  onChange={(e) =>
                    handleDatosReporteChange(
                      "fechaServicio",
                      e.target.value
                    )
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Código interno
                </label>
                <input
                  type="text"
                  value={datosReporte.codigoInterno}
                  onChange={(e) =>
                    handleDatosReporteChange(
                      "codigoInterno",
                      e.target.value
                    )
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Identificador interno del servicio"
                />
              </div>
            </div>

            {/* Dirección + referencia */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Dirección
              </label>
              <input
                type="text"
                value={datosReporte.direccion}
                onChange={(e) =>
                  handleDatosReporteChange("direccion", e.target.value)
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Dirección donde se realiza la inspección"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Referencia
              </label>
              <textarea
                rows={2}
                value={datosReporte.referencia}
                onChange={(e) =>
                  handleDatosReporteChange("referencia", e.target.value)
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
                placeholder="Puntos de referencia para llegar al sitio"
              />
            </div>

            {/* Técnico */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Técnico / inspector responsable
                </label>
                <input
                  type="text"
                  value={datosReporte.tecnico}
                  onChange={(e) =>
                    handleDatosReporteChange("tecnico", e.target.value)
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Nombre del técnico ASTAP"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Teléfono del técnico
                </label>
                <input
                  type="tel"
                  value={datosReporte.telefonoTecnico}
                  onChange={(e) =>
                    handleDatosReporteChange(
                      "telefonoTecnico",
                      e.target.value
                    )
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="+593 ..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Correo del técnico
                </label>
                <input
                  type="email"
                  value={datosReporte.correoTecnico}
                  onChange={(e) =>
                    handleDatosReporteChange(
                      "correoTecnico",
                      e.target.value
                    )
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="tecnico@astap.com"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Estado del equipo */}
        <section className="bg-white rounded-xl shadow border p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              2. Estado del equipo
            </h2>
            <p className="text-xs text-slate-500">
              Haga clic sobre la imagen para marcar puntos con daños o
              defectos. Haga doble clic sobre un número para eliminarlo.
            </p>
          </div>

          <div className="border rounded-lg bg-slate-50 p-4 flex justify-center">
            <div
              className="relative max-w-3xl w-full cursor-crosshair bg-white border rounded-lg overflow-hidden"
              onClick={handleClickImagen}
            >
              <img
                src="/estado-equipo.png"
                alt="Estado del equipo - vistas del Vactor"
                className="w-full h-auto object-contain select-none"
              />

              {puntosDanio.map((punto) => (
                <div
                  key={punto.id}
                  onDoubleClick={() => handleDoubleClickNumero(punto.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center shadow cursor-pointer"
                  style={{
                    left: `${punto.x}%`,
                    top: `${punto.y}%`,
                  }}
                  title="Doble clic para eliminar el punto"
                >
                  {punto.numero}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={limpiarPuntos}
              className="inline-flex items-center text-xs text-red-500 hover:text-red-700"
            >
              <Icon name="Trash2" size={14} className="mr-1" />
              Limpiar puntos marcados
            </button>
          </div>
        </section>

        {/* 3. Checklist de componentes */}
        <section className="bg-white rounded-xl shadow border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                3. Checklist de componentes
              </h2>
              <p className="text-xs text-slate-500">
                Registre los ítems inspeccionados, su estado y observaciones
                relevantes.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconName="Plus"
              onClick={addChecklistItem}
            >
              Agregar ítem
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-100 border-b text-[11px] font-semibold text-slate-700">
              <div className="col-span-2 flex items-center justify-center border-r py-2">
                Sección
              </div>
              <div className="col-span-4 flex items-center justify-center border-r py-2">
                Ítem / descripción
              </div>
              <div className="col-span-2 flex items-center justify-center border-r py-2">
                Estado
              </div>
              <div className="col-span-4 flex items-center justify-center py-2">
                Observaciones
              </div>
            </div>

            {checklist.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 border-b last:border-b-0 bg-white text-xs"
              >
                <div className="col-span-2 border-r p-2">
                  <input
                    type="text"
                    value={item.seccion}
                    onChange={(e) =>
                      handleChecklistChange(
                        index,
                        "seccion",
                        e.target.value
                      )
                    }
                    className="border rounded-md px-2 py-1 w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                    placeholder="Sección"
                  />
                </div>
                <div className="col-span-4 border-r p-2">
                  <textarea
                    rows={2}
                    value={item.descripcion}
                    onChange={(e) =>
                      handleChecklistChange(
                        index,
                        "descripcion",
                        e.target.value
                      )
                    }
                    className="border rounded-md px-2 py-1 w-full outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
                    placeholder="Descripción del componente o prueba realizada"
                  />
                </div>
                <div className="col-span-2 border-r p-2">
                  <input
                    type="text"
                    value={item.estado}
                    onChange={(e) =>
                      handleChecklistChange(
                        index,
                        "estado",
                        e.target.value
                      )
                    }
                    className="border rounded-md px-2 py-1 w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                    placeholder="OK / N.A. / Falla"
                  />
                </div>
                <div className="col-span-4 p-2 flex items-start gap-2">
                  <textarea
                    rows={2}
                    value={item.observaciones}
                    onChange={(e) =>
                      handleChecklistChange(
                        index,
                        "observaciones",
                        e.target.value
                      )
                    }
                    className="border rounded-md px-2 py-1 w-full outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
                    placeholder="Observaciones adicionales"
                  />
                  {checklist.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(index)}
                      className="text-[10px] text-red-500 hover:text-red-700 inline-flex items-center mt-1"
                    >
                      <Icon name="Trash2" size={12} className="mr-1" />
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Observaciones generales y conclusiones */}
        <section className="bg-white rounded-xl shadow border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            4. Observaciones generales y conclusiones
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Observaciones generales
            </label>
            <textarea
              rows={4}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
              placeholder="Describa observaciones generales relevantes de la inspección."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Conclusiones / recomendaciones
            </label>
            <textarea
              rows={4}
              value={conclusiones}
              onChange={(e) => setConclusiones(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
              placeholder="Conclusiones principales y recomendaciones para el cliente."
            />
          </div>
        </section>

        {/* 5. Autorización */}
        <section className="bg-white rounded-xl shadow border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            5. Autorización y responsables
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm">
            {/* Inspector ASTAP */}
            <div className="space-y-2">
              <p className="font-semibold text-slate-800">
                Autorizado por: ASTAP / Inspector
              </p>

              <label className="flex flex-col gap-1">
                <span>Nombre</span>
                <input
                  value={autorizaciones.inspectorNombre}
                  onChange={(e) =>
                    handleAutorizacionChange(
                      "inspectorNombre",
                      e.target.value
                    )
                  }
                  className="border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span>Cargo</span>
                <input
                  value={autorizaciones.inspectorCargo}
                  onChange={(e) =>
                    handleAutorizacionChange(
                      "inspectorCargo",
                      e.target.value
                    )
                  }
                  className="border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span>Empresa</span>
                <input
                  value={autorizaciones.inspectorEmpresa}
                  onChange={(e) =>
                    handleAutorizacionChange(
                      "inspectorEmpresa",
                      e.target.value
                    )
                  }
                  className="border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span>Fecha</span>
                <input
                  type="date"
                  value={autorizaciones.inspectorFecha}
                  onChange={(e) =>
                    handleAutorizacionChange(
                      "inspectorFecha",
                      e.target.value
                    )
                  }
                  className="border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </label>
            </div>

            {/* Cliente */}
            <div className="space-y-2">
              <p className="font-semibold text-slate-800">
                Autorizado por: CLIENTE
              </p>

              <label className="flex flex-col gap-1">
                <span>Nombre</span>
                <input
                  value={autorizaciones.clienteNombre}
                  onChange={(e) =>
                    handleAutorizacionChange(
                      "clienteNombre",
                      e.target.value
                    )
                  }
                  className="border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span>Cargo</span>
                <input
                  value={autorizaciones.clienteCargo}
                  onChange={(e) =>
                    handleAutorizacionChange(
                      "clienteCargo",
                      e.target.value
                    )
                  }
                  className="border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span>Empresa</span>
                <input
                  value={autorizaciones.clienteEmpresa}
                  onChange={(e) =>
                    handleAutorizacionChange(
                      "clienteEmpresa",
                      e.target.value
                    )
                  }
                  className="border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span>Fecha</span>
                <input
                  type="date"
                  value={autorizaciones.clienteFecha}
                  onChange={(e) =>
                    handleAutorizacionChange(
                      "clienteFecha",
                      e.target.value
                    )
                  }
                  className="border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </label>
            </div>
          </div>

          {/* Barra de acciones al final del formulario */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4 border-t mt-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={limpiarChecklist}
                className="px-4 py-2 rounded-lg border text-xs md:text-sm inline-flex items-center text-slate-700 hover:bg-slate-50"
              >
                <Icon name="Trash2" size={14} className="mr-1" />
                Limpiar ítems del checklist
              </button>
            </div>

            <Button
              size="sm"
              iconName="Save"
              iconPosition="left"
              onClick={handleGuardar}
            >
              Guardar / continuar
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HojaInspeccionHidro;
