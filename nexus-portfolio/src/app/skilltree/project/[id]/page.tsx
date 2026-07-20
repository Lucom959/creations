"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { getSkill } from "@/skilltree/skills";
import { useSkillTree, isUnlocked } from "@/skilltree/store";
import { sfx, resumeAudio } from "@/skilltree/sound";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { p, ready, completeProject } = useSkillTree();
  const skill = getSkill(params.id);
  if (!skill || !skill.project) return notFound();

  const unlocked = ready && isUnlocked(p, skill.id);
  const done = p.skills[skill.id]?.projectDone;

  return (
    <div className="st-fade-up" style={{ maxWidth: 640, margin: "0 auto" }}>
      <Link href="/skilltree/projects" className="st-muted" style={{ fontSize: "0.82rem", textDecoration: "none", display: "inline-flex", gap: 4, marginBottom: 16 }}>← Projetos</Link>

      <div className="st-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ fontSize: "2.6rem" }}>{skill.icon}</span>
          <div>
            <h1 className="st-display" style={{ fontSize: "1.5rem", fontWeight: 800 }}>{skill.project.title}</h1>
            <div className="st-muted" style={{ fontSize: "0.8rem" }}>Habilidade: {skill.name}</div>
          </div>
        </div>

        <p style={{ marginTop: 16, lineHeight: 1.6, fontSize: "0.9rem" }}>{skill.project.description}</p>

        <div className="st-surface" style={{ padding: 16, borderRadius: 12, marginTop: 16 }}>
          <div className="st-display" style={{ fontWeight: 700, marginBottom: 8 }}>Checklist de entregáveis</div>
          <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
            {skill.project.deliverables.map((d, i) => <li key={i} className="st-muted" style={{ fontSize: "0.85rem" }}>{d}</li>)}
          </ul>
        </div>

        {!unlocked ? (
          <p className="st-muted" style={{ marginTop: 18, fontSize: "0.85rem" }}>Desbloqueie a habilidade &ldquo;{skill.name}&rdquo; primeiro para registrar este projeto como concluído.</p>
        ) : done ? (
          <div className="st-chip" style={{ marginTop: 18, padding: "10px 16px", color: "var(--st-cyan)", borderColor: "var(--st-cyan)" }}>✅ Projeto concluído — bom trabalho!</div>
        ) : (
          <button type="button" onClick={() => { resumeAudio(); sfx.achievement(); completeProject(skill.id); }} className="st-btn st-btn-primary" style={{ width: "100%", padding: "14px", marginTop: 18 }}>
            Marcar como concluído (+60 XP)
          </button>
        )}
      </div>
    </div>
  );
}
