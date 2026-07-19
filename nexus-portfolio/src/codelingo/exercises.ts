/**
 * Tipos e utilitários compartilhados de exercícios do CodeLingo.
 * A construção de exercícios por lição vive em `curriculum.ts`/`progression.ts`
 * — este módulo define apenas o formato `Exercise` e helpers de checagem.
 */

export type ExerciseKind = "theory" | "multiple" | "encode" | "decode" | "audio" | "match" | "drag";

export interface MatchPair {
  left: string;
  right: string;
}

export interface Exercise {
  id: string;
  kind: ExerciseKind;
  prompt: string;
  /** Texto de referência mostrado (ex.: a palavra a codificar). */
  subject?: string;
  /** Resposta esperada normalizada (kinds simples: multiple/encode/decode). */
  answer: string;
  /** Alternativas para múltipla escolha. */
  options?: string[];
  explain?: string;
  /** Para exercícios de áudio (Morse), a string a tocar. */
  audio?: string;
  hint?: string;
  /** Exercício guiado: mostra dica sempre e explica cada resposta em detalhe. */
  guided?: boolean;
  /** Detalhamento letra a letra, mostrado em exercícios guiados. */
  breakdown?: string;
  /** Pares para o exercício de associação (kind "match"). */
  pairs?: MatchPair[];
  /** Alvo único para o exercício de arrastar-e-soltar (kind "drag"): arrastar `dragLabel` até `answer` entre `options`. */
  dragLabel?: string;
  /** Letra específica sendo testada — usada para rastrear pontos fracos e priorizar revisão. */
  targetLetter?: string;
}

/** Normaliza respostas para comparação tolerante (espaços, caixa). */
export function normalize(s: string): string {
  return s.trim().toUpperCase().replace(/\s+/g, " ");
}

export function checkAnswer(ex: Exercise, given: string): boolean {
  if (ex.kind === "theory") return true;
  return normalize(given) === normalize(ex.answer);
}
