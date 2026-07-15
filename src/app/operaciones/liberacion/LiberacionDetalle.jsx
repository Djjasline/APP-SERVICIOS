import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

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

const dataRows = [
  ["Fecha Inspección:", "fecha", "Lugar Inspección:", "lugar", "Fecha Caducidad:", "cad"],
  ["Nombre Conductor:", "conductor", "Tipo Licencia:", ["tipoLicencia", "lic"], "Fecha Caducidad:", "cad2"],
  ["Empr. Contratista:", "cliente", "Placas:", "placa", "Marca:", "marca"],
  ["GDP/MANT:", "gdp", "Tipo Vehículo:", "vehiculo", "Color:", "color"],
  ["Curso Manejo Def:", "curso", "Año:", "anio", "Fecha Caducidad:", "cad3"],
  ["Matrícula:", "matricula", "Año:", "anio2", "Fecha Caducidad:", "cad4"],
];

const valueOrDash = (value) => value || "-";

const getValue = (data, key) => {
  if (Array.isArray(key)) {
    return key.map((option) => data[option]).find(Boolean);
  }

  return data[key];
};

function CheckBox({ active, label }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-800">
      <span className={`flex h-4 w-4 items-center justify-center border border-slate-500 text-[10px] leading-none ${active ? "bg-slate-900 text-white" : "bg-white text-transparent"}`}>
        {active ? "✓" : ""}
      </span>
      {label}
    </span>
  );
}

export default function LiberacionDetalle({ pdfMode = false, allowDownload = true }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [registro, setRegistro] = useState(null);

  useEffect(() => {
    const load = async () => {

      // 🔵 SI ES LOCAL
      if (id === "local") {
        const local = JSON.parse(localStorage.getItem("currentLiberacion"));
        setRegistro(local);
        return;
      }

      // 🔵 SUPABASE
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) {
        setRegistro(data);
      }
    };

    load();
  }, [id]);

  if (!registro) {
    return <div className="p-6">Cargando...</div>;
  }

  const data = registro.data || {};
  const titulo = "AUTORIZACIÓN DE USO DE VEHÍCULO PARA REFINERÍA";
  const estadoFinal = data.estadoFinal || (registro.estado === "completado" ? "APROBADO" : "NO APROBADO");

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900">
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .liberacion-page { box-shadow: none !important; border: none !important; margin: 0 auto !important; }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <div className="no-print mx-auto mb-3 flex max-w-[794px] justify-between gap-2">
        <button
          onClick={() => navigate("/operaciones/liberacion")}
          className="btn-volver-orange"
        >
          Volver
        </button>

        {!pdfMode ? (
          <button
            onClick={() => navigate(`/operaciones/liberacion/pdf/${id}`)}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Ver PDF
          </button>
        ) : allowDownload ? (
          <button
            onClick={() => window.print()}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Descargar PDF
          </button>
        ) : null}
      </div>

      <div className="liberacion-page mx-auto max-w-[794px] bg-white p-6 shadow border space-y-4 text-xs">
        <div className="border border-slate-400">
          <div className="grid grid-cols-[110px_1fr_150px] items-stretch">
            <div className="flex items-center justify-center border-r border-slate-400 p-2">
              <img src="/astap-logo.jpg" alt="ASTAP" className="h-12 w-16 object-contain" />
            </div>
            <div className="flex flex-col items-center justify-center px-3 text-center">
              <h1 className="text-sm font-extrabold uppercase tracking-wide">{titulo}</h1>
              <p className="mt-1 text-[11px]">Vehículo liviano menor a 4500kg</p>
            </div>
            <div className="border-l border-slate-400 text-[10px]">
              <div className="border-b border-slate-400 px-2 py-1"><strong>Código:</strong> D-12752</div>
              <div className="border-b border-slate-400 px-2 py-1"><strong>No. Revisión:</strong> 01</div>
              <div className="px-2 py-1"><strong>Fecha:</strong> 22/07/2025</div>
            </div>
          </div>
        </div>

        <table className="w-full border-collapse text-[11px]">
          <tbody>
            {dataRows.map((row, index) => (
              <tr key={index}>
                <td className="w-[16%] border border-slate-400 bg-slate-100 px-2 py-1 font-semibold">{row[0]}</td>
                <td className="w-[17%] border border-slate-400 px-2 py-1">{valueOrDash(getValue(data, row[1]))}</td>
                <td className="w-[16%] border border-slate-400 bg-slate-100 px-2 py-1 font-semibold">{row[2]}</td>
                <td className="w-[17%] border border-slate-400 px-2 py-1">{valueOrDash(getValue(data, row[3]))}</td>
                <td className="w-[16%] border border-slate-400 bg-slate-100 px-2 py-1 font-semibold">{row[4]}</td>
                <td className="w-[18%] border border-slate-400 px-2 py-1">{valueOrDash(getValue(data, row[5]))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-2">
          {Object.entries(checklist).map(([section, items]) => (
            <div key={section} className="avoid-break">
              <h2 className="border border-blue-300 bg-blue-100 px-2 py-1 text-[11px] font-bold text-slate-900">
                {section}
              </h2>

              <table className="w-full border-collapse text-[11px]">
                <tbody>
                  {items.map((item, index) => {
                    const key = `${section}-${index}`;
                    const current = data.checklist?.[key] || "";

                    return (
                      <tr key={key}>
                        <td className="border border-slate-300 px-2 py-1">
                          {index + 1}. {item}
                        </td>
                        <td className="w-24 border border-slate-300 px-1 py-1 text-center">
                          <div className="flex justify-center gap-2">
                            <CheckBox active={current === "C"} label="C" />
                            <CheckBox active={current === "NC"} label="NC" />
                            <CheckBox active={current === "NA"} label="NA" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="avoid-break">
          <h2 className="mb-1 font-semibold">Observaciones</h2>
          <div className="min-h-12 whitespace-pre-wrap border border-slate-400 px-2 py-2 text-[11px]">
            {data.observaciones || "Sin observaciones"}
          </div>
        </div>

        <div className="avoid-break flex justify-center gap-4">
          {["APROBADO", "NO APROBADO"].map((option) => (
            <div key={option} className={`border px-5 py-2 text-[11px] font-semibold ${estadoFinal === option ? "border-blue-700 bg-blue-50 text-blue-800" : "border-slate-300"}`}>
              {option}
            </div>
          ))}
        </div>

        <div className="avoid-break">
          <p className="mb-1 text-[11px] font-semibold">Firma del Inspector</p>
          <div className="flex h-28 items-center justify-center border border-slate-400 bg-white">
            {data.firmaInspector ? (
              <img
                src={data.firmaInspector}
                alt="Firma del inspector"
                className="max-h-24 max-w-full object-contain"
              />
            ) : (
              <span className="text-[11px] text-slate-400">Sin firma registrada</span>
            )}
          </div>
          <div className="mt-1 border border-slate-400 px-2 py-1 text-[11px]">
            {data.inspector || "Nombre del inspector"}
          </div>
        </div>

      </div>
    </div>
  );
}
