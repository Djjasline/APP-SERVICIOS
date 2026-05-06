import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { saveOrUpdateReport } from "@/services/reportService";

export default function HojaRecepcion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [guardando, setGuardando] = useState(false);
  const [registroId, setRegistroId] = useState(id || null);
  const [isLocked, setIsLocked] = useState(false);

  // ================= STATE =================
  const [data, setData] = useState({
    referencia: "",
    descripcion: "",
    codigo: "",
    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    tecnico: "",
    telefonoTecnico: "",
    correoTecnico: "",
    fecha: "",
    equipo: {
      nota: "",
      marca: "",
      modelo: "",
      serie: "",
      anio: "",
      vin: "",
      placa: "",
      horasModulo: "",
      horasChasis: "",
      kilometraje: "",
    },
  });

  // ✅ / ✘ estado de checks
  const [checks, setChecks] = useState({});

  // 🔥 combustible
  const [fuelLevel, setFuelLevel] = useState(0.5);
  const fuelCanvasRef = useRef(null);

  /* ================= CARGAR REGISTRO (si hay id) ================= */
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const { createClient } = await import("@supabase/supabase-js");
      const { supabase } = await import("@/lib/supabase");

      const { data: reg, error } = await supabase
        .from("registros")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !reg) return;

      if (reg.data) {
        setData(reg.data.formulario || data);
        setChecks(reg.data.checks || {});
        setFuelLevel(reg.data.fuelLevel ?? 0.5);
      }

      if (reg.estado === "completado") setIsLocked(true);
    };

    load();
  }, [id]);

  /* ================= DRAW FUEL ================= */
  useEffect(() => {
    const canvas = fuelCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(60, 60, 40, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#333";
    ctx.fillText("E", 15, 65);
    ctx.fillText("F", 95, 65);

    const angle = Math.PI + fuelLevel * Math.PI;
    const x = 60 + 35 * Math.cos(angle);
    const y = 60 + 35 * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(60, 60);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [fuelLevel]);

  /* ================= HELPERS ================= */
  const setField = (key, value) => setData((d) => ({ ...d, [key]: value }));

  const setEquipo = (key, value) =>
    setData((d) => ({ ...d, equipo: { ...d.equipo, [key]: value } }));

  const toggleCheck = (key, value) =>
    setChecks((c) => ({ ...c, [key]: value }));

  /* ================= GUARDAR ================= */
  const handleGuardar = async () => {
    setGuardando(true);

    try {
      const payload = {
        formulario: data,
        checks,
        fuelLevel,
      };

      const result = await saveOrUpdateReport({
        id: registroId,
        tipo: "recepcion",
        subtipo: "equipo",
        data: payload,
        estado: "borrador",
      });

      if (result?.id) setRegistroId(result.id);

      alert("Guardado correctamente");
      navigate("/recepcion");
    } catch (error) {
      console.error("Error guardando:", error);
      alert("Error al guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-4 max-w-6xl mx-auto text-xs space-y-4">

      {/* ================= BOTONES SUPERIORES ================= */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => navigate("/recepcion")}
          className="border px-4 py-2 rounded text-sm hover:bg-gray-50"
        >
          ← Volver
        </button>

        {!isLocked && (
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "💾 Guardar"}
          </button>
        )}

        {isLocked && (
          <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
            ✅ Completado
          </span>
        )}
      </div>

      {/* ================= HEADER ================= */}
      <div className="border">

        <div className="grid grid-cols-6 border-b">
          <div className="col-span-1 flex items-center justify-center border-r p-2">
            <img src="/astap-logo.jpg" className="h-10" alt="ASTAP" />
          </div>
          <div className="col-span-3 flex items-center justify-center border-r font-bold text-sm">
            HOJA DE RECEPCIÓN
          </div>
          <div className="col-span-2 p-2">
            <div>Fecha versión: 01-01-26</div>
            <div>Versión: 01</div>
          </div>
        </div>

        {[
          { label: "REFERENCIA DE CONTRATO", key: "referencia" },
          { label: "DESCRIPCIÓN", key: "descripcion" },
          { label: "COD. INF.", key: "codigo" },
        ].map((row, i) => (
          <div key={i} className="grid grid-cols-6 border-t">
            <div className="col-span-3 border-r p-2 font-medium">
              {row.label}
            </div>
            <input
              className="col-span-3 p-2 outline-none"
              value={data[row.key]}
              disabled={isLocked}
              onChange={(e) => setField(row.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* ================= CLIENTE ================= */}
      <div className="border">
        <div className="grid grid-cols-2 border-b">
          <input
            placeholder="Cliente"
            className="p-2 border-r outline-none"
            value={data.cliente}
            disabled={isLocked}
            onChange={(e) => setField("cliente", e.target.value)}
          />
          <input
            placeholder="Dirección"
            className="p-2 outline-none"
            value={data.direccion}
            disabled={isLocked}
            onChange={(e) => setField("direccion", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 border-b">
          <input
            placeholder="Contacto"
            className="p-2 border-r outline-none"
            value={data.contacto}
            disabled={isLocked}
            onChange={(e) => setField("contacto", e.target.value)}
          />
          <input
            placeholder="Teléfono"
            className="p-2 outline-none"
            value={data.telefono}
            disabled={isLocked}
            onChange={(e) => setField("telefono", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 border-b">
          <input
            placeholder="Correo"
            className="p-2 border-r outline-none"
            value={data.correo}
            disabled={isLocked}
            onChange={(e) => setField("correo", e.target.value)}
          />
          <input
            placeholder="Técnico responsable"
            className="p-2 outline-none"
            value={data.tecnico}
            disabled={isLocked}
            onChange={(e) => setField("tecnico", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 border-b">
          <input
            placeholder="Teléfono técnico"
            className="p-2 border-r outline-none"
            value={data.telefonoTecnico}
            disabled={isLocked}
            onChange={(e) => setField("telefonoTecnico", e.target.value)}
          />
          <input
            placeholder="Correo técnico"
            className="p-2 outline-none"
            value={data.correoTecnico}
            disabled={isLocked}
            onChange={(e) => setField("correoTecnico", e.target.value)}
          />
        </div>
        <div>
          <input
            type="date"
            className="p-2 w-full outline-none"
            value={data.fecha}
            disabled={isLocked}
            onChange={(e) => setField("fecha", e.target.value)}
          />
        </div>
      </div>

      {/* ================= DESCRIPCIÓN EQUIPO ================= */}
      <div className="border">
        <div className="text-center font-semibold border-b py-1">
          DESCRIPCIÓN DEL EQUIPO
        </div>

        {[
          { label: "NOTA", key: "nota" },
          { label: "MARCA", key: "marca" },
          { label: "MODELO", key: "modelo" },
          { label: "N° SERIE", key: "serie" },
          { label: "AÑO MODELO", key: "anio" },
          { label: "VIN / CHASIS", key: "vin" },
          { label: "PLACA", key: "placa" },
          { label: "HORAS MÓDULO", key: "horasModulo" },
          { label: "HORAS CHASIS", key: "horasChasis" },
          { label: "KILOMETRAJE", key: "kilometraje" },
        ].map((item, i) => (
          <div key={i} className="grid grid-cols-4 border-t">
            <div className="col-span-1 border-r p-2 font-medium">
              {item.label}
            </div>
            <input
              className="col-span-3 p-2 outline-none"
              value={data.equipo[item.key]}
              disabled={isLocked}
              onChange={(e) => setEquipo(item.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* ================= TABLA CHECKS ================= */}
      <div className="border">
        <div className="text-center font-semibold border-b py-1">
          DOCUMENTOS Y ESTADO DEL VEHÍCULO
        </div>

        <div className="grid grid-cols-12">

          {/* INTERIOR */}
          <div className="col-span-4 border-r">
            <div className="grid grid-cols-4 border-b font-semibold text-center">
              <div className="col-span-2 border-r">INTERIOR</div>
              <div className="border-r">SI</div>
              <div>NO</div>
            </div>
            {["GATA", "LLAVE CRUZ", "EXTINTOR", "LUZ CABINA", "RADIO", "TAPETES", "ENCENDEDOR", "AIRE", "ALARMA"].map(
              (item, i) => (
                <div key={i} className="grid grid-cols-4 border-b">
                  <div className="col-span-2 border-r px-1">{item}</div>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => toggleCheck(`int_${item}`, "SI")}
                    className={`border-r text-center ${checks[`int_${item}`] === "SI" ? "bg-green-200 font-bold" : ""}`}
                  >
                    ✔
                  </button>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => toggleCheck(`int_${item}`, "NO")}
                    className={`text-center ${checks[`int_${item}`] === "NO" ? "bg-red-200 font-bold" : ""}`}
                  >
                    ✘
                  </button>
                </div>
              )
            )}
          </div>

          {/* MOTOR */}
          <div className="col-span-4 border-r">
            <div className="grid grid-cols-4 border-b font-semibold text-center">
              <div className="col-span-2 border-r">MOTOR</div>
              <div className="border-r">SI</div>
              <div>NO</div>
            </div>
            {["ACEITE", "REFRIGERANTE", "BATERIA", "TAPON ACEITE", "TAPA COMB", "RADIADOR"].map(
              (item, i) => (
                <div key={i} className="grid grid-cols-4 border-b">
                  <div className="col-span-2 border-r px-1">{item}</div>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => toggleCheck(`mot_${item}`, "SI")}
                    className={`border-r text-center ${checks[`mot_${item}`] === "SI" ? "bg-green-200 font-bold" : ""}`}
                  >
                    ✔
                  </button>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => toggleCheck(`mot_${item}`, "NO")}
                    className={`text-center ${checks[`mot_${item}`] === "NO" ? "bg-red-200 font-bold" : ""}`}
                  >
                    ✘
                  </button>
                </div>
              )
            )}
          </div>

          {/* EXTERIOR */}
          <div className="col-span-3 border-r">
            <div className="grid grid-cols-4 border-b font-semibold text-center">
              <div className="col-span-2 border-r">EXTERIOR</div>
              <div className="border-r">SI</div>
              <div>NO</div>
            </div>
            {["PLUMAS", "RETROVISOR", "PLACAS", "LLANTA", "TAPACUBOS", "LUCES"].map(
              (item, i) => (
                <div key={i} className="grid grid-cols-4 border-b">
                  <div className="col-span-2 border-r px-1">{item}</div>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => toggleCheck(`ext_${item}`, "SI")}
                    className={`border-r text-center ${checks[`ext_${item}`] === "SI" ? "bg-green-200 font-bold" : ""}`}
                  >
                    ✔
                  </button>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => toggleCheck(`ext_${item}`, "NO")}
                    className={`text-center ${checks[`ext_${item}`] === "NO" ? "bg-red-200 font-bold" : ""}`}
                  >
                    ✘
                  </button>
                </div>
              )
            )}
          </div>

          {/* COMBUSTIBLE */}
          <div className="col-span-1 flex flex-col items-center justify-center p-2">
            <div className="text-center text-[10px] font-semibold">
              COMBUSTIBLE
            </div>
            <canvas
              ref={fuelCanvasRef}
              width={120}
              height={80}
              onClick={(e) => {
                if (isLocked) return;
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                setFuelLevel(x / rect.width);
              }}
              className={`border mt-2 ${!isLocked ? "cursor-pointer" : ""}`}
            />
            <div className="text-[9px] text-gray-400 mt-1">
              Clic para ajustar
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTÓN INFERIOR ================= */}
      {!isLocked && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="bg-green-600 text-white px-6 py-2 rounded text-sm disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "💾 Guardar hoja de recepción"}
          </button>
        </div>
      )}

    </div>
  );
}
