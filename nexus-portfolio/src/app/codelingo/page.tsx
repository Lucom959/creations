"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CODES, getCode } from "@/codelingo/codes";
import { getCourseSteps } from "@/codelingo/curriculum";
import {
  courseLessonsDone,
  isCourseComplete,
  leagueFromXp,
  levelProgress,
  LEAGUES,
  useStore,
} from "@/codelingo/store";
import { ACHIEVEMENTS } from "@/codelingo/achievements";
import ProgressRing from "@/components/codelingo/ProgressRing";

export default function Dashboard() {
  const { p, ready, courseProgress, achievementInput } = useStore();

  const lp = levelProgress(p.xp);
  const league = leagueFromXp(p.xp);
  const dailyDone = p.dailyDate === new Date().toISOString().slice(0, 10) ? p.dailyXp : 0;
  const dailyPct = Math.min(1, dailyDone / p.dailyGoal);

  const unlockedAch = useMemo(() => ACHIEVEMENTS.filter((a) => a.check(achievementInput)), [achievementInput]);
  const recentAch = useMemo(
    () => p.achievements.slice(-3).reverse().map((id) => ACHIEVEMENTS.find((a) => a.id === id)).filter(Boolean),
    [p.achievements],
  );

  // Cursos em andamento (começados, não concluídos) — ordenados por atividade mais recente
  const inProgress = useMemo(() => {
    const touched = [...new Set(p.history.map((h) => h.codeId))].reverse();
    return touched
      .map((id) => getCode(id))
      .filter((c): c is NonNullable<typeof c> => !!c && !isCourseComplete(c.id, p.courses[c.id]))
      .slice(0, 4);
  }, [p.history, p.courses]);

  const completedCourses = CODES.filter((c) => isCourseComplete(c.id, p.courses[c.id]));

  // Progresso geral: lições concluídas em todos os cursos / total de lições existentes.
  const overallPct = useMemo(() => {
    const totalAll = CODES.reduce((s, c) => s + getCourseSteps(c.id).length, 0);
    const doneAll = CODES.reduce((s, c) => s + courseLessonsDone(c.id, p.courses[c.id]), 0);
    return totalAll > 0 ? doneAll / totalAll : 0;
  }, [p.courses]);

  // Recomendação de revisão: cursos com pior desempenho entre os já iniciados
  const reviewSuggestions = useMemo(() => {
    return CODES.filter((c) => {
      const cp = p.courses[c.id];
      return cp && courseLessonsDone(c.id, cp) > 0 && cp.bestScore < 0.8 && !cp.mastered;
    })
      .sort((a, b) => (p.courses[a.id]?.bestScore ?? 1) - (p.courses[b.id]?.bestScore ?? 1))
      .slice(0, 2);
  }, [p.courses]);

  const lastCode = p.lastCourse ? getCode(p.lastCourse) : undefined;
  const lastCp = lastCode ? courseProgress(lastCode.id) : undefined;
  const lastNextStep = lastCode ? getCourseSteps(lastCode.id).find((s) => !lastCp?.lessons[s.id]?.completed) : undefined;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <div className="cl-fade-up">
      {/* Resumo + Continuar de onde parei */}
      <section className="cl-card" style={{ padding: 22, display: "grid", gap: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div className="cl-muted" style={{ fontSize: "0.85rem" }}>
              {greeting}, {p.avatar} {p.name}
            </div>
            <h1 className="cl-display" style={{ fontSize: "1.9rem", fontWeight: 800, marginTop: 2 }}>
              Nível {lp.level} · <span className="cl-amber">{league.icon} {league.name}</span>
            </h1>
            <div style={{ marginTop: 12, maxWidth: 360 }}>
              <div className="cl-progress"><span style={{ width: `${lp.pct * 100}%` }} /></div>
              <div className="cl-muted" style={{ fontSize: "0.75rem", marginTop: 6 }}>
                {lp.into}/{lp.span} XP para o nível {lp.level + 1}
              </div>
            </div>
          </div>

          <ProgressRing value={dailyPct} size={116}>
            <div>
              <div className="cl-display cl-amber" style={{ fontSize: "1.5rem", fontWeight: 800 }}>{dailyDone}</div>
              <div className="cl-muted" style={{ fontSize: "0.68rem" }}>/ {p.dailyGoal} XP hoje</div>
            </div>
          </ProgressRing>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))", gap: 10 }}>
          <Metric icon="🔥" label="Sequência" value={`${p.streak}d`} />
          <Metric icon="⚡" label="XP total" value={`${p.xp}`} />
          <Metric icon="✅" label="Cursos" value={`${completedCourses.length}/${CODES.length}`} />
          <Metric icon="📈" label="Progresso geral" value={`${Math.round(overallPct * 100)}%`} />
          <Metric icon="🏅" label="Conquistas" value={`${unlockedAch.length}/${ACHIEVEMENTS.length}`} />
        </div>

        {/* Botão grande de continuar — a ação principal da Home */}
        {lastCode && lastNextStep ? (
          <Link href={`/codelingo/lesson/${lastCode.id}?type=${lastNextStep.id}`} className="cl-btn cl-btn-amber cl-glow" style={{ padding: "18px 24px", fontSize: "1.05rem", width: "100%" }}>
            ▶ Continuar aprendendo — {lastCode.icon} {lastCode.name}
          </Link>
        ) : (
          <Link href="/codelingo/courses" className="cl-btn cl-btn-amber cl-glow" style={{ padding: "18px 24px", fontSize: "1.05rem", width: "100%" }}>
            🚀 Começar a aprender agora
          </Link>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/codelingo/courses" className="cl-btn cl-btn-ghost" style={{ padding: "12px 22px", fontSize: "0.95rem" }}>
            🗂️ Escolha um Código
          </Link>
          {p.freezes > 0 && (
            <span className="cl-chip" title="Congelamentos de sequência disponíveis" style={{ alignSelf: "center" }}>
              🧊 {p.freezes} freeze{p.freezes > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </section>

      {/* Continue aprendendo — cursos em andamento */}
      {inProgress.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <SectionHeader icon="📚" title="Continue aprendendo" href="/codelingo/courses" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {inProgress.map((code, i) => {
              const cp = p.courses[code.id];
              const courseSteps = getCourseSteps(code.id);
              const done = courseLessonsDone(code.id, cp);
              const nextStep = courseSteps.find((s) => !cp?.lessons[s.id]?.completed);
              return (
                <Link key={code.id} href={nextStep ? `/codelingo/lesson/${code.id}?type=${nextStep.id}` : `/codelingo/course/${code.id}`} className="cl-course-card cl-stagger-in" style={{ textDecoration: "none", color: "inherit", ["--cl-stagger" as string]: `${i * 0.06}s` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "1.8rem" }}>{code.icon}</span>
                    <span className="cl-chip">{done}/{courseSteps.length}</span>
                  </div>
                  <div className="cl-display" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{code.name}</div>
                  {nextStep && <div className="cl-muted" style={{ fontSize: "0.72rem" }}>Próximo: {nextStep.title}</div>}
                  <div className="cl-progress" style={{ height: 6 }}>
                    <span style={{ width: `${(done / courseSteps.length) * 100}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Recomendações de revisão */}
      {reviewSuggestions.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <SectionHeader icon="🔁" title="Recomendado para revisar" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {reviewSuggestions.map((code) => {
              const cp = p.courses[code.id];
              const step = getCourseSteps(code.id).find((s) => s.kind === "review");
              return (
                <Link key={code.id} href={step ? `/codelingo/lesson/${code.id}?type=${step.id}` : `/codelingo/course/${code.id}`} className="cl-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "inherit" }}>
                  <span style={{ fontSize: "1.8rem" }}>{code.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div className="cl-display" style={{ fontWeight: 700 }}>{code.name}</div>
                    <div className="cl-muted" style={{ fontSize: "0.75rem" }}>Precisão atual: {Math.round((cp?.bestScore ?? 0) * 100)}% — reforce este código</div>
                  </div>
                  <span className="cl-amber">→</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Conquistas recentes */}
      {recentAch.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <SectionHeader icon="🏅" title="Conquistas recentes" href="/codelingo/profile" />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {recentAch.map((a) => a && (
              <div key={a.id} className="cl-chip" style={{ padding: "10px 14px", fontSize: "0.85rem" }}>
                {a.icon} {a.name}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cursos concluídos */}
      {completedCourses.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <SectionHeader icon="✅" title="Cursos concluídos" />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {completedCourses.map((c) => {
              const mastered = !!p.courses[c.id]?.mastered;
              return (
                <Link key={c.id} href={`/codelingo/course/${c.id}`} className="cl-chip" style={{ textDecoration: "none", padding: "8px 12px", borderColor: mastered ? "var(--cl-amber)" : "var(--cl-border)" }}>
                  {c.icon} {c.name} {mastered && <span className="cl-amber">⭐</span>}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Comece por aqui (novos cursos) */}
      <section style={{ marginBottom: 36 }}>
        <SectionHeader icon="🧭" title="Explore novos cursos" href="/codelingo/courses" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {CODES.filter((c) => !p.courses[c.id]).slice(0, 4).map((code, i) => (
            <Link key={code.id} href={`/codelingo/course/${code.id}`} className="cl-course-card cl-stagger-in" style={{ textDecoration: "none", color: "inherit", ["--cl-stagger" as string]: `${i * 0.06}s` }}>
              <span style={{ fontSize: "1.8rem" }}>{code.icon}</span>
              <div className="cl-display" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{code.name}</div>
              <div className="cl-muted" style={{ fontSize: "0.72rem" }}>{"⭐".repeat(code.difficulty)}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Ligas */}
      <section>
        <SectionHeader icon="🏆" title="Sistema de ligas" />
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
          {LEAGUES.map((l) => {
            const active = league.id === l.id;
            const reached = p.xp >= l.min;
            return (
              <div
                key={l.id}
                className="cl-card cl-node-hover"
                style={{
                  minWidth: 120,
                  padding: 14,
                  textAlign: "center",
                  opacity: reached ? 1 : 0.5,
                  borderColor: active ? "var(--cl-amber)" : "var(--cl-border)",
                  boxShadow: active ? "0 0 0 2px rgba(255,193,7,0.22)" : "none",
                }}
              >
                <div style={{ fontSize: "1.8rem" }}>{l.icon}</div>
                <div className="cl-display" style={{ fontWeight: 700, marginTop: 4 }}>{l.name}</div>
                <div className="cl-muted" style={{ fontSize: "0.72rem" }}>{l.min}+ XP</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ icon, title, href }: { icon: string; title: string; href?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
      <h2 className="cl-display" style={{ fontSize: "1.3rem", fontWeight: 700 }}>{icon} {title}</h2>
      {href && <Link href={href} className="cl-amber" style={{ fontSize: "0.8rem", textDecoration: "none" }}>Ver todos →</Link>}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="cl-surface" style={{ borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
      <div style={{ fontSize: "1.2rem" }}>{icon}</div>
      <div className="cl-display cl-amber" style={{ fontWeight: 800, fontSize: "1.1rem" }}>{value}</div>
      <div className="cl-muted" style={{ fontSize: "0.68rem" }}>{label}</div>
    </div>
  );
}
