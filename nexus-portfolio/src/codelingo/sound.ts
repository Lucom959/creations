/**
 * Efeitos sonoros gerados via Web Audio API — sem arquivos externos.
 * Inclui um tocador de Morse real. Respeita a preferência de mudo salva.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("codelingo.muted") === "1";
}

export function setMuted(m: boolean) {
  if (typeof window !== "undefined") localStorage.setItem("codelingo.muted", m ? "1" : "0");
}

export function getMuted(): boolean {
  return isMuted();
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.15) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.02);
}

export const sfx = {
  correct() {
    if (isMuted()) return;
    tone(660, 0, 0.12, "sine", 0.12);
    tone(880, 0.09, 0.16, "sine", 0.12);
  },
  wrong() {
    if (isMuted()) return;
    tone(220, 0, 0.18, "sawtooth", 0.08);
    tone(160, 0.08, 0.22, "sawtooth", 0.08);
  },
  levelUp() {
    if (isMuted()) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.22, "triangle", 0.12));
  },
  complete() {
    if (isMuted()) return;
    [659, 784, 988, 1319].forEach((f, i) => tone(f, i * 0.08, 0.25, "sine", 0.11));
  },
  achievement() {
    if (isMuted()) return;
    [784, 988, 1319, 1568].forEach((f, i) => tone(f, i * 0.09, 0.3, "triangle", 0.12));
  },
  chest() {
    if (isMuted()) return;
    tone(392, 0, 0.2, "sine", 0.1);
    tone(523, 0.12, 0.2, "sine", 0.1);
    tone(784, 0.26, 0.4, "triangle", 0.12);
  },
  click() {
    if (isMuted()) return;
    tone(440, 0, 0.05, "square", 0.05);
  },
};

/** Toca uma string de Morse (· e −) como bipes reais. */
export function playMorse(morse: string, wpm = 12): Promise<void> {
  return new Promise((resolve) => {
    if (isMuted()) {
      resolve();
      return;
    }
    const c = getCtx();
    if (!c) {
      resolve();
      return;
    }
    const unit = 1.2 / wpm; // segundos por unidade
    let t = 0;
    const freq = 600;
    for (const ch of morse) {
      if (ch === ".") {
        tone(freq, t, unit, "sine", 0.16);
        t += unit * 2;
      } else if (ch === "-") {
        tone(freq, t, unit * 3, "sine", 0.16);
        t += unit * 4;
      } else if (ch === " ") {
        t += unit * 2;
      } else if (ch === "/") {
        t += unit * 4;
      }
    }
    setTimeout(resolve, (t + 0.1) * 1000);
  });
}

/** Retoma o contexto de áudio após um gesto do usuário (política do navegador). */
export function resumeAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume();
}
