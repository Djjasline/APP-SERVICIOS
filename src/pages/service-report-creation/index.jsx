import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
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
{/* ============================= */}
{/* 2. DATOS DEL EQUIPO */}
{/* ============================= */}
<section className="section">
  <div>
    <h2 className="section-title">2. Datos del equipo</h2>
    <p className="section-description">
      Información general del equipo atendido durante el servicio.
    </p>
  </div>

  {/* Fila 1 */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="label">Tipo de equipo</label>
      <input
        type="text"
        className="input"
        placeholder="Ej: Hidrosuccionador, Barredora, Cámara"
      />
    </div>

    <div>
      <label className="label">Marca</label>
      <input
        type="text"
        className="input"
        placeholder="Ej: Vactor, Elgin, Metrotech"
      />
    </div>

    <div>
      <label className="label">Modelo</label>
      <input
        type="text"
        className="input"
        placeholder="Modelo del equipo"
      />
    </div>
  </div>

  {/* Fila 2 */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="label">Número de serie</label>
      <input
        type="text"
        className="input"
        placeholder="Serie del equipo"
      />
    </div>

    <div>
      <label className="label">Placa</label>
      <input
        type="text"
        className="input"
        placeholder="Placa del vehículo"
      />
    </div>

    <div>
      <label className="label">Año de fabricación</label>
      <input
        type="number"
        className="input"
        placeholder="Ej: 2022"
      />
    </div>
  </div>

  {/* Fila 3 */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="label">Kilometraje</label>
      <input
        type="text"
        className="input"
        placeholder="Km del vehículo"
      />
    </div>

    <div>
      <label className="label">Horas de trabajo</label>
      <input
        type="text"
        className="input"
        placeholder="Horas del equipo"
      />
    </div>

    <div>
      <label className="label">VIN / Chasis</label>
      <input
        type="text"
        className="input"
        placeholder="VIN o número de chasis"
      />
    </div>
  </div>
</section>
{/* ============================= */}
{/* 3. DESCRIPCIÓN DEL SERVICIO */}
{/* ============================= */}
<section className="section">
  <div>
    <h2 className="section-title">3. Descripción del servicio</h2>
    <p className="section-description">
      Detalle de las actividades realizadas durante el servicio técnico.
    </p>
  </div>

  {/* Descripción principal */}
  <div>
    <label className="label">Descripción general del servicio</label>
    <textarea
      rows={4}
      className="input resize-y"
      placeholder="Describa de forma clara las actividades realizadas, diagnóstico, mantenimiento, reparación, ajustes, etc."
    />
  </div>

  {/* Trabajo realizado */}
  <div>
    <label className="label">Trabajo realizado</label>
    <textarea
      rows={4}
      className="input resize-y"
      placeholder="Detalle paso a paso del trabajo ejecutado en el equipo."
    />
  </div>

  {/* Observaciones técnicas */}
  <div>
    <label className="label">Observaciones técnicas</label>
    <textarea
      rows={3}
      className="input resize-y"
      placeholder="Observaciones relevantes, hallazgos, condiciones del equipo, recomendaciones."
    />
  </div>

  {/* Recomendaciones */}
  <div>
    <label className="label">Recomendaciones</label>
    <textarea
      rows={3}
      className="input resize-y"
      placeholder="Recomendaciones para el cliente: mantenimientos futuros, advertencias, mejoras."
    />
  </div>
</section>
{/* ============================= */}
{/* 4. MATERIALES / REPUESTOS */}
{/* ============================= */}
<section className="section">
  <div>
    <h2 className="section-title">4. Materiales y repuestos utilizados</h2>
    <p className="section-description">
      Detalle de los materiales, repuestos o insumos utilizados durante el
      servicio.
    </p>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full border border-slate-300 text-sm">
      <thead className="bg-slate-100 text-slate-700">
        <tr>
          <th className="border px-2 py-2 text-left">Ítem</th>
          <th className="border px-2 py-2 text-left">Descripción</th>
          <th className="border px-2 py-2 text-center">Cantidad</th>
          <th className="border px-2 py-2 text-left">Observación</th>
        </tr>
      </thead>

      <tbody>
        {[1, 2, 3, 4].map((row) => (
          <tr key={row}>
            <td className="border px-2 py-1 text-center">{row}</td>

            <td className="border px-2 py-1">
              <input
                type="text"
                className="input"
                placeholder="Descripción del material o repuesto"
              />
            </td>

            <td className="border px-2 py-1">
              <input
                type="number"
                min="0"
                className="input text-center"
                placeholder="0"
              />
            </td>

            <td className="border px-2 py-1">
              <input
                type="text"
                className="input"
                placeholder="Observación"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Nota */}
  <p className="text-xs text-slate-500">
    * En caso de no utilizar materiales o repuestos, dejar esta sección en
    blanco.
  </p>
</section>
{/* ============================= */}
{/* 5. CONCLUSIÓN DEL SERVICIO */}
{/* ============================= */}
<section className="section">
  <div>
    <h2 className="section-title">
      5. Conclusión del servicio y estado final del equipo
    </h2>
    <p className="section-description">
      Resumen del trabajo realizado, estado final del equipo y
      recomendaciones técnicas.
    </p>
  </div>

  <div className="grid md:grid-cols-2 gap-4">
    {/* Estado final */}
    <label className="field">
      <span className="field-label">Estado final del equipo</span>
      <select className="input">
        <option value="">Seleccione una opción</option>
        <option value="operativo">Operativo</option>
        <option value="operativo-observaciones">
          Operativo con observaciones
        </option>
        <option value="no-operativo">No operativo</option>
      </select>
    </label>

    {/* Tipo de cierre */}
    <label className="field">
      <span className="field-label">Estado del servicio</span>
      <select className="input">
        <option value="">Seleccione una opción</option>
        <option value="completado">Servicio completado</option>
        <option value="parcial">Servicio parcial</option>
        <option value="pendiente">Servicio pendiente</option>
      </select>
    </label>
  </div>

  {/* Descripción final */}
  <label className="field">
    <span className="field-label">Descripción del trabajo realizado</span>
    <textarea
      rows={3}
      className="input resize-y"
      placeholder="Detalle de las actividades realizadas durante el servicio"
    />
  </label>

  {/* Recomendaciones */}
  <label className="field">
    <span className="field-label">Recomendaciones técnicas</span>
    <textarea
      rows={3}
      className="input resize-y"
      placeholder="Recomendaciones, mantenimientos futuros o acciones sugeridas"
    />
  </label>
</section>

{/* ================= SECCIÓN 6 – FIRMAS ================= */}
<div className="bg-white border rounded-xl p-6 space-y-6">
  <h2 className="text-lg font-semibold text-slate-900">
    6. Firmas
  </h2>

  {/* FIRMA TÉCNICO */}
  <div className="space-y-2">
    <p className="text-sm font-medium text-slate-700">
      Firma del técnico
    </p>

    <div className="border rounded bg-slate-50">
      <SignatureCanvas
        ref={sigTecnicoRef}
        penColor="black"
        canvasProps={{
          width: 500,
          height: 180,
          className: "w-full",
        }}
        onEnd={() => saveSignature("tecnico", sigTecnicoRef)}
      />
    </div>

    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => clearSignature("tecnico", sigTecnicoRef)}
        className="text-xs px-3 py-1 rounded border hover:bg-slate-100"
      >
        Limpiar
      </button>
    </div>
  </div>

  {/* FIRMA CLIENTE */}
  <div className="space-y-2">
    <p className="text-sm font-medium text-slate-700">
      Firma del cliente
    </p>

    <div className="border rounded bg-slate-50">
      <SignatureCanvas
        ref={sigClienteRef}
        penColor="black"
        canvasProps={{
          width: 500,
          height: 180,
          className: "w-full",
        }}
        onEnd={() => saveSignature("cliente", sigClienteRef)}
      />
    </div>

    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => clearSignature("cliente", sigClienteRef)}
        className="text-xs px-3 py-1 rounded border hover:bg-slate-100"
      >
        Limpiar
      </button>
    </div>
  </div>
</div>

signatures: {
  tecnico: "data:image/png;base64,...",
  cliente: "data:image/png;base64,..."
}
