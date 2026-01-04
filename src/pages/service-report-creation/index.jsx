import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReports } from "../../context/ReportContext";

export default function ServiceReportCreation() {
  const navigate = useNavigate();
  const { report, setReport, saveDraft } = useReports();

  // Inicializa estructura si no existe
  useEffect(() => {
    if (!report.generalInfo) {
      setReport((prev) => ({
        ...prev,
        generalInfo: {
          clientCompany: "",
          contactName: "",
          contactRole: "",
          clientEmail: "",
          serviceDate: "",
          internalCode: "",
          address: "",
          reference: "",
          technicianName: "",
          technicianPhone: "",
          technicianEmail: "",
        },
      }));
    }
  }, [report, setReport]);

  const updateGeneralInfo = (field, value) => {
    setReport((prev) => ({
      ...prev,
      generalInfo: {
        ...prev.generalInfo,
        [field]: value,
      },
    }));
  };

  const handleSaveDraft = () => {
    saveDraft();
    alert("Borrador guardado correctamente");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto bg-white border rounded-xl p-6 space-y-8">

        {/* ENCABEZADO */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Reporte de servicio
          </h1>
          <span className="text-xs text-slate-500">
            Estado: {report.status === "completed" ? "Completado" : "Borrador"}
          </span>
        </div>

        {/* ========================= */}
        {/* SECCIÓN 1 – DATOS CLIENTE */}
        {/* ========================= */}
        <section className="border rounded-lg p-4 space-y-4">
          <div>
            <h2 className="font-semibold text-slate-800">
              1. Datos del reporte
            </h2>
            <p className="text-sm text-slate-500">
              Datos del cliente, contacto y servicio
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="input"
              placeholder="Empresa cliente"
              value={report.generalInfo.clientCompany}
              onChange={(e) =>
                updateGeneralInfo("clientCompany", e.target.value)
              }
            />

            <input
              className="input"
              placeholder="Correo del cliente"
              value={report.generalInfo.clientEmail}
              onChange={(e) =>
                updateGeneralInfo("clientEmail", e.target.value)
              }
            />

            <input
              className="input"
              placeholder="Nombre del contacto"
              value={report.generalInfo.contactName}
              onChange={(e) =>
                updateGeneralInfo("contactName", e.target.value)
              }
            />

            <input
              className="input"
              placeholder="Cargo del contacto"
              value={report.generalInfo.contactRole}
              onChange={(e) =>
                updateGeneralInfo("contactRole", e.target.value)
              }
            />

            <input
              type="date"
              className="input"
              value={report.generalInfo.serviceDate}
              onChange={(e) =>
                updateGeneralInfo("serviceDate", e.target.value)
              }
            />

            <input
              className="input"
              placeholder="Código interno"
              value={report.generalInfo.internalCode}
              onChange={(e) =>
                updateGeneralInfo("internalCode", e.target.value)
              }
            />
          </div>

          <input
            className="input"
            placeholder="Dirección del servicio"
            value={report.generalInfo.address}
            onChange={(e) =>
              updateGeneralInfo("address", e.target.value)
            }
          />

          <textarea
            className="input h-20"
            placeholder="Referencia"
            value={report.generalInfo.reference}
            onChange={(e) =>
              updateGeneralInfo("reference", e.target.value)
            }
          />

          <div className="grid md:grid-cols-3 gap-4">
            <input
              className="input"
              placeholder="Técnico responsable"
              value={report.generalInfo.technicianName}
              onChange={(e) =>
                updateGeneralInfo("technicianName", e.target.value)
              }
            />

            <input
              className="input"
              placeholder="Teléfono técnico"
              value={report.generalInfo.technicianPhone}
              onChange={(e) =>
                updateGeneralInfo("technicianPhone", e.target.value)
              }
            />

            <input
              className="input"
              placeholder="Correo técnico"
              value={report.generalInfo.technicianEmail}
              onChange={(e) =>
                updateGeneralInfo("technicianEmail", e.target.value)
              }
            />
          </div>
        </section>

        {/* ================= */}
        {/* BOTONES ACCIÓN */}
        {/* ================= */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 rounded-md border text-sm hover:bg-slate-50"
          >
            Guardar borrador
          </button>

          <button
            onClick={() => navigate("/report-history-management")}
            className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800"
          >
            Volver al historial
          </button>
        </div>
      </div>
    </div>
  );
}
