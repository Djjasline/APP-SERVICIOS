import Routes from "./Routes";
import { useFormPlaceholders } from "./hooks/useFormPlaceholders";
import { useFormWritingQuality } from "./hooks/useFormWritingQuality";
import { useHistoricalWritingCorrection } from "./hooks/useHistoricalWritingCorrection";

export default function App() {
  useFormPlaceholders();
  useFormWritingQuality();
  useHistoricalWritingCorrection();

  return <Routes />;
}
