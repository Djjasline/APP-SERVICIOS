import InformeHome from "@/app/agua/informe/InformeHome";

export default function PetroleoInformeHome({ tipo = null }) {
  return (
    <InformeHome
      tipo={tipo}
      area="petroleo"
      areaLabel="Petróleo"
      basePath="/petroleo/informe"
      areaPath="/area/petroleo"
    />
  );
}
