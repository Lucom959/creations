"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSkillTree, levelFromXp } from "@/skilltree/store";
import { SKILLS } from "@/skilltree/skills";
import { ACHIEVEMENTS } from "@/skilltree/achievements";
import { getMuted, setMuted, sfx, resumeAudio } from "@/skilltree/sound";

const AVATARS = ["🧑‍🚀", "🧙", "🦾", "🐉", "🛰️", "🔮", "🧬", "⚔️", "🕶️", "👾", "🦉", "🌠"];

export default function ProfilePage() {
  const router = useRouter();
  const { p, setProfile, setDailyGoal, logout, reset, achievementInput } = useSkillTree();
  const [name, setName] = useState(p.profile.name);
  const [editing, setEditing] = useState(false);
  const [muted, setMutedState] = useState(true);
  useEffect(() => setMutedState(getMuted()), []);

  const level = levelFromXp(p.xp);
  const unlockedAch = ACHIEVEMENTS.filter((a) => a.check(achievementInput)).length;

  return (
    <div className="st-fade-up" style={{ display: "grid", gap: 18 }}>
      <section className="st-card" style={{ padding: 22 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: "3rem" }}>{p.profile.avatar}</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            {editing ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input className="st-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} />
                <button type="button" onClick={() => { setProfile(name, p.profile.avatar, p.profile.provider); setEditing(false); }} className="st-btn st-btn-primary" style={{ padding: "0 16px" }}>Salvar</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 className="st-display" style={{ fontSize: "1.5rem", fontWeight: 800 }}>{p.profile.name}</h1>
                <button type="button" onClick={() => setEditing(true)} className="st-btn st-btn-ghost" style={{ padding: "4px 10px", fontSize: "0.72rem" }}>editar</button>
              </div>
            )}
            <div className="st-muted" style={{ marginTop: 4, fontSize: "0.82rem" }}>Nível {level} · conectado via {p.profile.provider ?? "—"} (perfil local)</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {AVATARS.map((a) => (
            <button key={a} type="button" onClick={() => setProfile(p.profile.name, a, p.profile.provider)} style={{ fontSize: "1.3rem", width: 42, height: 42, borderRadius: 12, border: `2px solid ${p.profile.avatar === a ? "var(--st-cyan)" : "var(--st-border)"}`, background: p.profile.avatar === a ? "rgba(34,211,238,0.1)" : "var(--st-surface)", cursor: "pointer" }}>{a}</button>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
        <Card icon="⚡" label="XP total" value={`${p.xp}`} />
        <Card icon="🔥" label="Sequência" value={`${p.streak}d`} />
        <Card icon="🌳" label="Habilidades" value={`${Object.keys(p.skills).length}/${SKILLS.length}`} />
        <Card icon="🏅" label="Conquistas" value={`${unlockedAch}/${ACHIEVEMENTS.length}`} />
      </section>

      <Link href="/skilltree/ranking" className="st-card st-hover" style={{ padding: 18, display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
        <span style={{ fontSize: "1.6rem" }}>🏆</span>
        <div style={{ flex: 1 }}>
          <div className="st-display" style={{ fontWeight: 700 }}>Ver ranking</div>
          <div className="st-muted" style={{ fontSize: "0.75rem" }}>Global, amigos, escola e cidade (simulado)</div>
        </div>
        <span className="st-cyan">→</span>
      </Link>

      <section className="st-card" style={{ padding: 20 }}>
        <h2 className="st-display" style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 14 }}>⚙️ Configurações</h2>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span className="st-muted" style={{ fontSize: "0.8rem" }}>Meta diária de estudo</span>
            <span className="st-cyan" style={{ fontSize: "0.82rem", fontWeight: 700 }}>{p.dailyGoalMinutes} min</span>
          </div>
          <input
            type="range"
            className="st-slider"
            min={5}
            max={120}
            step={5}
            value={p.dailyGoalMinutes}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
          />
        </div>

        <label className="st-switch" style={{ marginBottom: 20 }}>
          <input
            type="checkbox"
            checked={!muted}
            onChange={() => {
              const nm = !muted;
              setMuted(nm);
              setMutedState(nm);
              if (!nm) { resumeAudio(); sfx.click(); }
            }}
          />
          <span className="st-track" />
          Sons da plataforma
        </label>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={() => { logout(); router.push("/skilltree/login"); }} className="st-btn st-btn-ghost" style={{ padding: "10px 16px" }}>Sair (trocar perfil local)</button>
          <button type="button" onClick={() => { if (confirm("Apagar todo o progresso? Isso não pode ser desfeito.")) { reset(); router.push("/skilltree/login"); } }} className="st-btn st-btn-ghost" style={{ padding: "10px 16px", borderColor: "var(--st-err)", color: "var(--st-err)" }}>🗑️ Zerar progresso</button>
        </div>
      </section>
    </div>
  );
}

function Card({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="st-card" style={{ padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: "1.3rem" }}>{icon}</div>
      <div className="st-display st-cyan" style={{ fontWeight: 800, fontSize: "1.1rem", marginTop: 2 }}>{value}</div>
      <div className="st-muted" style={{ fontSize: "0.68rem" }}>{label}</div>
    </div>
  );
}
