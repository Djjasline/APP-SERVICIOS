// Queue dialogs so multiple selected photos can be reviewed one at a time.
let queue = Promise.resolve();

export function cropImageBeforeUpload(file) {
  const task = queue.then(() => showCropDialog(file));
  queue = task.catch(() => {});
  return task;
}

function showCropDialog(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const dialog = document.createElement("dialog");
    dialog.setAttribute("aria-label", "Editar fotografía antes de subirla");
    dialog.style.cssText = "position:fixed;z-index:2147483647;inset:0;margin:auto;width:min(94vw,620px);max-height:92vh;overflow:auto;padding:20px;border:1px solid #94a3b8;border-radius:12px;background:white;color:#111827;box-shadow:0 16px 48px #0006";
    dialog.innerHTML = `<h2 style="font-size:18px;font-weight:700;margin:0 0 8px">Preparar fotografía</h2>
      <p style="font-size:13px;margin:0 0 12px">Opcional: gira la imagen y ajusta los bordes antes de agregar puntos u observaciones.</p>
      <div style="position:relative;width:fit-content;max-width:100%;margin:auto;line-height:0;overflow:hidden">
        <img alt="Vista previa de la fotografía" style="display:block;max-width:100%;max-height:42vh;width:auto;height:auto">
        <div data-selection style="position:absolute;box-shadow:0 0 0 2000px #0009;border:2px solid white;pointer-events:none;box-sizing:border-box"></div>
      </div>
      <div style="display:flex;justify-content:center;gap:8px;margin-top:12px">
        <button type="button" data-rotate-left style="padding:8px 12px;border:1px solid #94a3b8;border-radius:6px;background:white;color:#111827">↶ Girar izquierda</button>
        <button type="button" data-rotate-right style="padding:8px 12px;border:1px solid #94a3b8;border-radius:6px;background:white;color:#111827">↷ Girar derecha</button>
      </div>
      <div data-controls style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;margin-top:16px"></div>
      <p data-error role="alert" style="color:#b91c1c;font-size:13px"></p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;margin-top:16px">
        <button type="button" data-cancel style="padding:8px 12px;border:1px solid #94a3b8;border-radius:6px;background:white;color:#111827">Cancelar carga</button>
        <button type="button" data-original style="padding:8px 12px;border:1px solid #94a3b8;border-radius:6px;background:white;color:#111827">Usar foto original</button>
        <button type="button" data-apply style="padding:8px 12px;border:0;border-radius:6px;background:#1d4ed8;color:white" disabled>Aplicar edición</button>
      </div>`;
    const image = dialog.querySelector("img");
    const selection = dialog.querySelector("[data-selection]");
    const controls = dialog.querySelector("[data-controls]");
    const values = { left: 0, right: 0, top: 0, bottom: 0 };
    const sourceImage = new Image();
    sourceImage.src = url;
    const applyButton = dialog.querySelector("[data-apply]");
    let rotation = 0;
    const refresh = () => {
      Object.assign(selection.style, { left: `${values.left}%`, right: `${values.right}%`, top: `${values.top}%`, bottom: `${values.bottom}%` });
    };
    for (const [key, label] of [["left", "Izquierda"], ["right", "Derecha"], ["top", "Arriba"], ["bottom", "Abajo"]]) {
      const wrapper = document.createElement("label");
      wrapper.style.cssText = "display:flex;flex-direction:column;font-size:13px;gap:4px;color:#111827";
      wrapper.textContent = label;
      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = "95";
      slider.value = "0";
      slider.setAttribute("aria-label", `Recortar por ${label.toLowerCase()}`);
      slider.addEventListener("input", () => {
        const opposite = { left: "right", right: "left", top: "bottom", bottom: "top" }[key];
        values[key] = Math.min(Number(slider.value), 95 - values[opposite]);
        slider.value = String(values[key]);
        refresh();
      });
      wrapper.append(slider);
      controls.append(wrapper);
    }
    image.onload = () => { applyButton.disabled = false; };
    image.onerror = () => { dialog.querySelector("[data-error]").textContent = "No se pudo mostrar la imagen. Puedes usar la foto original."; };
    image.src = url;
    refresh();
    const rotate = (direction) => {
      if (!sourceImage.naturalWidth || !sourceImage.naturalHeight) {
        dialog.querySelector("[data-error]").textContent = "La imagen aún no está lista.";
        return;
      }
      rotation = (rotation + direction + 360) % 360;
      const canvas = document.createElement("canvas");
      const sideways = rotation === 90 || rotation === 270;
      canvas.width = sideways ? sourceImage.naturalHeight : sourceImage.naturalWidth;
      canvas.height = sideways ? sourceImage.naturalWidth : sourceImage.naturalHeight;
      const context = canvas.getContext("2d");
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(rotation * Math.PI / 180);
      context.drawImage(sourceImage, -sourceImage.naturalWidth / 2, -sourceImage.naturalHeight / 2);
      Object.keys(values).forEach((key) => { values[key] = 0; });
      controls.querySelectorAll("input").forEach((slider) => { slider.value = "0"; });
      refresh();
      applyButton.disabled = true;
      dialog.querySelector("[data-error]").textContent = "";
      image.src = canvas.toDataURL("image/png");
    };
    dialog.querySelector("[data-rotate-left]").onclick = () => rotate(-90);
    dialog.querySelector("[data-rotate-right]").onclick = () => rotate(90);
    let finished = false;
    const finish = (result) => {
      if (finished) return;
      finished = true;
      dialog.close(); dialog.remove(); URL.revokeObjectURL(url); resolve(result);
    };
    dialog.querySelector("[data-cancel]").onclick = () => finish(null);
    dialog.querySelector("[data-original]").onclick = () => finish(file);
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); finish(null); });
    dialog.querySelector("[data-apply]").onclick = () => {
      try {
        if (!image.naturalWidth || !image.naturalHeight) throw new Error("La imagen aún no está lista.");
        const x = Math.round(image.naturalWidth * values.left / 100);
        const y = Math.round(image.naturalHeight * values.top / 100);
        const width = Math.max(1, Math.round(image.naturalWidth * (100 - values.left - values.right) / 100));
        const height = Math.max(1, Math.round(image.naturalHeight * (100 - values.top - values.bottom) / 100));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(image, x, y, width, height, 0, 0, width, height);
        applyButton.disabled = true;
        canvas.toBlob((blob) => {
          if (finished) return;
          if (!blob) { applyButton.disabled = false; dialog.querySelector("[data-error]").textContent = "No se pudo recortar la imagen. Inténtalo de nuevo."; return; }
          finish(new File([blob], "imagen-recortada.jpg", { type: "image/jpeg" }));
        }, "image/jpeg", 0.92);
      } catch (error) {
        dialog.querySelector("[data-error]").textContent = error.message || "No se pudo recortar la imagen.";
      }
    };
    document.body.append(dialog);
    dialog.showModal();
  });
}
