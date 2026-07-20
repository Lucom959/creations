"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSkillTree } from "@/skilltree/store";
import { sfx, resumeAudio } from "@/skilltree/sound";

const AVATARS = ["🧑‍🚀", "🧙", "🦾", "🐉", "🛰️", "🔮", "🧬", "⚔️", "🕶️", "👾", "🦉", "🌠"];

const PROVIDERS: { id: "google" | "github" | "discord"; label: string; icon: string }[] = [
  { id: "google", label: "Continuar com Google", icon: "🔴" },
  { id: "github", label: "Continuar com GitHub", icon: "⚫" },
  { id: "discord", label: "Continuar com Discord", icon: "🟣" },
];

export default function LoginPage() {
  const router = useRouter();
  const { setProfile } = useSkillTree();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [mode, setMode] = useState<"select" | "email">("select");
  const [email, setEmail] = useState("");

  const enter = (provider: "google" | "github" | "discord" | "email") => {
    resumeAudio();
    sfx.levelUp();
    const finalName = name.trim() || (provider === "email" ? email.split("@")[0] : "Explorador");
    setProfile(finalName || "Explorador", avatar, provider);
    router.push("/skilltree");
  };

  return (
    <div className="st-root" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div className="st-card st-fade-up" style={{ padding: 32, maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "3rem" }}>🌌</div>
        <h1 className="st-display" style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: 8 }}>
          Skill<span className="st-gradient-text">Tree</span>
        </h1>
        <p className="st-muted" style={{ marginTop: 6, fontSize: "0.88rem" }}>
          Sua jornada de habilidades reais começa aqui.
        </p>

        <div className="st-chip" style={{ marginTop: 16, padding: "8px 12px", fontSize: "0.7rem", textAlign: "left", lineHeight: 1.4, display: "block" }}>
          ⚠️ <strong>Modo demonstração local:</strong> este site não tem servidor/backend, então os botões abaixo criam um perfil salvo apenas no seu navegador — não é uma autenticação real do Google/GitHub/Discord.
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", margin: "20px 0" }}>
          {AVATARS.map((a) => (
            <button key={a} type="button" onClick={() => setAvatar(a)} style={{ fontSize: "1.3rem", width: 42, height: 42, borderRadius: 12, border: `2px solid ${avatar === a ? "var(--st-cyan)" : "var(--st-border)"}`, background: avatar === a ? "rgba(34,211,238,0.12)" : "var(--st-surface)", cursor: "pointer" }}>
              {a}
            </button>
          ))}
        </div>

        <input className="st-input" placeholder="Seu nome (opcional)" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 16 }} />

        {mode === "select" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PROVIDERS.map((prov) => (
              <button key={prov.id} type="button" onClick={() => enter(prov.id)} className="st-btn st-btn-ghost" style={{ padding: "12px", justifyContent: "flex-start", paddingLeft: 18 }}>
                <span>{prov.icon}</span> {prov.label}
              </button>
            ))}
            <button type="button" onClick={() => setMode("email")} className="st-btn st-btn-ghost" style={{ padding: "12px", justifyContent: "flex-start", paddingLeft: 18 }}>
              ✉️ Continuar com e-mail
            </button>
            <button type="button" onClick={() => enter("google")} className="st-btn st-btn-primary" style={{ padding: "14px", marginTop: 6 }}>
              🚀 Entrar e explorar
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="st-input" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="button" onClick={() => enter("email")} className="st-btn st-btn-primary" style={{ padding: "12px" }} disabled={!email.includes("@")}>
              Continuar
            </button>
            <button type="button" onClick={() => setMode("select")} className="st-btn st-btn-ghost" style={{ padding: "10px", fontSize: "0.8rem" }}>← Voltar</button>
          </div>
        )}
      </div>
    </div>
  );
}
