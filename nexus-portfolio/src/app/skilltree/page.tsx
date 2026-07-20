"use client";

import Link from "next/link";
import { useMemo } from "react";
import { SKILLS, getSkill, DOMAINS } from "@/skilltree/skills";
import { ACHIEVEMENTS } from "@/skilltree/achievements";
import { useSkillTree, levelProgress, isAvailable, isUnlocked } from "@/skilltree/store";

export default function SkillTreeHome() {
  const { p, ready, achievementInput } = useSkillTree();
  const lp = levelProgress(p.xp);

  const unlockedIds = useMemo(() => Object.keys(p.skills), [p.skills]);
  const unlockedSkills = useMemo(() => unlockedIds.map((id) => getSkill(id)).filter(Boolean), [unlockedIds]);

  const recentUnlocks = useMemo(
    () => [...unlockedSkills].sort((a, b) => (p.skills[b!.id]?.unlockedAt ?? "").localeCompare(p.skills[a!.id]?.unlockedAt ?? "")).slice(0, 4),
    [unlockedSkills, p.skills],
  );

  const inProgressProjects = useMemo(
    () => unlockedSkills.filter((s) => s?.project && !p.skills[s.id]?.projectDone).slice(0, 3),
    [unlockedSkills, p.skills],
  );

  const nextRecommended = useMemo(() => {
    const available = SKILLS.filter((s) => ready && isAvailable(p, s.id) && !isUnlocked(p, s.id));
    return available.sort((a, b) => a.difficulty - b.difficulty)[0];
  }, [p, ready]);

  const unlockedAchievements = useMemo(() => ACHIEVEMENTS.filter((a) => a.check(achievementInput)), [achievementInput]);
  const recentAchievements = useMemo(
    () => p.achievements.slice(-3).reverse().map((id) => ACHIEVEMENTS.find((a) => a.id === id)).filter(Boolean),
    [p.achievements],
  );

  const goalPct = Math.min(1, p.minutesTodayDate === new Date().toISOString().slice(0, 10) ? p.minutesToday / p.dailyGoalMinutes : 0);
  const minutesToday = p.minutesTodayDate === new Date().toISOString().slice(0, 10) ? p.minutesToday : 0;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <div className="st-fade-up" style={{ display: "grid", gap: 26 }}>
      {/* Resumo */}
      <section className="st-card" style={{ padding: 24 }}>
        <div className="st-muted" style={{ fontSize: "0.85rem" }}>{greeting}, {p.profile.avatar} {p.profile.name}</div>
        <h1 className="st-display" style={{ fontSize: "1.9rem", fontWeight: 800, marginTop: 2 }}>
          Nível {lp.level} · <span className="st-gradient-text">Explorador de Habilidades</span>
        </h1>
        <div style={{ marginTop: 12, maxWidth: 420 }}>
          <div className="st-progress"><span style={{ width: `${lp.pct * 100}%` }} /></div>
          <div className="st-muted" style={{ fontSize: "0.75rem", marginTop: 6 }}>{lp.into}/{lp.span} XP para o nível {lp.level + 1}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 10, marginTop: 20 }}>
          <Metric icon="🔥" label="Sequência" value={`${p.streak}d`} />
          <Metric icon="⚡" label="XP total" value={`${p.xp}`} />
          <Metric icon="⏱️" label="Hoje" value={`${minutesToday}min`} />
          <Metric icon="🌳" label="Habilidades" value={`${unlockedIds.length}/${SKILLS.length}`} />
          <Metric icon="🏅" label="Conquistas" value={`${unlockedAchievements.length}/${ACHIEVEMENTS.length}`} />
        </div>

        {nextRecommended ? (
          <Link href={`/skilltree/skill/${nextRecommended.id}`} className="st-btn st-btn-primary st-glow-pulse" style={{ padding: "16px 22px", fontSize: "1rem", width: "100%", marginTop: 20 }}>
            {nextRecommended.icon} Próxima recomendada: {nextRecommended.name} →
          </Link>
        ) : (
          <Link href="/skilltree/map" className="st-btn st-btn-primary" style={{ padding: "16px 22px", fontSize: "1rem", width: "100%", marginTop: 20 }}>
            🗺️ Explorar o mapa de habilidades
          </Link>
        )}
      </section>

      {/* Objetivo diário */}
      <section className="st-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h2 className="st-display" style={{ fontSize: "1.1rem", fontWeight: 700 }}>🎯 Objetivo diário</h2>
          <span className="st-cyan" style={{ fontWeight: 700 }}>{minutesToday}/{p.dailyGoalMinutes} min</span>
        </div>
        <div className="st-progress"><span style={{ width: `${goalPct * 100}%` }} /></div>
      </section>

      {/* Habilidades desbloqueadas recentemente */}
      {recentUnlocks.length > 0 && (
        <section>
          <SectionHeader icon="🌟" title="Desbloqueadas recentemente" href="/skilltree/map" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {recentUnlocks.map((s, i) => s && (
              <Link key={s.id} href={`/skilltree/skill/${s.id}`} className="st-card st-hover st-stagger-in" style={{ padding: 14, textDecoration: "none", color: "inherit", ["--st-stagger" as string]: `${i * 0.06}s` }}>
                <span style={{ fontSize: "1.6rem" }}>{s.icon}</span>
                <div className="st-display" style={{ fontWeight: 700, fontSize: "0.9rem", marginTop: 4 }}>{s.name}</div>
                <div className="st-muted" style={{ fontSize: "0.7rem" }}>{DOMAINS.find((d) => d.id === s.domainId)?.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Projetos em andamento */}
      {inProgressProjects.length > 0 && (
        <section>
          <SectionHeader icon="🛠️" title="Projetos em andamento" href="/skilltree/projects" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {inProgressProjects.map((s) => s?.project && (
              <Link key={s.id} href={`/skilltree/project/${s.id}`} className="st-card st-hover" style={{ padding: 16, textDecoration: "none", color: "inherit", display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: "1.7rem" }}>{s.icon}</span>
                <div>
                  <div className="st-display" style={{ fontWeight: 700 }}>{s.project.title}</div>
                  <div className="st-muted" style={{ fontSize: "0.72rem" }}>Habilidade: {s.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Conquistas recentes */}
      {recentAchievements.length > 0 && (
        <section>
          <SectionHeader icon="🏅" title="Conquistas recentes" href="/skilltree/achievements" />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {recentAchievements.map((a) => a && (
              <div key={a.id} className="st-chip" style={{ padding: "10px 14px", fontSize: "0.85rem" }}>{a.icon} {a.name}</div>
            ))}
          </div>
        </section>
      )}

      {/* Domínios */}
      <section>
        <SectionHeader icon="🧭" title="Domínios de conhecimento" href="/skilltree/map" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {DOMAINS.map((d, i) => {
            const total = SKILLS.filter((s) => s.domainId === d.id).length;
            const done = SKILLS.filter((s) => s.domainId === d.id && isUnlocked(p, s.id)).length;
            return (
              <Link key={d.id} href={`/skilltree/map?domain=${d.id}`} className="st-card st-hover st-stagger-in" style={{ padding: 14, textDecoration: "none", color: "inherit", ["--st-stagger" as string]: `${i * 0.05}s` }}>
                <span style={{ fontSize: "1.6rem" }}>{d.icon}</span>
                <div className="st-display" style={{ fontWeight: 700, fontSize: "0.88rem", marginTop: 4 }}>{d.name}</div>
                <div className="st-progress" style={{ height: 5, marginTop: 8 }}><span style={{ width: `${total > 0 ? (done / total) * 100 : 0}%`, background: d.color }} /></div>
                <div className="st-muted" style={{ fontSize: "0.68rem", marginTop: 4 }}>{done}/{total}</div>
              </Link>
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
      <h2 className="st-display" style={{ fontSize: "1.2rem", fontWeight: 700 }}>{icon} {title}</h2>
      {href && <Link href={href} className="st-cyan" style={{ fontSize: "0.8rem", textDecoration: "none" }}>Ver todos →</Link>}
    </div>
  );
}
function Metric({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="st-surface" style={{ padding: "12px 8px", textAlign: "center" }}>
      <div style={{ fontSize: "1.15rem" }}>{icon}</div>
      <div className="st-display st-cyan" style={{ fontWeight: 800, fontSize: "1.05rem" }}>{value}</div>
      <div className="st-muted" style={{ fontSize: "0.65rem" }}>{label}</div>
    </div>
  );
}
