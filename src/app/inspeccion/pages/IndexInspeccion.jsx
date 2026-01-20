<li
  key={item.id}
  className="flex justify-between items-center border rounded px-2 py-2"
>
  {/* INFO */}
  <div className="flex flex-col">
    <span className="font-medium truncate">
      {item.data?.cliente || "Sin cliente"}
    </span>

    <span className="text-xs text-slate-500">
      {new Date(item.fecha || item.createdAt).toLocaleString()}
    </span>
  </div>

  {/* ACCIONES */}
  <div className="flex items-center gap-2">
    <StatusBadge estado={item.estado} />

    {/* PDF – SOLO COMPLETADA */}
    {item.estado === "completada" && (
      <button
        onClick={() =>
          navigate(`/inspeccion/${type}/${item.id}/pdf`)
        }
        className="text-xs text-green-600 hover:underline"
      >
        PDF
      </button>
    )}

    {/* ABRIR */}
    <button
      onClick={() =>
        navigate(`/inspeccion/${type}/${item.id}`)
      }
      className="text-xs text-blue-600 hover:underline"
    >
      Abrir
    </button>

    {/* ELIMINAR */}
    <button
      onClick={() => {
        const all = getAllInspections();
        const next = all.filter(
          (i) => !(i.id === item.id && i.type === type)
        );
        localStorage.setItem("inspections", JSON.stringify(next));
        window.location.reload();
      }}
      className="text-xs text-red-600 hover:underline"
    >
      Eliminar
    </button>
  </div>
</li>
