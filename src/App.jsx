import Routes from "./Routes";
import { useFormPlaceholders } from "./hooks/useFormPlaceholders";

export default function App() {
  useFormPlaceholders();

  return <Routes />;
}
