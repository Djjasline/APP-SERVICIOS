import { ArrowLeft, ExternalLink, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

const marcas = [
  {
    nombre: "Elgin Sweepers",
    descripcion: "Barredoras viales, equipos de limpieza urbana y documentación de productos.",
    url: "https://www.elginsweeper.com.es/",
    dominio: "elginsweeper.com.es",
    color: "bg-blue-600",
    iniciales: "ES",
  },
  {
    nombre: "Vactor",
    descripcion: "Equipos hidrosuccionadores, sistemas combinados y soluciones de limpieza industrial.",
    url: "https://www.vactor.com/",
    dominio: "vactor.com",
    color: "bg-sky-700",
    iniciales: "V",
  },
  {
    nombre: "Piquersa",
    descripcion: "Maquinaria vial, barredoras compactas y equipos para servicios municipales.",
    url: "https://www.piquersa.es/",
    dominio: "piquersa.es",
    color: "bg-orange-600",
    iniciales: "P",
  },
  {
    nombre: "Vivax Metrotech",
    descripcion: "Cámaras, localizadores y accesorios para inspección técnica de redes.",
    url: "https://vivax-metrotech.com/vivax-product/vcam-wi-fi-adapter/",
    dominio: "vivax-metrotech.com",
    color: "bg-red-600",
    iniciales: "VM",
  },
  {
    nombre: "Sewer Robotics",
    descripcion: "Robótica, inspección y rehabilitación especializada de tuberías y alcantarillado.",
    url: "https://www.sewerrobotics.com/",
    dominio: "sewerrobotics.com",
    color: "bg-emerald-700",
    iniciales: "SR",
  },
];

export default function MarcasProductos() {
  const navigate = useNavigate();
  const { isLight } = useTheme();
  const [selectedMarca, setSelectedMarca] = useState(null);

  const openMarca = (marca) => {
    setSelectedMarca(marca);
    document.body.style.overflow = "hidden";
  };

  const closeMarca = () => {
    setSelectedMarca(null);
    document.body.style.overflow = "";
  };

  const openExternal = () => {
    if (!selectedMarca?.url) return;
    window.open(selectedMarca.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h2 className={`text-xl font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
            Marcas y productos
          </h2>
          <p className={`text-sm mt-1 ${isLight ? "text-slate-600" : "text-gray-300"}`}>
            Accesos rápidos a fabricantes, líneas de producto y documentación pública relacionada.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/repositorios")}
          className="bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition inline-flex items-center gap-2 w-fit"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {marcas.map((marca) => (
          <article key={marca.nombre} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between gap-5 hover:shadow-lg transition">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className={`relative w-12 h-12 rounded-xl ${marca.color} text-white flex items-center justify-center overflow-hidden font-bold`}>
                  <span>{marca.iniciales}</span>
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${marca.dominio}&sz=64`}
                    alt={`${marca.nombre} logo`}
                    className="absolute inset-0 m-auto w-8 h-8 object-contain rounded"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <span className="text-xs rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
                  Producto externo
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900">{marca.nombre}</h3>
                <p className="mt-1 text-sm text-slate-600">{marca.descripcion}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openMarca(marca)}
              className={`${marca.color} text-white rounded-lg py-2.5 px-4 text-sm font-semibold hover:opacity-90 transition inline-flex items-center justify-center gap-2`}
            >
              Ver acceso
              <ExternalLink size={15} />
            </button>
          </article>
        ))}
      </div>

      {selectedMarca && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/60" onClick={closeMarca} />

          <div className="relative z-10 w-[92%] max-w-xl overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {selectedMarca.nombre}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Producto externo
                </p>
              </div>

              <button
                type="button"
                onClick={closeMarca}
                aria-label="Cerrar"
                className="rounded p-2 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${selectedMarca.color} font-bold text-white`}>
                  {selectedMarca.iniciales}
                </div>
                <p className="text-sm leading-6 text-gray-600">
                  {selectedMarca.descripcion}
                </p>
              </div>

              <div className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm text-purple-800">
                Este sitio se abrirá en una pestaña segura del navegador porque pertenece a una plataforma externa.
              </div>

              <div className="flex flex-col justify-end gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeMarca}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={openExternal}
                  className={`${selectedMarca.color} inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition hover:opacity-90`}
                >
                  Abrir sitio
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
