import NuevoInforme from "@/app/agua/informe/NuevoInforme";

export default function PetroleoNuevoInforme({ tipo = null }) {
  return (
    <NuevoInforme
      tipo={tipo}
      area="petroleo"
      basePath="/petroleo/informe"
    />
  );
}
