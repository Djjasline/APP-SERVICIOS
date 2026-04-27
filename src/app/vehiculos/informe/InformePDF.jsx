import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "@/lib/supabaseClient";

export default function InformePDF() {

  const { id } = useParams();
  const [data, setData] = useState(null);

  // 🔥 TRAER DATOS REALES
  useEffect(() => {
    const fetchData = async () => {
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
    };

    if (id) fetchData();
  }, [id]);

  // 🔥 LOADING REAL
  if (!data) {
    return (
      <div className="p-6 text-white">
        Cargando informe...
      </div>
    );
  }

  return (
    <div className="pdf-container">

      <table className="pdf-table w-full">
        <tbody>
          <tr>
            <td rowSpan={5} style={{ width: 120, textAlign: "center" }}>
              <img src="/astap-logo.jpg" alt="ASTAP" style={{ maxHeight: 80 }} />
            </td>

            <td colSpan={2} className="pdf-title" style={{ textAlign: "center" }}>
              INFORME GENERAL DE SERVICIOS
            </td>

            <td style={{ width: 160, fontSize: 10 }}>
              <div>Fecha de versión: 01-01-26</div>
              <div>Versión: 01</div>
            </td>
          </tr>

          <tr>
            <td className="pdf-label">REFERENCIA CONTRATO</td>
            <td colSpan={2}>{data?.referenciaContrato || "—"}</td>
          </tr>

          <tr>
            <td className="pdf-label">PEDIDO / DEMANDA</td>
            <td colSpan={2}>{data?.pedidoDemanda || "—"}</td>
          </tr>

          <tr>
            <td className="pdf-label">DESCRIPCIÓN</td>
            <td colSpan={2}>{data?.descripcion || "—"}</td>
          </tr>

          <tr>
            <td className="pdf-label">COD. INF.</td>
            <td colSpan={2}>{data?.codInf || "—"}</td>
          </tr>
        </tbody>
      </table>

    </div>
  );
}
