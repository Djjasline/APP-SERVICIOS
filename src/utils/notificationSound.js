let notificationAudioContext = null;

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
    if (audioContext.state === "suspended") await audioContext.resume();
    return true;
  } catch (error) {
    console.warn("No se pudo habilitar sonido de notificación:", error);
    return false;
  }
}

export async function playNotificationSound() {
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
