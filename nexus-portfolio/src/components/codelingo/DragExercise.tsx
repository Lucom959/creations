"use client";

import { useState } from "react";
import { sfx, resumeAudio } from "@/codelingo/sound";

interface Props {
  dragLabel: string;
  options: string[];
  answer: string;
  onDone: (correct: boolean) => void;
}

/**
 * Exercício de arrastar-e-soltar: arraste o chip até o alvo correto.
 * Suporta arrastar de verdade (desktop) e um fallback tocar-tocar (touch):
 * toque no chip para selecioná-lo, depois toque no alvo para soltá-lo ali.
 */
export default function DragExercise({ dragLabel, options, answer, onDone }: Props) {
  const [placed, setPlaced] = useState(false);
  const [wrongTarget, setWrongTarget] = useState<string | null>(null);
  const [selected, setSelected] = useState(false);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  const attempt = (target: string) => {
    if (placed) return;
    resumeAudio();
    if (target === answer) {
      sfx.correct();
      setPlaced(true);
      setSelected(false);
      setTimeout(() => onDone(true), 500);
    } else {
      sfx.wrong();
      setWrongTarget(target);
      setSelected(false);
      setTimeout(() => setWrongTarget(null), 350);
      onDone(false);
    }
  };

  return (
    <div>
      <div
        draggable={!placed}
        onDragStart={(e) => e.dataTransfer.setData("text/plain", dragLabel)}
        onClick={() => !placed && setSelected((s) => !s)}
        className="cl-display"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 120,
          padding: "14px 20px",
          borderRadius: 14,
          border: `2px solid ${selected ? "var(--cl-amber)" : "var(--cl-border)"}`,
          background: placed ? "rgba(255,193,7,0.12)" : selected ? "rgba(255,193,7,0.1)" : "var(--cl-card)",
          fontWeight: 800,
          fontSize: "1.2rem",
          cursor: placed ? "default" : "grab",
          margin: "0 auto 22px",
          userSelect: "none",
          transition: "border-color 0.2s ease, background 0.2s ease",
        }}
        aria-label="Arraste ou toque para selecionar"
      >
        {dragLabel}
      </div>
      <p className="cl-muted" style={{ textAlign: "center", fontSize: "0.75rem", marginTop: -14, marginBottom: 16 }}>
        {selected ? "Agora toque na letra correta ↓" : "Arraste (ou toque) até a letra certa"}
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {options.map((opt) => {
          const isWrong = wrongTarget === opt;
          const isOver = dragOverTarget === opt;
          return (
            <div
              key={opt}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverTarget(opt);
              }}
              onDragLeave={() => setDragOverTarget((t) => (t === opt ? null : t))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverTarget(null);
                attempt(opt);
              }}
              onClick={() => selected && attempt(opt)}
              className={isWrong ? "cl-shake" : ""}
              style={{
                width: 74,
                height: 74,
                borderRadius: 14,
                border: `2px dashed ${isWrong ? "var(--cl-err)" : isOver ? "var(--cl-amber)" : "var(--cl-border)"}`,
                background: isOver ? "rgba(255,193,7,0.1)" : "var(--cl-surface)",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-grotesk)",
                fontWeight: 800,
                fontSize: "1.3rem",
                cursor: selected ? "pointer" : "default",
                transition: "border-color 0.2s ease, background 0.2s ease",
              }}
            >
              {opt}
            </div>
          );
        })}
      </div>
    </div>
  );
}
