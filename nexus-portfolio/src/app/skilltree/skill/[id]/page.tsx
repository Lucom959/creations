"use client";

import Link from "next/link";
import { useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { getSkill, getSkill as gs, childrenOf, DOMAINS } from "@/skilltree/skills";
import { useSkillTree, isAvailable, isUnlocked } from "@/skilltree/store";
import { sfx, resumeAudio } from "@/skilltree/sound";
import { unlockExplanation } from "@/skilltree/mentor";
import { pushMentorMessage } from "@/skilltree/mentorBus";
import QuizCard from "@/components/skilltree/QuizCard";

export default function SkillDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { p, ready, unlockSkill, completeProject } = useSkillTree();
  const [unlocking, setUnlocking] = useState(false);
  const [banner, setBanner] = useState<{ xp: number; level: number | null; achievements: string[] } | null>(null);

  const skill = getSkill(params.id);
  if (!skill) return notFound();

  const domain = DOMAINS.find((d) => d.id === skill.domainId)!;
  const unlocked = ready && isUnlocked(p, skill.id);
  const available = ready && isAvailable(p, skill.id);
  const state = p.skills[skill.id];
  const prereqSkills = skill.prerequisites.map((id) => gs(id)).filter(Boolean);
  const nextSkills = childrenOf(skill.id);

  const handleUnlock = () => {
    if (!available || unlocked) return;
    resumeAudio();
    sfx.unlock();
    setUnlocking(true);
    setTimeout(() => {
      const result = unlockSkill(skill.id);
      setBanner({ xp: result.xpGained, level: result.newLevel, achievements: result.newAchievements });
      setUnlocking(false);
      pushMentorMessage(unlockExplanation(skill));
      if (result.newLevel) setTimeout(() => sfx.levelUp(), 300);
      if (result.newAchievements.length) setTimeout(() => sfx.achievement(), 700);
    }, 1600);
  };

  return (
    <div className="st-fade-up" style={{ maxWidth: 700, margin: "0 auto" }}>
      {unlocking && (
        <div className="st-unlock-overlay">
          <div style={{ textAlign: "center" }}>
            <div className="st-pop st-drift" style={{ fontSize: "6rem", filter: "drop-shadow(0 0 40px var(--st-cyan))" }}>{skill.icon}</div>
            <div className="st-display st-gradient-text" style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: 12 }}>Desbloqueando {skill.name}...</div>
          </div>
        </div>
      )}

      <Link href="/skilltree/map" className="st-muted" style={{ fontSize: "0.82rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}>← Mapa de Habilidades</Link>

      <div className="st-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "3rem" }}>{skill.icon}</span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h1 className="st-display" style={{ fontSize: "1.6rem", fontWeight: 800 }}>{skill.name}</h1>
              {unlocked && <span className="st-chip" style={{ color: "var(--st-cyan)", borderColor: "var(--st-cyan)" }}>✅ Desbloqueada</span>}
            </div>
            <div className="st-muted" style={{ fontSize: "0.82rem", marginTop: 2 }}>{domain.icon} {domain.name}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <span className="st-chip">{"⭐".repeat(skill.difficulty)} dificuldade</span>
              <span className="st-chip">⚡ {skill.xp} XP</span>
              <span className="st-chip">⏱ {skill.timeEstimate}</span>
            </div>
          </div>
        </div>

        {banner && (
          <div className="st-fade-up" style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="st-chip" style={{ color: "var(--st-cyan)", borderColor: "var(--st-cyan)" }}>+{banner.xp} XP</span>
            {banner.level && <span className="st-chip st-pop" style={{ color: "var(--st-purple)", borderColor: "var(--st-purple)" }}>🎉 Nível {banner.level}!</span>}
            {banner.achievements.map((a) => <span key={a} className="st-chip st-pop">🏅 Conquista desbloqueada</span>)}
          </div>
        )}

        {!unlocked && (
          <button type="button" onClick={handleUnlock} disabled={!available} className="st-btn st-btn-primary" style={{ width: "100%", padding: "16px", marginTop: 18, fontSize: "1rem" }}>
            {available ? "🔓 Desbloquear habilidade" : "🔒 Bloqueada — complete os pré-requisitos"}
          </button>
        )}
      </div>

      {!available && !unlocked && prereqSkills.length > 0 && (
        <div className="st-card" style={{ padding: 18, marginBottom: 20, borderColor: "var(--st-err)" }}>
          <div className="st-display" style={{ fontWeight: 700, marginBottom: 6 }}>🔒 Pré-requisitos necessários</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {prereqSkills.map((pr) => pr && (
              <Link key={pr.id} href={`/skilltree/skill/${pr.id}`} className="st-chip" style={{ textDecoration: "none", borderColor: isUnlocked(p, pr.id) ? "var(--st-cyan)" : "var(--st-border)" }}>
                {isUnlocked(p, pr.id) ? "✅" : "○"} {pr.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <InfoBlock icon="💡" title="O que é">{skill.what}</InfoBlock>
      <InfoBlock icon="🎯" title="Por que importa">{skill.why}</InfoBlock>
      <InfoBlock icon="🏢" title="Onde é usado no mercado">
        {skill.market}
        {skill.salaryRange && <div className="st-cyan" style={{ marginTop: 6, fontSize: "0.85rem" }}>💰 {skill.salaryRange}</div>}
      </InfoBlock>
      <InfoBlock icon="📖" title="Como aprender do zero">{skill.how}</InfoBlock>

      <div className="st-card" style={{ padding: 18, marginBottom: 14 }}>
        <div className="st-display" style={{ fontWeight: 700, marginBottom: 8 }}>⚠️ Erros comuns</div>
        <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
          {skill.commonMistakes.map((m, i) => <li key={i} className="st-muted" style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>{m}</li>)}
        </ul>
      </div>

      <div className="st-card" style={{ padding: 18, marginBottom: 14 }}>
        <div className="st-display" style={{ fontWeight: 700, marginBottom: 8 }}>📚 Documentação e materiais gratuitos</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {skill.docs.map((d) => (
            <a key={d.url} href={d.url} target="_blank" rel="noreferrer" className="st-cyan" style={{ fontSize: "0.85rem", textDecoration: "none" }}>
              🔗 {d.label} ↗
            </a>
          ))}
        </div>
      </div>

      {skill.project && (
        <div className="st-card" style={{ padding: 18, marginBottom: 14 }}>
          <div className="st-display" style={{ fontWeight: 700, marginBottom: 6 }}>🛠️ Projeto sugerido: {skill.project.title}</div>
          <p className="st-muted" style={{ fontSize: "0.85rem", marginBottom: 10 }}>{skill.project.description}</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4, marginBottom: 12 }}>
            {skill.project.deliverables.map((d, i) => <li key={i} className="st-muted" style={{ fontSize: "0.82rem" }}>{d}</li>)}
          </ul>
          {unlocked && (
            state?.projectDone ? (
              <span className="st-chip" style={{ color: "var(--st-cyan)", borderColor: "var(--st-cyan)" }}>✅ Projeto concluído</span>
            ) : (
              <button type="button" onClick={() => { resumeAudio(); sfx.achievement(); completeProject(skill.id); }} className="st-btn st-btn-primary" style={{ padding: "10px 18px", fontSize: "0.85rem" }}>
                Marcar projeto como concluído (+60 XP)
              </button>
            )
          )}
        </div>
      )}

      {unlocked && (
        <div className="st-card" style={{ padding: 18, marginBottom: 14 }}>
          <div className="st-display" style={{ fontWeight: 700, marginBottom: 10 }}>🎯 Quiz</div>
          <QuizCard skill={skill} />
        </div>
      )}

      {nextSkills.length > 0 && (
        <div className="st-card" style={{ padding: 18 }}>
          <div className="st-display" style={{ fontWeight: 700, marginBottom: 8 }}>➡️ Desbloqueia a seguir</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {nextSkills.map((n) => (
              <Link key={n.id} href={`/skilltree/skill/${n.id}`} className="st-chip" style={{ textDecoration: "none" }}>{n.icon} {n.name}</Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="st-card" style={{ padding: 18, marginBottom: 14 }}>
      <div className="st-display" style={{ fontWeight: 700, marginBottom: 6 }}>{icon} {title}</div>
      <p className="st-muted" style={{ fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>{children}</p>
    </div>
  );
}
