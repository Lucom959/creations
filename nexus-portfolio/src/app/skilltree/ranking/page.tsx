"use client";

import { useMemo, useState } from "react";
import { useSkillTree } from "@/skilltree/store";

// Ranking simulado — este site não tem backend/multiplayer real. Ver aviso na UI.
const MOCK_NAMES = ["Nova_Byte", "K3y_Master", "CyberFox", "QuantumDev", "PixelMage", "RootAccess", "NeonRunner", "ByteWitch", "GhostCompiler", "AetherCoder"];
function mockList(seed: number) {
  return MOCK_NAMES.map((n, i) => ({ name: n, xp: Math.max(200, 6000 - i * 480 - seed * 37), avatar: ["🦾", "🧙", "🦊", "🔮", "🎭", "🗝️", "🌌", "🧬", "👻", "⚔️"][i] }));
}

const TABS = [
  { id: "global", label: "🌍 Global" },
  { id: "amigos", label: "🤝 Amigos" },
  { id: "escola", label: "🏫 Escola" },
  { id: "cidade", label: "🏙️ Cidade" },
] as const;

export default function RankingPage() {
  const { p } = useSkillTree();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("global");

  const list = useMemo(() => {
    const seed = { global: 0, amigos: 3, escola: 6, cidade: 9 }[tab];
    const base = mockList(seed);
    const me = { name: `${p.profile.name} (você)`, xp: p.xp, avatar: p.profile.avatar, me: true };
    return [...base.map((b) => ({ ...b, me: false })), me].sort((a, b) => b.xp - a.xp);
  }, [tab, p.profile, p.xp]);

  return (
    <div className="st-fade-up">
      <h1 className="st-display" style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>🏆 Ranking</h1>
      <p className="st-muted" style={{ fontSize: "0.78rem", marginBottom: 16 }}>⚠️ Ranking simulado para demonstração — este site não tem servidor multiplayer real. Só sua posição (XP) é verdadeira.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className="st-chip" style={{ cursor: "pointer", borderColor: tab === t.id ? "var(--st-cyan)" : "var(--st-border)", color: tab === t.id ? "var(--st-cyan)" : "var(--st-text)" }}>{t.label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {list.map((r, i) => (
          <div key={r.name} className="st-card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderColor: r.me ? "var(--st-cyan)" : "var(--st-border)", background: r.me ? "rgba(34,211,238,0.06)" : undefined }}>
            <span className="st-display" style={{ fontWeight: 800, width: 26, color: i < 3 ? "var(--st-gold)" : "var(--st-muted)" }}>{i + 1}</span>
            <span style={{ fontSize: "1.3rem" }}>{r.avatar}</span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: "0.9rem" }}>{r.name}</span>
            <span className="st-cyan st-display" style={{ fontWeight: 700 }}>{r.xp.toLocaleString("pt-BR")} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}
