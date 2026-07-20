/**
 * Barramento simples para o painel do Mentor (renderizado uma vez no Shell)
 * receber mensagens de qualquer página (ex.: a explicação automática ao
 * desbloquear uma habilidade).
 */

import { MentorMessage } from "./mentor";

type Listener = (msg: MentorMessage, opts?: { open?: boolean }) => void;

let listener: Listener | null = null;

export function subscribeMentor(fn: Listener) {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

export function pushMentorMessage(msg: MentorMessage, opts?: { open?: boolean }) {
  listener?.(msg, opts);
}
