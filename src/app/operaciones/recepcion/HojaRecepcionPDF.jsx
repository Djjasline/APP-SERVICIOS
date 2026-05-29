import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { generarPDFRecepcion } from "./generarPDFRecepcion";
import { ControlVehicularSheet } from "./HojaRecepcion";
import { cloneRecepcionSchema } from "./recepcionSchema";

const mergeDeep = (base, value) => {
  if (Array.isArray(base)) return Array.isArray(value) ? value : [...base];
  if (!base || typeof base !== "object") return value ?? base;

  const source = value && typeof value === "object" ? value : {};
  const merged = { ...source };

  Object.keys(base).forEach((key) => {
    merged[key] = mergeDeep(base[key], source[key]);
  });

  return merged;
};

export default function HojaRecepcionPDF() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(cloneRecepcionSchema());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const { data: registro, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && registro?.data) {
        setData(mergeDeep(cloneRecepcionSchema(), registro.data));
      }

      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-600">
        Cargando hoja de control vehicular...
      </div>
    );
  }

  return (
    <div className="p-4 max-w-[1080px] mx-auto space-y-3 bg-white">
      <div className="no-print flex flex-wrap justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="border px-4 py-2 rounded text-sm hover:bg-gray-50"
        >
          Volver
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="border px-4 py-2 rounded text-sm hover:bg-gray-50"
          >
            Imprimir
          </button>

          <button
            type="button"
            onClick={() => generarPDFRecepcion(data)}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm"
          >
            Descargar PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow border p-2">
        <ControlVehicularSheet
          data={data}
          setData={() => {}}
          readOnly
          signatureRefs={{}}
        />
      </div>
    </div>
  );
}
