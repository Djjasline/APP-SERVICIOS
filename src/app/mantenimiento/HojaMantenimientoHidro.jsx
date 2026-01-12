{/* ESTADO DEL EQUIPO */}
<section className="border rounded p-4 space-y-2">
  <p className="font-semibold">Estado del equipo</p>

  <div className="relative border rounded cursor-crosshair" onClick={handleImageClick}>
    <img src="/estado-equipo.png" className="w-full" draggable={false} />
    {formData.estadoEquipoPuntos.map((pt) => (
      <div
        key={pt.id}
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

  <textarea
    name="estadoEquipoDetalle"
    placeholder="Observaciones del estado del equipo"
    onChange={handleChange}
    className="w-full border rounded p-2 min-h-[80px]"
  />
</section>
