import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES DE INSPECCIÓN
============================= */
const secciones = [
  {
    id: "sec1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    items: [
      { codigo: "1.1", texto: "Prueba de encendido general del equipo" },
      { codigo: "1.2", texto: "Verificación de funcionamiento de controles principales" },
      { codigo: "1.3", texto: "Revisión de alarmas o mensajes de fallo" },
    ],
  },
  {
    id: "secA",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      { codigo: "A.1", texto: "Fugas de aceite hidráulico" },
      { codigo: "A.2", texto: "Nivel de aceite del soplador" },
      { codigo: "A.3", texto: "Nivel de aceite hidráulico" },
      { codigo: "A.4", texto: "Aceite caja de transferencia" },
      { codigo: "A.5", texto: "Manómetro filtro hidráulico" },
      { codigo: "A.6", texto: "Filtro hidráulico de retorno" },
      { codigo: "A.7", texto: "Filtros de succión tanque hidráulico" },
      { codigo: "A.8", texto: "Cilindros hidráulicos" },
      { codigo: "A.9", texto: "Tapones de drenaje" },
      { codigo: "A.10", texto: "Bancos hidráulicos" },
    ],
  },
  {
    id: "secB",
    titulo: "B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      { codigo: "B.1", texto: "Filtros malla 2\" y 3\"" },
      { codigo: "B.2", texto: "Empaques tapa filtros" },
      { codigo: "B.3", texto: "Fugas de agua (mangueras / acoples)" },
      { codigo: "B.4", texto: "Válvula alivio pistola" },
      { codigo: "B.5", texto: "Golpes / fugas tanque aluminio" },
      { codigo: "B.6", texto: "Medidor de nivel tanque" },
      { codigo: "B.7", texto: "Tapón expansión 2\"" },
      { codigo: "B.8", texto: "Drenaje bomba Rodder" },
      { codigo: "B.9", texto: "Válvulas check bomba" },
      { codigo: "B.10", texto: "Manómetros de presión" },
      { codigo: "B.11", texto: "Carrete de manguera" },
      { codigo: "B.12", texto: "Soporte del carrete" },
      { codigo: "B.13", texto: "Codo giratorio" },
      { codigo: "B.14", texto: "Sistema de trinquete" },
      { codigo: "B.15", texto: "Válvula alivio bomba" },
      { codigo: "B.16", texto: "Válvulas 1\"" },
      { codigo: "B.17", texto: "Válvulas 3/4\"" },
      { codigo: "B.18", texto: "Válvulas 1/2\"" },
      { codigo: "B.19", texto: "Boquillas" },
    ],
  },
  {
    id: "secC",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      { codigo: "C.1", texto: "Tablero frontal" },
      { codigo: "C.2", texto: "Tablero cabina" },
      { codigo: "C.3", texto: "Control remoto" },
      { codigo: "C.4", texto: "Electroválvulas" },
      { codigo: "C.5", texto: "Humedad en componentes" },
      { codigo: "C.6", texto: "Luces y accesorios" },
    ],
  },
  {
    id: "secD",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      { codigo: "D.1", texto: "Sellos tanque" },
      { codigo: "D.2", texto: "Interior tanque desechos" },
      { codigo: "D.3", texto: "Microfiltros succión" },
      { codigo: "D.4", texto: "Tapón drenaje filtro" },
      { codigo: "D.5", texto: "Mangueras succión" },
      { codigo: "D.6", texto: "Seguros compuerta" },
      { codigo: "D.7", texto: "Sistema desfogüe" },
      { codigo: "D.8", texto: "Válvulas alivio Kunkle" },
      { codigo: "D.9", texto: "Operación del soplador" },
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
    fechaInspeccion: "",
    ubicacion: "",
    cliente: "",
    contactoCliente: "",
    telefonoCliente: "",
    correoCliente: "",
    tecnicoResponsable: "",
    telefonoTecnico: "",
    correoTecnico: "",
    estadoEquipoDetalle: "",
    estadoEquipoPuntos: [],
    notaEquipo: "",
    marca: "",
    modelo: "",
    serie: "",
    anioModelo: "",
    vin: "",
    placa: "",
    horasModulo: "",
    horasChasis: "",
    kilometraje: "",
    items: {},
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleItemChange = (codigo, campo, valor) => {
    setFormData((p) => ({
      ...p,
      items: {
        ...p.items,
        [codigo]: {
          ...p.items[codigo],
          [campo]: valor,
        },
      },
    }));
  };

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: [
        ...p.estadoEquipoPuntos,
        { id: p.estadoEquipoPuntos.length + 1, x, y },
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const firmaTecnico = firmaTecnicoRef.current?.toDataURL();
    const firmaCliente = firmaClienteRef.current?.toDataURL();

    markInspectionCompleted("hidro", id, {
      ...formData,
      firmaTecnico,
      firmaCliente,
    });

    navigate("/inspeccion");
  };

  /* ======== JSX: NO SE TOCÓ NADA ======== */

  return (
    <>
      {/* TODO tu JSX EXACTAMENTE igual */}
    </>
  );
}
