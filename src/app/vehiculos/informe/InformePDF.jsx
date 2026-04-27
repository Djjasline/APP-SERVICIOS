import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function InformePDF() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH DESDE SUPABASE
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: informe, error } = await supabase
          .from("informes")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error cargando informe:", error);
        } else {
          setData(informe);
        }
      } catch (err) {
        console.error("Error inesperado:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // 🔄 LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Cargando informe...
      </div>
    );
  }

  // ❌ ERROR
  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen text-red-400">
        No se pudo cargar el informe
      </div>
    );
  }

  return (
    <div className="pdf-container p-4 bg-white text-black">

      {/* ================= HEADER ================= */}
      <table className="pdf-table w-full border border-gray-400">
        <tbody>

          <tr>
            <td rowSpan={5} style={{ width: 120, textAlign: "center" }}>
              <img src="/astap-logo.jpg" alt="ASTAP" style={{ maxHeight: 80 }} />
            </td>

            <td colSpan={2} style={{ textAlign: "center", fontWeight: "bold" }}>
              INFORME GENERAL DE SERVICIOS
            </td>

            <td style={{ width: 160, fontSize: 10 }}>
              <div>Fecha de versión: 01-01-26</div>
              <div>Versión: 01</div>
            </td>
          </tr>

          <tr>
            <td>REFERENCIA CONTRATO</td>
            <td colSpan={2}>{data?.referenciaContrato || "—"}</td>
          </tr>

          <tr>
            <td>PEDIDO / DEMANDA</td>
            <td colSpan={2}>{data?.pedidoDemanda || "—"}</td>
          </tr>

          <tr>
            <td>DESCRIPCIÓN</td>
            <td colSpan={2}>{data?.descripcion || "—"}</td>
          </tr>

          <tr>
            <td>COD. INF.</td>
            <td colSpan={2}>{data?.codInf || "—"}</td>
          </tr>

        </tbody>
      </table>

      {/* ================= CONTENIDO ================= */}

      {/* 🔥 AQUÍ VUELVES A PEGAR TU CONTENIDO ORIGINAL */}

      {/* EJEMPLO ACTIVIDADES */}
      {data?.actividades && (
        <div className="mt-6">
          <h3 className="font-bold">ACTIVIDADES</h3>
          <table className="w-full border mt-2">
            <tbody>
              {data.actividades.map((item, i) => (
                <tr key={i}>
                  <td className="border p-2">{item}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EJEMPLO OBSERVACIONES */}
      {data?.observaciones && (
        <div className="mt-6">
          <h3 className="font-bold">OBSERVACIONES</h3>
          <p>{data.observaciones}</p>
        </div>
      )}

      {/* EJEMPLO FIRMAS */}
      {data?.firmas && (
        <div className="mt-6 flex justify-between">
          <div>
            <p>Firma Técnico</p>
            {data?.firmas?.tecnico && (
              <img src={data.firmas.tecnico} alt="firma tecnico" />
            )}
          </div>

          <div>
            <p>Firma Cliente</p>
            {data?.firmas?.cliente && (
              <img src={data.firmas.cliente} alt="firma cliente" />
            )}
          </div>
        </div>
      )}

    </div>
  );
}
