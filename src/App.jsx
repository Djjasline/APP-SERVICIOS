import Routes from "./Routes";
import { useFormPlaceholders } from "./hooks/useFormPlaceholders";
import { useFormWritingQuality } from "./hooks/useFormWritingQuality";

export default function App() {
  useFormPlaceholders();
  useFormWritingQuality();

  return <Routes />;
}
