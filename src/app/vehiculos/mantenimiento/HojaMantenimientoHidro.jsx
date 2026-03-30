import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { nanoid } from "nanoid";

/* =============================
   SECCIONES – MANTENIMIENTO HIDRO
============================= */
const secciones = [
  {
    id: "1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    tipo: "simple",
    items: [
      ["1.1", "Prueba de encendido general del equipo"],
      ["1.2", "Verificación de funcionamiento de controles principales"],
      ["1.3", "Revisión de alarmas o mensajes de fallo"],
    ],
  },
  {
    id: "2",
    titulo:
      "2. RECAMBIO DE ELEMENTOS DE LOS SISTEMAS DEL MÓDULO HIDROSUCCIONADOR",
    tipo: "cantidad",
    items: [
      ["2.1", "Tapón de expansión PN 45731-30"],
      ["2.2", "Empaque externo tapa filtro en Y 3\" PN 41272-30"],
      ["2.3", "Empaque externo tapa filtro en Y 3\" New Model PN 513726A-30"],
      ["2.4", "Empaque interno tapa filtro en Y 3\" New Model PN 513726B-31"],
      ["2.5", "Empaque interno tapa filtro en Y 3\" PN 41271-30"],
      ["2.6", "Empaque filtro de agua Y 2\" PN 46137-30"],
      ["2.7", "Empaque filtro de agua Y 2\" PN 46138-30"],
      ["2.8", "Malla filtro de agua 2\" PN 45803-30"],
      ["2.9", "O-Ring válvula check 2\" PN 29674-30"],
      ["2.10", "O-Ring válvula check 3\" PN 29640-30"],
      ["2.11", "Malla filtro de agua 3\" PN 41280-30"],
      ["2.12", "Filtro aceite hidráulico cartucho New Model PN 514335-30"],
      ["2.13", "Filtro aceite hidráulico cartucho PN 1099061"],
      ["2.14", "Aceite caja transferencia 80W90 (galones)"],
      ["2.15", "Aceite soplador ISO 220 (galones)"],
      ["2.16", "Aceite hidráulico AW 46 (galones)"],
    ],
  },
  {
    id: "3",
    titulo: "3. SERVICIOS DE MÓDULO HIDROSUCCIONADOR",
    tipo: "simple",
    items: [
      ["3.1", "Sistema de diálisis para limpieza de impurezas del sistema hidráulico"],
      ["3.2", "Limpieza de bomba Rodder y cambio de elementos"],
      ["3.3", "Inspección válvula paso de agua a bomba Rodder"],
    ],
  },
  {
    id: "4",
    titulo: "4. OTROS (ESPECIFICAR)",
    tipo: "otros",
    items: ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6"],
  },
  {
    id: "5",
    titulo:
      "5. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, POSTERIOR AL SERVICIO",
    tipo: "simple",
    items: [
      ["5.1", "Encendido general del equipo"],
      ["5.2", "Verificación de presiones de trabajo"],
      ["5.3", "Funcionamiento de sistemas hidráulicos"],
      ["5.4", "Funcionamiento de sistema de succión"],
      ["5.5", "Funcionamiento de sistema de agua"],
    ],
  },
];

export default function HojaMantenimientoHidro() {
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
     CARGA DESDE LOCALSTORAGE (EDITAR)
  ============================= */
  useEffect(() => {
    if (!id) return;

    const stored =
      JSON.parse(localStorage.getItem("mantenimiento-hidro")) || [];

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

  /* =============================
     PUNTOS ROJOS
  ============================= */
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
     SUBMIT (CLON INSPECCIÓN)
  ============================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    const stored =
      JSON.parse(localStorage.getItem("mantenimiento-hidro")) || [];

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
      "mantenimiento-hidro",
      JSON.stringify(updated)
    );

    navigate("/mantenimiento");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >

      {/* ================= ENCABEZADO ================= */}
      <section className="border rounded overflow-hidden">
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b">
              <td rowSpan={4} className="w-32 border-r p-3 text-center">
                <img src="/astap-logo.jpg" className="mx-auto max-h-20" />
              </td>
              <td colSpan={2} className="border-r text-center font-bold">
                HOJA DE MANTENIMIENTO HIDROSUCCIONADOR
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

      {/* ================= DATOS ================= */}
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

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <section className="border rounded p-4 space-y-3">
        <div className="flex justify-between items-center">
          <p className="font-semibold">Estado del equipo</p>
          <button
            type="button"
            onClick={clearAllPoints}
            className="text-xs border px-2 py-1 rounded"
          >
            Limpiar puntos
          </button>
        </div>

        <div
          className="relative border rounded cursor-crosshair"
          onClick={handleImageClick}
        >
          <img src="/estado-equipo.png" className="w-full" draggable={false} />
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
              placeholder={`Observación punto ${pt.id}`}
              onChange={(e) => handleNotaChange(pt.id, e.target.value)}
            />
          </div>
        ))}
      </section>

      {/* ================= TABLAS ================= */}
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
              {sec.items.map((it) => {
                const codigo = Array.isArray(it) ? it[0] : it;
                const texto = Array.isArray(it) ? it[1] : "";
                return (
                  <tr key={codigo}>
                    <td>{codigo}</td>
                    <td>
                      {sec.tipo === "otros" ? (
                        <input
                          className="border w-full"
                          value={formData.items[codigo]?.detalle || ""}
                          onChange={(e) =>
                            handleItemChange(codigo, "detalle", e.target.value)
                          }
                        />
                      ) : (
                        texto
                      )}
                    </td>
                    {sec.tipo === "cantidad" && (
                      <td>
                        <input
                          type="number"
                          className="border w-16"
                          value={formData.items[codigo]?.cantidad || ""}
                          onChange={(e) =>
                            handleItemChange(
                              codigo,
                              "cantidad",
                              e.target.value
                            )
                          }
                        />
                      </td>
                    )}
                    <td>
                      <input
                        type="radio"
                        name={`estado-${codigo}`}
                        checked={formData.items[codigo]?.estado === "SI"}
                        onChange={() =>
                          handleItemChange(codigo, "estado", "SI")
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name={`estado-${codigo}`}
                        checked={formData.items[codigo]?.estado === "NO"}
                        onChange={() =>
                          handleItemChange(codigo, "estado", "NO")
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="border w-full"
                        value={
                          formData.items[codigo]?.observacion || ""
                        }
                        onChange={(e) =>
                          handleItemChange(
                            codigo,
                            "observacion",
                            e.target.value
                          )
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}

      {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
      <section className="border rounded p-4">
        <h2 className="font-semibold text-center mb-2">
          DESCRIPCIÓN DEL EQUIPO
        </h2>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            ["NOTA", "nota"],
            ["MARCA", "marca"],
            ["MODELO", "modelo"],
            ["N° SERIE", "serie"],
            ["AÑO MODELO", "anioModelo"],
            ["VIN / CHASIS", "vin"],
            ["PLACA", "placa"],
            ["HORAS MÓDULO", "horasModulo"],
            ["HORAS CHASIS", "horasChasis"],
            ["KILOMETRAJE", "kilometraje"],
          ].map(([label, name]) => (
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

     {/* ================= FIRMAS ================= */}
<section className="border rounded p-4">
  <div className="grid md:grid-cols-2 gap-6 text-center">

    {/* FIRMA TÉCNICO */}
    <div>
      <p className="font-semibold mb-1">Firma Técnico ASTAP</p>

      <SignatureCanvas
        ref={firmaTecnicoRef}
        canvasProps={{ className: "border w-full h-32" }}
      />

      <button
        type="button"
        onClick={() => firmaTecnicoRef.current?.clear()}
        className="text-xs text-red-600 mt-2"
      >
        Borrar firma
      </button>
    </div>

    {/* FIRMA CLIENTE */}
    <div>
      <p className="font-semibold mb-1">Firma Cliente</p>

      <SignatureCanvas
        ref={firmaClienteRef}
        canvasProps={{ className: "border w-full h-32" }}
      />

      <button
        type="button"
        onClick={() => firmaClienteRef.current?.clear()}
        className="text-xs text-red-600 mt-2"
      >
        Borrar firma
      </button>
    </div>

  </div>
</section>
      {/* ================= BOTONES ================= */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate("/mantenimiento")}
          className="border px-4 py-2 rounded"
        >
          Volver
        </button>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Guardar mantenimiento
        </button>
      </div>

    </form>
  );
}
