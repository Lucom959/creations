"use client";

import { useMemo } from "react";
import { DOMAINS, SKILLS } from "@/skilltree/skills";
import { useSkillTree, levelFromXp } from "@/skilltree/store";

export default function StatsPage() {
  const { p } = useSkillTree();
  const level = levelFromXp(p.xp);

  const last7Days = useMemo(() => {
    const days: { label: string; xp: number; key: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const xp = p.xpHistory.filter((h) => h.date === key).reduce((s, h) => s + h.amount, 0);
      days.push({ label: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.getDay()], xp, key });
    }
    return days;
  }, [p.xpHistory]);
  const maxXp = Math.max(1, ...last7Days.map((d) => d.xp));

  const last6Months = useMemo(() => {
    const months: { label: string; xp: number; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const xp = p.xpHistory.filter((h) => h.date.startsWith(key)).reduce((s, h) => s + h.amount, 0);
      months.push({ label: d.toLocaleDateString("pt-BR", { month: "short" }), xp, key });
    }
    return months;
  }, [p.xpHistory]);
  const maxMonthXp = Math.max(1, ...last6Months.map((m) => m.xp));

  const domainStats = useMemo(() => {
    return DOMAINS.map((d) => {
      const total = SKILLS.filter((s) => s.domainId === d.id).length;
      const done = Object.keys(p.skills).filter((id) => SKILLS.find((s) => s.id === id)?.domainId === d.id).length;
      return { ...d, total, done };
    }).sort((a, b) => b.done - a.done);
  }, [p.skills]);

  const topDomain = domainStats[0];
  const projectsDone = Object.values(p.skills).filter((s) => s.projectDone).length;

  return (
    <div className="st-fade-up" style={{ display: "grid", gap: 20 }}>
      <h1 className="st-display" style={{ fontSize: "1.5rem", fontWeight: 800 }}>📊 Estatísticas</h1>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
        <Big icon="⚡" label="XP total" value={`${p.xp}`} />
        <Big icon="📈" label="Nível" value={`${level}`} />
        <Big icon="⏱️" label="Tempo total" value={`${Math.round(p.totalMinutes / 60)}h ${p.totalMinutes % 60}m`} />
        <Big icon="🌳" label="Habilidades" value={`${Object.keys(p.skills).length}/${SKILLS.length}`} />
        <Big icon="🛠️" label="Projetos" value={`${projectsDone}`} />
        <Big icon="🔥" label="Sequência" value={`${p.streak}d`} />
      </section>

      <section className="st-card" style={{ padding: 20 }}>
        <h2 className="st-display" style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 16 }}>XP nos últimos 7 dias</h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 150 }}>
          {last7Days.map((d) => (
            <div key={d.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
              <div className="st-cyan st-display" style={{ fontSize: "0.68rem", fontWeight: 700 }}>{d.xp || ""}</div>
              <div style={{ width: "100%", maxWidth: 38, height: `${(d.xp / maxXp) * 100}%`, minHeight: d.xp > 0 ? 6 : 2, background: d.xp > 0 ? "linear-gradient(180deg, var(--st-cyan), var(--st-blue))" : "var(--st-border)", borderRadius: 8 }} />
              <div className="st-muted" style={{ fontSize: "0.68rem" }}>{d.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="st-card" style={{ padding: 20 }}>
        <h2 className="st-display" style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 16 }}>Evolução mensal</h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 130 }}>
          {last6Months.map((m) => (
            <div key={m.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
              <div style={{ width: "100%", maxWidth: 44, height: `${(m.xp / maxMonthXp) * 100}%`, minHeight: m.xp > 0 ? 6 : 2, background: "linear-gradient(180deg, var(--st-purple), var(--st-blue))", borderRadius: 8 }} />
              <div className="st-muted" style={{ fontSize: "0.68rem", textTransform: "capitalize" }}>{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="st-card" style={{ padding: 20 }}>
        <h2 className="st-display" style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 4 }}>Áreas de estudo</h2>
        {topDomain && topDomain.done > 0 && (
          <p className="st-muted" style={{ fontSize: "0.82rem", marginBottom: 14 }}>Área mais estudada: <span className="st-cyan" style={{ fontWeight: 700 }}>{topDomain.icon} {topDomain.name}</span></p>
        )}
        <div style={{ display: "grid", gap: 10 }}>
          {domainStats.map((d) => (
            <div key={d.id}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 4 }}>
                <span>{d.icon} {d.name}</span>
                <span className="st-cyan" style={{ fontWeight: 700 }}>{d.done}/{d.total}</span>
              </div>
              <div className="st-progress" style={{ height: 6 }}><span style={{ width: `${d.total > 0 ? (d.done / d.total) * 100 : 0}%`, background: d.color }} /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Big({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="st-card" style={{ padding: 14, textAlign: "center" }}>
      <div style={{ fontSize: "1.2rem" }}>{icon}</div>
      <div className="st-display st-cyan" style={{ fontWeight: 800, fontSize: "1.05rem", marginTop: 2 }}>{value}</div>
      <div className="st-muted" style={{ fontSize: "0.65rem" }}>{label}</div>
    </div>
  );
}
