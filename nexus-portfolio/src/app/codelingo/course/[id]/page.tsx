"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { getCode } from "@/codelingo/codes";
import { COURSE_LESSONS } from "@/codelingo/curriculum";
import { courseLessonsDone, isCourseComplete, useStore } from "@/codelingo/store";

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const code = getCode(params.id);
  const { p, ready, isLessonUnlocked, courseProgress, toggleFavorite } = useStore();

  if (!code) return notFound();

  const cp = ready ? courseProgress(code.id) : undefined;
  const done = courseLessonsDone(cp);
  const total = COURSE_LESSONS.length;
  const pct = total > 0 ? done / total : 0;
  const complete = isCourseComplete(cp);
  const mastered = !!cp?.mastered;
  const isFav = p.favorites.includes(code.id);

  return (
    <div className="cl-fade-up">
      <Link href="/codelingo/courses" className="cl-muted" style={{ fontSize: "0.82rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
        ← Escolha um Código
      </Link>

      {/* Cabeçalho do curso */}
      <div className="cl-card" style={{ padding: 22, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", marginBottom: 22 }}>
        <span style={{ fontSize: "3rem" }}>{code.icon}</span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 className="cl-display" style={{ fontSize: "1.7rem", fontWeight: 800 }}>{code.name}</h1>
            {mastered && <span className="cl-chip cl-amber">⭐ Dominado</span>}
            {complete && !mastered && <span className="cl-chip">✅ Concluído</span>}
          </div>
          <p className="cl-muted" style={{ marginTop: 2 }}>{code.tagline}</p>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            <span className="cl-chip">{"⭐".repeat(code.difficulty)} dificuldade</span>
            <span className="cl-chip">{code.category}</span>
            <span className="cl-chip">{total} lições</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(code.id)}
          className="cl-btn cl-btn-ghost"
          style={{ width: 42, height: 42, padding: 0, borderColor: isFav ? "var(--cl-amber)" : "var(--cl-border)", color: isFav ? "var(--cl-amber)" : "var(--cl-text)" }}
          aria-label="Favoritar curso"
        >
          {isFav ? "★" : "☆"}
        </button>
      </div>

      {/* Progresso */}
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 6 }}>
          <span>Progresso do curso</span>
          <span className="cl-amber" style={{ fontWeight: 700 }}>{done}/{total}</span>
        </div>
        <div className="cl-progress"><span style={{ width: `${pct * 100}%` }} /></div>
      </div>

      {/* Lições em sequência */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {COURSE_LESSONS.map((lesson, i) => {
          const unlocked = ready ? isLessonUnlocked(code.id, lesson.type) : i === 0;
          const lessonDone = !!cp?.lessons[lesson.type]?.completed;
          const score = cp?.lessons[lesson.type]?.bestScore;
          const classes = `cl-lesson-row ${unlocked ? "cl-lesson-unlocked" : "cl-lesson-locked"} ${lessonDone ? "cl-lesson-done" : ""}`;
          const inner = (
            <>
              <div className="cl-lesson-icon">{unlocked ? lesson.icon : "🔒"}</div>
              <div style={{ flex: 1 }}>
                <div className="cl-display" style={{ fontWeight: 700 }}>{lesson.title}</div>
                <div className="cl-muted" style={{ fontSize: "0.78rem" }}>{lesson.desc}</div>
              </div>
              {lessonDone ? (
                <span className="cl-chip cl-amber">
                  ✓ {score !== undefined ? `${Math.round(score * 100)}%` : "feito"}
                </span>
              ) : unlocked ? (
                <span className="cl-amber" style={{ fontSize: "1.2rem" }}>→</span>
              ) : null}
            </>
          );
          return unlocked ? (
            <Link key={lesson.type} href={`/codelingo/lesson/${code.id}?type=${lesson.type}`} className={classes} style={{ textDecoration: "none", color: "inherit" }}>
              {inner}
            </Link>
          ) : (
            <div key={lesson.type} className={classes} title="Conclua a lição anterior para desbloquear">{inner}</div>
          );
        })}
      </div>

      {/* Conteúdo de referência */}
      <div className="cl-card" style={{ padding: 20, marginTop: 26 }}>
        <div className="cl-display" style={{ fontWeight: 700, marginBottom: 8 }}>🕰️ Sobre {code.name}</div>
        <p className="cl-muted" style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
          {code.content.origin} — {code.content.inventor}
        </p>
        {code.alphabetHint && (
          <pre style={{ marginTop: 10, padding: 10, background: "var(--cl-surface)", borderRadius: 10, color: "var(--cl-amber)", fontFamily: "var(--font-grotesk)", fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
            {code.alphabetHint}
          </pre>
        )}
      </div>
    </div>
  );
}
