type AudioCtx = AudioContext;

let ctx: AudioCtx | null = null;

function getCtx(): AudioCtx | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

function tone(
  c: AudioCtx,
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.2,
) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(c.destination);

  const t = c.currentTime + startOffset;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.start(t);
  osc.stop(t + duration + 0.02);
}

export function playCorrect() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  // Cheerful two-note chime: C5 → G5
  tone(c, 523.25, 0, 0.18, "sine", 0.25);
  tone(c, 783.99, 0.09, 0.28, "sine", 0.22);
}

export function playWrong() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  // Short descending buzz: A3 → D3
  tone(c, 220, 0, 0.14, "sawtooth", 0.18);
  tone(c, 146.83, 0.08, 0.22, "sawtooth", 0.18);
}

export function playLoss() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  // Sad descending phrase: G4 → Eb4 → C4 → G3
  tone(c, 392.0, 0.0, 0.32, "sine", 0.22);
  tone(c, 311.13, 0.22, 0.32, "sine", 0.22);
  tone(c, 261.63, 0.44, 0.4, "sine", 0.22);
  tone(c, 196.0, 0.74, 0.6, "triangle", 0.2);
}

export function playCelebration() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  // Major arpeggio fanfare: C5 → E5 → G5 → C6 → G5 → C6
  tone(c, 523.25, 0.0, 0.18, "triangle", 0.22);
  tone(c, 659.25, 0.12, 0.18, "triangle", 0.22);
  tone(c, 783.99, 0.24, 0.2, "triangle", 0.22);
  tone(c, 1046.5, 0.36, 0.35, "triangle", 0.24);
  tone(c, 783.99, 0.5, 0.2, "sine", 0.18);
  tone(c, 1046.5, 0.62, 0.5, "sine", 0.22);
}
