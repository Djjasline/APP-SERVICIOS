<div className="space-y-6">

  {/* TÍTULO */}
  <h2 className="text-xl font-semibold text-white tracking-wide">
    Vehículos Especiales
  </h2>

  {/* GRID */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

    {/* INFORME */}
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 space-y-3 hover:shadow-md transition">
      
      <div className="flex items-center gap-2">
        <span className="text-blue-600 text-lg">📄</span>
        <h3 className="text-lg font-semibold text-gray-900">
          Informe General
        </h3>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        Registro técnico de trabajos realizados.
      </p>

      <button className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        Ir
      </button>
    </div>

    {/* INSPECCIÓN */}
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 space-y-3 hover:shadow-md transition">
      
      <div className="flex items-center gap-2">
        <span className="text-yellow-600 text-lg">🛠</span>
        <h3 className="text-lg font-semibold text-gray-900">
          Inspección
        </h3>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        Evaluación del estado de equipos como barredoras, hidrosuccionadores y cámaras de inspección.
      </p>

      <button className="px-3 py-1.5 text-sm font-medium bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition">
        Ir
      </button>
    </div>

    {/* MANTENIMIENTO */}
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 space-y-3 hover:shadow-md transition">
      
      <div className="flex items-center gap-2">
        <span className="text-green-600 text-lg">🧰</span>
        <h3 className="text-lg font-semibold text-gray-900">
          Mantenimiento
        </h3>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        Control de mantenimiento preventivo de barredoras, hidrosuccionadores y cámaras de inspección.
      </p>

      <button className="px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition">
        Ir
      </button>
    </div>

  </div>
</div>
