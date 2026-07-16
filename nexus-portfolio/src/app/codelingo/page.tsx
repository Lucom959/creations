"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CODES } from "@/codelingo/codes";
import { leagueFromXp, levelProgress, useStore, LEAGUES } from "@/codelingo/store";
import { ACHIEVEMENTS } from "@/codelingo/achievements";
import ProgressRing from "@/components/codelingo/ProgressRing";

export default function Dashboard() {
  const { p, ready, isUnlocked, achievementInput } = useStore();

  const lp = levelProgress(p.xp);
  const league = leagueFromXp(p.xp);
  const dailyDone = p.dailyDate === new Date().toISOString().slice(0, 10) ? p.dailyXp : 0;
  const dailyPct = Math.min(1, dailyDone / p.dailyGoal);

  const unlockedAch = useMemo(
    () => ACHIEVEMENTS.filter((a) => a.check(achievementInput)),
    [achievementInput],
  );
  const completedCount = Object.values(p.courses).filter((c) => c.completed).length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <div className="cl-fade-up">
      {/* Resumo */}
      <section
        className="cl-card"
        style={{ padding: 20, display: "grid", gap: 20, gridTemplateColumns: "1fr", marginBottom: 24 }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div className="cl-muted" style={{ fontSize: "0.85rem" }}>
              {greeting}, {p.avatar} {p.name}
            </div>
            <h1 className="cl-display" style={{ fontSize: "1.9rem", fontWeight: 800, marginTop: 2 }}>
              Nível {lp.level} · <span className="cl-amber">{league.icon} {league.name}</span>
            </h1>
            <div style={{ marginTop: 12, maxWidth: 360 }}>
              <div className="cl-progress">
                <span style={{ width: `${lp.pct * 100}%` }} />
              </div>
              <div className="cl-muted" style={{ fontSize: "0.75rem", marginTop: 6 }}>
                {lp.into}/{lp.span} XP para o nível {lp.level + 1}
              </div>
            </div>
          </div>

          {/* Meta diária */}
          <ProgressRing value={dailyPct} size={116}>
            <div>
              <div className="cl-display cl-amber" style={{ fontSize: "1.5rem", fontWeight: 800 }}>
                {dailyDone}
              </div>
              <div className="cl-muted" style={{ fontSize: "0.68rem" }}>/ {p.dailyGoal} XP hoje</div>
            </div>
          </ProgressRing>
        </div>

        {/* Métricas rápidas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          <Metric icon="🔥" label="Sequência" value={`${p.streak}d`} />
          <Metric icon="⚡" label="XP total" value={`${p.xp}`} />
          <Metric icon="✅" label="Cursos" value={`${completedCount}/${CODES.length}`} />
          <Metric icon="🏅" label="Conquistas" value={`${unlockedAch.length}/${ACHIEVEMENTS.length}`} />
        </div>

        {/* Continuar */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href={`/codelingo/lesson/${p.lastLesson ?? CODES[0].id}`}
            className="cl-btn cl-btn-amber"
            style={{ padding: "12px 22px", fontSize: "0.95rem" }}
          >
            {p.lastLesson ? "▶ Continuar estudando" : "🚀 Começar agora"}
          </Link>
          {p.freezes > 0 && (
            <span className="cl-chip" title="Congelamentos de sequência disponíveis">
              🧊 {p.freezes} freeze{p.freezes > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </section>

      {/* Árvore de aprendizado */}
      <section>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 className="cl-display" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
            Árvore de aprendizado
          </h2>
          <span className="cl-muted" style={{ fontSize: "0.8rem" }}>{CODES.length} cursos</span>
        </div>

        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          {CODES.map((code, i) => {
            const unlocked = ready ? isUnlocked(code.id) : i === 0;
            const done = !!p.courses[code.id]?.completed;
            const mastered = !!p.courses[code.id]?.mastered;
            // serpentina: deslocamento horizontal
            const offset = Math.sin(i * 0.9) * 90;
            const state = done ? "done" : unlocked ? "active" : "locked";
            return (
              <div key={code.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                {i > 0 && (
                  <div
                    style={{
                      width: 4,
                      height: 26,
                      borderRadius: 2,
                      background: done || unlocked ? "var(--cl-amber-800)" : "var(--cl-border)",
                      opacity: 0.6,
                    }}
                  />
                )}
                <div style={{ transform: `translateX(${offset}px)`, display: "flex", alignItems: "center", gap: 14 }}>
                  <NodeCard code={code} state={state} mastered={mastered} align={offset >= 0 ? "left" : "right"} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ligas */}
      <section style={{ marginTop: 36 }}>
        <h2 className="cl-display" style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 16 }}>
          Sistema de ligas
        </h2>
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

function NodeCard({
  code,
  state,
  mastered,
  align,
}: {
  code: (typeof CODES)[number];
  state: "done" | "active" | "locked";
  mastered: boolean;
  align: "left" | "right";
}) {
  const node = (
    <div
      className={`cl-node ${state === "done" ? "cl-node-done" : state === "active" ? "cl-node-active" : "cl-node-locked"}`}
    >
      {state === "locked" ? "🔒" : code.icon}
      {state === "done" && <span className="cl-tick">✓</span>}
    </div>
  );
  const label = (
    <div style={{ textAlign: align === "left" ? "left" : "right" }}>
      <div className="cl-display" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{code.name}</div>
      <div className="cl-muted" style={{ fontSize: "0.72rem" }}>
        {"⭐".repeat(code.difficulty)} · {code.category}
        {mastered && <span className="cl-amber"> · dominado</span>}
      </div>
    </div>
  );

  if (state === "locked") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 14, cursor: "not-allowed" }} title="Conclua o curso anterior para desbloquear">
        {align === "right" && label}
        {node}
        {align === "left" && label}
      </div>
    );
  }

  return (
    <Link href={`/codelingo/lesson/${code.id}`} style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "inherit" }}>
      {align === "right" && label}
      {node}
      {align === "left" && label}
    </Link>
  );
}
