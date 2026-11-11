import InspectionCriteriaLegend from "./InspectionCriteriaLegend";
import { getAdditionalRowsForPdf } from "./additionalInspectionItems.mjs";

export default function AdditionalInspectionItemsPdf({ rows, styles, Table, newCriteria }) {
  const { items, data } = getAdditionalRowsForPdf(rows);
  if (!items.length) return null;
  return <div>
    <p style={styles.sectionTitle}>ELEMENTOS ADICIONALES EN MAL ESTADO</p>
    <p style={{ fontSize: 8.5, color: "#6b7280", margin: "2px 0 4px", fontStyle: "italic" }}>
      {newCriteria ? <InspectionCriteriaLegend /> : "SI = Sin anomalías | NO = Presenta anomalía (describa en observación) | N/A = No aplica al equipo"}
    </p>
    <Table items={items} data={data} newCriteria={newCriteria} />
  </div>;
}
