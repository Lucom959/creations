/**
 * Motor de progressão estilo Duolingo.
 *
 * Dois eixos de progressão, escolhidos conforme a natureza de cada código:
 *
 * 1) "letters" — códigos de tabela (Morse, Binário, Hex, ASCII, Octal,
 *    Unicode, Braille, NATO, Bacon, Tap Code): cada letra tem um símbolo
 *    fixo e memorizável. A progressão introduz 2-6 letras novas por lição,
 *    SEMPRE misturando com as letras antigas nos exercícios, e libera
 *    palavras reais assim que o banco de palavras tiver alguma 100%
 *    coberta pelas letras já ensinadas.
 *
 * 2) "payload" — códigos de fórmula/chave aplicados uniformemente a todo o
 *    alfabeto (César, ROT13, Atbash, Vigenère, Base64, Gray): não há "letra
 *    ainda não aprendida" — o alfabeto inteiro já funciona desde a primeira
 *    lição. A progressão aqui é pelo TAMANHO do conteúdo: conceito → uma
 *    letra → palavra pequena → frase.
 *
 * 3) "concept" — códigos sem encode automático (Pigpen, Semáforo, QR,
 *    Barras): sem tabela para progredir, mantém o ensino em cards
 *    pequenos e sequenciais (já era assim, apenas reorganizado aqui).
 */

import { CodeModule, getCode } from "./codes";
import { Exercise } from "./exercises";
import { CourseStep, TeachCard } from "./courseTypes";
import { CHUNK_SCHEDULE, cumulativeLetters, WORD_BANK } from "./wordbank";

export const LETTER_FAMILY = new Set([
  "morse", "binary", "hex", "ascii", "octal", "unicode", "braille", "nato", "bacon", "tap",
]);
export const PAYLOAD_FAMILY = new Set([
  "caesar", "rot13", "atbash", "vigenere", "base64", "gray",
]);
export const CONCEPT_FAMILY = new Set([
  "pigpen", "semaphore", "qr", "barcode",
]);

export type CourseFamily = "letters" | "payload" | "concept";

export function courseFamily(codeId: string): CourseFamily {
  if (LETTER_FAMILY.has(codeId)) return "letters";
  if (PAYLOAD_FAMILY.has(codeId)) return "payload";
  return "concept";
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
const uniq = <T,>(arr: T[]) => [...new Set(arr)];

function wordsFor(known: string[], minLen = 2, maxLen = 99): string[] {
  const set = new Set(known);
  return WORD_BANK.filter((w) => w.length >= minLen && w.length <= maxLen && [...w].every((ch) => set.has(ch)));
}

// ---------------------------------------------------------------------------
// Família "letters" — trilha de introdução progressiva
// ---------------------------------------------------------------------------

export function letterStepCount(): number {
  return CHUNK_SCHEDULE.length;
}

export function buildLetterSteps(code: CodeModule): CourseStep[] {
  const steps: CourseStep[] = [];
  CHUNK_SCHEDULE.forEach((chunk, i) => {
    const unitTitle = `Letras ${chunk.join(", ")}`;
    const isFirst = i === 0;
    const kinds: { kind: CourseStep["kind"]; title: string; icon: string; desc: string }[] = isFirst
      ? [
          { kind: "learn", title: "Aprender", icon: "📖", desc: `Conheça ${chunk.join(" e ")} — do zero` },
          { kind: "guided", title: "Primeiros passos", icon: "✏️", desc: "Pratique só com as letras novas, com ajuda" },
        ]
      : [
          { kind: "learn", title: `Novas letras: ${chunk.join(", ")}`, icon: "📖", desc: "Poucas letras novas, sempre misturando com as antigas" },
          { kind: "guided", title: "Exercícios guiados", icon: "✏️", desc: "Pratique com dicas e explicações" },
          { kind: "free", title: "Exercícios livres", icon: "🎯", desc: "Misture letras antigas e novas, sem ajuda" },
        ];
    kinds.forEach((k) => {
      steps.push({
        id: `u${i + 1}-${k.kind}`,
        unitIndex: i,
        unitTitle,
        unitIcon: "🔤",
        kind: k.kind,
        title: k.title,
        icon: k.icon,
        desc: k.desc,
      });
    });
  });
  const finalIndex = CHUNK_SCHEDULE.length;
  steps.push(
    { id: `u${finalIndex + 1}-review`, unitIndex: finalIndex, unitTitle: "Domínio Final", unitIcon: "🏆", kind: "review", title: "Revisão geral", icon: "🔁", desc: "Recapitule o alfabeto inteiro, com foco no que você mais errou" },
    { id: `u${finalIndex + 1}-final`, unitIndex: finalIndex, unitTitle: "Domínio Final", unitIcon: "🏆", kind: "final", title: "Prova final", icon: "🏆", desc: "Prove que domina todas as letras do código" },
  );
  return steps;
}

function chunkIndexFromStep(stepId: string): number {
  const m = stepId.match(/^u(\d+)-/);
  return m ? parseInt(m[1], 10) - 1 : 0;
}

function letterExercise(
  code: CodeModule,
  letter: string,
  r: () => number,
  guided: boolean,
  known: string[],
): Exercise {
  const enc = code.encode!(letter);
  if (isTypeable(enc)) {
    return {
      id: `${code.id}-lex-${letter}-${guided ? "g" : "f"}-${Math.floor(r() * 1e6)}`,
      kind: "encode",
      prompt: `Escreva "${letter}" em ${code.name}:`,
      subject: letter,
      answer: enc,
      explain: `${letter} → ${enc}`,
      hint: guided ? code.alphabetHint : undefined,
      guided,
      targetLetter: letter,
    };
  }
  const decoys = decoySymbols(code, letter, known, r);
  return {
    id: `${code.id}-lexm-${letter}-${guided ? "g" : "f"}-${Math.floor(r() * 1e6)}`,
    kind: "multiple",
    prompt: `Qual é o código de "${letter}" em ${code.name}?`,
    answer: enc,
    options: decoys,
    explain: `${letter} → ${enc}`,
    guided,
    targetLetter: letter,
  };
}

function decoySymbols(code: CodeModule, correctLetter: string, known: string[], r: () => number, count = 4): string[] {
  const correct = code.encode!(correctLetter);
  const pool = uniq(known.filter((l) => l !== correctLetter).map((l) => code.encode!(l)));
  const chosen = shuffle(pool, r).slice(0, Math.min(count - 1, pool.length));
  return shuffle([correct, ...chosen], r);
}

function decodeLetterExercise(code: CodeModule, letter: string, r: () => number, guided: boolean, known: string[]): Exercise {
  const enc = code.encode!(letter);
  const decoyLetters = shuffle(known.filter((l) => l !== letter), r).slice(0, 3);
  return {
    id: `${code.id}-dex-${letter}-${guided ? "g" : "f"}-${Math.floor(r() * 1e6)}`,
    kind: "multiple",
    prompt: `Qual letra corresponde a este código de ${code.name}?`,
    subject: enc,
    answer: letter,
    options: shuffle([letter, ...decoyLetters], r),
    explain: `${enc} → ${letter}`,
    guided,
    targetLetter: letter,
  };
}

function wordExercise(code: CodeModule, word: string, r: () => number, guided: boolean): Exercise {
  const enc = code.encode!(word);
  if (isTypeable(enc)) {
    return {
      id: `${code.id}-wex-${word}-${guided ? "g" : "f"}`,
      kind: "decode",
      prompt: `Traduza de ${code.name} para texto:`,
      subject: enc,
      answer: word,
      explain: `${enc} → ${word}`,
      guided,
    };
  }
  const decoyWords = shuffle(WORD_BANK.filter((w) => w !== word), r).slice(0, 3);
  return {
    id: `${code.id}-wexm-${word}-${guided ? "g" : "f"}`,
    kind: "multiple",
    prompt: `O que está escrito em ${code.name}?`,
    subject: enc,
    answer: word,
    options: shuffle(uniq([word, ...decoyWords]), r),
    explain: `${enc} → ${word}`,
    guided,
  };
}

function completeWordExercise(code: CodeModule, word: string, known: string[], r: () => number): Exercise | null {
  if (word.length < 3) return null;
  const idx = Math.floor(r() * word.length);
  const blankLetter = word[idx];
  const display = word.slice(0, idx) + "_" + word.slice(idx + 1);
  const decoys = shuffle(known.filter((l) => l !== blankLetter), r).slice(0, 3);
  return {
    id: `${code.id}-complete-${word}-${idx}`,
    kind: "multiple",
    prompt: `Complete a palavra: ${display}`,
    answer: blankLetter,
    options: shuffle([blankLetter, ...decoys], r),
    explain: `A palavra é ${word}.`,
    targetLetter: blankLetter,
  };
}

function matchExercise(code: CodeModule, letters: string[], r: () => number): Exercise {
  const chosen = shuffle(letters, r).slice(0, Math.min(4, letters.length));
  return {
    id: `${code.id}-match-${chosen.join("")}-${Math.floor(r() * 1e6)}`,
    kind: "match",
    prompt: `Associe cada letra ao seu código em ${code.name}:`,
    answer: "",
    pairs: chosen.map((l) => ({ left: l, right: code.encode!(l) })),
  };
}

function dragExercise(code: CodeModule, letter: string, known: string[], r: () => number): Exercise {
  const decoys = shuffle(known.filter((l) => l !== letter), r).slice(0, 2);
  const options = shuffle([letter, ...decoys], r);
  return {
    id: `${code.id}-drag-${letter}-${Math.floor(r() * 1e6)}`,
    kind: "drag",
    prompt: `Arraste o código até a letra correta:`,
    dragLabel: code.encode!(letter),
    answer: letter,
    options,
    targetLetter: letter,
  };
}

function audioExercise(code: CodeModule, target: string, guided: boolean): Exercise {
  return {
    id: `${code.id}-audio-${target}-${guided ? "g" : "f"}`,
    kind: "audio",
    prompt: "Ouça o Morse e escreva o texto:",
    audio: code.encode!(target),
    answer: target,
    explain: `${code.encode!(target)} → ${target}`,
    hint: guided ? "Toque quantas vezes quiser antes de responder." : undefined,
    guided,
  };
}

function buildLetterTeach(code: CodeModule, chunkIndex: number): TeachCard[] {
  const chunk = CHUNK_SCHEDULE[chunkIndex];
  const known = cumulativeLetters(chunkIndex);
  const cards: TeachCard[] = [];
  const isFirst = chunkIndex === 0;
  const isLast = chunkIndex === CHUNK_SCHEDULE.length - 1;

  if (isFirst) {
    cards.push({
      title: "Introdução",
      icon: "👋",
      body: `Vamos aprender ${code.name} aos poucos — ${code.tagline.toLowerCase()}. Cada lição ensina só algumas letras novas. Você pratica bastante antes de seguir para as próximas.`,
    });
    cards.push({
      title: "História",
      icon: "🕰️",
      body: `${code.content.history}\n\nOrigem: ${code.content.origin} Inventor: ${code.content.inventor}`,
    });
  }

  chunk.forEach((letter) => {
    cards.push({
      title: `Nova letra: ${letter}`,
      icon: "✨",
      body: `Em ${code.name}, a letra "${letter}" é representada assim:`,
      example: { plain: letter, encoded: code.encode!(letter) },
      morse: code.id === "morse" ? code.encode!(letter) : undefined,
    });
  });

  cards.push({
    title: "Revisão rápida",
    icon: "🧠",
    body: isFirst
      ? "Suas primeiras letras — memorize antes de praticar:"
      : `Agora você conhece ${known.length} letras. Aqui está tudo que já aprendeu:`,
    list: known.map((l) => `${l} = ${code.encode!(l)}`),
  });

  if (isLast) {
    cards.push(
      { title: "Onde é usado", icon: "🌍", body: code.content.applications },
      { title: "Curiosidades", icon: "💡", body: "Fatos interessantes:", list: code.content.curiosities },
      { title: "Erros comuns", icon: "⚠️", body: "Fique atento a essas pegadinhas:", list: code.content.commonMistakes },
      { title: "Resumo", icon: "🎓", body: `${code.content.summary}\n\nVocê já conhece o alfabeto inteiro de ${code.name}. Hora da revisão final!` },
    );
  }

  return cards;
}

function buildLetterExercises(code: CodeModule, step: CourseStep, chunkIndex: number, seed: number, weakLetters: string[] = []): Exercise[] {
  const r = rng(seed * 2654435761 + code.id.length * 40503 + step.id.length * 977);
  const chunk = CHUNK_SCHEDULE[chunkIndex];
  const known = cumulativeLetters(chunkIndex);
  const words = wordsFor(known, 3, chunkIndex < 3 ? 5 : 99);
  const out: Exercise[] = [];
  const guided = step.kind === "guided";

  if (guided) {
    // Guiado: foco nas letras NOVAS, sempre com dica e explicação.
    chunk.slice(0, 2).forEach((l) => out.push(letterExercise(code, l, r, true, known)));
    out.push(decodeLetterExercise(code, pick(chunk, r), r, true, known));
    if (known.length >= 3) out.push(matchExercise(code, known, r));
    if (code.id === "morse") out.push(audioExercise(code, pick(chunk, r), true));
    return out;
  }

  // Livre: mistura letras antigas + novas, várias formas de exercício.
  const mixed = shuffle(known, r).slice(0, Math.min(4, known.length));
  mixed.forEach((l) => out.push(r() > 0.5 ? letterExercise(code, l, r, false, known) : decodeLetterExercise(code, l, r, false, known)));

  if (words.length > 0) {
    out.push(wordExercise(code, pick(words, r), r, false));
    const comp = completeWordExercise(code, pick(words, r), known, r);
    if (comp) out.push(comp);
  }
  out.push(dragExercise(code, pick(chunk, r), known, r));
  if (code.id === "morse") out.push(audioExercise(code, words.length > 0 ? pick(words, r) : pick(chunk, r), false));

  // Reforço de pontos fracos: se há letras que o usuário já errou antes e
  // que já foram ensinadas, adiciona uma prática extra nelas.
  const weakKnown = weakLetters.filter((l) => known.includes(l));
  if (weakKnown.length > 0) out.push(letterExercise(code, pick(weakKnown, r), r, false, known));

  return out;
}

function buildLetterReview(code: CodeModule, isFinal: boolean, seed: number, weakLetters: string[] = []): Exercise[] {
  const r = rng(seed * 999331 + (isFinal ? 7 : 3));
  const known = LETTER_ORDER_ALL();
  const words = wordsFor(known, 3, 8);
  const out: Exercise[] = [];

  // Prioriza letras fracas primeiro — revisão de erros anteriores.
  const priority = weakLetters.length > 0 ? weakLetters : shuffle(known, r).slice(0, 5);
  priority.slice(0, isFinal ? 5 : 3).forEach((l) => {
    out.push(r() > 0.5 ? letterExercise(code, l, r, false, known) : decodeLetterExercise(code, l, r, false, known));
  });

  if (words.length > 0) {
    out.push(wordExercise(code, pick(words, r), r, false));
    if (isFinal) out.push(wordExercise(code, pick(words, r), r, false));
  }
  out.push(matchExercise(code, shuffle(known, r).slice(0, 4), r));
  if (isFinal) out.push(dragExercise(code, pick(known, r), known, r));
  if (code.id === "morse") out.push(audioExercise(code, words.length > 0 ? pick(words, r) : pick(known, r), false));

  return out;
}

function LETTER_ORDER_ALL(): string[] {
  return cumulativeLetters(CHUNK_SCHEDULE.length - 1);
}

export function buildLetterLesson(
  code: CodeModule,
  step: CourseStep,
  seed: number,
  weakLetters: string[] = [],
): { teach?: TeachCard[]; exercises?: Exercise[] } {
  if (step.kind === "review") return { exercises: buildLetterReview(code, false, seed, weakLetters) };
  if (step.kind === "final") return { exercises: buildLetterReview(code, true, seed, weakLetters) };
  const chunkIndex = chunkIndexFromStep(step.id);
  if (step.kind === "learn") return { teach: buildLetterTeach(code, chunkIndex) };
  return { exercises: buildLetterExercises(code, step, chunkIndex, seed, weakLetters) };
}

// ---------------------------------------------------------------------------
// Família "payload" — progressão por tamanho de conteúdo
// ---------------------------------------------------------------------------

const SINGLE_LETTERS = ["A", "E", "S", "O", "T", "R", "M", "C", "N", "D"];
const SMALL_WORDS = WORD_BANK.filter((w) => w.length >= 3 && w.length <= 5);
const LONGER_WORDS = WORD_BANK.filter((w) => w.length >= 5);

function buildPhrase(r: () => number): string {
  const a = pick(SMALL_WORDS, r);
  const b = pick(SMALL_WORDS.filter((w) => w !== a), r);
  return `${a} ${b}`;
}

const PAYLOAD_STAGES = [
  { key: "concept", title: "O conceito", icon: "🧠" },
  { key: "letter", title: "Uma letra", icon: "🔤" },
  { key: "word", title: "Palavras pequenas", icon: "✏️" },
  { key: "phrase", title: "Frases", icon: "💬" },
] as const;

export function buildPayloadSteps(code: CodeModule): CourseStep[] {
  const steps: CourseStep[] = [];
  PAYLOAD_STAGES.forEach((stage, i) => {
    const kinds: { kind: CourseStep["kind"]; title: string; icon: string; desc: string }[] =
      stage.key === "concept"
        ? [{ kind: "learn", title: "Aprender", icon: "📖", desc: "Entenda o conceito antes de qualquer exercício" }]
        : [
            { kind: "learn", title: stage.title, icon: stage.icon, desc: `Do zero: ${stage.title.toLowerCase()}` },
            { kind: "guided", title: "Exercícios guiados", icon: "✏️", desc: "Pratique com dicas e explicações" },
            { kind: "free", title: "Exercícios livres", icon: "🎯", desc: "Sem ajuda, só o que já aprendeu" },
          ];
    kinds.forEach((k) => {
      steps.push({
        id: `u${i + 1}-${k.kind}`,
        unitIndex: i,
        unitTitle: stage.title,
        unitIcon: stage.icon,
        kind: k.kind,
        title: k.title,
        icon: k.icon,
        desc: k.desc,
      });
    });
  });
  const finalIndex = PAYLOAD_STAGES.length;
  steps.push(
    { id: `u${finalIndex + 1}-review`, unitIndex: finalIndex, unitTitle: "Domínio Final", unitIcon: "🏆", kind: "review", title: "Revisão geral", icon: "🔁", desc: "Recapitule tudo o que aprendeu" },
    { id: `u${finalIndex + 1}-final`, unitIndex: finalIndex, unitTitle: "Domínio Final", unitIcon: "🏆", kind: "final", title: "Prova final", icon: "🏆", desc: "Prove seu domínio completo do código" },
  );
  return steps;
}

function payloadStageFromStep(stepId: string): (typeof PAYLOAD_STAGES)[number] {
  const idx = chunkIndexFromStep(stepId);
  return PAYLOAD_STAGES[Math.min(idx, PAYLOAD_STAGES.length - 1)];
}

function buildPayloadTeach(code: CodeModule, stageKey: (typeof PAYLOAD_STAGES)[number]["key"]): TeachCard[] {
  const c = code.content;
  if (stageKey === "concept") {
    const cards: TeachCard[] = [
      { title: "Introdução", icon: "👋", body: `Vamos aprender ${code.name} do zero. Antes de qualquer exercício, você vai entender a ideia por trás dele.` },
      { title: "O conceito central", icon: "🧠", body: c.howItWorks, hint: code.alphabetHint },
      { title: "Por que existe", icon: "🎯", body: c.applications },
    ];
    if (code.id === "vigenere") {
      cards.push({ title: "A chave", icon: "🗝️", body: "Vigenère usa uma palavra-chave: cada letra da chave desloca uma letra do texto de forma diferente. Vamos usar a chave CHAVE nos exemplos deste curso." });
    }
    return cards;
  }
  const example = stageKey === "letter" ? pick(SINGLE_LETTERS, rng(1)) : stageKey === "word" ? pick(SMALL_WORDS, rng(2)) : buildPhrase(rng(3));
  return [
    { title: PAYLOAD_STAGES.find((s) => s.key === stageKey)!.title, icon: "✨", body: `Agora vamos praticar com ${stageKey === "letter" ? "uma única letra" : stageKey === "word" ? "palavras pequenas" : "frases inteiras"}. Veja um exemplo:`, example: { plain: example, encoded: code.encode!(example) } },
  ];
}

function buildPayloadExercises(code: CodeModule, stageKey: (typeof PAYLOAD_STAGES)[number]["key"], guided: boolean, seed: number): Exercise[] {
  const r = rng(seed * 7919 + stageKey.length * 31 + (guided ? 1 : 2));
  const out: Exercise[] = [];
  const pool = stageKey === "letter" ? SINGLE_LETTERS : stageKey === "word" ? SMALL_WORDS : [buildPhrase(r), buildPhrase(r), buildPhrase(r)];

  const n = guided ? 3 : 5;
  for (let i = 0; i < n; i++) {
    const item = pick(pool, r);
    const enc = code.encode!(item);
    const asEncode = isTypeable(enc) && r() > 0.4;
    if (asEncode) {
      out.push({ id: `${code.id}-pl-enc-${item}-${i}`, kind: "encode", prompt: `Criptografe em ${code.name}:`, subject: item, answer: enc, explain: `${item} → ${enc}`, hint: guided ? code.alphabetHint : undefined, guided });
    } else {
      out.push({ id: `${code.id}-pl-dec-${item}-${i}`, kind: "decode", prompt: `Descriptografe de ${code.name}:`, subject: enc, answer: item, explain: `${enc} → ${item}`, hint: guided ? code.alphabetHint : undefined, guided });
    }
  }
  if (!guided && stageKey !== "concept") {
    const a = pick(pool, r);
    const b = pick(pool.filter((x) => x !== a), r);
    out.push(matchLikePayload(code, [a, b], r));
  }
  return out;
}

function matchLikePayload(code: CodeModule, items: string[], r: () => number): Exercise {
  return {
    id: `${code.id}-plmatch-${items.join("-")}-${Math.floor(r() * 1e6)}`,
    kind: "match",
    prompt: `Associe cada texto ao seu resultado em ${code.name}:`,
    answer: "",
    pairs: items.map((it) => ({ left: it, right: code.encode!(it) })),
  };
}

function buildPayloadReview(code: CodeModule, isFinal: boolean, seed: number): Exercise[] {
  const r = rng(seed * 55511 + (isFinal ? 9 : 4));
  const out: Exercise[] = [];
  const items = [pick(SINGLE_LETTERS, r), pick(SMALL_WORDS, r), buildPhrase(r)];
  items.forEach((item, i) => {
    const enc = code.encode!(item);
    if (i % 2 === 0) out.push({ id: `${code.id}-plrev-enc-${i}`, kind: "encode", prompt: `Criptografe em ${code.name}:`, subject: item, answer: enc, explain: `${item} → ${enc}` });
    else out.push({ id: `${code.id}-plrev-dec-${i}`, kind: "decode", prompt: `Descriptografe de ${code.name}:`, subject: enc, answer: item, explain: `${enc} → ${item}` });
  });
  if (isFinal) {
    const phrase = buildPhrase(r);
    out.push({ id: `${code.id}-plfinal-phrase`, kind: "decode", prompt: `Descriptografe esta frase de ${code.name}:`, subject: code.encode!(phrase), answer: phrase, explain: `${code.encode!(phrase)} → ${phrase}` });
  }
  return out;
}

export function buildPayloadLesson(code: CodeModule, step: CourseStep, seed: number): { teach?: TeachCard[]; exercises?: Exercise[] } {
  if (step.kind === "review") return { exercises: buildPayloadReview(code, false, seed) };
  if (step.kind === "final") return { exercises: buildPayloadReview(code, true, seed) };
  const stage = payloadStageFromStep(step.id);
  if (step.kind === "learn") return { teach: buildPayloadTeach(code, stage.key) };
  return { exercises: buildPayloadExercises(code, stage.key, step.kind === "guided", seed) };
}
