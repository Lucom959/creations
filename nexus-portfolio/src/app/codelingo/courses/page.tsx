"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CODES, CodeModule } from "@/codelingo/codes";
import { TOTAL_STEPS, TOTAL_UNITS } from "@/codelingo/curriculum";
import { CourseProgress, courseLessonsDone, isCourseComplete, useStore } from "@/codelingo/store";

const CATEGORIES = ["Todas", "Fundamentos", "Numéricos", "Cifras", "Táteis & Visuais", "Comunicação"] as const;

export default function CoursesPage() {
  const { p, ready, courseProgress } = useStore();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Todas");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CODES.filter((c) => {
      if (category !== "Todas" && c.category !== category) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.tagline.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [category, query]);

  return (
    <div className="cl-fade-up">
      <div style={{ marginBottom: 22 }}>
        <span className="cl-amber" style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Trilha de aprendizado
        </span>
        <h1 className="cl-display" style={{ fontSize: "2rem", fontWeight: 800, marginTop: 4 }}>
          Escolha um Código
        </h1>
        <p className="cl-muted" style={{ marginTop: 6, maxWidth: 560 }}>
          Cada código é um curso completo e independente, com {TOTAL_UNITS} unidades e {TOTAL_STEPS} lições — do zero absoluto até a prova final. Escolha por onde começar: o progresso de um curso nunca afeta o dos outros.
        </p>
      </div>

      {/* Busca + filtro de categoria */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        <input
          className="cl-input"
          placeholder="Buscar um código..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 340 }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className="cl-chip"
              style={{
                cursor: "pointer",
                borderColor: category === cat ? "var(--cl-amber)" : "var(--cl-border)",
                color: category === cat ? "var(--cl-amber)" : "var(--cl-text)",
                background: category === cat ? "rgba(255,193,7,0.12)" : "var(--cl-glass)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de cursos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
        {filtered.map((code) => (
          <CourseCard
            key={code.id}
            code={code}
            cp={ready ? courseProgress(code.id) : undefined}
          />
        ))}
        {filtered.length === 0 && (
          <p className="cl-muted" style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0" }}>
            Nenhum código encontrado com esse filtro.
          </p>
        )}
      </div>
    </div>
  );
}

function CourseCard({ code, cp }: { code: CodeModule; cp: CourseProgress | undefined }) {
  const done = courseLessonsDone(cp);
  const total = TOTAL_STEPS;
  const pct = total > 0 ? done / total : 0;
  const started = done > 0;
  const complete = isCourseComplete(cp);
  const mastered = !!cp?.mastered;

  return (
    <Link
      href={`/codelingo/course/${code.id}`}
      className={`cl-course-card ${mastered ? "cl-mastered" : ""}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "2.1rem" }}>{code.icon}</span>
        {mastered ? (
          <span className="cl-chip cl-amber" title="Dominado">⭐ Dominado</span>
        ) : complete ? (
          <span className="cl-chip" title="Curso concluído">✅ Concluído</span>
        ) : (
          <span className="cl-chip" title="Dificuldade">{"⭐".repeat(code.difficulty)}</span>
        )}
      </div>

      <div>
        <h3 className="cl-display" style={{ fontWeight: 700, fontSize: "1.05rem" }}>{code.name}</h3>
        <p className="cl-muted" style={{ fontSize: "0.78rem", marginTop: 2, lineHeight: 1.4 }}>{code.tagline}</p>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: "0.7rem" }}>
        <span className="cl-chip">{code.category}</span>
        <span className="cl-chip">{total} lições</span>
      </div>

      <div>
        <div className="cl-progress" style={{ height: 8 }}>
          <span style={{ width: `${pct * 100}%` }} />
        </div>
        <div className="cl-muted" style={{ fontSize: "0.7rem", marginTop: 5 }}>{done}/{total} lições concluídas</div>
      </div>

      <span
        className="cl-btn cl-btn-amber"
        style={{ padding: "10px 0", fontSize: "0.85rem", marginTop: 4 }}
      >
        {started ? "Continuar" : "Começar"} →
      </span>
    </Link>
  );
}
