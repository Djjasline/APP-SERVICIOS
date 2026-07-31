let notificationAudioContext = null;
let notificationBeepUrl = null;

function getNotificationBeepUrl() {
  if (notificationBeepUrl) return notificationBeepUrl;

  const sampleRate = 44100;
  const durationSeconds = 0.62;
  const totalSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = totalSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, value) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  for (let sample = 0; sample < totalSamples; sample += 1) {
    const time = sample / sampleRate;
    const frequency = time < 0.2 ? 1046 : time < 0.4 ? 784 : 1175;
    const envelope = Math.min(1, time / 0.03) * Math.max(0, 1 - time / durationSeconds);
    const value = Math.sin(2 * Math.PI * frequency * time) * envelope * 0.55;
    view.setInt16(44 + sample * 2, Math.max(-1, Math.min(1, value)) * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  notificationBeepUrl = `data:audio/wav;base64,${btoa(binary)}`;
  return notificationBeepUrl;
}

function getNotificationAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;

  if (!notificationAudioContext) {
    notificationAudioContext = new AudioContext();
  }

  return notificationAudioContext;
}

export async function unlockNotificationSound() {
  try {
    const audioContext = getNotificationAudioContext();
    if (!audioContext) return false;
    if (audioContext?.state === "suspended") await audioContext.resume();
    return audioContext.state === "running";
  } catch (error) {
    console.warn("No se pudo habilitar sonido de notificación:", error);
    return false;
  }
}

async function playAudioElementSound() {
  const audio = new Audio(getNotificationBeepUrl());
  audio.volume = 1;
  await audio.play();
  return true;
}

async function playAudioContextSound() {
  try {
    const audioContext = getNotificationAudioContext();
    if (!audioContext) return false;
    if (audioContext.state === "suspended") await audioContext.resume();

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(1046, now);
    oscillator.frequency.setValueAtTime(784, now + 0.14);
    oscillator.frequency.setValueAtTime(1175, now + 0.28);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.45, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.68);

    return true;
  } catch (error) {
    console.warn("No se pudo reproducir sonido de notificación:", error);
    return false;
  }
}

export async function playNotificationSound() {
  const playedWithAudioContext = await playAudioContextSound();
  if (playedWithAudioContext) return true;

  try {
    return await playAudioElementSound();
  } catch (error) {
    console.warn("No se pudo reproducir audio HTML de notificación:", error);
  }

  return false;
}
