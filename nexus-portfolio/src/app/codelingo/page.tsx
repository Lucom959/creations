"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CODES, getCode } from "@/codelingo/codes";
import { COURSE_LESSONS } from "@/codelingo/curriculum";
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
  const { p, ready, courseProgress, isLessonUnlocked, achievementInput } = useStore();

  const lp = levelProgress(p.xp);
  const league = leagueFromXp(p.xp);
  const dailyDone = p.dailyDate === new Date().toISOString().slice(0, 10) ? p.dailyXp : 0;
  const dailyPct = Math.min(1, dailyDone / p.dailyGoal);

  const unlockedAch = useMemo(() => ACHIEVEMENTS.filter((a) => a.check(achievementInput)), [achievementInput]);
  const completedCourses = CODES.filter((c) => isCourseComplete(courseProgress(c.id))).length;

  const lastCode = p.lastCourse ? getCode(p.lastCourse) : undefined;
  const lastCp = lastCode ? courseProgress(lastCode.id) : undefined;
  const lastDone = courseLessonsDone(lastCp);
  const nextLesson = lastCode ? COURSE_LESSONS.find((l) => !lastCp?.lessons[l.type]?.completed) : undefined;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <div className="cl-fade-up">
      {/* Resumo */}
      <section className="cl-card" style={{ padding: 20, display: "grid", gap: 20, marginBottom: 24 }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          <Metric icon="🔥" label="Sequência" value={`${p.streak}d`} />
          <Metric icon="⚡" label="XP total" value={`${p.xp}`} />
          <Metric icon="✅" label="Cursos" value={`${completedCourses}/${CODES.length}`} />
          <Metric icon="🏅" label="Conquistas" value={`${unlockedAch.length}/${ACHIEVEMENTS.length}`} />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/codelingo/courses" className="cl-btn cl-btn-amber" style={{ padding: "12px 22px", fontSize: "0.95rem" }}>
            🗂️ Escolha um Código
          </Link>
          {lastCode && nextLesson && (
            <Link href={`/codelingo/lesson/${lastCode.id}?type=${nextLesson.type}`} className="cl-btn cl-btn-ghost" style={{ padding: "12px 22px", fontSize: "0.95rem" }}>
              ▶ Continuar {lastCode.icon} {lastCode.name}
            </Link>
          )}
          {p.freezes > 0 && (
            <span className="cl-chip" title="Congelamentos de sequência disponíveis" style={{ alignSelf: "center" }}>
              🧊 {p.freezes} freeze{p.freezes > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </section>

      {/* Continue de onde parou */}
      {lastCode && (
        <section className="cl-card" style={{ padding: 18, marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: "2.2rem" }}>{lastCode.icon}</span>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="cl-display" style={{ fontWeight: 700 }}>{lastCode.name}</div>
            <div className="cl-muted" style={{ fontSize: "0.78rem" }}>
              {lastDone}/{COURSE_LESSONS.length} lições · último curso estudado
            </div>
            <div className="cl-progress" style={{ marginTop: 8, height: 6, maxWidth: 240 }}>
              <span style={{ width: `${(lastDone / COURSE_LESSONS.length) * 100}%` }} />
            </div>
          </div>
          <Link href={`/codelingo/course/${lastCode.id}`} className="cl-btn cl-btn-ghost" style={{ padding: "10px 18px", fontSize: "0.85rem" }}>
            Ver curso →
          </Link>
        </section>
      )}

      {/* Cursos em destaque */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 className="cl-display" style={{ fontSize: "1.4rem", fontWeight: 700 }}>Comece por aqui</h2>
          <Link href="/codelingo/courses" className="cl-amber" style={{ fontSize: "0.82rem", textDecoration: "none" }}>Ver todos →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {CODES.slice(0, 4).map((code) => {
            const cp = ready ? courseProgress(code.id) : undefined;
            const done = courseLessonsDone(cp);
            const unlocked = ready ? isLessonUnlocked(code.id, "intro") : true;
            return (
              <Link key={code.id} href={`/codelingo/course/${code.id}`} className="cl-course-card" style={{ textDecoration: "none", color: "inherit" }}>
                <span style={{ fontSize: "1.8rem" }}>{unlocked ? code.icon : "🔒"}</span>
                <div className="cl-display" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{code.name}</div>
                <div className="cl-progress" style={{ height: 6 }}>
                  <span style={{ width: `${(done / COURSE_LESSONS.length) * 100}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Ligas */}
      <section>
        <h2 className="cl-display" style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 16 }}>Sistema de ligas</h2>
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
                  boxShadow: active ? "0 0 0 2px rgba(255,213,79,0.25)" : "none",
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

function Metric({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="cl-surface" style={{ borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
      <div style={{ fontSize: "1.2rem" }}>{icon}</div>
      <div className="cl-display cl-amber" style={{ fontWeight: 800, fontSize: "1.1rem" }}>{value}</div>
      <div className="cl-muted" style={{ fontSize: "0.68rem" }}>{label}</div>
    </div>
  );
}
