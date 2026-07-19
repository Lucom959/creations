/**
 * Currículo do CodeLingo — orquestrador.
 *
 * Cada CÓDIGO é um curso independente. A forma da trilha depende da família
 * pedagógica do código (ver progression.ts):
 *
 *   "letters"  → trilha de letras progressiva (2-6 símbolos novos por lição,
 *                sempre misturando com o que já foi ensinado, formando
 *                palavras reais assim que possível). Ex.: Morse, Binário.
 *   "payload"  → conceito → uma letra → palavra pequena → frase. Ex.: César.
 *   "concept"  → sem encode automático, cards pequenos e sequenciais.
 *                Ex.: Semáforo, Pigpen.
 *
 * Este módulo expõe uma API só: getCourseSteps(code) e buildLesson(...).
 */

import { CodeModule, getCode } from "./codes";
import { Exercise, normalize } from "./exercises";
import { CourseStep, Lesson, TeachCard } from "./courseTypes";
import {
  courseFamily,
  buildLetterSteps,
  buildLetterLesson,
  buildPayloadSteps,
  buildPayloadLesson,
} from "./progression";

export type { CourseStep, Lesson, TeachCard } from "./courseTypes";
export { courseFamily } from "./progression";

// ---------------------------------------------------------------------------
// Família "concept" — códigos sem encode automático (Pigpen, Semáforo, QR,
// Código de Barras). Sem tabela para progredir: ensino em cards pequenos e
// sequenciais, exercícios vêm do banco de quiz de cada código.
// ---------------------------------------------------------------------------

interface ConceptUnitTemplate {
  title: string;
  icon: string;
  teachGroup?: "fundamentos" | "mecanica" | "exemplos" | "aplicacoes";
  steps: { kind: CourseStep["kind"]; title: string; icon: string; desc: string }[];
}

const CONCEPT_UNIT_TEMPLATE: ConceptUnitTemplate[] = [
  {
    title: "Fundamentos",
    icon: "📖",
    teachGroup: "fundamentos",
    steps: [
      { kind: "learn", title: "Aprender", icon: "📖", desc: "Introdução, história e por que existe — do zero" },
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
      { kind: "free", title: "Exercícios livres", icon: "🎯", desc: "Teste seus conhecimentos sozinho" },
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

function buildConceptSteps(): CourseStep[] {
  return CONCEPT_UNIT_TEMPLATE.flatMap((unit, unitIndex) =>
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
}

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
const shuffle = <T,>(arr: T[], r: () => number): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function makeConceptQuiz(code: CodeModule, qi: number, r: () => number, guided: boolean): Exercise {
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

function buildConceptTeach(code: CodeModule, group: NonNullable<ConceptUnitTemplate["teachGroup"]>): TeachCard[] {
  const c = code.content;
  if (group === "fundamentos") {
    return [
      { title: "Introdução", icon: "👋", body: `Vamos aprender ${code.name} do zero — ${code.tagline.toLowerCase()}. Você não precisa saber nada antes: vamos com calma, um conceito de cada vez.` },
      { title: "Por que esse código existe", icon: "🎯", body: `Todo código nasce para resolver um problema. No caso de ${code.name}: ${c.applications.split(".")[0].toLowerCase()}.` },
      { title: "História", icon: "🕰️", body: `${c.history}\n\nOrigem: ${c.origin}\nInventor: ${c.inventor}` },
      { title: "Para que serve", icon: "🌍", body: c.applications },
    ];
  }
  if (group === "mecanica") {
    return [
      { title: "Como funciona", icon: "⚙️", body: c.howItWorks },
      { title: "A lógica por trás", icon: "🧩", body: `Pense assim: ${c.encodeGuide}` },
      { title: "Passo a passo", icon: "🪜", body: "Vamos destrinchar o processo em etapas simples:", list: [`1) Identificar o símbolo ou padrão.`, `2) ${c.encodeGuide}`, `3) Repetir a lógica para toda a mensagem.`] },
    ];
  }
  if (group === "exemplos") {
    if (code.id === "semaphore") {
      return [
        { title: "Exemplo visual: letra A", icon: "🚩", body: "No semáforo, a letra A tem os dois braços em posições específicas. Veja o diagrama:", visual: { kind: "semaphore", letter: "A" } },
        { title: "Exemplo visual: letra N", icon: "🚩", body: "A letra N usa outro par de ângulos.", visual: { kind: "semaphore", letter: "N" } },
        { title: "Exemplo visual: letra D", icon: "🚩", body: "N + D juntos inspiraram o símbolo da paz ☮.", visual: { kind: "semaphore", letter: "D" } },
      ];
    }
    if (code.id === "pigpen") {
      return [
        { title: "Exemplo visual: letra A", icon: "🔳", body: "A letra A ocupa o canto superior-esquerdo da primeira grade.", visual: { kind: "pigpen", letter: "A" } },
        { title: "Exemplo visual: letra E", icon: "🔳", body: "A letra E fica no centro — repare como o símbolo muda de formato.", visual: { kind: "pigpen", letter: "E" } },
        { title: "Exemplo visual: letra R", icon: "🔳", body: "Letras da segunda grade (com ponto) representam a segunda metade do alfabeto.", visual: { kind: "pigpen", letter: "R" } },
      ];
    }
    return c.curiosities.slice(0, 3).map((cu, i) => ({ title: `Na prática ${i + 1}`, icon: "✨", body: cu }));
  }
  return [
    { title: "Onde você encontra isso", icon: "🌍", body: c.applications },
    { title: "Curiosidades", icon: "💡", body: "Fatos interessantes:", list: c.curiosities },
    { title: "Erros comuns", icon: "⚠️", body: "Fique atento a essas pegadinhas:", list: c.commonMistakes },
    { title: "Resumo da unidade", icon: "🎓", body: `${c.summary}\n\nAgora é hora de praticar com mais confiança.` },
  ];
}

function buildConceptExercises(code: CodeModule, kind: CourseStep["kind"], seed: number): Exercise[] {
  const r = rng(seed * 2654435761 + code.id.length * 40503 + kind.length);
  const out: Exercise[] = [];
  const guided = kind === "guided";
  if (kind === "final") {
    code.quiz.forEach((_, i) => out.push(makeConceptQuiz(code, i, r, false)));
    return out;
  }
  const count = kind === "review" ? Math.min(4, code.quiz.length) : 2;
  for (let i = 0; i < count; i++) out.push(makeConceptQuiz(code, i, r, guided));
  return out;
}

function buildConceptLesson(code: CodeModule, step: CourseStep, seed: number): Lesson {
  if (step.kind === "learn") {
    const unit = CONCEPT_UNIT_TEMPLATE[step.unitIndex];
    return { step, code, teach: unit.teachGroup ? buildConceptTeach(code, unit.teachGroup) : [] };
  }
  return { step, code, exercises: buildConceptExercises(code, step.kind, seed) };
}

// ---------------------------------------------------------------------------
// API principal
// ---------------------------------------------------------------------------

const stepsCache = new Map<string, CourseStep[]>();

/** Sequência de lições do curso — varia por família pedagógica do código. */
export function getCourseSteps(codeId: string): CourseStep[] {
  const cached = stepsCache.get(codeId);
  if (cached) return cached;
  const code = getCode(codeId);
  if (!code) return [];
  const family = courseFamily(codeId);
  const steps = family === "letters" ? buildLetterSteps(code) : family === "payload" ? buildPayloadSteps(code) : buildConceptSteps();
  stepsCache.set(codeId, steps);
  return steps;
}

export function getStep(codeId: string, stepId: string): CourseStep | undefined {
  return getCourseSteps(codeId).find((s) => s.id === stepId);
}

export function stepsForUnit(codeId: string, unitIndex: number): CourseStep[] {
  return getCourseSteps(codeId).filter((s) => s.unitIndex === unitIndex);
}

export function totalUnits(codeId: string): number {
  return new Set(getCourseSteps(codeId).map((s) => s.unitIndex)).size;
}

export function buildLesson(codeId: string, stepId: string, seed = 1, weakLetters: string[] = []): Lesson | null {
  const code = getCode(codeId);
  const step = getStep(codeId, stepId);
  if (!code || !step) return null;
  const family = courseFamily(codeId);
  if (family === "letters") {
    const { teach, exercises } = buildLetterLesson(code, step, seed, weakLetters);
    return { step, code, teach, exercises };
  }
  if (family === "payload") {
    const { teach, exercises } = buildPayloadLesson(code, step, seed);
    return { step, code, teach, exercises };
  }
  return buildConceptLesson(code, step, seed);
}

export function checkExercise(ex: Exercise, given: string): boolean {
  if (ex.kind === "theory") return true;
  return normalize(given) === normalize(ex.answer);
}
