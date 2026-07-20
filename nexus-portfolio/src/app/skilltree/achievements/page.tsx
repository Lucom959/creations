"use client";

import { useMemo, useState } from "react";
import { ACHIEVEMENTS } from "@/skilltree/achievements";
import { useSkillTree } from "@/skilltree/store";

export default function AchievementsPage() {
  const { achievementInput } = useSkillTree();
  const [filter, setFilter] = useState<"all" | "done" | "locked">("all");

  const unlocked = useMemo(() => new Set(ACHIEVEMENTS.filter((a) => a.check(achievementInput)).map((a) => a.id)), [achievementInput]);
  const list = ACHIEVEMENTS.filter((a) => (filter === "done" ? unlocked.has(a.id) : filter === "locked" ? !unlocked.has(a.id) : true));

  return (
    <div className="st-fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <h1 className="st-display" style={{ fontSize: "1.5rem", fontWeight: 800 }}>🏅 Conquistas</h1>
        <span className="st-cyan" style={{ fontWeight: 700 }}>{unlocked.size}/{ACHIEVEMENTS.length}</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {(["all", "done", "locked"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className="st-chip" style={{ cursor: "pointer", borderColor: filter === f ? "var(--st-cyan)" : "var(--st-border)", color: filter === f ? "var(--st-cyan)" : "var(--st-text)" }}>
            {f === "all" ? "Todas" : f === "done" ? "Conquistadas" : "Bloqueadas"}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
        {list.map((a, i) => {
          const done = unlocked.has(a.id);
          const prog = a.progress ? a.progress(achievementInput) : done ? 1 : 0;
          return (
            <div key={a.id} className="st-card st-stagger-in" style={{ padding: 14, opacity: done ? 1 : 0.55, borderColor: done ? "var(--st-cyan)" : "var(--st-border)", ["--st-stagger" as string]: `${(i % 20) * 0.03}s` }} title={a.desc}>
              <div style={{ fontSize: "1.5rem", filter: done ? "none" : "grayscale(1)" }}>{a.icon}</div>
              <div className="st-display" style={{ fontWeight: 700, fontSize: "0.82rem", marginTop: 4 }}>{a.name}</div>
              <div className="st-muted" style={{ fontSize: "0.68rem", marginTop: 2, lineHeight: 1.3 }}>{a.desc}</div>
              {!done && a.progress && <div className="st-progress" style={{ marginTop: 8, height: 5 }}><span style={{ width: `${prog * 100}%` }} /></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
