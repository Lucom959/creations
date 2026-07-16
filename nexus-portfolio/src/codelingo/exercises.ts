/**
 * Tipos e utilitários compartilhados de exercícios do CodeLingo.
 * A construção de exercícios por lição vive em `curriculum.ts` — este módulo
 * define apenas o formato `Exercise` e helpers de checagem de resposta.
 */

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
  /** Exercício guiado: mostra dica sempre e explica cada resposta em detalhe. */
  guided?: boolean;
  /** Detalhamento letra a letra, mostrado em exercícios guiados. */
  breakdown?: string;
}

/** Normaliza respostas para comparação tolerante (espaços, caixa). */
export function normalize(s: string): string {
  return s.trim().toUpperCase().replace(/\s+/g, " ");
}

export function checkAnswer(ex: Exercise, given: string): boolean {
  if (ex.kind === "theory") return true;
  return normalize(given) === normalize(ex.answer);
}
