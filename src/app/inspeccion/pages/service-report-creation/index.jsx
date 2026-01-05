{/* ============================= */}
{/* DATOS GENERALES DEL INFORME */}
{/* ============================= */}
<div className="border border-black text-xs">

  {/* REFERENCIA / DESCRIPCIÓN */}
  <div className="grid grid-cols-12 border-b border-black">
    <div className="col-span-3 border-r border-black p-2 font-semibold">
      REFERENCIA DE CONTRATO:
    </div>
    <div className="col-span-9 p-1">
      <input
        className="w-full outline-none"
        value={report.cliente.referencia || ""}
        onChange={(e) =>
          setReport((p) => ({
            ...p,
            cliente: { ...p.cliente, referencia: e.target.value },
          }))
        }
      />
    </div>
  </div>

  <div className="grid grid-cols-12 border-b border-black">
    <div className="col-span-3 border-r border-black p-2 font-semibold">
      DESCRIPCIÓN:
    </div>
    <div className="col-span-9 p-1">
      <textarea
        className="w-full outline-none resize-none"
        rows={2}
        value={report.cliente.descripcion || ""}
        onChange={(e) =>
          setReport((p) => ({
            ...p,
            cliente: { ...p.cliente, descripcion: e.target.value },
          }))
        }
      />
    </div>
  </div>

  <div className="grid grid-cols-12 border-b border-black">
    <div className="col-span-3 border-r border-black p-2 font-semibold">
      Cod. INF.:
    </div>
    <div className="col-span-9 p-1">
      <input
        className="w-full outline-none"
        value={report.cliente.codigoInforme || ""}
        onChange={(e) =>
          setReport((p) => ({
            ...p,
            cliente: { ...p.cliente, codigoInforme: e.target.value },
          }))
        }
      />
    </div>
  </div>

  {/* FECHA / UBICACIÓN */}
  <div className="grid grid-cols-12 border-b border-black">
    <div className="col-span-3 border-r border-black p-2 font-semibold">
      FECHA DE EMISIÓN:
    </div>

    <div className="col-span-1 border-r border-black p-1 text-center">
      <input
        className="w-full outline-none text-center"
        placeholder="DD"
        value={report.cliente.dd || ""}
        onChange={(e) =>
          setReport((p) => ({
            ...p,
            cliente: { ...p.cliente, dd: e.target.value },
          }))
        }
      />
    </div>

    <div className="col-span-1 border-r border-black p-1 text-center">
      <input
        className="w-full outline-none text-center"
        placeholder="MM"
        value={report.cliente.mm || ""}
        onChange={(e) =>
          setReport((p) => ({
            ...p,
            cliente: { ...p.cliente, mm: e.target.value },
          }))
        }
      />
    </div>

    <div className="col-span-1 border-r border-black p-1 text-center">
      <input
        className="w-full outline-none text-center"
        placeholder="AA"
        value={report.cliente.aa || ""}
        onChange={(e) =>
          setReport((p) => ({
            ...p,
            cliente: { ...p.cliente, aa: e.target.value },
          }))
        }
      />
    </div>

    <div className="col-span-2 border-r border-black p-2 font-semibold">
      UBICACIÓN:
    </div>

    <div className="col-span-4 p-1">
      <input
        className="w-full outline-none"
        value={report.cliente.ubicacion || ""}
        onChange={(e) =>
          setReport((p) => ({
            ...p,
            cliente: { ...p.cliente, ubicacion: e.target.value },
          }))
        }
      />
    </div>
  </div>

  {/* RESPONSABLES */}
  <div className="grid grid-cols-12 border-b border-black">
    <div className="col-span-3 border-r border-black p-2 font-semibold">
      TÉCNICO RESPONSABLE:
    </div>
    <div className="col-span-3 border-r border-black p-1">
      <input
        className="w-full outline-none"
        value={report.cliente.tecnico || ""}
        onChange={(e) =>
          setReport((p) => ({
            ...p,
            cliente: { ...p.cliente, tecnico: e.target.value },
          }))
        }
      />
    </div>

    <div className="col-span-3 border-r border-black p-2 font-semibold">
      CLIENTE:
    </div>
    <div className="col-span-3 p-1">
      <input
        className="w-full outline-none"
        value={report.cliente.nombreCliente || ""}
        onChange={(e) =>
          setReport((p) => ({
            ...p,
            cliente: { ...p.cliente, nombreCliente: e.target.value },
          }))
        }
      />
    </div>
  </div>

  <div className="grid grid-cols-12">
    <div className="col-span-3 border-r border-black p-2 font-semibold">
      RESPONSABLE CLIENTE:
    </div>
    <div className="col-span-9 p-1">
      <input
        className="w-full outline-none"
        value={report.cliente.responsableCliente || ""}
        onChange={(e) =>
          setReport((p) => ({
            ...p,
            cliente: {
              ...p.cliente,
              responsableCliente: e.target.value,
            },
          }))
        }
      />
    </div>
  </div>
</div>
