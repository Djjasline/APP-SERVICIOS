import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function InformePDF() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];
    const found = stored.find((r) => String(r.id) === String(id));
    if (found) setReport(found);
  }, [id]);

  useEffect(() => {
    if (report) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [report]);

  if (!report) return <p>Cargando informe…</p>;

  const d = report.data;

  return (
    <div className="p-8 bg-white text-black text-sm print:text-xs">
      {/* ENCABEZADO */}
      <h1 className="text-center text-lg font-bold mb-4">
        INFORME TÉCNICO DE SERVICIO
      </h1>

      {/* DATOS GENERALES */}
      <section className="mb-4">
        <p><strong>Cliente:</strong> {d.cliente}</p>
        <p><strong>Dirección:</strong> {d.direccion}</p>
        <p><strong>Contacto:</strong> {d.contacto}</p>
        <p><strong>Teléfono:</strong> {d.telefono}</p>
        <p><strong>Correo:</strong> {d.correo}</p>
        <p><strong>Fecha de servicio:</strong> {d.fechaServicio}</p>
      </section>

      {/* ACTIVIDADES */}
      <section className="mb-4">
        <h2 className="font-semibold mb-2">Actividades realizadas</h2>

        {d.actividades.map((a, i) => (
          <div key={i} className="mb-3">
            <p><strong>{i + 1}. {a.titulo}</strong></p>
            <p>{a.detalle}</p>

            {a.imagen && (
              <img
                src={a.imagen}
                alt="actividad"
                style={{ maxWidth: "300px", marginTop: "8px" }}
              />
            )}
          </div>
        ))}
      </section>

      {/* EQUIPO */}
      <section className="mb-4">
        <h2 className="font-semibold mb-2">Descripción del equipo</h2>
        <p>Marca: {d.equipo.marca}</p>
        <p>Modelo: {d.equipo.modelo}</p>
        <p>Serie: {d.equipo.serie}</p>
        <p>VIN: {d.equipo.vin}</p>
        <p>Placa: {d.equipo.placa}</p>
        <p>Horas módulo: {d.equipo.horasModulo}</p>
        <p>Kilometraje: {d.equipo.kilometraje}</p>
      </section>

      {/* FIRMAS */}
      <section className="mt-8 grid grid-cols-2 gap-8 text-center">
        <div>
          <p className="mb-2">Firma técnico</p>
          {d.firmas.tecnico && (
            <img src={d.firmas.tecnico} style={{ maxWidth: "200px" }} />
          )}
        </div>

        <div>
          <p className="mb-2">Firma cliente</p>
          {d.firmas.cliente && (
            <img src={d.firmas.cliente} style={{ maxWidth: "200px" }} />
          )}
        </div>
      </section>

      {/* BOTÓN SOLO EN PANTALLA */}
      <div className="mt-10 text-center print:hidden">
        <button
          className="border px-6 py-2 rounded"
          onClick={() => navigate("/informe")}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
