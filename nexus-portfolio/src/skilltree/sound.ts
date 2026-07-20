/**
 * Efeitos sonoros do SkillTree via Web Audio API — sem arquivos externos.
 * Tons mais "sci-fi" (sweeps, sinos digitais) que os do CodeLingo.
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
  return localStorage.getItem("skilltree.muted") === "1";
}
export function setMuted(m: boolean) {
  if (typeof window !== "undefined") localStorage.setItem("skilltree.muted", m ? "1" : "0");
}
export function getMuted(): boolean {
  return isMuted();
}
export function resumeAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume();
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.12, sweepTo?: number) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, c.currentTime + start + dur);
  g.gain.setValueAtTime(0, c.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.02);
}

export const sfx = {
  click() { if (!isMuted()) tone(500, 0, 0.05, "square", 0.04); },
  correct() { if (!isMuted()) { tone(660, 0, 0.1, "sine", 0.1); tone(990, 0.08, 0.16, "sine", 0.1); } },
  wrong() { if (!isMuted()) { tone(200, 0, 0.2, "sawtooth", 0.07, 120); } },
  hover() { if (!isMuted()) tone(700, 0, 0.03, "sine", 0.02); },
  xp() { if (!isMuted()) tone(880, 0, 0.12, "triangle", 0.08, 1200); },
  levelUp() { if (!isMuted()) [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.24, "triangle", 0.11)); },
  /** Som cinematográfico de desbloqueio: sweep ascendente + sino de portal. */
  unlock() {
    if (isMuted()) return;
    tone(140, 0, 0.6, "sawtooth", 0.05, 60); // grave ominoso
    tone(220, 0.1, 0.5, "sine", 0.08, 880); // sweep ascendente
    tone(1400, 0.55, 0.5, "triangle", 0.1); // brilho
    tone(1866, 0.62, 0.6, "sine", 0.08); // sino agudo
  },
  achievement() { if (!isMuted()) [784, 988, 1319, 1568, 1976].forEach((f, i) => tone(f, i * 0.08, 0.28, "triangle", 0.1)); },
  open() { if (!isMuted()) tone(440, 0, 0.15, "sine", 0.07, 880); },
  close() { if (!isMuted()) tone(880, 0, 0.12, "sine", 0.05, 440); },
};
