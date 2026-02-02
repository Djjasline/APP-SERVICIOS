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
     SUBMIT (CLON DE INSPECCIÓN)
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
                <div>Fecha versión: <strong>01-1-2026</strong></div>
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
                  <input name={name} onChange={handleChange} className="w-full border p-1" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ================= DATOS ================= */}
      <section className="grid md:grid-cols-2 gap-3 border rounded p-4">
        <input name="cliente" placeholder="Cliente" onChange={handleChange} className="input" />
        <input name="direccion" placeholder="Dirección" onChange={handleChange} className="input" />
        <input name="contacto" placeholder="Contacto" onChange={handleChange} className="input" />
        <input name="telefono" placeholder="Teléfono" onChange={handleChange} className="input" />
        <input name="correo" placeholder="Correo" onChange={handleChange} className="input" />
        <input name="tecnicoResponsable" placeholder="Técnico responsable" onChange={handleChange} className="input" />
        <input name="telefonoTecnico" placeholder="Teléfono técnico" onChange={handleChange} className="input" />
        <input name="correoTecnico" placeholder="Correo técnico" onChange={handleChange} className="input" />
        <input type="date" name="fechaServicio" onChange={handleChange} className="input md:col-span-2" />
      </section>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <section className="border rounded p-4 space-y-3">
        <div className="flex justify-between items-center">
          <p className="font-semibold">Estado del equipo</p>
          <button type="button" onClick={clearAllPoints} className="text-xs border px-2 py-1 rounded">
            Limpiar puntos
          </button>
        </div>

        <div className="relative border rounded cursor-crosshair" onClick={handleImageClick}>
          <img src="/estado-equipo.png" className="w-full" draggable={false} />
          {formData.estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              onDoubleClick={() => handleRemovePoint(pt.id)}
              className="absolute bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full cursor-pointer"
              style={{ left: `${pt.x}%`, top: `${pt.y}%`, transform: "translate(-50%, -50%)" }}
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
              placeholder={`Observación punto ${pt.id}`}
              value={pt.nota}
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
                          onChange={(e) => handleItemChange(codigo, "detalle", e.target.value)}
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
                          onChange={(e) =>
                            handleItemChange(codigo, "cantidad", e.target.value)
                          }
                        />
                      </td>
                    )}
                    <td>
                      <input
                        type="radio"
                        onChange={() => handleItemChange(codigo, "estado", "SI")}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        onChange={() => handleItemChange(codigo, "estado", "NO")}
                      />
                    </td>
                    <td>
                      <input
                        className="border w-full"
                        onChange={(e) =>
                          handleItemChange(codigo, "observacion", e.target.value)
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

      {/* ================= DESCRIPCIÓN EQUIPO ================= */}
      <section className="border rounded p-4">
        <h2 className="font-semibold text-center mb-2">DESCRIPCIÓN DEL EQUIPO</h2>
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
              <input name={name} onChange={handleChange} className="col-span-3 border p-1" />
            </div>
          ))}
        </div>
      </section>

      {/* ================= FIRMAS ================= */}
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

      {/* ================= BOTONES ================= */}
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
