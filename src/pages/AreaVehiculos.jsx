{/* ================= DERECHA ================= */}
<div className="bg-white p-6 rounded-xl shadow space-y-4">

  <h2 className="font-semibold text-lg">
    Operaciones
  </h2>

  {/* HERRAMIENTAS */}
  <div className="border rounded-lg p-4 space-y-2">
    <h3 className="font-medium">Herramientas</h3>
    <p className="text-xs text-gray-500">
      Control y seguimiento de equipos y herramientas.
    </p>

    <button
      onClick={() => navigate("/registro")}
      className="bg-purple-600 text-white w-full py-2 rounded"
    >
      Ir
    </button>
  </div>

  {/* RECEPCIÓN */}
  <div className="border rounded-lg p-4 space-y-2">
    <h3 className="font-medium">Recepción</h3>
    <p className="text-xs text-gray-500">
      Registro de ingreso de vehículos a operación.
    </p>

    <button
      onClick={() => navigate("/recepcion")}
      className="bg-red-600 text-white w-full py-2 rounded"
    >
      Ir
    </button>
  </div>

  {/* 🔥 LIBERACIÓN (AQUÍ VA EL MÓDULO REAL) */}
  <div className="border rounded-lg p-4 space-y-2">
    <h3 className="font-medium">Liberación</h3>
    <p className="text-xs text-gray-500">
      Control de salida y entrega de vehículos.
    </p>

    <button
      onClick={() => navigate("/liberacion")}
      className="bg-indigo-600 text-white w-full py-2 rounded"
    >
      Ir
    </button>
  </div>

</div>
