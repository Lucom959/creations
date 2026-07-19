"use client";

import { useMemo, useState } from "react";
import { MatchPair } from "@/codelingo/exercises";
import { sfx, resumeAudio } from "@/codelingo/sound";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Exercício de associação de pares — clique em um item de cada coluna para parear. */
export default function MatchExercise({ pairs, onDone }: { pairs: MatchPair[]; onDone: (mistakes: number) => void }) {
  const left = useMemo(() => shuffle(pairs.map((p) => p.left)), [pairs]);
  const right = useMemo(() => shuffle(pairs.map((p) => p.right)), [pairs]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPulse, setWrongPulse] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const correctFor = (l: string) => pairs.find((p) => p.left === l)?.right;

  const pickLeft = (l: string) => {
    if (matched.has(l)) return;
    resumeAudio();
    sfx.click();
    setSelectedLeft(l);
  };

  const pickRight = (r: string) => {
    if (!selectedLeft || matched.has(r)) return;
    const isCorrect = correctFor(selectedLeft) === r;
    if (isCorrect) {
      sfx.correct();
      const nextMatched = new Set(matched);
      nextMatched.add(selectedLeft);
      nextMatched.add(r);
      setMatched(nextMatched);
      setSelectedLeft(null);
      if (nextMatched.size >= left.length + right.length) {
        setTimeout(() => onDone(mistakes), 400);
      }
    } else {
      sfx.wrong();
      setMistakes((m) => m + 1);
      setWrongPulse(r);
      setTimeout(() => setWrongPulse(null), 350);
      setSelectedLeft(null);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div style={{ display: "grid", gap: 8 }}>
        {left.map((l) => {
          const done = matched.has(l);
          const sel = selectedLeft === l;
          return (
            <button
              key={l}
              type="button"
              disabled={done}
              onClick={() => pickLeft(l)}
              className="cl-option"
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: `2px solid ${done ? "var(--cl-amber-700)" : sel ? "var(--cl-amber)" : "var(--cl-border)"}`,
                background: done ? "rgba(255,193,7,0.12)" : sel ? "rgba(255,193,7,0.08)" : "var(--cl-surface)",
                color: "var(--cl-text)",
                fontWeight: 700,
                fontFamily: "var(--font-grotesk)",
                cursor: done ? "default" : "pointer",
                opacity: done ? 0.6 : 1,
                textAlign: "center",
              }}
            >
              {l}
            </button>
          );
        })}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {right.map((r) => {
          const done = matched.has(r);
          const wrong = wrongPulse === r;
          return (
            <button
              key={r}
              type="button"
              disabled={done}
              onClick={() => pickRight(r)}
              className={`cl-option ${wrong ? "cl-shake" : ""}`}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: `2px solid ${done ? "var(--cl-amber-700)" : wrong ? "var(--cl-err)" : "var(--cl-border)"}`,
                background: done ? "rgba(255,193,7,0.12)" : "var(--cl-surface)",
                color: "var(--cl-text)",
                fontWeight: 700,
                fontFamily: "var(--font-grotesk)",
                cursor: done ? "default" : "pointer",
                opacity: done ? 0.6 : 1,
                textAlign: "center",
                wordBreak: "break-word",
              }}
            >
              {r}
            </button>
          );
        })}
      </div>
    </div>
  );
}
