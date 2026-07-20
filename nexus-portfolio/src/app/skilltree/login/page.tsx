"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSkillTree } from "@/skilltree/store";
import { sfx, resumeAudio } from "@/skilltree/sound";

const AVATARS = ["🧑‍🚀", "🧙", "🦾", "🐉", "🛰️", "🔮", "🧬", "⚔️", "🕶️", "👾", "🦉", "🌠"];

const PROVIDERS: { id: "google" | "github" | "discord"; label: string; icon: string }[] = [
  { id: "google", label: "Continuar com Google", icon: "🔴" },
  { id: "github", label: "Continuar com GitHub", icon: "⚫" },
  { id: "discord", label: "Continuar com Discord", icon: "🟣" },
];

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const { setProfile } = useSkillTree();
  const isSignup = search.get("mode") === "signup";

  const [tab, setTab] = useState<"entrar" | "criar">(isSignup ? "criar" : "entrar");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [mode, setMode] = useState<"select" | "email">("select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const enter = (provider: "google" | "github" | "discord" | "email") => {
    resumeAudio();
    sfx.levelUp();
    const finalName = name.trim() || (provider === "email" ? email.split("@")[0] : "Explorador");
    setProfile(finalName || "Explorador", avatar, provider);
    setPassword("");
    router.push("/skilltree/dashboard");
  };

  return (
    <div className="st-root" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div className="st-card st-page-enter" style={{ padding: 32, maxWidth: 420, width: "100%", textAlign: "center" }}>
        <Link href="/skilltree" style={{ textDecoration: "none", color: "inherit", display: "inline-block" }}>
          <div style={{ fontSize: "3rem" }}>🌌</div>
          <h1 className="st-display" style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: 8 }}>
            Skill<span className="st-gradient-text">Tree</span>
          </h1>
        </Link>

        <div className="st-surface" style={{ display: "flex", padding: 4, borderRadius: 12, marginTop: 18, gap: 4 }}>
          <button type="button" onClick={() => setTab("entrar")} className="st-btn" style={{ flex: 1, minHeight: 38, fontSize: "0.82rem", background: tab === "entrar" ? "linear-gradient(90deg, var(--st-blue), var(--st-purple))" : "transparent", color: tab === "entrar" ? "#fff" : "var(--st-muted)" }}>
            Entrar
          </button>
          <button type="button" onClick={() => setTab("criar")} className="st-btn" style={{ flex: 1, minHeight: 38, fontSize: "0.82rem", background: tab === "criar" ? "linear-gradient(90deg, var(--st-blue), var(--st-purple))" : "transparent", color: tab === "criar" ? "#fff" : "var(--st-muted)" }}>
            Criar Conta
          </button>
        </div>

        <p className="st-muted" style={{ marginTop: 14, fontSize: "0.88rem" }}>
          {tab === "entrar" ? "Bem-vindo de volta, explorador." : "Sua jornada de habilidades reais começa aqui."}
        </p>

        <div className="st-chip" style={{ marginTop: 16, padding: "8px 12px", fontSize: "0.7rem", textAlign: "left", lineHeight: 1.4, display: "block" }}>
          ⚠️ <strong>Modo demonstração local:</strong> este site não tem servidor/backend. Os botões abaixo criam ou carregam um perfil salvo apenas no seu navegador — não é uma autenticação real do Google/GitHub/Discord, e nenhuma senha é enviada ou armazenada em lugar nenhum.
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
              🚀 {tab === "criar" ? "Criar conta e explorar" : "Entrar e explorar"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input className="st-input" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="st-input" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => enter("email")} className="st-btn st-btn-primary" style={{ padding: "12px" }} disabled={!email.includes("@") || password.length < 1}>
              {tab === "criar" ? "Criar conta" : "Entrar"}
            </button>
            <button type="button" onClick={() => setMode("select")} className="st-btn st-btn-ghost" style={{ padding: "10px", fontSize: "0.8rem" }}>← Voltar</button>
          </div>
        )}

        <Link href="/skilltree" className="st-muted" style={{ display: "block", marginTop: 18, fontSize: "0.76rem", textDecoration: "none" }}>← Voltar para a página inicial</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
