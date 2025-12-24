// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

// Páginas principales
import PanelServicios from "./pages/PanelServicios";
import NotFound from "./pages/NotFound";

// Módulo informes de servicio
import ServiceReportCreation from "./pages/service-report-creation";
import PDFReportPreview from "./pages/pdf-report-preview";
import ReportHistoryManagement from "./pages/report-history-management";
import EmailIntegrationInterface from "./pages/email-integration-interface";
import DigitalSignatureCapture from "./pages/digital-signature-capture";

// Módulo inspección (rutas hijas)
import InspectionRoutes from "./app/ins
