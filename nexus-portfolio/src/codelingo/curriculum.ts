/**
 * Currículo do CodeLingo.
 * Cada CÓDIGO é um curso independente. Um curso tem uma sequência fixa de
 * lições que ensinam do zero antes de qualquer exercício:
 *
 *   Aprender (teoria passo a passo + exemplos) → Exercícios guiados →
 *   Exercícios livres → Revisão → Quiz final
 *
 * Este módulo constrói o conteúdo de cada lição a partir do motor de códigos.
 */

import { CodeModule, getCode } from "./codes";
import { Exercise, normalize } from "./exercises";

export type LessonType = "intro" | "guided" | "free" | "review" | "quiz";

export interface LessonMeta {
  type: LessonType;
  title: string;
  icon: string;
  desc: string;
}

/** Ordem fixa das lições dentro de qualquer curso. */
export const COURSE_LESSONS: LessonMeta[] = [
  { type: "intro", title: "Aprender", icon: "📖", desc: "Introdução, história e como funciona — do zero" },
  { type: "guided", title: "Exercícios guiados", icon: "✏️", desc: "Pratique com dicas e explicações a cada resposta" },
  { type: "free", title: "Exercícios livres", icon: "🎯", desc: "Teste sozinho, sem ajudas" },
  { type: "review", title: "Revisão", icon: "🔁", desc: "Recapitule tudo o que aprendeu" },
  { type: "quiz", title: "Quiz final", icon: "🏆", desc: "Prove seu domínio do código" },
];

export const LESSON_META: Record<LessonType, LessonMeta> = Object.fromEntries(
  COURSE_LESSONS.map((l) => [l.type, l]),
) as Record<LessonType, LessonMeta>;

/** Card de ensino (teoria). Sem pontuação — o usuário só avança lendo. */
export interface TeachCard {
  title: string;
  icon: string;
  body: string;
  /** Exemplo trabalhado: texto simples → codificado. */
  example?: { plain: string; encoded: string };
  /** Para Morse: string tocável. */
  morse?: string;
  hint?: string;
}

export interface Lesson {
  type: LessonType;
  code: CodeModule;
  teach?: TeachCard[];
  exercises?: Exercise[];
  passScore: number;
}

// ---------------------------------------------------------------------------
// Utilidades (locais, para não acoplar ao gerador antigo)
// ---------------------------------------------------------------------------

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
const pick = <T>(arr: T[], r: () => number): T => arr[Math.floor(r() * arr.length)];
function shuffle<T>(arr: T[], r: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const isTypeable = (s: string) => /^[A-Za-z0-9 .\-/+=]*$/.test(s);

const SIMPLE = ["A", "E", "OI", "SOS"];
const MEDIUM = ["SOL", "LUA", "CODE", "REDE", "BYTE"];
const HARD = ["NEXUS", "CIFRA", "AGENTE", "SINAL", "LOGIN", "CHAVE"];

/** Códigos que fazem sentido detalhar letra a letra. */
const PER_LETTER = new Set([
  "morse", "binary", "ascii", "hex", "caesar", "vigenere", "braille", "nato",
  "atbash", "rot13", "gray", "octal", "unicode", "bacon", "tap",
]);

/** Quebra uma palavra em "L=código" para explicar guiado. */
function breakdown(code: CodeModule, word: string): string | undefined {
  if (!code.encode || !PER_LETTER.has(code.id)) return undefined;
  return word
    .toUpperCase()
    .split("")
    .map((c) => `${c} = ${code.encode!(c)}`)
    .join("   ");
}

function decoy(correct: string, code: CodeModule, r: () => number): string[] {
  const set = new Set<string>([correct]);
  let guard = 0;
  while (set.size < 4 && guard++ < 60) {
    const w = pick([...SIMPLE, ...MEDIUM, ...HARD], r);
    const enc = code.encode ? code.encode(w) : w;
    if (enc && enc !== correct) set.add(enc);
  }
  while (set.size < 4) set.add(correct + " ·".repeat(set.size));
  return shuffle([...set], r);
}

// ---------------------------------------------------------------------------
// 1) Lição "Aprender" — ensina do zero
// ---------------------------------------------------------------------------

function buildTeachCards(code: CodeModule): TeachCard[] {
  const c = code.content;
  const cards: TeachCard[] = [
    {
      title: "Introdução",
      icon: "👋",
      body: `Vamos aprender ${code.name} do zero — ${code.tagline.toLowerCase()}. Você não precisa saber nada antes: comece por aqui e siga no seu ritmo.`,
      hint: code.alphabetHint,
    },
    { title: "História", icon: "🕰️", body: `${c.history}\n\nOrigem: ${c.origin}\nInventor: ${c.inventor}` },
    { title: "Para que serve", icon: "🌍", body: c.applications },
    { title: "Como funciona", icon: "⚙️", body: c.howItWorks },
  ];

  // Passo a passo
  const stepBody =
    `1) O que é: ${c.summary}\n` +
    `2) Para codificar: ${c.encodeGuide}\n` +
    (code.decode ? `3) Para decodificar: ${c.decodeGuide}\n` : "") +
    (code.alphabetHint ? `\nReferência rápida: ${code.alphabetHint}` : "");
  cards.push({ title: "Passo a passo", icon: "🪜", body: stepBody, hint: code.alphabetHint });

  // Exemplos simples → médios → difíceis
  if (code.encode) {
    const ex = (word: string, level: string): TeachCard => ({
      title: `Exemplo ${level}`,
      icon: "✨",
      body: `Veja como fica a palavra "${word}" em ${code.name}. Observe cada letra virar seu código.`,
      example: { plain: word, encoded: code.encode!(word) },
      morse: code.id === "morse" ? code.encode!(word) : undefined,
    });
    cards.push(ex("A", "simples"));
    cards.push(ex(pick(MEDIUM, rng(code.id.length + 3)), "médio"));
    cards.push(ex(pick(HARD, rng(code.id.length + 9)), "difícil"));
  } else {
    // Códigos conceituais: exemplos via curiosidades
    c.curiosities.slice(0, 3).forEach((cu, i) => {
      cards.push({ title: `Exemplo ${["simples", "médio", "avançado"][i] ?? "extra"}`, icon: "✨", body: cu });
    });
  }

  // Fechamento
  cards.push({
    title: "Resumo",
    icon: "🎓",
    body: `${c.summary}\n\nAgora que você já entendeu, vamos praticar com calma — os primeiros exercícios explicam cada resposta.`,
    hint: code.alphabetHint,
  });
  return cards;
}

// ---------------------------------------------------------------------------
// 2) Exercícios (guiados / livres / revisão / quiz)
// ---------------------------------------------------------------------------

function makeMultipleFromQuiz(code: CodeModule, qi: number, r: () => number, guided: boolean): Exercise {
  const q = code.quiz[qi % code.quiz.length];
  return {
    id: `${code.id}-quiz-${qi}`,
    kind: "multiple",
    prompt: q.prompt,
    answer: q.options[q.answer],
    options: shuffle(q.options, r),
    explain: q.explain,
    guided,
  };
}

function makeEncode(code: CodeModule, word: string, r: () => number, guided: boolean): Exercise {
  const enc = code.encode!(word);
  const bd = breakdown(code, word);
  if (isTypeable(enc)) {
    return {
      id: `${code.id}-enc-${word}`,
      kind: "encode",
      prompt: `Codifique em ${code.name}:`,
      subject: word,
      answer: enc,
      explain: `${word} → ${enc}`,
      hint: guided ? code.alphabetHint : undefined,
      guided,
      breakdown: guided ? bd : undefined,
    };
  }
  return {
    id: `${code.id}-encm-${word}`,
    kind: "multiple",
    prompt: `Como se escreve "${word}" em ${code.name}?`,
    answer: enc,
    options: decoy(enc, code, r),
    explain: `${word} → ${enc}`,
    guided,
    breakdown: guided ? bd : undefined,
  };
}

function makeDecode(code: CodeModule, word: string, r: () => number, guided: boolean, asMultiple: boolean): Exercise {
  const enc = code.encode!(word);
  const bd = breakdown(code, word);
  if (asMultiple) {
    return {
      id: `${code.id}-decm-${word}`,
      kind: "multiple",
      prompt: `O que está escrito em ${code.name}?`,
      subject: enc,
      answer: word,
      options: shuffle([word, ...shuffle([...MEDIUM, ...HARD].filter((w) => w !== word), r).slice(0, 3)], r),
      explain: `${enc} → ${word}`,
      guided,
      breakdown: guided ? bd : undefined,
    };
  }
  return {
    id: `${code.id}-dec-${word}`,
    kind: "decode",
    prompt: `Decodifique de ${code.name} para texto:`,
    subject: enc,
    answer: word,
    explain: `${enc} → ${word}`,
    hint: guided ? code.alphabetHint : undefined,
    guided,
    breakdown: guided ? bd : undefined,
  };
}

function buildExerciseSet(code: CodeModule, type: LessonType, seed: number): Exercise[] {
  const r = rng(seed * 2654435761 + code.id.length * 40503 + type.length);
  const out: Exercise[] = [];
  const guided = type === "guided";

  if (!code.encode || !code.decode) {
    // Código conceitual: perguntas de múltipla escolha (guiadas explicam)
    const n = type === "quiz" ? code.quiz.length : Math.min(3, code.quiz.length);
    for (let i = 0; i < n; i++) out.push(makeMultipleFromQuiz(code, i, r, guided));
    return out;
  }

  if (type === "guided") {
    // Começa fácil, sempre com dica e explicação letra a letra
    out.push(makeMultipleFromQuiz(code, 0, r, true));
    out.push(makeEncode(code, pick(SIMPLE.filter((w) => w.length <= 3), r) || "OI", r, true));
    out.push(makeDecode(code, pick(MEDIUM, r), r, true, true));
    out.push(makeEncode(code, pick(MEDIUM, r), r, true));
    return out;
  }

  if (type === "free") {
    // Sem dicas, dificuldade média/alta
    out.push(makeEncode(code, pick(MEDIUM, r), r, false));
    out.push(makeDecode(code, pick(MEDIUM, r), r, false, false));
    out.push(makeEncode(code, pick(HARD, r), r, false));
    out.push(makeDecode(code, pick(HARD, r), r, false, false));
    if (code.id === "morse") {
      const aud = pick(SIMPLE, r);
      out.push({ id: `${code.id}-audio`, kind: "audio", prompt: "Ouça o Morse e escreva o texto:", audio: code.encode(aud), answer: aud, explain: `${code.encode(aud)} → ${aud}` });
    }
    return out;
  }

  if (type === "review") {
    // Mistura de tudo
    out.push(makeMultipleFromQuiz(code, 0, r, false));
    out.push(makeEncode(code, pick(MEDIUM, r), r, false));
    out.push(makeDecode(code, pick(MEDIUM, r), r, false, true));
    out.push(makeMultipleFromQuiz(code, 1, r, false));
    out.push(makeEncode(code, pick(HARD, r), r, false));
    return out;
  }

  // quiz final: todas as perguntas + 2 práticas, sem dicas
  code.quiz.forEach((_, i) => out.push(makeMultipleFromQuiz(code, i, r, false)));
  out.push(makeEncode(code, pick(HARD, r), r, false));
  out.push(makeDecode(code, pick(HARD, r), r, false, false));
  return out;
}

// ---------------------------------------------------------------------------
// API principal
// ---------------------------------------------------------------------------

export function buildLesson(codeId: string, type: LessonType, seed = 1): Lesson | null {
  const code = getCode(codeId);
  if (!code) return null;
  if (type === "intro") {
    return { type, code, teach: buildTeachCards(code), passScore: 1 };
  }
  return {
    type,
    code,
    exercises: buildExerciseSet(code, type, seed),
    passScore: type === "quiz" ? 0.6 : 0,
  };
}

/** Quantidade total de lições por curso (para exibir "X lições"). */
export const LESSONS_PER_COURSE = COURSE_LESSONS.length;

export function checkExercise(ex: Exercise, given: string): boolean {
  if (ex.kind === "theory") return true;
  return normalize(given) === normalize(ex.answer);
}
