import Routes from "./Routes";
import { useFormPlaceholders } from "./hooks/useFormPlaceholders";
import { useFormWritingQuality } from "./hooks/useFormWritingQuality";
import { useHistoricalWritingCorrection } from "./hooks/useHistoricalWritingCorrection";
import AutosaveStatus from "./components/AutosaveStatus";

export default function App() {
  useFormPlaceholders();
  useFormWritingQuality();
  useHistoricalWritingCorrection();

  return <><Routes /><AutosaveStatus /></>;
}
