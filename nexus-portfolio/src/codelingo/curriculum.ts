/**
 * Currículo do CodeLingo.
 * Cada CÓDIGO é um curso independente. Todo curso segue a mesma árvore de
 * unidades pedagógicas (mesma estrutura, conteúdo próprio de cada código):
 *
 *   Unidade 1 · Fundamentos      → Aprender, Checagem guiada
 *   Unidade 2 · Como Funciona    → Aprender, Guiados, Livres
 *   Unidade 3 · Exemplos Práticos→ Aprender, Guiados, Livres
 *   Unidade 4 · Aplicações       → Aprender, Guiados, Livres
 *   Unidade 5 · Domínio Final    → Revisão geral, Prova final
 *
 * 13 lições por curso — mais que o dobro da versão anterior (5) — com
 * conteúdo genuíno em cada etapa (nada de repetição vazia). Cada lição
 * "Aprender" ensina do zero, assumindo que o usuário nunca viu o código.
 */

import { CodeModule, getCode, CODES } from "./codes";
import { Exercise, normalize } from "./exercises";

export type StepKind = "learn" | "guided" | "free" | "review" | "final";

export interface CourseStep {
  id: string; // único dentro do curso, ex.: "u1-learn"
  unitIndex: number;
  unitTitle: string;
  unitIcon: string;
  kind: StepKind;
  title: string;
  icon: string;
  desc: string;
}

interface UnitTemplate {
  title: string;
  icon: string;
  /** Quais grupos de teach cards essa unidade usa (ver buildTeachCards). */
  teachGroup?: "fundamentos" | "mecanica" | "exemplos" | "aplicacoes";
  steps: { kind: StepKind; title: string; icon: string; desc: string }[];
}

const UNIT_TEMPLATE: UnitTemplate[] = [
  {
    title: "Fundamentos",
    icon: "📖",
    teachGroup: "fundamentos",
    steps: [
      { kind: "learn", title: "Aprender", icon: "📖", desc: "O que é, história e por que existe — do zero" },
      { kind: "guided", title: "Checagem rápida", icon: "✅", desc: "Confirme que entendeu o básico, com ajuda" },
    ],
  },
  {
    title: "Como Funciona",
    icon: "⚙️",
    teachGroup: "mecanica",
    steps: [
      { kind: "learn", title: "Mecânica do código", icon: "⚙️", desc: "A lógica por trás, passo a passo" },
      { kind: "guided", title: "Exercícios guiados", icon: "✏️", desc: "Pratique com dicas e explicações" },
      { kind: "free", title: "Exercícios livres", icon: "🎯", desc: "Teste sozinho, sem ajudas" },
    ],
  },
  {
    title: "Exemplos Práticos",
    icon: "✨",
    teachGroup: "exemplos",
    steps: [
      { kind: "learn", title: "Do simples ao difícil", icon: "✨", desc: "Exemplos crescentes, animados" },
      { kind: "guided", title: "Exercícios guiados", icon: "✏️", desc: "Mais prática com explicações" },
      { kind: "free", title: "Exercícios livres", icon: "🎯", desc: "Codifique e decodifique sozinho" },
    ],
  },
  {
    title: "Aplicações e Domínio",
    icon: "🌍",
    teachGroup: "aplicacoes",
    steps: [
      { kind: "learn", title: "Onde é usado", icon: "🌍", desc: "Aplicações reais, curiosidades e erros comuns" },
      { kind: "guided", title: "Exercícios guiados", icon: "✏️", desc: "Últimos reforços com explicações" },
      { kind: "free", title: "Exercícios livres", icon: "🎯", desc: "Prática avançada, sem ajudas" },
    ],
  },
  {
    title: "Domínio Final",
    icon: "🏆",
    steps: [
      { kind: "review", title: "Revisão geral", icon: "🔁", desc: "Recapitule tudo o que aprendeu no curso" },
      { kind: "final", title: "Prova final", icon: "🏆", desc: "Prove seu domínio completo do código" },
    ],
  },
];

/** Sequência fixa de passos, igual para todo curso (o conteúdo de cada passo é próprio do código). */
export const COURSE_STEPS: CourseStep[] = UNIT_TEMPLATE.flatMap((unit, unitIndex) =>
  unit.steps.map((s) => ({
    id: `u${unitIndex + 1}-${s.kind}`,
    unitIndex,
    unitTitle: unit.title,
    unitIcon: unit.icon,
    kind: s.kind,
    title: s.title,
    icon: s.icon,
    desc: s.desc,
  })),
);

export const TOTAL_UNITS = UNIT_TEMPLATE.length;
export const TOTAL_STEPS = COURSE_STEPS.length;

export function getStep(stepId: string): CourseStep | undefined {
  return COURSE_STEPS.find((s) => s.id === stepId);
}

/** Passos de uma unidade específica (para agrupar visualmente na tela do curso). */
export function stepsForUnit(unitIndex: number): CourseStep[] {
  return COURSE_STEPS.filter((s) => s.unitIndex === unitIndex);
}

// ---------------------------------------------------------------------------
// Utilidades locais
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
const pick = <T,>(arr: T[], r: () => number): T => arr[Math.floor(r() * arr.length)];
function shuffle<T>(arr: T[], r: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const isTypeable = (s: string) => /^[A-Za-z0-9 .\-/+=]*$/.test(s);

const MONO = ["A", "E", "S", "O"];
const SIMPLE = ["OI", "SIM", "NAO", "SOS"];
const MEDIUM = ["SOL", "LUA", "CODE", "REDE", "BYTE", "PIXEL"];
const HARD = ["NEXUS", "CIFRA", "AGENTE", "SINAL", "LOGIN", "CHAVE", "SEGURO"];

/** Códigos que fazem sentido detalhar letra a letra nos exercícios guiados. */
const PER_LETTER = new Set([
  "morse", "binary", "ascii", "hex", "caesar", "vigenere", "braille", "nato",
  "atbash", "rot13", "gray", "octal", "unicode", "bacon", "tap",
]);

function breakdown(code: CodeModule, word: string): string | undefined {
  if (!code.encode || !PER_LETTER.has(code.id)) return undefined;
  return word.toUpperCase().split("").map((c) => `${c} = ${code.encode!(c)}`).join("   ");
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
// Cards de ensino, agrupados por unidade temática
// ---------------------------------------------------------------------------

export interface TeachCard {
  title: string;
  icon: string;
  body: string;
  example?: { plain: string; encoded: string };
  morse?: string;
  hint?: string;
  /** Renderização visual especial (para códigos sem encode, ex. semáforo/pigpen). */
  visual?: { kind: "semaphore" | "pigpen"; letter: string };
  list?: string[];
}

function buildTeachCards(code: CodeModule, group: NonNullable<UnitTemplate["teachGroup"]>): TeachCard[] {
  const c = code.content;

  if (group === "fundamentos") {
    return [
      {
        title: "Introdução",
        icon: "👋",
        body: `Vamos aprender ${code.name} do zero — ${code.tagline.toLowerCase()}. Você não precisa saber nada antes: vamos com calma, um conceito de cada vez.`,
        hint: code.alphabetHint,
      },
      {
        title: "Por que esse código existe",
        icon: "🎯",
        body: `Todo código nasce para resolver um problema. No caso de ${code.name}: ${c.applications.split(".")[0].toLowerCase()}. Entender o "porquê" ajuda a entender o "como".`,
      },
      {
        title: "História",
        icon: "🕰️",
        body: `${c.history}\n\nOrigem: ${c.origin}\nInventor: ${c.inventor}`,
      },
      {
        title: "Para que serve",
        icon: "🌍",
        body: c.applications,
      },
    ];
  }

  if (group === "mecanica") {
    return [
      {
        title: "Como funciona",
        icon: "⚙️",
        body: c.howItWorks,
        hint: code.alphabetHint,
      },
      {
        title: "A lógica por trás",
        icon: "🧩",
        body: `Pense assim: ${c.encodeGuide}${code.decode ? ` Para desfazer o processo, o caminho é o inverso — ${c.decodeGuide.toLowerCase()}` : ""}`,
      },
      {
        title: "Passo a passo",
        icon: "🪜",
        body: "Vamos destrinchar o processo em etapas simples, sem pular nada:",
        list: code.decode
          ? [`1) Ler o texto original, letra por letra.`, `2) ${c.encodeGuide}`, `3) Repetir para cada caractere até o fim.`, `4) Para o caminho inverso: ${c.decodeGuide}`]
          : [`1) Identificar o símbolo ou padrão.`, `2) ${c.encodeGuide}`, `3) Repetir a lógica para toda a mensagem.`],
      },
    ];
  }

  if (group === "exemplos") {
    if (code.encode) {
      const r1 = rng(code.id.length + 3);
      const r2 = rng(code.id.length + 9);
      const mkExample = (word: string, level: string, note: string): TeachCard => ({
        title: `Exemplo ${level}`,
        icon: "✨",
        body: note,
        example: { plain: word, encoded: code.encode!(word) },
        morse: code.id === "morse" ? code.encode!(word) : undefined,
      });
      return [
        mkExample(pick(MONO, r1), "muito simples", `Comece pelo mais simples possível: uma única letra. Veja "${pick(MONO, r1)}" virar código.`),
        mkExample(pick(SIMPLE, r1), "simples", "Agora uma palavra curta — o mesmo processo, repetido letra a letra."),
        mkExample(pick(MEDIUM, r2), "médio", "Uma palavra um pouco maior. Observe: nada muda na lógica, só repetimos mais vezes."),
        mkExample(pick(HARD, r2), "avançado", "Por fim, um exemplo mais longo — prova de que, dominando a lógica, o tamanho não importa."),
      ];
    }
    // Códigos conceituais (sem encode): usar diagramas visuais quando disponíveis
    if (code.id === "semaphore") {
      return [
        { title: "Exemplo visual: letra A", icon: "🚩", body: "No semáforo, a letra A tem os dois braços em posições específicas do 'relógio'. Veja o diagrama:", visual: { kind: "semaphore", letter: "A" } },
        { title: "Exemplo visual: letra N", icon: "🚩", body: "A letra N usa outro par de ângulos. Compare com o A — a diferença é só a posição dos braços.", visual: { kind: "semaphore", letter: "N" } },
        { title: "Exemplo visual: letra D", icon: "🚩", body: "N + D juntos, aliás, inspiraram o símbolo da paz ☮ — uma curiosidade que vem exatamente desses ângulos.", visual: { kind: "semaphore", letter: "D" } },
      ];
    }
    if (code.id === "pigpen") {
      return [
        { title: "Exemplo visual: letra A", icon: "🔳", body: "A letra A ocupa o canto superior-esquerdo da primeira grade. O símbolo é o 'canto' que sobra ao redor dela.", visual: { kind: "pigpen", letter: "A" } },
        { title: "Exemplo visual: letra E", icon: "🔳", body: "A letra E fica no centro da primeira grade — repare como o símbolo muda de formato.", visual: { kind: "pigpen", letter: "E" } },
        { title: "Exemplo visual: letra R", icon: "🔳", body: "Letras da segunda grade (com ponto) representam a segunda metade do alfabeto.", visual: { kind: "pigpen", letter: "R" } },
      ];
    }
    // fallback genérico: usar curiosidades como "exemplos" de aplicação real
    return c.curiosities.slice(0, 3).map((cu, i) => ({
      title: `Na prática ${i + 1}`,
      icon: "✨",
      body: cu,
    }));
  }

  // aplicacoes
  return [
    { title: "Onde você encontra isso", icon: "🌍", body: c.applications },
    { title: "Curiosidades", icon: "💡", body: "Fatos interessantes para impressionar quem também estiver aprendendo:", list: c.curiosities },
    { title: "Erros comuns", icon: "⚠️", body: "Fique atento a essas pegadinhas — são os erros que mais aparecem em quem está começando:", list: c.commonMistakes },
    {
      title: "Resumo da unidade",
      icon: "🎓",
      body: `${c.summary}\n\nVocê já tem tudo que precisa. Agora é hora de praticar com mais confiança.`,
      hint: code.alphabetHint,
    },
  ];
}

// ---------------------------------------------------------------------------
// Exercícios
// ---------------------------------------------------------------------------

function makeMultipleFromQuiz(code: CodeModule, qi: number, r: () => number, guided: boolean): Exercise {
  const q = code.quiz[qi % code.quiz.length];
  return {
    id: `${code.id}-quiz-${qi}-${guided ? "g" : "f"}`,
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
      id: `${code.id}-enc-${word}-${guided ? "g" : "f"}`,
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
    id: `${code.id}-encm-${word}-${guided ? "g" : "f"}`,
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
      id: `${code.id}-decm-${word}-${guided ? "g" : "f"}`,
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
    id: `${code.id}-dec-${word}-${guided ? "g" : "f"}`,
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

function makeAudio(code: CodeModule, word: string, guided: boolean): Exercise {
  return {
    id: `${code.id}-audio-${word}-${guided ? "g" : "f"}`,
    kind: "audio",
    prompt: "Ouça o Morse e escreva o texto:",
    audio: code.encode!(word),
    answer: word,
    explain: `${code.encode!(word)} → ${word}`,
    hint: guided ? "Toque quantas vezes quiser antes de responder." : undefined,
    guided,
  };
}

/** Exercício de identificação: reconhecer QUAL sistema produziu um trecho codificado. */
function makeIdentify(code: CodeModule, r: () => number): Exercise | null {
  const decoyCodes = CODES.filter((c) => c.id !== code.id && c.encode).slice(0);
  if (!code.encode || decoyCodes.length < 3) return null;
  const word = pick(SIMPLE, r);
  const snippet = code.encode(word);
  const wrongNames = shuffle(decoyCodes, r).slice(0, 3).map((c) => c.name);
  return {
    id: `${code.id}-identify-${word}`,
    kind: "multiple",
    prompt: "Este trecho foi codificado em qual sistema?",
    subject: snippet,
    answer: code.name,
    options: shuffle([code.name, ...wrongNames], r),
    explain: `"${snippet}" é ${code.name} — repare no padrão de símbolos característico.`,
  };
}

function wordPoolForUnit(unitIndex: number): string[] {
  if (unitIndex <= 0) return MONO;
  if (unitIndex === 1) return SIMPLE;
  if (unitIndex === 2) return MEDIUM;
  return HARD;
}

function buildExerciseSet(code: CodeModule, step: CourseStep, seed: number): Exercise[] {
  const r = rng(seed * 2654435761 + code.id.length * 40503 + step.id.length * 977);
  const out: Exercise[] = [];
  const guided = step.kind === "guided";
  const pool = wordPoolForUnit(step.unitIndex);

  if (!code.encode || !code.decode) {
    // Código conceitual: perguntas do quiz, cobrindo o banco todo ao longo do curso
    const count = step.kind === "final" ? code.quiz.length : step.kind === "review" ? Math.min(4, code.quiz.length) : 2;
    const offset = step.unitIndex; // varia as perguntas conforme a unidade
    for (let i = 0; i < count; i++) out.push(makeMultipleFromQuiz(code, i + offset, r, guided));
    return out;
  }

  if (step.kind === "guided") {
    out.push(makeMultipleFromQuiz(code, step.unitIndex, r, true));
    out.push(makeEncode(code, pick(pool, r), r, true));
    out.push(makeDecode(code, pick(pool, r), r, true, true));
    if (step.unitIndex >= 2) out.push(makeEncode(code, pick(pool, r), r, true));
    if (code.id === "morse") out.push(makeAudio(code, pick(pool.length ? pool : SIMPLE, r), true));
    return out;
  }

  if (step.kind === "free") {
    out.push(makeEncode(code, pick(pool, r), r, false));
    out.push(makeDecode(code, pick(pool, r), r, false, false));
    out.push(makeEncode(code, pick(pool, r), r, false));
    out.push(makeDecode(code, pick(pool, r), r, false, true));
    if (code.id === "morse") out.push(makeAudio(code, pick(pool, r), false));
    const idf = makeIdentify(code, r);
    if (idf && step.unitIndex >= 2) out.push(idf);
    return out;
  }

  if (step.kind === "review") {
    out.push(makeMultipleFromQuiz(code, 0, r, false));
    out.push(makeEncode(code, pick(MEDIUM, r), r, false));
    out.push(makeDecode(code, pick(MEDIUM, r), r, false, true));
    out.push(makeMultipleFromQuiz(code, 1, r, false));
    out.push(makeEncode(code, pick(HARD, r), r, false));
    out.push(makeDecode(code, pick(HARD, r), r, false, false));
    return out;
  }

  // final: prova completa — todas as perguntas do quiz + prática pesada
  code.quiz.forEach((_, i) => out.push(makeMultipleFromQuiz(code, i, r, false)));
  out.push(makeEncode(code, pick(HARD, r), r, false));
  out.push(makeDecode(code, pick(HARD, r), r, false, false));
  out.push(makeEncode(code, pick(MEDIUM, r), r, false));
  if (code.id === "morse") out.push(makeAudio(code, pick(HARD.filter((w) => w.length <= 6), r) || "SOL", false));
  const idf = makeIdentify(code, r);
  if (idf) out.push(idf);
  return out;
}

// ---------------------------------------------------------------------------
// API principal
// ---------------------------------------------------------------------------

export interface Lesson {
  step: CourseStep;
  code: CodeModule;
  teach?: TeachCard[];
  exercises?: Exercise[];
}

export function buildLesson(codeId: string, stepId: string, seed = 1): Lesson | null {
  const code = getCode(codeId);
  const step = getStep(stepId);
  if (!code || !step) return null;
  if (step.kind === "learn") {
    const unit = UNIT_TEMPLATE[step.unitIndex];
    const teach = unit.teachGroup ? buildTeachCards(code, unit.teachGroup) : [];
    return { step, code, teach };
  }
  return { step, code, exercises: buildExerciseSet(code, step, seed) };
}

export function checkExercise(ex: Exercise, given: string): boolean {
  if (ex.kind === "theory") return true;
  return normalize(given) === normalize(ex.answer);
}
