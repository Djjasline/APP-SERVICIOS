<li
  key={item.id}
  className="border rounded px-3 py-2 flex justify-between items-center"
>
  {/* INFO */}
  <div>
    <p className="font-medium">
      {item.data?.cliente || "Sin cliente"}
    </p>

    <p className="text-xs text-slate-500">
      {new Date(item.fecha || item.createdAt).toLocaleString()}
    </p>

    <p className="text-xs">
      Estado:{" "}
      <strong className={
        item.estado === "completada"
          ? "text-green-600"
          : "text-yellow-600"
      }>
        {item.estado}
      </strong>
    </p>
  </div>

  {/* ACCIONES */}
  <div className="flex items-center gap-3 text-sm">
    <button
      onClick={() =>
        navigate(`/inspeccion/${type}/${item.id}`)
      }
      className="text-blue-600 hover:underline"
    >
      Abrir
    </button>

    {item.estado === "completada" && (
      <button
        onClick={() =>
          navigate(`/inspeccion/${type}/${item.id}/pdf`)
        }
        className="text-green-600 hover:underline"
      >
        PDF
      </button>
    )}

    <button
      onClick={() => {
        const all = getAllInspections();
        const next = all.filter(
          (i) => !(i.id === item.id && i.type === type)
        );
        localStorage.setItem("inspections", JSON.stringify(next));
        window.location.reload();
      }}
      className="text-red-600 hover:underline"
    >
      Eliminar
    </button>
  </div>
</li>
