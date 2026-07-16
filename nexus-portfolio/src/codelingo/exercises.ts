/**
 * Gerador de exercícios do CodeLingo.
 * Produz exercícios variados (múltipla escolha, codificar, decodificar) com
 * dificuldade crescente a partir do motor de códigos. Determinístico por seed
 * para permitir sessões reproduzíveis quando necessário.
 */

import { CodeModule, getCode } from "./codes";

export type ExerciseKind = "theory" | "multiple" | "encode" | "decode" | "audio";

export interface Exercise {
  id: string;
  kind: ExerciseKind;
  prompt: string;
  /** Texto de referência mostrado (ex.: a palavra a codificar). */
  subject?: string;
  /** Resposta esperada normalizada. */
  answer: string;
  /** Alternativas para múltipla escolha. */
  options?: string[];
  explain?: string;
  /** Para exercícios de áudio (Morse), a string a tocar. */
  audio?: string;
  hint?: string;
}

const WORDS = [
  "SOL", "LUA", "CODE", "REDE", "CHAVE", "BYTE", "PIXEL", "NEXUS", "CIFRA",
  "SINAL", "DADO", "LOGIN", "SENHA", "TROCA", "AGENTE", "ROTA", "NODO",
];
const SHORT = ["OI", "SIM", "NAO", "OK", "SOS", "AR", "PC", "TV"];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// PRNG simples (mulberry32) para variação estável dentro de uma sessão.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

/** Saída digitável em teclado comum (evita pedir para digitar Braille etc.). */
function isTypeable(s: string): boolean {
  return /^[A-Za-z0-9 .\-/+=]*$/.test(s);
}

function shuffle<T>(arr: T[], r: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Gera opções plausíveis para múltipla escolha a partir de variações do alvo. */
function decoyOptions(correct: string, code: CodeModule, r: () => number): string[] {
  const set = new Set<string>([correct]);
  let guard = 0;
  while (set.size < 4 && guard++ < 40) {
    const w = pick(WORDS.concat(SHORT), r);
    const enc = code.encode ? code.encode(w) : w;
    if (enc && enc !== correct) set.add(enc);
  }
  // fallback: pequenas mutações
  while (set.size < 4) set.add(correct + " ·".repeat(set.size));
  return shuffle([...set], r);
}

/**
 * Constrói uma sessão de lição: 1 card de teoria + N exercícios com
 * dificuldade crescente + 1 pergunta do quiz final.
 */
export function buildSession(codeId: string, seedInput = 1): Exercise[] {
  const code = getCode(codeId);
  if (!code) return [];
  const r = rng(seedInput * 2654435761 + codeId.length * 40503);
  const out: Exercise[] = [];

  // 1) Teoria de abertura
  out.push({
    id: `${codeId}-theory`,
    kind: "theory",
    prompt: code.content.summary,
    subject: code.content.howItWorks,
    answer: "ok",
    explain: code.alphabetHint,
  });

  // 2) Múltipla escolha inicial (do quiz, mais fácil)
  const q0 = code.quiz[0];
  out.push({
    id: `${codeId}-q0`,
    kind: "multiple",
    prompt: q0.prompt,
    answer: q0.options[q0.answer],
    options: shuffle(q0.options, r),
    explain: q0.explain,
  });

  if (code.encodable && code.encode && code.decode) {
    // 3) Codificar palavra curta (fácil)
    const easy = pick(SHORT, r);
    const easyEnc = code.encode(easy);
    out.push(
      isTypeable(easyEnc)
        ? {
            id: `${codeId}-enc1`,
            kind: "encode",
            prompt: `Codifique em ${code.name}:`,
            subject: easy,
            answer: easyEnc,
            explain: `${easy} → ${easyEnc}`,
            hint: code.alphabetHint,
          }
        : {
            id: `${codeId}-enc1`,
            kind: "multiple",
            prompt: `Como se escreve "${easy}" em ${code.name}?`,
            answer: easyEnc,
            options: decoyOptions(easyEnc, code, r),
            explain: `${easy} → ${easyEnc}`,
          },
    );

    // 4) Decodificar (fácil→médio) como múltipla escolha
    const midWord = pick(WORDS, r);
    const encoded = code.encode(midWord);
    out.push({
      id: `${codeId}-dec1`,
      kind: "multiple",
      prompt: `O que está escrito em ${code.name}?`,
      subject: encoded,
      answer: midWord,
      options: shuffle(
        Array.from(new Set([midWord, pick(WORDS, r), pick(WORDS, r), pick(WORDS, r)])).slice(0, 4).length >= 4
          ? Array.from(new Set([midWord, pick(WORDS, r), pick(WORDS, r), pick(WORDS, r)])).slice(0, 4)
          : [midWord, ...shuffle(WORDS, r).filter((w) => w !== midWord).slice(0, 3)],
        r,
      ),
      explain: `${encoded} → ${midWord}`,
    });

    // 5) Codificar palavra média (escrever a resposta)
    const hardWord = pick(WORDS, r);
    const hardEnc = code.encode(hardWord);
    out.push(
      isTypeable(hardEnc)
        ? {
            id: `${codeId}-enc2`,
            kind: "encode",
            prompt: `Codifique em ${code.name}:`,
            subject: hardWord,
            answer: hardEnc,
            explain: `${hardWord} → ${hardEnc}`,
            hint: code.alphabetHint,
          }
        : {
            id: `${codeId}-enc2`,
            kind: "multiple",
            prompt: `Qual é "${hardWord}" em ${code.name}?`,
            answer: hardEnc,
            options: decoyOptions(hardEnc, code, r),
            explain: `${hardWord} → ${hardEnc}`,
          },
    );

    // 6) Decodificar escrevendo o texto (mais difícil)
    const decWord = pick(WORDS, r);
    out.push({
      id: `${codeId}-dec2`,
      kind: "decode",
      prompt: `Decodifique de ${code.name} para texto:`,
      subject: code.encode(decWord),
      answer: decWord,
      explain: `${code.encode(decWord)} → ${decWord}`,
      hint: code.alphabetHint,
    });

    // 7) Exercício de áudio para Morse
    if (codeId === "morse") {
      const aud = pick(SHORT, r);
      out.push({
        id: `${codeId}-audio`,
        kind: "audio",
        prompt: "Ouça o Morse e escreva o texto:",
        audio: code.encode(aud),
        answer: aud,
        explain: `${code.encode(aud)} → ${aud}`,
      });
    }
  } else {
    // Códigos conceituais: mais perguntas de múltipla escolha
    code.quiz.slice(1).forEach((q, i) => {
      out.push({
        id: `${codeId}-cq${i}`,
        kind: "multiple",
        prompt: q.prompt,
        answer: q.options[q.answer],
        options: shuffle(q.options, r),
        explain: q.explain,
      });
    });
  }

  // Última: pergunta final do quiz (revisão)
  const qf = code.quiz[code.quiz.length - 1];
  out.push({
    id: `${codeId}-qf`,
    kind: "multiple",
    prompt: qf.prompt,
    answer: qf.options[qf.answer],
    options: shuffle(qf.options, r),
    explain: qf.explain,
  });

  return out;
}

/** Normaliza respostas para comparação tolerante (espaços, caixa). */
export function normalize(s: string): string {
  return s.trim().toUpperCase().replace(/\s+/g, " ");
}

export function checkAnswer(ex: Exercise, given: string): boolean {
  if (ex.kind === "theory") return true;
  return normalize(given) === normalize(ex.answer);
}

/** Gera uma rodada de exercícios de revisão a partir de vários códigos. */
export function buildReview(codeIds: string[], seed = 7): Exercise[] {
  const r = rng(seed * 99991);
  const chosen = shuffle(codeIds, r).slice(0, 5);
  return chosen
    .map((id, i) => {
      const s = buildSession(id, seed + i).filter((e) => e.kind !== "theory");
      return s[Math.floor(r() * s.length)];
    })
    .filter(Boolean);
}
