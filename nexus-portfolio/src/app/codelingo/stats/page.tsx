"use client";

import { useMemo } from "react";
import { CODES } from "@/codelingo/codes";
import { isCourseComplete, leagueFromXp, levelFromXp, useStore } from "@/codelingo/store";

const AMBER = "#FFC107";

export default function StatsPage() {
  const { p } = useStore();

  // XP por dia (últimos 7 dias)
  const daily = useMemo(() => {
    const days: { label: string; xp: number; key: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const xp = p.history.filter((h) => h.date === key).reduce((s, h) => s + h.xp, 0);
      days.push({ label: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.getDay()], xp, key });
    }
    return days;
  }, [p.history]);
  const maxXp = Math.max(1, ...daily.map((d) => d.xp));

  const level = levelFromXp(p.xp);
  const league = leagueFromXp(p.xp);
  const completed = Object.values(p.courses).filter((c) => isCourseComplete(c)).length;
  const mastered = Object.values(p.courses).filter((c) => c.mastered).length;
  const totalAnswered = p.history.reduce((s, h) => s + h.total, 0);
  const precision = totalAnswered > 0 ? Math.round((p.totalCorrect / totalAnswered) * 100) : 0;

  // Precisão por curso jogado
  const perCourse = useMemo(
    () =>
      CODES.filter((c) => p.courses[c.id]?.attempts)
        .map((c) => ({ name: c.name, icon: c.icon, score: Math.round((p.courses[c.id].bestScore || 0) * 100) }))
        .sort((a, b) => b.score - a.score),
    [p.courses],
  );

  return (
    <div className="cl-fade-up" style={{ display: "grid", gap: 20 }}>
      <h1 className="cl-display" style={{ fontSize: "1.8rem", fontWeight: 800 }}>📊 Estatísticas</h1>

      {/* Cartões-resumo */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        <Big icon="⚡" label="XP total" value={`${p.xp}`} />
        <Big icon="📈" label="Nível" value={`${level}`} />
        <Big icon={league.icon} label="Liga" value={league.name} />
        <Big icon="🎯" label="Precisão" value={`${precision}%`} />
        <Big icon="🔥" label="Sequência" value={`${p.streak}d`} />
        <Big icon="⏱️" label="Tempo" value={`${p.minutesStudied}min`} />
        <Big icon="✅" label="Lições" value={`${p.history.length}`} />
        <Big icon="⭐" label="Dominados" value={`${mastered}`} />
      </section>

      {/* XP nos últimos 7 dias */}
      <section className="cl-card" style={{ padding: 20 }}>
        <h2 className="cl-display" style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 18 }}>XP nos últimos 7 dias</h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160 }}>
          {daily.map((d) => (
            <div key={d.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
              <div className="cl-amber cl-display" style={{ fontSize: "0.72rem", fontWeight: 700 }}>{d.xp || ""}</div>
              <div
                style={{
                  width: "100%",
                  maxWidth: 42,
                  height: `${(d.xp / maxXp) * 100}%`,
                  minHeight: d.xp > 0 ? 6 : 2,
                  background: d.xp > 0 ? `linear-gradient(180deg, ${AMBER}, #FFB300)` : "var(--cl-border)",
                  borderRadius: 8,
                  transition: "height 0.6s cubic-bezier(0.22,1,0.36,1)",
                }}
              />
              <div className="cl-muted" style={{ fontSize: "0.7rem" }}>{d.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Progresso geral (donut) */}
      <section className="cl-card" style={{ padding: 20, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <Donut value={completed / CODES.length} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 className="cl-display" style={{ fontSize: "1.15rem", fontWeight: 700 }}>Cursos concluídos</h2>
          <p className="cl-muted" style={{ marginTop: 4 }}>
            Você concluiu <span className="cl-amber">{completed}</span> de {CODES.length} cursos e dominou{" "}
            <span className="cl-amber">{mastered}</span> códigos.
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
            {CODES.map((c) => {
              const done = isCourseComplete(p.courses[c.id]);
              const mast = p.courses[c.id]?.mastered;
              return (
                <span key={c.id} title={c.name} style={{ fontSize: "1.3rem", opacity: done ? 1 : 0.3, filter: mast ? "drop-shadow(0 0 6px rgba(255,193,7,0.6))" : "none" }}>
                  {c.icon}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* Precisão por curso */}
      <section className="cl-card" style={{ padding: 20 }}>
        <h2 className="cl-display" style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 16 }}>Precisão por código</h2>
        {perCourse.length === 0 ? (
          <p className="cl-muted" style={{ fontSize: "0.85rem" }}>Complete lições para ver seu desempenho por código aqui.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {perCourse.map((c) => (
              <div key={c.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 5 }}>
                  <span>{c.icon} {c.name}</span>
                  <span className="cl-amber cl-display" style={{ fontWeight: 700 }}>{c.score}%</span>
                </div>
                <div className="cl-progress" style={{ height: 8 }}>
                  <span style={{ width: `${c.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Calendário de estudos (heatmap simples) */}
      <section className="cl-card" style={{ padding: 20 }}>
        <h2 className="cl-display" style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 16 }}>Calendário de estudos</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: 5 }}>
          {Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            const key = d.toISOString().slice(0, 10);
            const studied = p.studyDays.includes(key);
            return (
              <div
                key={key}
                title={key}
                style={{
                  aspectRatio: "1",
                  borderRadius: 5,
                  background: studied ? AMBER : "var(--cl-surface)",
                  border: "1px solid var(--cl-border)",
                }}
              />
            );
          })}
        </div>
        <p className="cl-muted" style={{ fontSize: "0.72rem", marginTop: 10 }}>Últimos 30 dias — âmbar = dia estudado.</p>
      </section>
    </div>
  );
}

function Big({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="cl-card" style={{ padding: 14, textAlign: "center" }}>
      <div style={{ fontSize: "1.3rem" }}>{icon}</div>
      <div className="cl-display cl-amber" style={{ fontWeight: 800, fontSize: "1.15rem", marginTop: 2 }}>{value}</div>
      <div className="cl-muted" style={{ fontSize: "0.68rem" }}>{label}</div>
    </div>
  );
}

function Donut({ value }: { value: number }) {
  const size = 130;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--cl-border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={AMBER}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value)}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div className="cl-display cl-amber" style={{ fontWeight: 800, fontSize: "1.6rem" }}>{Math.round(value * 100)}%</div>
      </div>
    </div>
  );
}
