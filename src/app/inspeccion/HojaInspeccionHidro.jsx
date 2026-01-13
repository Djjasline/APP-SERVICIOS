import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* ======================================================
   SECCIONES – HIDROSUCCIONADOR (OFICIAL PDF)
====================================================== */
const secciones = [
  {
    bloque: "2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O ESTADO DE LOS SISTEMAS",
    id: "A",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      ["A.1", "FUGAS DE ACEITE HIDRÁULICO (MANGUERAS - ACOPLES - BANCOS)"],
      ["A.2", "NIVEL DE ACEITE DEL SOPLADOR"],
      ["A.3", "NIVEL DE ACEITE HIDRÁULICO"],
      ["A.4", "NIVEL DE ACEITE EN LA CAJA DE TRANSFERENCIA"],
      ["A.5", "INSPECCIÓN DEL MANÓMETRO DE FILTRO HIDRÁULICO DE RETORNO, VERDE, AMARILLO, ROJO"],
      ["A.6", "INSPECCIÓN DEL FILTRO HIDRÁULICO DE RETORNO, PRESENTA FUGAS O DAÑOS"],
      ["A.7", "INSPECCIÓN DE LOS FILTROS DE SUCCIÓN DEL TANQUE HIDRÁULICO (OPCIONAL)"],
      ["A.8", "ESTADO DE LOS CILINDROS HIDRÁULICOS, PRESENTA FUGAS O DAÑOS"],
      ["A.9", "EVALUACIÓN DEL ESTADO DE LOS TAPONES DE DRENAJE DE LUBRICANTES"],
      ["A.10", "EVALUACIÓN DE BANCOS HIDRÁULICOS, PRESENTAN FUGAS O DAÑOS"],
    ],
  },
  {
    id: "B",
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      ["B.1", "INSPECCIÓN DEL ESTADO DE LOS FILTROS MALLA DE PARA AGUA DE 2” Y 3”"],
      ["B.2", "ESTADO DE LOS EMPAQUES DE LA TAPA DE LOS FILTROS DE AGUA"],
      ["B.3", "INSPECCIÓN DE FUGAS DE AGUA (MANGUERAS - ACOPLES)"],
      ["B.4", "INSPECCIÓN DE LA VÁLVULA DE ALIVIO DE LA PISTOLA (OPCIONAL DE 700 PSI)"],
      ["B.5", "INSPECCIÓN DE GOLPES Y FUGAS DE AGUA EN EL TANQUE DE ALUMINIO"],
      ["B.6", "INSPECCIÓN DEL MEDIDOR DE NIVEL DEL TANQUE, ¿SE VISUALIZA SUS BOLITAS?"],
      ["B.7", "INSPECCIÓN DEL SISTEMA DE TAPÓN DE EXPANSIÓN DE 2” DE TANQUES DE ALUMINIO"],
      ["B.8", "INSPECCIÓN DEL SISTEMA DE DRENAJE DE LA BOMBA RODDER (OPCIONAL)"],
      ["B.9", "ESTADO DE VÁLVULAS CHECKS INTERNAS DE LA BOMBA DE 2” Y DE 3”"],
      ["B.10", "ESTADO DE LOS MANÓMETROS DE PRESIÓN (OPCIONAL)"],
      ["B.11", "INSPECCIÓN DEL ESTADO DEL CARRETE DE MANGUERA, MANGUERA GUÍA"],
      ["B.12", "SOPORTE DEL CARRETE ¿ESTÁ FLOJO?"],
      ["B.13", "INSPECCIÓN DEL CODO GIRATORIO DEL CARRETE, SUPERIOR E INFERIOR, PRESENTA FUGAS"],
      ["B.14", "INSPECCIÓN DE SISTEMA DE TRINQUETE, SEGUROS, CILINDROS NEUMÁTICOS, ¿SE ACTIVAN?"],
      ["B.15", "INSPECCIÓN DE LA VÁLVULA DE ALIVIO DE BOMBA DE AGUA (OPCIONAL)"],
      ["B.16", "INSPECCIÓN DE VÁLVULAS DE 1”"],
      ["B.17", "INSPECCIÓN DE VÁLVULAS DE 3/4”"],
      ["B.18", "INSPECCIÓN DE VÁLVULAS DE 1/2”"],
      ["B.19", "ESTADO DE LAS BOQUILLAS, ¿SE LAS DA MANTENIMIENTO, CONSERVACIÓN?"],
    ],
  },
  {
    id: "C",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      ["C.1", "INSPECCIÓN DE FUNCIONES DE TABLERO FRONTAL, ¿SE MANTIENE LIMPIO?"],
      ["C.2", "EVALUAR FUNCIONAMIENTO DE TABLERO DE CONTROL INTERNO CABINA"],
      ["C.3", "INSPECCIÓN DEL ESTADO DE CONTROL REMOTO, ESTADO DE SU PUERTO DE CARGA"],
      ["C.4", "INSPECCIÓN DEL ESTADO DE LAS ELECTROVÁLVULAS DE LOS BANCOS DE CONTROL"],
      ["C.5", "PRESENCIA DE HUMEDAD EN SUS COMPONENTES"],
      ["C.6", "REVISIÓN DE LUCES ESTROBO, FLECHAS Y ACCESORIOS EXTERNOS"],
    ],
  },
  {
    id: "D",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      ["D.1", "INSPECCIÓN DE LOS SELLOS EN EL TANQUE DE DESPERDICIOS FRONTAL Y POSTERIOR"],
      ["D.2", "ESTADO INTERNO DEL TANQUE DE DESECHOS, CANASTILLAS, ESFERAS Y DEFLECTORES"],
      ["D.3", "INSPECCIÓN DEL MICROFILTRO DE SUCCIÓN"],
      ["D.4", "INSPECCIÓN DEL TAPÓN DE DRENAJE DEL FILTRO DE SUCCIÓN"],
      ["D.5", "ESTADO FÍSICO DE LAS MANGUERAS DE SUCCIÓN"],
      ["D.6", "SEGUROS DE COMPUERTA DEL TANQUE DE DESECHOS"],
      ["D.7", "INSPECCIÓN DEL SISTEMA DE DESFOGUE (VÁLVULA Y ACTUADOR)"],
      ["D.8", "INSPECCIÓN DE VÁLVULAS DE ALIVIO DE PRESIÓN KUNKLE"],
      ["D.9", "INSPECCIONAR LA OPERACIÓN DEL SOPLADOR"],
    ],
  },
];

export default function HojaInspeccionHidro() {
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
    equipo: {
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
    },
    items: {},
  });

  const update = (path, value) => {
    setFormData((p) => {
      const copy = structuredClone(p);
      let ref = copy;
      for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
      ref[path[path.length - 1]] = value;
      return copy;
    });
  };

  const addPoint = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    update(["estadoEquipoPuntos"], [
      ...formData.estadoEquipoPuntos,
      {
        id: formData.estadoEquipoPuntos.length + 1,
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
        nota: "",
      },
    ]);
  };

  const removePoint = (id) =>
    update(
      ["estadoEquipoPuntos"],
      formData.estadoEquipoPuntos.filter((p) => p.id !== id).map((p, i) => ({ ...p, id: i + 1 }))
    );

  const clearPoints = () => update(["estadoEquipoPuntos"], []);

  const submit = (e) => {
    e.preventDefault();
    markInspectionCompleted("hidro", id, {
      ...formData,
      firmas: {
        tecnico: firmaTecnicoRef.current?.toDataURL() || "",
        cliente: firmaClienteRef.current?.toDataURL() || "",
      },
    });
    navigate("/inspeccion");
  };

  return (
    <form onSubmit={submit} className="max-w-6xl mx-auto bg-white p-6 space-y-6 text-sm">
      {/* === DATOS CLIENTE === */}
      <section className="grid grid-cols-2 gap-3 border p-4 rounded">
        {[
          ["cliente", "Cliente"],
          ["direccion", "Dirección"],
          ["contacto", "Contacto"],
          ["telefono", "Teléfono"],
          ["correo", "Correo"],
          ["tecnicoResponsable", "Técnico responsable"],
          ["telefonoTecnico", "Teléfono técnico"],
          ["correoTecnico", "Correo técnico"],
        ].map(([k, p]) => (
          <input key={k} placeholder={p} className="border p-2" onChange={(e) => update([k], e.target.value)} />
        ))}
        <input type="date" className="border p-2 col-span-2" onChange={(e) => update(["fechaServicio"], e.target.value)} />
      </section>

      {/* === ESTADO EQUIPO === */}
      <section className="border p-4 rounded space-y-2">
        <div className="flex justify-between">
          <strong>Estado del equipo</strong>
          <button type="button" onClick={clearPoints} className="text-xs border px-2 py-1">Limpiar puntos</button>
        </div>
        <div className="relative border" onClick={addPoint}>
          <img src="/estado-equipo.png" className="w-full" />
          {formData.estadoEquipoPuntos.map((p) => (
            <div
              key={p.id}
              onDoubleClick={() => removePoint(p.id)}
              className="absolute bg-red-600 text-white w-6 h-6 text-xs rounded-full flex items-center justify-center"
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)" }}
            >
              {p.id}
            </div>
          ))}
        </div>
      </section>

      {/* === TABLAS === */}
      {secciones.map((s) => (
        <section key={s.id} className="border p-4 rounded">
          <h3 className="font-semibold mb-2">{s.titulo}</h3>
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr><th>Ítem</th><th>Detalle</th><th>SI</th><th>NO</th><th>Observación</th></tr>
            </thead>
            <tbody>
              {s.items.map(([c, t]) => (
                <tr key={c}>
                  <td>{c}</td>
                  <td>{t}</td>
                  <td><input type="radio" onChange={() => update(["items", c, "estado"], "SI")} /></td>
                  <td><input type="radio" onChange={() => update(["items", c, "estado"], "NO")} /></td>
                  <td><input className="border w-full px-1" onChange={(e) => update(["items", c, "obs"], e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* === DATOS EQUIPO === */}
      <section className="border p-4 rounded">
        <h3 className="text-center font-semibold mb-2">DESCRIPCIÓN DEL EQUIPO</h3>
        {Object.entries(formData.equipo).map(([k]) => (
          <input key={k} className="border p-2 w-full mb-2" placeholder={k.toUpperCase()} onChange={(e) => update(["equipo", k], e.target.value)} />
        ))}
      </section>

      {/* === FIRMAS === */}
      <section className="grid grid-cols-2 gap-4">
        <SignatureCanvas ref={firmaTecnicoRef} canvasProps={{ className: "border h-32 w-full" }} />
        <SignatureCanvas ref={firmaClienteRef} canvasProps={{ className: "border h-32 w-full" }} />
      </section>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => navigate("/inspeccion")} className="border px-4 py-2">Volver</button>
        <button type="submit" className="bg-green-600 text-white px-4 py-2">Guardar y completar</button>
      </div>
    </form>
  );
}
