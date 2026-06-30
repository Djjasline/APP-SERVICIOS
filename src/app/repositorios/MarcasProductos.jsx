import { ArrowLeft, ExternalLink } from "lucide-react";
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
              onClick={() => window.open(marca.url, "_blank", "noopener,noreferrer")}
              className={`${marca.color} text-white rounded-lg py-2.5 px-4 text-sm font-semibold hover:opacity-90 transition inline-flex items-center justify-center gap-2`}
            >
              Abrir sitio
              <ExternalLink size={15} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
