// src/app/inspeccion/index.jsx
import React from "react";
import App from "./App";        // El componente principal de la hoja de inspección
import "./index.css";           // Los estilos propios de esa app

/**
 * Componente raíz de la app de inspección dentro de APP-SERVICIOS.
 * OJO: aquí ya NO usamos ReactDOM.createRoot ni BrowserRouter,
 * eso ya lo maneja la app principal.
 */
const InspeccionHidro = () => {
  return <App />;
};

export default InspeccionHidro;
