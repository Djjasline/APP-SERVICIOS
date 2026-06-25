import InformePDF from "@/app/agua/informe/InformePDF";

export default function PetroleoInformePDF({ allowDownload = true }) {
  return (
    <InformePDF
      area="petroleo"
      basePath="/petroleo/informe"
      allowDownload={allowDownload}
    />
  );
}
