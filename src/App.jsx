import Routes from "./Routes";
import { useFormPlaceholders } from "./hooks/useFormPlaceholders";
import { useFormWritingQuality } from "./hooks/useFormWritingQuality";
import { useHistoricalWritingCorrection } from "./hooks/useHistoricalWritingCorrection";
import AutosaveStatus from "./components/AutosaveStatus";
import InlineSpellAssistant from "./components/InlineSpellAssistant";

export default function App() {
  useFormPlaceholders();
  useFormWritingQuality();
  useHistoricalWritingCorrection();

  return <><Routes /><AutosaveStatus /><InlineSpellAssistant /></>;
}
