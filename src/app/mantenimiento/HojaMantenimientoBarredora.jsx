import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { nanoid } from "nanoid";

/* =============================
   SECCIONES – MANTENIMIENTO BARREDORA
============================= */
const secciones = [
  {
    id: "1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    tipo: "simple",
    items: [
      ["1.1", "Encendido general del equipo"],
      ["1.2", "Funcionamiento de controles y tablero"],
      ["1.3", "Revisión de alarmas o fallas"],
    ],
  },
  {
    id: "2",
    titulo: "2. RECAMBIO DE ELEMENTOS DE LOS SISTEMAS DEL MÓDULO",
    tipo: "cantidad",
    items: [
      ["2.1", "Filtro de combustible primario (trampa de agua)"],
      ["2.2", "Filtro de combustible secundario (bomba)"],
      ["2.3", "Aceite de motor 15W40 (4 GL)"],
      ["2.4", "Filtro de aceite de motor"],
      ["2.5", "Filtro de aire primario interno"],
      ["2.6", "Filtro de aire secundario exterior"],
      ["2.7", "Reemplazo de filtros de combustible"],
      ["2.8", "Comprobación tensión tensor de correa y desgaste de banda"],
      ["2.9", "Reemplazo de aceite de motor"],
      ["2.10", "Reemplazo filtro de aceite de motor"],
      ["2.11", "Mantenimiento por 250 Hrs"],
      ["2.12", "Mano de obra mantenimiento por 1000 Hrs motor"],
      ["2.13", "Inspección visual de bomba de agua"],
      ["2.14", "Verificación manguera respiradero cárter y válvula"],
      ["2.15", "Calibración de válvulas del motor"],
      ["2.16", "Cambio de empaque tapa de válvulas"],
      ["2.17", "Limpieza de inyectores por método de recirculación"],
      ["2.18", "Reemplazo de termostato"],
      ["2.19", "Cambio de refrigerante"],
      ["2.20", "Reemplazo de filtros de aire"],
      ["2.21", "Aceite hidráulico AW 68"],
      ["2.22", "Kit filtro hidráulico"],
      ["2.23", "Aceite sintético SHC 629 cubo de ruedas"],
      ["2.24", "Filtro de aire acondicionado"],
      ["2.25", "Refrigerante JD tanque 2 1/2 gal"],
      ["2.26", "Grasa JD multipropósito"],
      ["2.27", "Termostato"],
      ["2.28", "Empaque tapa de válvula"],
      ["2.29", "Junta del termostato"],
      ["2.30", "Elemento filtrante"],
      ["2.31", "Aditivo limpieza de inyectores"],
      ["2.32", "Set segmento cepillo lateral"],
      ["2.33", "Cepillo central"],
      ["2.34", "Caucho zapata lateral"],
      ["2.35", "Caucho zapata esquinera"],
      ["2.36", "Cadena banda transportadora"],
      ["2.37", "Piñón hidromotor banda transportadora"],
      ["2.38", "Piñón rodillo superior banda"],
      ["2.39", "Filtro de agua"],
      ["2.40", "Chumacera eje cepillo"],
      ["2.41", "Chumacera rodillo superior"],
      ["2.42", "Chumacera eje inferior banda"],
      ["2.43", "Banda transportadora"],
    ],
  },
  {
    id: "3",
    titulo:
      "3. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, POST SERVICIO",
    tipo: "simple",
    items: [
      ["3.1", "Encendido general del equipo"],
      ["3.2", "Funcionamiento del sistema de barrido"],
      ["3.3", "Funcionamiento del sistema hidráulico"],
    ],
  },
];

export default function HojaMantenimientoBarredora() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  const [formData, setFormData] = useState({
    referenciaContrato: "",
    descripcion: "",
    codInf: "",

    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    tecnicoResponsable: "",
    telefonoTecnico: "",
    correoTecnico: "",
    fechaServicio: "",

    estadoEquipoPuntos: [],
    estadoEquipoDetalle: "",
    items: {},

    nota: "",
    marca: "",
    modelo: "",
    serie: "",
    anioModelo: "",
    vin: "",
    placa: "",
    horasModulo: "",
    horasChasis: "",
    kilometraje: "",
  });

  /* =============================
     CARGA DESDE LOCALSTORAGE
  ============================= */
  useEffect(() => {
    if (!id) return;

    const stored =
      JSON.parse(localStorage.getItem("mantenimiento-barredora")) || [];

    const found = stored.find((r) => r.id === id);

    if (found?.data) {
      setFormData(found.data);

      if (found.data.firmas?.tecnico && firmaTecnicoRef.current) {
        firmaTecnicoRef.current.fromDataURL(found.data.firmas.tecnico);
      }
      if (found.data.firmas?.cliente && firmaClienteRef.current) {
        firmaClienteRef.current.fromDataURL(found.data.firmas.cliente);
      }
    }
  }, [id]);

  /* =============================
     HANDLERS
  ============================= */
  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleItemChange = (codigo, campo, valor) => {
    setFormData((p) => ({
      ...p,
      items: {
        ...p.items,
        [codigo]: { ...p.items[codigo], [campo]: valor },
      },
    }));
  };

  const handleImageClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;

    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: [
        ...p.estadoEquipoPuntos,
        { id: p.estadoEquipoPuntos.length + 1, x, y, nota: "" },
      ],
    }));
  };

  const handleRemovePoint = (id) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos
        .filter((pt) => pt.id !== id)
        .map((pt, i) => ({ ...pt, id: i + 1 })),
    }));
  };

  const clearAllPoints = () =>
    setFormData((p) => ({ ...p, estadoEquipoPuntos: [] }));

  const handleNotaChange = (id, value) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos.map((pt) =>
        pt.id === id ? { ...pt, nota: value } : pt
      ),
    }));
  };

  /* =============================
     SUBMIT
  ============================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    const stored =
      JSON.parse(localStorage.getItem("mantenimiento-barredora")) || [];

    const record = {
      id: id || nanoid(),
      estado: "completado",
      codInf: formData.codInf || "",
      cliente: formData.cliente || "",
      data: {
        ...formData,
        firmas: {
          tecnico: firmaTecnicoRef.current?.toDataURL() || "",
          cliente: firmaClienteRef.current?.toDataURL() || "",
        },
      },
      createdAt: new Date().toISOString(),
    };

    const updated = id
      ? stored.map((r) => (r.id === id ? record : r))
      : [...stored, record];

    localStorage.setItem(
      "mantenimiento-barredora",
      JSON.stringify(updated)
    );

    navigate("/mantenimiento");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >
      {/* TODO EL JSX QUE YA TIENES SE MANTIENE */}
    </form>
  );
}

      {/* ENCABEZADO */}
      <section className="border rounded overflow-hidden">
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b">
              <td rowSpan={4} className="w-32 border-r p-3 text-center">
                <img src="/astap-logo.jpg" className="mx-auto max-h-20" />
              </td>
              <td colSpan={2} className="border-r text-center font-bold">
                HOJA DE MANTENIMIENTO BARREDORA
              </td>
              <td className="p-2">
                <div>Fecha versión: <strong>01-01-2026</strong></div>
                <div>Versión: <strong>01</strong></div>
              </td>
            </tr>

            {[
              ["REFERENCIA DE CONTRATO", "referenciaContrato"],
              ["DESCRIPCIÓN", "descripcion"],
              ["COD. INF.", "codInf"],
            ].map(([label, name]) => (
              <tr key={name} className="border-b">
                <td className="border-r p-2 font-semibold">{label}</td>
                <td colSpan={2} className="p-2">
                  <input
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className="w-full border p-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* DATOS */}
  <section className="grid md:grid-cols-2 gap-3 border rounded p-4">
        {[
          ["cliente", "Cliente"],
          ["direccion", "Dirección"],
          ["contacto", "Contacto"],
          ["telefono", "Teléfono"],
          ["correo", "Correo"],
          ["tecnicoResponsable", "Técnico responsable"],
          ["telefonoTecnico", "Teléfono técnico"],
          ["correoTecnico", "Correo técnico"],
        ].map(([n, p]) => (
          <input
            key={n}
            name={n}
            value={formData[n]}
            placeholder={p}
            onChange={handleChange}
            className="input"
          />
        ))}

        <input
          type="date"
          name="fechaServicio"
          value={formData.fechaServicio}
          onChange={handleChange}
          className="input md:col-span-2"
        />
      </section>

      {/* ESTADO DEL EQUIPO */}
      <section className="border rounded p-4 space-y-3">
        <div className="flex justify-between items-center">
          <p className="font-semibold">Estado del equipo</p>
          <button type="button" onClick={clearAllPoints} className="text-xs border px-2 py-1 rounded">
            Limpiar puntos
          </button>
        </div>

        <div
          className="relative border rounded cursor-crosshair"
          onClick={handleImageClick}
        >
          <img src="/estado equipo barredora.png" className="w-full" draggable={false} />
          {formData.estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              onDoubleClick={() => handleRemovePoint(pt.id)}
              className="absolute bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full"
              style={{
                left: `${pt.x}%`,
                top: `${pt.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {pt.id}
            </div>
          ))}
        </div>

        {formData.estadoEquipoPuntos.map((pt) => (
          <div key={pt.id} className="flex gap-2">
            <span className="font-semibold">{pt.id})</span>
            <input
              className="flex-1 border p-1"
              value={pt.nota}
              onChange={(e) => handleNotaChange(pt.id, e.target.value)}
            />
          </div>
        ))}
      </section>

      {/* TABLAS */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
          <table className="w-full text-xs border">
            <thead className="bg-gray-100">
              <tr>
                <th>Ítem</th>
                <th>Detalle</th>
                {sec.tipo === "cantidad" && <th>Cantidad</th>}
                <th>SI</th>
                <th>NO</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map(([codigo, texto]) => (
                <tr key={codigo}>
                  <td>{codigo}</td>
                  <td>{texto}</td>
                  {sec.tipo === "cantidad" && (
                    <td>
                      <input
                        type="number"
                        value={formData.items[codigo]?.cantidad || ""}
                        onChange={(e) =>
                          handleItemChange(codigo, "cantidad", e.target.value)
                        }
                        className="border w-16"
                      />
                    </td>
                  )}
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[codigo]?.estado === "SI"}
                      onChange={() => handleItemChange(codigo, "estado", "SI")}
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      checked={formData.items[codigo]?.estado === "NO"}
                      onChange={() => handleItemChange(codigo, "estado", "NO")}
                    />
                  </td>
                  <td>
                    <input
                      className="border w-full"
                      value={formData.items[codigo]?.observacion || ""}
                      onChange={(e) =>
                        handleItemChange(codigo, "observacion", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* DESCRIPCIÓN DEL EQUIPO */}
      <section className="border rounded p-4">
        <h2 className="font-semibold text-center mb-2">DESCRIPCIÓN DEL EQUIPO</h2>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            ["nota", "NOTA"],
            ["marca", "MARCA"],
            ["modelo", "MODELO"],
            ["serie", "N° SERIE"],
            ["anioModelo", "AÑO MODELO"],
            ["vin", "VIN / CHASIS"],
            ["placa", "PLACA"],
            ["horasModulo", "HORAS MÓDULO"],
            ["horasChasis", "HORAS CHASIS"],
            ["kilometraje", "KILOMETRAJE"],
          ].map(([name, label]) => (
            <div key={name} className="contents">
              <label className="font-semibold">{label}</label>
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="col-span-3 border p-1"
              />
            </div>
          ))}
        </div>
      </section>

      {/* FIRMAS */}
      <section className="border rounded p-4">
        <div className="grid md:grid-cols-2 gap-6 text-center">
          <div>
            <p className="font-semibold mb-1">Firma Técnico ASTAP</p>
            <SignatureCanvas ref={firmaTecnicoRef} canvasProps={{ className: "border w-full h-32" }} />
          </div>
          <div>
            <p className="font-semibold mb-1">Firma Cliente</p>
            <SignatureCanvas ref={firmaClienteRef} canvasProps={{ className: "border w-full h-32" }} />
          </div>
        </div>
      </section>

      {/* BOTONES */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => navigate("/mantenimiento")} className="border px-4 py-2 rounded">
          Volver
        </button>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Guardar mantenimiento
        </button>
      </div>
    </form>
  );
}
