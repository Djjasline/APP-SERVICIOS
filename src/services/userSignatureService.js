import { supabase } from "@/lib/supabase";

const SIGNATURE_BUCKET = "registros";

export function getUserSignaturePath(userId) {
  return `firmas/${userId}.png`;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function uploadUserSignature(userId, file) {
  if (!userId) throw new Error("Usuario no autenticado.");
  if (!file || file.type !== "image/png") throw new Error("La firma debe ser un archivo PNG.");

  const path = getUserSignaturePath(userId);
  const { error } = await supabase.storage
    .from(SIGNATURE_BUCKET)
    .upload(path, file, {
      cacheControl: "60",
      contentType: "image/png",
      upsert: true,
    });

  if (error) throw error;
  return loadUserSignatureDataUrl(userId);
}

export async function loadUserSignatureDataUrl(userId) {
  if (!userId) return "";

  const { data, error } = await supabase.storage
    .from(SIGNATURE_BUCKET)
    .download(getUserSignaturePath(userId));

  if (error || !data) return "";
  return blobToDataUrl(data);
}
