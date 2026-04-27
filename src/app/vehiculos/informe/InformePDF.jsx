import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function InformePDF() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH REAL DESDE SUPABASE
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

    if (id) {
      fetchData();
    }
  }, [id]);

  // 🔄 LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Cargando informe...
      </div>
    );
  }

  // ❌ ERROR DATA
  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen text-red-400">
        No se pudo cargar el informe
      </div>
    );
  }

  return (
    <div className="pdf-container p-4 bg-white text-black">

      {/* HEADER */}
      <table className="pdf-table w-full border border-gray-400">
        <tbody>

          <tr>
            {/* LOGO */}
            <td
              rowSpan={5}
              style={{
                width: 120,
                textAlign: "center",
                verticalAlign: "middle",
                border: "1px solid #999",
              }}
            >
              <img
                src="/astap-logo.jpg"
                alt="ASTAP"
                style={{ maxHeight: 80, margin: "0 auto" }}
              />
            </td>

            {/* TITULO */}
            <td
              colSpan={2}
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "14px",
                border: "1px solid #999",
              }}
            >
              INFORME GENERAL DE SERVICIOS
            </td>

            {/* VERSION */}
            <td
              style={{
                width: 160,
                fontSize: 10,
                border: "1px solid #999",
              }}
            >
              <div>Fecha de versión: 01-01-26</div>
              <div>Versión: 01</div>
            </td>
          </tr>

          {/* REFERENCIA */}
          <tr>
            <td className="pdf-label border border-gray-400">
              REFERENCIA CONTRATO
            </td>
            <td colSpan={2} className="border border-gray-400">
              {data?.referenciaContrato || "—"}
            </td>
          </tr>

          {/* PEDIDO */}
          <tr>
            <td className="pdf-label border border-gray-400">
              PEDIDO / DEMANDA
            </td>
            <td colSpan={2} className="border border-gray-400">
              {data?.pedidoDemanda || "—"}
            </td>
          </tr>

          {/* DESCRIPCION */}
          <tr>
            <td className="pdf-label border border-gray-400">
              DESCRIPCIÓN
            </td>
            <td colSpan={2} className="border border-gray-400">
              {data?.descripcion || "—"}
            </td>
          </tr>

          {/* CODIGO */}
          <tr>
            <td className="pdf-label border border-gray-400">
              COD. INF.
            </td>
            <td colSpan={2} className="border border-gray-400">
              {data?.codInf || "—"}
            </td>
          </tr>

        </tbody>
      </table>

      {/* ESPACIO PARA CONTENIDO FUTURO */}
      <div className="mt-6 text-sm">
        {/* Aquí luego puedes agregar:
            - actividades
            - imágenes
            - firmas
        */}
      </div>

    </div>
  );
}
