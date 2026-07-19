"use client";

import { useMemo, useState } from "react";
import { CODES } from "@/codelingo/codes";
import { ACHIEVEMENTS } from "@/codelingo/achievements";
import { isCourseComplete, leagueFromXp, levelFromXp, useStore } from "@/codelingo/store";

const AVATARS = ["🕵️", "🧑‍💻", "👩‍🚀", "🦊", "🐙", "🤖", "🦉", "🐝", "👾", "🧙", "🐧", "🦾"];

// Ranking simulado (multiplayer real fica como evolução futura).
const MOCK_RANK = [
  { name: "NovaByte", xp: 4820, avatar: "🦾" },
  { name: "K3yMaster", xp: 3910, avatar: "🧙" },
  { name: "Enigmatic", xp: 3140, avatar: "🦉" },
  { name: "BinBun", xp: 2450, avatar: "🐰" },
  { name: "Vigenère_Fan", xp: 1980, avatar: "🗝️" },
];

export default function ProfilePage() {
  const { p, setProfile, setDailyGoal, reset, toggleFavorite, achievementInput } = useStore();
  const [name, setName] = useState(p.name);
  const [editing, setEditing] = useState(false);

  const level = levelFromXp(p.xp);
  const league = leagueFromXp(p.xp);
  const unlocked = useMemo(() => ACHIEVEMENTS.filter((a) => a.check(achievementInput)), [achievementInput]);
  const completedCourses = Object.entries(p.courses).filter(([id, c]) => isCourseComplete(id, c)).length;
  const masteredCourses = Object.values(p.courses).filter((c) => c.mastered).length;
  const accuracy = Math.round(p.bestAccuracy * 100);

  const ranking = useMemo(() => {
    const me = { name: p.name + " (você)", xp: p.xp, avatar: p.avatar, me: true };
    return [...MOCK_RANK.map((r) => ({ ...r, me: false })), me].sort((a, b) => b.xp - a.xp);
  }, [p.name, p.xp, p.avatar]);

  return (
    <div className="cl-fade-up" style={{ display: "grid", gap: 20 }}>
      {/* Cabeçalho do perfil */}
      <section className="cl-card" style={{ padding: 22 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: "3.4rem", lineHeight: 1 }}>{p.avatar}</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            {editing ? (
              <div style={{ display: "flex", gap: 8 }}>
                <input className="cl-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} />
                <button
                  type="button"
                  className="cl-btn cl-btn-amber"
                  style={{ padding: "0 16px" }}
                  onClick={() => { setProfile(name, p.avatar); setEditing(false); }}
                >
                  Salvar
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 className="cl-display" style={{ fontSize: "1.7rem", fontWeight: 800 }}>{p.name}</h1>
                <button type="button" className="cl-btn cl-btn-ghost" style={{ padding: "4px 10px", fontSize: "0.75rem" }} onClick={() => setEditing(true)}>
                  editar
                </button>
              </div>
            )}
            <div className="cl-muted" style={{ marginTop: 4 }}>
              Nível {level} · {league.icon} Liga {league.name}
            </div>
          </div>
        </div>

        {/* Escolher avatar */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setProfile(p.name, a)}
              className="cl-node-hover"
              style={{
                fontSize: "1.4rem",
                width: 44,
                height: 44,
                borderRadius: 12,
                border: `2px solid ${p.avatar === a ? "var(--cl-amber)" : "var(--cl-border)"}`,
                background: p.avatar === a ? "rgba(255,193,7,0.12)" : "var(--cl-surface)",
                cursor: "pointer",
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      {/* Métricas */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
        <Card icon="⚡" label="XP total" value={`${p.xp}`} />
        <Card icon="🔥" label="Sequência" value={`${p.streak} dias`} />
        <Card icon="🎯" label="Precisão" value={`${accuracy}%`} />
        <Card icon="⏱️" label="Tempo" value={`${p.minutesStudied} min`} />
        <Card icon="✅" label="Cursos" value={`${completedCourses}/${CODES.length}`} />
        <Card icon="⭐" label="Dominados" value={`${masteredCourses}`} />
      </section>

      {/* Ranking */}
      <section className="cl-card" style={{ padding: 20 }}>
        <h2 className="cl-display" style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 4 }}>🏆 Ranking semanal</h2>
        <p className="cl-muted" style={{ fontSize: "0.72rem", marginBottom: 14 }}>Ranking simulado — o multiplayer online é uma evolução futura.</p>
        <div style={{ display: "grid", gap: 8 }}>
          {ranking.map((r, i) => (
            <div
              key={r.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 12,
                background: r.me ? "rgba(255,193,7,0.12)" : "var(--cl-surface)",
                border: `1px solid ${r.me ? "var(--cl-amber)" : "var(--cl-border)"}`,
              }}
            >
              <span className="cl-display" style={{ fontWeight: 800, width: 24, color: i < 3 ? "var(--cl-amber)" : "var(--cl-muted)" }}>
                {i + 1}
              </span>
              <span style={{ fontSize: "1.3rem" }}>{r.avatar}</span>
              <span style={{ flex: 1, fontWeight: 600 }}>{r.name}</span>
              <span className="cl-amber cl-display" style={{ fontWeight: 700 }}>{r.xp} XP</span>
            </div>
          ))}
        </div>
      </section>

      {/* Conquistas */}
      <section className="cl-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <h2 className="cl-display" style={{ fontSize: "1.2rem", fontWeight: 700 }}>🏅 Conquistas</h2>
          <span className="cl-muted" style={{ fontSize: "0.8rem" }}>{unlocked.length}/{ACHIEVEMENTS.length}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
          {ACHIEVEMENTS.map((a) => {
            const got = a.check(achievementInput);
            const prog = a.progress ? a.progress(achievementInput) : got ? 1 : 0;
            return (
              <div
                key={a.id}
                className="cl-surface"
                style={{ borderRadius: 14, padding: 14, opacity: got ? 1 : 0.55, border: got ? "1px solid var(--cl-amber)" : "1px solid var(--cl-border)" }}
                title={a.desc}
              >
                <div style={{ fontSize: "1.6rem", filter: got ? "none" : "grayscale(1)" }}>{a.icon}</div>
                <div className="cl-display" style={{ fontWeight: 700, fontSize: "0.85rem", marginTop: 4 }}>{a.name}</div>
                <div className="cl-muted" style={{ fontSize: "0.7rem", marginTop: 2, lineHeight: 1.3 }}>{a.desc}</div>
                {!got && a.progress && (
                  <div className="cl-progress" style={{ marginTop: 8, height: 6 }}>
                    <span style={{ width: `${prog * 100}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Favoritos */}
      <section className="cl-card" style={{ padding: 20 }}>
        <h2 className="cl-display" style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 14 }}>⭐ Favoritos</h2>
        {p.favorites.length === 0 ? (
          <p className="cl-muted" style={{ fontSize: "0.85rem" }}>Nenhum favorito ainda. Marque códigos abaixo:</p>
        ) : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {CODES.map((c) => {
            const fav = p.favorites.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleFavorite(c.id)}
                className="cl-chip"
                style={{ cursor: "pointer", borderColor: fav ? "var(--cl-amber)" : "var(--cl-border)", color: fav ? "var(--cl-amber)" : "var(--cl-text)" }}
              >
                {fav ? "★" : "☆"} {c.icon} {c.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Configurações */}
      <section className="cl-card" style={{ padding: 20 }}>
        <h2 className="cl-display" style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 14 }}>⚙️ Configurações</h2>
        <div style={{ marginBottom: 16 }}>
          <div className="cl-muted" style={{ fontSize: "0.82rem", marginBottom: 8 }}>Meta diária de XP</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[20, 50, 100, 150].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setDailyGoal(g)}
                className="cl-btn"
                style={{
                  padding: "8px 16px",
                  border: `2px solid ${p.dailyGoal === g ? "var(--cl-amber)" : "var(--cl-border)"}`,
                  background: p.dailyGoal === g ? "rgba(255,193,7,0.12)" : "transparent",
                  color: "var(--cl-text)",
                }}
              >
                {g} XP
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="cl-btn cl-btn-ghost"
          style={{ padding: "10px 16px", borderColor: "var(--cl-err)", color: "var(--cl-err)" }}
          onClick={() => {
            if (confirm("Apagar todo o progresso? Isso não pode ser desfeito.")) reset();
          }}
        >
          🗑️ Zerar progresso
        </button>
      </section>
    </div>
  );
}

function Card({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="cl-card" style={{ padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: "1.4rem" }}>{icon}</div>
      <div className="cl-display cl-amber" style={{ fontWeight: 800, fontSize: "1.3rem", marginTop: 2 }}>{value}</div>
      <div className="cl-muted" style={{ fontSize: "0.72rem" }}>{label}</div>
    </div>
  );
}
