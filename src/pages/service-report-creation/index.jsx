import { useEffect, useState } from "react";

const STORAGE_KEY = "serviceReport_datosCliente";

function DatosCliente() {
  const [form, setForm] = useState({
    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    fechaServicio: "",
    codigoInterno: "",
  });

  // Cargar datos guardados
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setForm(JSON.parse(saved));
    }
  }, []);

  // Guardar automáticamente
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">
        1. Datos del cliente
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          name="cliente"
          value={form.cliente}
          onChange={handleChange}
          placeholder="Cliente"
          className="input"
        />

        <input
          name="codigoInterno"
          value={form.codigoInterno}
          onChange={handleChange}
          placeholder="Código interno"
          className="input"
        />

        <input
          name="direccion"
          value={form.direccion}
          onChange={handleChange}
          placeholder="Dirección"
          className="input"
        />

        <input
          name="contacto"
          value={form.contacto}
          onChange={handleChange}
          placeholder="Contacto"
          className="input"
        />

        <input
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
          placeholder="Teléfono"
          className="input"
        />

        <input
          name="correo"
          value={form.correo}
          onChange={handleChange}
          placeholder="Correo"
          className="input"
        />

        <input
          type="date"
          name="fechaServicio"
          value={form.fechaServicio}
          onChange={handleChange}
          className="input"
        />
      </div>
    </div>
  );
}

export default DatosCliente;

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
