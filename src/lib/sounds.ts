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

// Lightweight pitched glide — kept for non-vocal effects (chirp, etc.).
function voiceGlide(
  c: AudioCtx,
  startFreq: number,
  endFreq: number,
  startOffset: number,
  duration: number,
  options: {
    vibratoRate?: number;
    vibratoDepth?: number;
    volume?: number;
    type?: OscillatorType;
    attack?: number;
    release?: number;
    harmonicMix?: number;
  } = {},
) {
  const {
    vibratoRate = 6,
    vibratoDepth = 14,
    volume = 0.22,
    type = "triangle",
    attack = 0.04,
    release = 0.12,
    harmonicMix = 0.35,
  } = options;

  const t = c.currentTime + startOffset;
  const endT = t + duration;

  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, t);
  osc.frequency.linearRampToValueAtTime(endFreq, endT);

  const lfo = c.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = vibratoRate;
  const lfoGain = c.createGain();
  lfoGain.gain.value = vibratoDepth;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  const harm = c.createOscillator();
  harm.type = "sine";
  harm.frequency.setValueAtTime(startFreq * 2, t);
  harm.frequency.linearRampToValueAtTime(endFreq * 2, endT);
  lfoGain.connect(harm.frequency);

  const oscGain = c.createGain();
  const harmGain = c.createGain();

  oscGain.gain.setValueAtTime(0.0001, t);
  oscGain.gain.exponentialRampToValueAtTime(volume, t + attack);
  oscGain.gain.setValueAtTime(volume, endT - release);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, endT);

  harmGain.gain.setValueAtTime(0.0001, t);
  harmGain.gain.exponentialRampToValueAtTime(volume * harmonicMix, t + attack);
  harmGain.gain.setValueAtTime(volume * harmonicMix, endT - release);
  harmGain.gain.exponentialRampToValueAtTime(0.0001, endT);

  osc.connect(oscGain).connect(c.destination);
  harm.connect(harmGain).connect(c.destination);

  osc.start(t);
  harm.start(t);
  lfo.start(t);
  osc.stop(endT + 0.05);
  harm.stop(endT + 0.05);
  lfo.stop(endT + 0.05);
}

// --- Formant-based vocal synthesis ---------------------------------------
// Sawtooth glottal source -> parallel bandpass formant filters -> vocal vowel.
// This is what makes the result actually sound voice-like instead of a kazoo.

type PitchPoint = [time01: number, hz: number];

type FormantSnapshot = {
  formants: ReadonlyArray<{ readonly f: number; readonly q: number; readonly gain: number }>;
};

type FormantTrack = {
  start: FormantSnapshot;
  end: FormantSnapshot;
};

function syllable(
  c: AudioCtx,
  opts: {
    startOffset: number;
    duration: number;
    pitch: PitchPoint[];
    formants: FormantTrack;
    volume?: number;
    vibratoRate?: number;
    vibratoDepth?: number;
    breath?: number;
    attack?: number;
    release?: number;
  },
) {
  const {
    startOffset,
    duration,
    pitch,
    formants,
    volume = 0.5,
    vibratoRate = 6,
    vibratoDepth = 12,
    breath = 0.06,
    attack = 0.035,
    release = 0.12,
  } = opts;

  const t = c.currentTime + startOffset;
  const endT = t + duration;

  // Glottal source: sawtooth has rich harmonics for formant filters to sculpt.
  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(pitch[0]?.[1] ?? 300, t);
  for (const [frac, hz] of pitch) {
    osc.frequency.linearRampToValueAtTime(hz, t + frac * duration);
  }

  const lfo = c.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = vibratoRate;
  const lfoGain = c.createGain();
  lfoGain.gain.value = vibratoDepth;
  lfo.connect(lfoGain).connect(osc.frequency);

  const master = c.createGain();
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(volume, t + attack);
  master.gain.setValueAtTime(volume, Math.max(t + attack + 0.01, endT - release));
  master.gain.exponentialRampToValueAtTime(0.0001, endT);
  master.connect(c.destination);

  // Vocal tract roll-off
  const lpf = c.createBiquadFilter();
  lpf.type = "lowpass";
  lpf.frequency.value = 4200;
  lpf.Q.value = 0.5;
  lpf.connect(master);

  const startF = formants.start.formants;
  const endF = formants.end.formants;
  const formantCount = Math.min(startF.length, endF.length);

  for (let i = 0; i < formantCount; i++) {
    const a = startF[i];
    const b = endF[i];
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(a.f, t);
    bp.frequency.linearRampToValueAtTime(b.f, endT);
    bp.Q.setValueAtTime(a.q, t);
    bp.Q.linearRampToValueAtTime(b.q, endT);

    const fg = c.createGain();
    fg.gain.setValueAtTime(a.gain, t);
    fg.gain.linearRampToValueAtTime(b.gain, endT);

    osc.connect(bp).connect(fg).connect(lpf);
  }

  // Brief breath noise onset for vocal realism.
  if (breath > 0) {
    const noiseDur = 0.05;
    const buf = c.createBuffer(1, Math.ceil(c.sampleRate * noiseDur), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.7;
    const noise = c.createBufferSource();
    noise.buffer = buf;
    const hpf = c.createBiquadFilter();
    hpf.type = "highpass";
    hpf.frequency.value = 2000;
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(breath, t + 0.01);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + noiseDur);
    noise.connect(hpf).connect(ng).connect(master);
    noise.start(t);
    noise.stop(t + noiseDur + 0.02);
  }

  osc.start(t);
  lfo.start(t);
  osc.stop(endT + 0.05);
  lfo.stop(endT + 0.05);
}

// Child-voice vowel formants (higher F1/F2 than adult averages).
const VOWEL = {
  AE: {
    formants: [
      { f: 800, q: 8, gain: 1.0 },
      { f: 1900, q: 10, gain: 0.85 },
      { f: 2900, q: 12, gain: 0.4 },
    ],
  },
  EE: {
    formants: [
      { f: 380, q: 9, gain: 0.9 },
      { f: 2700, q: 11, gain: 1.0 },
      { f: 3200, q: 12, gain: 0.4 },
    ],
  },
  OH: {
    formants: [
      { f: 520, q: 8, gain: 1.0 },
      { f: 900, q: 9, gain: 0.7 },
      { f: 2600, q: 11, gain: 0.3 },
    ],
  },
  UH: {
    formants: [
      { f: 480, q: 8, gain: 0.95 },
      { f: 1300, q: 9, gain: 0.55 },
      { f: 2500, q: 11, gain: 0.3 },
    ],
  },
} as const;

// --- Sampled audio playback ---------------------------------------------
// Real CC0 children "yeeeh" cheer and "aww" disappointed samples from
// mixkit.co (free SFX license). Files live in public/sounds/ and are
// played via HTMLAudioElement. If the file fails to load, we fall back
// to the synthesized vowel below — so the UX never goes silent.

const SAMPLE_URLS = {
  correct: "/sounds/kids-yay.mp3",
  wrong: "/sounds/kids-aww.mp3",
} as const;

const samples: Record<keyof typeof SAMPLE_URLS, HTMLAudioElement | null> = {
  correct: null,
  wrong: null,
};

function getSample(key: keyof typeof SAMPLE_URLS): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  if (samples[key]) return samples[key];
  try {
    const a = new Audio(SAMPLE_URLS[key]);
    a.preload = "auto";
    a.volume = 0.85;
    samples[key] = a;
    return a;
  } catch {
    return null;
  }
}

function playSample(key: keyof typeof SAMPLE_URLS): boolean {
  const a = getSample(key);
  if (!a) return false;
  try {
    // Clone the node so rapid clicks can overlap without cutting each other off.
    const node = a.cloneNode(true) as HTMLAudioElement;
    node.volume = a.volume;
    const p = node.play();
    if (p && typeof p.then === "function") {
      p.catch(() => {
        // autoplay blocked or load failure — silent; synth fallback already ran
      });
    }
    return true;
  } catch {
    return false;
  }
}

// --- Public sound effects ------------------------------------------------

export function playCorrect() {
  if (playSample("correct")) return;

  // Fallback synth — child "yay!" /æ/ → /i/.
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  syllable(c, {
    startOffset: 0,
    duration: 0.45,
    pitch: [
      [0.0, 380],
      [0.18, 620],
      [0.45, 780],
      [0.75, 720],
      [1.0, 540],
    ],
    formants: { start: VOWEL.AE, end: VOWEL.EE },
    volume: 0.55,
    vibratoRate: 7,
    vibratoDepth: 22,
    breath: 0.08,
    attack: 0.025,
    release: 0.18,
  });
  tone(c, 1318.5, 0.22, 0.18, "sine", 0.08);
  tone(c, 1760.0, 0.32, 0.22, "sine", 0.06);
}

export function playWrong() {
  if (playSample("wrong")) return;

  // Fallback synth — child "oh-oh".
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  syllable(c, {
    startOffset: 0,
    duration: 0.28,
    pitch: [
      [0.0, 420],
      [1.0, 300],
    ],
    formants: { start: VOWEL.OH, end: VOWEL.OH },
    volume: 0.48,
    vibratoRate: 5,
    vibratoDepth: 8,
    breath: 0.07,
    attack: 0.03,
    release: 0.12,
  });
  syllable(c, {
    startOffset: 0.34,
    duration: 0.42,
    pitch: [
      [0.0, 380],
      [0.5, 290],
      [1.0, 220],
    ],
    formants: { start: VOWEL.OH, end: VOWEL.UH },
    volume: 0.5,
    vibratoRate: 4.5,
    vibratoDepth: 10,
    breath: 0.06,
    attack: 0.04,
    release: 0.2,
  });
}

export function playLoss() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();

  // Long disappointed "awwww" — drawn-out falling /æ/ → /ə/.
  syllable(c, {
    startOffset: 0,
    duration: 1.1,
    pitch: [
      [0.0, 460],
      [0.25, 420],
      [0.6, 320],
      [1.0, 200],
    ],
    formants: { start: VOWEL.AE, end: VOWEL.UH },
    volume: 0.5,
    vibratoRate: 4.5,
    vibratoDepth: 14,
    breath: 0.05,
    attack: 0.05,
    release: 0.4,
  });
}

// Quick airy whoosh for a paper plane / fly-by (kept for sky scenery).
export function playWhoosh() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  const t = c.currentTime;

  const noise = c.createBufferSource();
  const buf = c.createBuffer(1, c.sampleRate * 0.35, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
  noise.buffer = buf;

  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(1800, t);
  bp.frequency.exponentialRampToValueAtTime(400, t + 0.3);

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.22, t + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

  noise.connect(bp).connect(gain).connect(c.destination);
  noise.start(t);
  noise.stop(t + 0.36);
}

// Cheerful two-syllable bird chirp.
export function playChirp() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  voiceGlide(c, 1200, 1800, 0, 0.12, {
    vibratoRate: 12,
    vibratoDepth: 30,
    volume: 0.18,
    type: "sine",
    attack: 0.01,
    release: 0.04,
    harmonicMix: 0.15,
  });
  voiceGlide(c, 1600, 2200, 0.16, 0.14, {
    vibratoRate: 14,
    vibratoDepth: 30,
    volume: 0.16,
    type: "sine",
    attack: 0.01,
    release: 0.05,
    harmonicMix: 0.15,
  });
}

export function playCelebration() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  // Arpeggio fanfare layered with a child "yay" for celebration!
  tone(c, 523.25, 0.0, 0.18, "triangle", 0.22);
  tone(c, 659.25, 0.12, 0.18, "triangle", 0.22);
  tone(c, 783.99, 0.24, 0.2, "triangle", 0.22);
  tone(c, 1046.5, 0.36, 0.35, "triangle", 0.24);

  syllable(c, {
    startOffset: 0.18,
    duration: 0.55,
    pitch: [
      [0.0, 420],
      [0.25, 680],
      [0.55, 820],
      [1.0, 600],
    ],
    formants: { start: VOWEL.AE, end: VOWEL.EE },
    volume: 0.45,
    vibratoRate: 7,
    vibratoDepth: 22,
    breath: 0.08,
    attack: 0.025,
    release: 0.2,
  });
}
