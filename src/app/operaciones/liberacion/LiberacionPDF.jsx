import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const checklist = {
  "Sistema Mecánico": [
    "Frenos sin fugas (Liqueos)",
    "Llantas: Delanteras / Traseras",
    "Llanta emergencia",
    "Tuercas completas y ajustadas",
    "Parabrisas, vidrios y espejos (no trizados)",
    "Asientos con apoya cabezas",
    "Cinturones de seguridad (3 puntos)",
    "Limpia parabrisas y plumas operativos",
    "No liqueos (combustible, aceite, fluido)",
    "Kit básico de herramientas",
    "Agua limpia parabrisas",
    "Gato, palanca, llave de ruedas",
  ],
  "Sistema Eléctrico & Otros": [
    "Cableado eléctrico en buen estado",
    "Batería y bornes ajustados (sin corrosión)",
    "Luces delanteras altas y bajas",
    "Luces direccionales",
    "Luces de freno",
    "Luces de reversa",
    "Alarma de retro",
    "Luz interior / tablero",
    "Luces de parqueo",
    "Bocina",
    "Certificado o revisión mecánica",
  ],
  "Accesorios de Seguridad Industrial": [
    "Arrestallamas",
    "Extintor tipo PQS (≥ 5 lbs)",
    "Botiquín de primeros auxilios",
    "Triángulos o conos (mínimo 2)",
    "Chaleco reflectivo",
    "Linterna con batería y repuesto",
    "Cables pasa corriente",
  ],
  "Estado / Área de Carga": [
    "Roll bar asegurado al chasis",
    "Balde o cajón en buen estado",
    "Malla de protección en roll bar",
  ],
};

export default function LiberacionPDF() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registro, setRegistro] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .eq("area", "operaciones")
        .eq("tipo", "liberacion")
        .eq("subtipo", "general")
        .single();

      if (error || !data) {
        console.error("Error cargando liberación:", error);
        return;
      }

      setRegistro(data);
    };

    load();
  }, [id]);

  if (!registro) {
    return (
      <div className="p-6 text-center">
        <p>No se encontró la liberación.</p>
        <button
          onClick={() => navigate("/operaciones/liberacion")}
          className="border px-4 py-2 mt-4"
        >
          Volver
        </button>
      </div>
    );
  }

  const data = registro.data || {};
  const check = data.checklist || {};

  const rows = [
    ["Fecha Inspección:", data.fecha, "Lugar Inspección:", data.lugar, "Fecha Caducidad:", data.cad],
    ["Nombre Conductor:", data.conductor, "Tipo Licencia:", data.tipoLicencia, "Fecha Caducidad:", data.cad2],
    ["Empr. Contratista:", data.cliente, "Placas:", data.placa, "Marca:", data.marca],
    ["GDP/MANT:", data.gdp, "Tipo Vehículo:", data.vehiculo, "Color:", data.color],
    ["Curso Manejo Def:", data.curso, "Año:", data.anio, "Fecha Caducidad:", data.cad3],
    ["Matrícula:", data.matricula, "Año:", data.anio2, "Fecha Caducidad:", data.cad4],
  ];

  return (
    <div className="bg-slate-100 min-h-screen p-4">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .pdf-page { box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>

      <div className="pdf-page max-w-[794px] mx-auto bg-white p-6 shadow border text-xs text-black">
        <div className="border p-4 mb-4">
          <div className="flex items-center">
            <img src="/astap-logo.jpg" className="w-14 mr-4" />
            <div className="flex-1 text-center">
              <h1 className="font-bold text-sm">
                FORMATO PARA INSPECCIÓN CAMIONETAS
              </h1>
              <p>Vehículo liviano menor a 4500kg</p>
            </div>
          </div>
        </div>

        <div className="border mb-4">
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[150px_1fr_150px_1fr_150px_1fr] min-h-[32px]"
            >
              <div className="border bg-gray-100 px-2 flex items-center font-semibold">{row[0]}</div>
              <div className="border px-2 py-1 whitespace-pre-wrap">{row[1] || "—"}</div>

              <div className="border bg-gray-100 px-2 flex items-center font-semibold">{row[2]}</div>
              <div className="border px-2 py-1 whitespace-pre-wrap">{row[3] || "—"}</div>

              <div className="border bg-gray-100 px-2 flex items-center font-semibold">{row[4]}</div>
              <div className="border px-2 py-1 whitespace-pre-wrap">{row[5] || "—"}</div>
            </div>
          ))}
        </div>

        {Object.entries(checklist).map(([section, items]) => (
          <div key={section} className="mb-3">
            <div className="bg-blue-600 text-white px-2 py-1 font-bold">
              {section}
            </div>

            <div className="grid grid-cols-[1fr_40px_40px_40px] bg-gray-100 font-bold">
              <div className="border px-2 py-1">Ítem</div>
              <div className="border text-center py-1">C</div>
              <div className="border text-center py-1">NC</div>
              <div className="border text-center py-1">NA</div>
            </div>

            {items.map((item, index) => {
              const key = `${section}-${index}`;
              return (
                <div key={key} className="grid grid-cols-[1fr_40px_40px_40px]">
                  <div className="border px-2 py-1">
                    {index + 1}. {item}
                  </div>
                  <div className="border text-center py-1">
                    {check[key] === "C" ? "X" : ""}
                  </div>
                  <div className="border text-center py-1">
                    {check[key] === "NC" ? "X" : ""}
                  </div>
                  <div className="border text-center py-1">
                    {check[key] === "NA" ? "X" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div className="mt-4">
          <div className="font-bold mb-1">Observaciones</div>
          <div className="border min-h-[80px] p-2 whitespace-pre-wrap">
            {data.observaciones || "—"}
          </div>
        </div>

        <div className="mt-4">
          <div className="font-bold mb-1">Resultado Final</div>
          <div className="border p-2">
            {data.estadoFinal || "—"}
          </div>
        </div>

        <div className="mt-4">
          <div className="font-bold mb-1">Inspector</div>
          <div className="border p-2">
            {data.inspector || "—"}
          </div>
        </div>

        <div className="mt-4">
          <div className="font-bold mb-1">Firma del Inspector</div>
          <div className="border h-[120px] flex items-center justify-center">
            {data.firmaInspector ? (
              <img
                src={data.firmaInspector}
                alt="Firma inspector"
                className="max-h-[110px] object-contain"
              />
            ) : (
              "—"
            )}
          </div>
        </div>

        <div className="no-print flex justify-between mt-6">
          <button
            onClick={() => navigate("/operaciones/liberacion")}
            className="border px-4 py-2 rounded"
          >
            Volver
          </button>

          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
