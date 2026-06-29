import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { uploadRegistroImage } from "@/utils/storage";

function sanitizeFolder(value) {
  return String(value || "observacion").replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
}

export default function ObservationImageField({ value = [], onChange, recordId, folder, disabled = false }) {
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const images = Array.isArray(value) ? value.filter(Boolean) : [];

  const handleFiles = async (files) => {
    const selected = Array.from(files || []).filter((file) => {
      return file.type?.startsWith("image/") || /\.(heic|heif)$/i.test(file.name || "");
    });
    if (!selected.length || disabled) return;

    setUploading(true);
    try {
      const uploaded = [];
      for (const file of selected) {
        const isHeic = /\.(heic|heif)$/i.test(file.name || "") || /heic|heif/i.test(file.type || "");
        let fileToUpload = file;

        if (!isHeic) {
          fileToUpload = await imageCompression(file, {
            maxSizeMB: 0.35,
            maxWidthOrHeight: 1400,
            useWebWorker: true,
            initialQuality: 0.75,
          });
        }

        const url = await uploadRegistroImage(
          fileToUpload,
          recordId || "temp-observacion",
          sanitizeFolder(folder)
        );

        if (url) uploaded.push(url);
      }

      if (uploaded.length) onChange?.([...images, ...uploaded]);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    onChange?.(images.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap gap-2">
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => cameraRef.current?.click()}
          className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
        >
          📷 Cámara
        </button>
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => galleryRef.current?.click()}
          className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          🖼️ Galería
        </button>
        {uploading && <span className="text-[11px] text-slate-500">Subiendo...</span>}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="relative rounded border bg-white p-1">
              <img src={url} alt={`Evidencia observación ${index + 1}`} className="h-16 w-full rounded object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white"
                aria-label="Eliminar imagen de observación"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
