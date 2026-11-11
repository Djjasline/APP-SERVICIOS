export default function InspectionCriteriaLegend() {
  return <>
    <span style={{ color: "#b91c1c", fontWeight: 700 }}>SÍ</span> = Presenta una novedad, falla o condición incorrecta (describa en observación) |{" "}
    <span style={{ color: "#15803d", fontWeight: 700 }}>NO</span> = Condición correcta, sin novedades detectadas |{" "}
    N/A = No aplica al equipo o a la revisión
  </>;
}
