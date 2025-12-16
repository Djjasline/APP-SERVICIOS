// src/pages/service-report-creation/index.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";

import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";
import { useReports } from "../../context/ReportContext";

// ======================================================
//   Sub-componente para un cuadro de firma reutilizable
// ======================================================
const SignatureBox = ({ title, subtitle, value, onChange }) => {
  const sigRef = useRef(null);

  // Cargar firma previa si existe
  useEffect(() => {
    if (!sigRef.current) return;
    sigRef.current.clear();
    if (value) {
      try {
        sigRef.current.fromDataURL(value);
      } catch (e) {
        console.error("Error al cargar firma previa:", e);
      }
    }
  }, [value]);

  const handleClear = () => {
    if (sigRef.current) {
      sigRef.current.clear();
    }
    onChange(null);
  };

  const handleEnd = () => {
    if (!sigRef.current) return;
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    onChange(dataUrl);
  };

  return (
    <div className="border rounded-xl p-4 space-y-3 bg-slate-50">
      <div>
        <h3 className="font-semibold text-sm text-slate-900">{title}</h3>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="border-2 border-dashed rounded-lg bg-white">
        <SignatureCanvas
          ref={sigRef}
          penColor="#111827"
          onEnd={handleEnd}
          canvasProps={{
            className: "w-full h-40 md:h-48 cursor-crosshair",
          }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
        >
          <Icon name="RotateCcw" size={12} />
          Limpiar
        </button>
        <span>Use mouse o toque para firmar</span>
      </div>
    </div>
  );
};

// =====================
//  Objetos base
// =====================
const emptyGeneralInfo = {
  client: "",
  clientContact: "",
  clientEmail: "",
  clientRole: "",
  serviceDate: "",
  internalCode: "",
  address: "",
  reference: "",
  technicalPersonnel: "",
  technicianPhone: "",
  technicianEmail: "",
};

const emptyTestingRow = {
  parameter: "",
  value: "",
};

const emptyActivitiesIncidents = {
  activities: [
    {
      title: "",
      detail: "",
      imageData: null,
    },
  ],
  incidentsDescription: "",
};

const emptyEquipment = {
  unit: "",
  brand: "",
  model: "",
  serial: "",
  plate: "",
  mileageKm: "",
  lifeHours: "",
  manufactureYear: "",
  vin: "",
};

// =====================
//  Componente principal
// =====================
const ServiceReportCreation = () => {
  const navigate = useNavigate();
  const { currentReport, saveDraft, setCurrentReport } = useReports
    ? useReports()
    : { currentReport: null, saveDraft: () => {}, setCurrentReport: () => {} };

  const [generalInfo, setGeneralInfo] = useState(emptyGeneralInfo);
  const [beforeTesting, setBeforeTesting] = useState([emptyTestingRow]);
  const [afterTesting, setAfterTesting] = useState([emptyTestingRow]);
  const [activitiesIncidents, setActivitiesIncidents] = useState(
    emptyActivitiesIncidents
  );
  const [equipment, setEquipment] = useState(emptyEquipment);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(0);

  // NUEVO: firmas digitales del reporte
  const [digitalSignatures, setDigitalSignatures] = useState({
    astap: null,
    client: null,
  });

  const fileInputRef = useRef(null);

  // =====================
  // Cargar borrador si existe
  // =====================
  useEffect(() => {
    if (!currentReport) return;

    const r = currentReport;

    setGeneralInfo({ ...emptyGeneralInfo, ...(r.generalInfo || {}) });

    setBeforeTesting(
      r.beforeTesting && r.beforeTesting.length > 0
        ? r.beforeTesting
        : [emptyTestingRow]
    );

    setAfterTesting(
      r.afterTesting && r.afterTesting.length > 0
        ? r.afterTesting
        : [emptyTestingRow]
    );

    const existingActivities = r.activitiesIncidents || {};
    setActivitiesIncidents({
      activities:
        existingActivities.activities &&
        existingActivities.activities.length > 0
          ? existingActivities.activities.map((a) => ({
              title: a.title || "",
              detail: a.detail || "",
              imageData: a.imageData || null,
            }))
          : emptyActivitiesIncidents.activities,
      incidentsDescription: existingActivities.incidentsDescription || "",
    });

    setEquipment({
      ...emptyEquipment,
      ...(r.equipment || {}),
    });

    setDigitalSignatures(
      r.digitalSignatures || {
        astap: null,
        client: null,
      }
    );
  }, [currentReport]);

  // =====================
  // Handlers generales
  // =====================

  const handleGeneralChange = (field, value) => {
    setGeneralInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleBeforeChange = (index, field, value) => {
    setBeforeTesting((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleAfterChange = (index, field, value) => {
    setAfterTesting((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleActivitiesChange = (field, value) => {
    setActivitiesIncidents((prev) => ({ ...prev, [field]: value }));
  };

  const handleActivityRowChange = (index, field, value) => {
    setActivitiesIncidents((prev) => {
      const list = prev.activities || [];
      const updated = list.map((act, i) =>
        i === index ? { ...act, [field]: value } : act
      );
      return { ...prev, activities: updated };
    });
  };

  const handleActivityImageUpload = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setActivitiesIncidents((prev) => {
        const list = prev.activities || [];
        const updated = list.map((act, i) =>
          i === index ? { ...act, imageData: dataUrl } : act
        );
        return { ...prev, activities: updated };
      });
    };
    reader.readAsDataURL(file);
  };

  const addActivityRow = () => {
    setActivitiesIncidents((prev) => ({
      ...prev,
      activities: [
        ...(prev.activities || []),
        {
          title: "",
          detail: "",
          imageData: null,
        },
      ],
    }));
    setSelectedActivityIndex((prev) => prev + 1);
  };

  const removeActivityRow = (index) => {
    setActivitiesIncidents((prev) => {
      const list = prev.activities || [];
      if (list.length === 1) return prev;
      const updated = list.filter((_, i) => i !== index);
      return { ...prev, activities: updated };
    });

    setSelectedActivityIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleEquipmentChange = (field, value) => {
    setEquipment((prev) => ({ ...prev, [field]: value }));
  };

  const addBeforeRow = () =>
    setBeforeTesting((prev) => [...prev, { ...emptyTestingRow }]);

  const removeBeforeRow = (index) =>
    setBeforeTesting((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index)
    );

  const addAfterRow = () =>
    setAfterTesting((prev) => [...prev, { ...emptyTestingRow }]);

  const removeAfterRow = (index) =>
    setAfterTesting((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index)
    );

  // NUEVO: cambio de firmas
  const handleSignatureChange = (who, dataUrl) => {
    setDigitalSignatures((prev) => ({
      ...prev,
      [who]: dataUrl,
    }));
  };

  // =====================
  // Construir objeto reporte
  // =====================
  const buildReportObject = () => {
    const cleanedBefore = beforeTesting.filter(
      (r) => r.parameter.trim() !== "" || r.value.trim() !== ""
    );
    const cleanedAfter = afterTesting.filter(
      (r) => r.parameter.trim() !== "" || r.value.trim() !== ""
    );
    const cleanedActivities = (activitiesIncidents.activities || []).filter(
      (a) =>
        (a.title && a.title.trim() !== "") ||
        (a.detail && a.detail.trim() !== "") ||
        a.imageData
    );

    return {
      id: currentReport?.id || Date.now().toString(),
      status: currentReport?.status || "draft",
      generalInfo,
      beforeTesting: cleanedBefore,
      afterTesting: cleanedAfter,
      activitiesIncidents: {
        ...activitiesIncidents,
        activities: cleanedActivities,
      },
      equipment,
      digitalSignatures: {
        astap: digitalSignatures.astap || null,
        client: digitalSignatures.client || null,
      },
      createdAt: currentReport?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // =====================
  // Acciones de botones
  // =====================
  const handleSaveDraft = () => {
    const report = buildReportObject();
    try {
      saveDraft && saveDraft(report);
      setCurrentReport && setCurrentReport(report);
      alert("Borrador guardado correctamente.");
    } catch (e) {
      console.error(e);
      alert("Error al guardar el borrador.");
    }
  };

  // AHORA va directo a Vista previa PDF
  const handleNextToPreview = () => {
    const report = buildReportObject();
    setCurrentReport && setCurrentReport(report);
    navigate("/pdf-report-preview");
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleGoToList = () => {
    navigate("/report-history-management");
  };

  // =====================
  // Datos derivados de actividades
  // =====================
  const activitiesList = activitiesIncidents.activities || [];
  const safeIndex =
    activitiesList.length > 0
      ? Math.min(selectedActivityIndex, activitiesList.length - 1)
      : 0;
  const actividadLabel = `Actividad ${safeIndex + 1}`;
  const selectedActivity = activitiesList[safeIndex] || {};

  // =====================
  // Render
  // =====================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Encabezado superior */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Crear Reporte de Servicio
            </h1>
            <p className="text-sm text-slate-600">
              Complete la información general, las pruebas realizadas, las
              actividades, los datos del equipo y las firmas digitales antes de
              generar el PDF.
            </p>
          </div>
        </header>

        {/* 1. Información general del servicio */}
        <section className="bg-white rounded-xl shadow border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            1. Información general del servicio
          </h2>
          <p className="text-xs text-slate-500">
            Datos del cliente, contacto, servicio y técnico responsable.
          </p>

          <div className="space-y-4">
            {/* Cliente */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Cliente (empresa) *
              </label>
              <input
                type="text"
                value={generalInfo.client}
                onChange={(e) =>
                  handleGeneralChange("client", e.target.value)
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Nombre de la empresa cliente"
              />
            </div>

            {/* Contacto + cargo del cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Contacto del cliente
                </label>
                <input
                  type="text"
                  value={generalInfo.clientContact}
                  onChange={(e) =>
                    handleGeneralChange("clientContact", e.target.value)
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
                  value={generalInfo.clientRole}
                  onChange={(e) =>
                    handleGeneralChange("clientRole", e.target.value)
                  }
                  className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Cargo o rol de la persona de contacto"
                />
              </div>
            </div>

            {/* Correo del cliente */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Correo del cliente
              </label>
              <input
                type="email"
                value={generalInfo.clientEmail}
                onChange={(e) =>
                  handleGeneralChange("clientEmail", e.target.value)
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="correo@cliente.com"
              />
            </div>

            {/* Fecha de servicio + Código interno */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Fecha de servicio
                </label>
                <input
                  type="date"
                  value={generalInfo.serviceDate}
                  onChange={(e) =>
                    handleGeneralChange("serviceDate", e.target.value)
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
                  value={generalInfo.internalCode}
                  onChange={(e) =>
                    handleGeneralChange("internalCode", e.target.value)
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
                value={generalInfo.address}
                onChange={(e) =>
                  handleGeneralChange("address", e.target.value)
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Dirección donde se realiza el servicio"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Referencia
              </label>
              <textarea
                rows={2}
                value={generalInfo.reference}
                onChange={(e) =>
                  handleGeneralChange("reference", e.target.value)
                }
                className="border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
                placeholder="Puntos de referencia para llegar al sitio"
              />
            </div>

            {/* Datos del técnico */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Técnico responsable
                </label>
                <input
                  type="text"
                  value={generalInfo.technicalPersonnel}
                  onChange={(e) =>
                    handleGeneralChange(
                      "technicalPersonnel",
                      e.target.value
                    )
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
                  value={generalInfo.technicianPhone}
                  onChange={(e) =>
                    handleGeneralChange(
                      "technicianPhone",
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
                  value={generalInfo.technicianEmail}
                  onChange={(e) =>
                    handleGeneralChange(
                      "technicianEmail",
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

        {/* 2. Pruebas antes del servicio */}
        <section className="bg-white rounded-xl shadow border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                2. Pruebas antes del servicio
              </h2>
              <p className="text-xs text-slate-500">
                Registre los parámetros medidos antes de iniciar el servicio.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconName="Plus"
              onClick={addBeforeRow}
            >
              Agregar fila
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-100 border-b text-xs font-semibold text-slate-700">
              <div className="col-span-2 flex items-center justify-center border-r py-2">
                Ítem
              </di
