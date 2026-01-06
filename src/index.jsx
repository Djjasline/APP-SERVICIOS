import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { ReportProvider } from "./context/ReportContext";

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <ReportProvider>
      <App />
    </ReportProvider>
  </React.StrictMode>
);
