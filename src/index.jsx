import React from "react";
import ReactDOM from "react-dom/client";
import Aplicacion from "./Aplicacion";
import "./index.css";

import { ProveedorDeInformes } from "./contexto/ReportContext";

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <ProveedorDeInformes>
      <Aplicacion />
    </ProveedorDeInformes>
  </React.StrictMode>
);
