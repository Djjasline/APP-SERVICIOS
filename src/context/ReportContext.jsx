import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ReportContext = createContext(null);

export const useReports = () => {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error("useReports must be used inside ReportProvider");
  return ctx;
};

export const ReportProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);

  /* ================= LOAD ================= */
  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando reportes:", error);
      return;
    }

    setReports(data || []);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  /* ================= NEW ================= */
  const startNewReport = () => {
    setCurrentReport({});
  };

  /* ================= SAVE ================= */
  const saveDraft = async (data) => {
    const { data: saved, error } = await supabase
      .from("registros")
      .upsert([
        {
          id: currentReport?.id,
          data,
          estado: "borrador",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error guardando borrador:", error);
      return null;
    }

    setCurrentReport(saved);
    fetchReports();
    return saved;
  };

  const saveCompleted = async (data) => {
    const { data: saved, error } = await supabase
      .from("registros")
      .upsert([
        {
          id: currentReport?.id,
          data,
          estado: "completado",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error guardando completo:", error);
      return null;
    }

    setCurrentReport(saved);
    fetchReports();
    return saved;
  };

  /* ================= LOAD ONE ================= */
  const loadReport = async (id) => {
    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error cargando reporte:", error);
      return null;
    }

    setCurrentReport(data);
    return data;
  };

  /* ================= DELETE ================= */
  const deleteReport = async (id) => {
    const { error } = await supabase
      .from("registros")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error eliminando:", error);
      return;
    }

    if (currentReport?.id === id) {
      setCurrentReport(null);
    }

    fetchReports();
  };

  const value = {
    reports,
    currentReport,
    setCurrentReport,
    startNewReport,
    saveDraft,
    saveCompleted,
    loadReport,
    deleteReport,
  };

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
};
