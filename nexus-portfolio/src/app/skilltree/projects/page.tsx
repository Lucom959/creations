"use client";

import Link from "next/link";
import { SKILLS } from "@/skilltree/skills";
import { useSkillTree, isUnlocked } from "@/skilltree/store";

export default function ProjectsPage() {
  const { p, ready } = useSkillTree();
  const withProjects = SKILLS.filter((s) => s.project);

  return (
    <div className="st-fade-up">
      <h1 className="st-display" style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>🛠️ Projetos</h1>
      <p className="st-muted" style={{ fontSize: "0.85rem", marginBottom: 18 }}>Cada habilidade desbloqueia um projeto prático para você aplicar o que aprendeu de verdade.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {withProjects.map((s, i) => {
          const unlocked = ready && isUnlocked(p, s.id);
          const done = p.skills[s.id]?.projectDone;
          return (
            <Link key={s.id} href={unlocked ? `/skilltree/project/${s.id}` : `/skilltree/skill/${s.id}`} className="st-card st-hover st-stagger-in" style={{ padding: 18, textDecoration: "none", color: "inherit", ["--st-stagger" as string]: `${i * 0.05}s`, opacity: unlocked ? 1 : 0.6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.8rem" }}>{s.icon}</span>
                {done ? <span className="st-chip" style={{ color: "var(--st-cyan)", borderColor: "var(--st-cyan)" }}>✅ Concluído</span> : !unlocked && <span className="st-chip">🔒 Bloqueado</span>}
              </div>
              <div className="st-display" style={{ fontWeight: 700, marginTop: 8 }}>{s.project!.title}</div>
              <div className="st-muted" style={{ fontSize: "0.78rem", marginTop: 4 }}>{s.project!.description}</div>
              <div className="st-chip" style={{ marginTop: 10 }}>Habilidade: {s.name}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
