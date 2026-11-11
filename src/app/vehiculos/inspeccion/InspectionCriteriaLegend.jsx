export default function InspectionCriteriaLegend() {
  return <>
    <span style={{ color: "#b91c1c", fontWeight: 700 }}>SÍ</span> = Condición correcta, sin novedades detectadas |{" "}
    <span style={{ color: "#15803d", fontWeight: 700 }}>NO</span> = Presenta una novedad, falla o condición incorrecta (describa en observación) |{" "}
    N/A = No aplica al equipo o a la revisión
  </>;
}
