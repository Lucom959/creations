"use client";

import { useState } from "react";
import { Skill } from "@/skilltree/skills";
import { useSkillTree } from "@/skilltree/store";
import { sfx, resumeAudio } from "@/skilltree/sound";

export default function QuizCard({ skill }: { skill: Skill }) {
  const { recordQuiz } = useSkillTree();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const q = skill.quiz[index];
  if (!q) return <p className="st-muted" style={{ fontSize: "0.85rem" }}>Sem quiz cadastrado para esta habilidade ainda.</p>;

  if (done) {
    const pctScore = Math.round((correctCount / skill.quiz.length) * 100);
    return (
      <div className="st-fade-up" style={{ textAlign: "center", padding: "10px 0" }}>
        <div style={{ fontSize: "2rem" }}>{pctScore >= 80 ? "🎯" : pctScore >= 50 ? "👍" : "💪"}</div>
        <div className="st-display" style={{ fontWeight: 800, fontSize: "1.2rem", marginTop: 4 }}>{correctCount}/{skill.quiz.length} corretas ({pctScore}%)</div>
        <button
          type="button"
          onClick={() => { setIndex(0); setSelected(null); setCorrectCount(0); setDone(false); }}
          className="st-btn st-btn-ghost"
          style={{ marginTop: 12, padding: "8px 16px", fontSize: "0.82rem" }}
        >
          ↻ Refazer quiz
        </button>
      </div>
    );
  }

  const submit = () => {
    if (selected === null) return;
    resumeAudio();
    const isCorrect = selected === q.answer;
    if (isCorrect) { setCorrectCount((c) => c + 1); sfx.correct(); } else sfx.wrong();
    recordQuiz(skill.id, isCorrect, (correctCount + (isCorrect ? 1 : 0)) / skill.quiz.length);
    setTimeout(() => {
      if (index + 1 >= skill.quiz.length) setDone(true);
      else { setIndex((i) => i + 1); setSelected(null); }
    }, 900);
  };

  return (
    <div className="st-fade-up" key={index}>
      <div className="st-muted" style={{ fontSize: "0.72rem", marginBottom: 6 }}>Pergunta {index + 1} de {skill.quiz.length}</div>
      <div style={{ fontWeight: 700, marginBottom: 12 }}>{q.prompt}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {q.options.map((opt, i) => {
          const reveal = selected !== null;
          const isCorrect = i === q.answer;
          const isSel = selected === i;
          let border = "var(--st-border)";
          let bg = "var(--st-surface)";
          if (reveal && isCorrect) { border = "var(--st-cyan)"; bg = "rgba(34,211,238,0.12)"; }
          else if (reveal && isSel && !isCorrect) { border = "var(--st-err)"; bg = "rgba(255,91,122,0.1)"; }
          return (
            <button key={i} type="button" disabled={reveal} onClick={() => setSelected(i)} style={{ textAlign: "left", padding: "10px 14px", borderRadius: 12, border: `2px solid ${border}`, background: bg, color: "var(--st-text)", cursor: reveal ? "default" : "pointer", fontSize: "0.85rem" }}>
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && <p className="st-muted" style={{ fontSize: "0.78rem", marginTop: 10 }}>{q.explain}</p>}
      {selected === null && (
        <button type="button" onClick={submit} className="st-btn st-btn-primary" style={{ width: "100%", padding: "10px", marginTop: 12, fontSize: "0.85rem" }}>Responder</button>
      )}
    </div>
  );
}
