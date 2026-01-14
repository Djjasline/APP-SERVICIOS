import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function InformePDF() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const reports = JSON.parse(localStorage.getItem("serviceReports")) || [];
    const report = reports.find(r => String(r.id) === id);

    if (!report) {
      alert("Informe no encontrado");
      navigate("/informe");
      return;
    }

    const firmado =
      report.data?.firmas?.tecnico &&
      report.data?.firmas?.cliente;

    if (!firmado) {
      alert("El informe no está completado");
      navigate("/informe");
      return;
    }

    setTimeout(() => {
      window.print();
    }, 500);
  }, [id, navigate]);

  return (
    <div className="p-6">
      <h2 className="text-center font-bold mb-4">
        Informe Técnico
      </h2>

      <pre style={{ fontSize: 12 }}>
        {JSON.stringify(
          JSON.parse(localStorage.getItem("serviceReports"))
            ?.find(r => String(r.id) === id),
          null,
          2
        )}
      </pre>
    </div>
  );
}
