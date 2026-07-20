"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DOMAINS } from "@/skilltree/skills";

const BENEFITS = [
  { icon: "🌳", title: "Aprenda fazendo", text: "Cada habilidade se conecta a um projeto prático real — nada de assistir e esquecer." },
  { icon: "🤖", title: "Mentor de IA pessoal", text: "Ao desbloquear uma habilidade, um mentor te explica o que é, por que importa e monta um plano de estudos." },
  { icon: "🎮", title: "Evolua como em um RPG", text: "XP, níveis, sequências e conquistas transformam o estudo em progresso visível e viciante." },
  { icon: "🆓", title: "100% local e gratuito", text: "Sem servidor, sem anúncios. Tudo roda no seu navegador e fica salvo só com você." },
];

const FEATURES = [
  { icon: "🗺️", title: "Mapa de habilidades", text: "~40 habilidades reais em 9 domínios, num mapa infinito para explorar, arrastar e dar zoom." },
  { icon: "💬", title: "Mentor de IA", text: "Explicações automáticas a cada desbloqueio, com plano de estudos personalizado sob demanda." },
  { icon: "🏅", title: "100+ conquistas", text: "Metas de XP, sequência, domínio e projetos concluídos para manter a motivação." },
  { icon: "🛠️", title: "Projetos práticos", text: "Cada habilidade aponta para um projeto real com checklist de entregáveis." },
  { icon: "📊", title: "Estatísticas de evolução", text: "Acompanhe XP, tempo de estudo e progresso por domínio ao longo do tempo." },
  { icon: "🏆", title: "Ranking", text: "Compare sua evolução (simulada) com outros exploradores — só sua posição de XP é real." },
];

export default function SkillTreeLanding() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="st-root">
      <header
        className={`st-landing-header ${scrolled ? "st-glass" : ""}`}
        style={{ borderBottom: scrolled ? undefined : "1px solid transparent" }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.5rem" }}>🌌</span>
            <span className="st-display" style={{ fontWeight: 800, fontSize: "1.1rem" }}>Skill<span className="st-gradient-text">Tree</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/skilltree/login" className="st-btn st-btn-ghost" style={{ padding: "0 18px", minHeight: 42 }}>Entrar</Link>
            <Link href="/skilltree/login?mode=signup" className="st-btn st-btn-primary" style={{ padding: "0 18px", minHeight: 42 }}>Criar Conta</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px" }}>
        {/* Hero */}
        <section className="st-page-enter" style={{ padding: "72px 0 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <span className="st-chip" style={{ padding: "8px 16px" }}>🚀 Um projeto NEXUS</span>
          <h1 className="st-display st-hero-title" style={{ maxWidth: 780 }}>
            Sua evolução técnica, <span className="st-gradient-text">como em um RPG.</span>
          </h1>
          <p className="st-muted" style={{ fontSize: "1.05rem", maxWidth: 560, lineHeight: 1.6 }}>
            Desbloqueie habilidades reais em programação, IA, robótica, cibersegurança e mais — cada uma explicada por um mentor de IA e conectada a um projeto prático.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
            <Link href="/skilltree/login?mode=signup" className="st-btn st-btn-primary st-glow-pulse" style={{ padding: "0 28px", minHeight: 54, fontSize: "1rem" }}>
              🚀 Criar Conta grátis
            </Link>
            <Link href="/skilltree/login" className="st-btn st-btn-ghost" style={{ padding: "0 28px", minHeight: 54, fontSize: "1rem" }}>
              Entrar
            </Link>
          </div>

          {/* Preview mockup */}
          <div className="st-mock-window st-page-enter" style={{ marginTop: 28, width: "100%", maxWidth: 820 }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--st-border)", display: "flex", alignItems: "center", gap: 8 }}>
              <span className="st-mock-dots">
                <span style={{ background: "#ff5b7a" }} /><span style={{ background: "#ffcf5b" }} /><span style={{ background: "#22d3ee" }} />
              </span>
              <span className="st-muted" style={{ fontSize: "0.72rem", marginLeft: 4 }}>skilltree — mapa de habilidades</span>
            </div>
            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 14 }}>
              {DOMAINS.slice(0, 6).map((d) => (
                <div key={d.id} className="st-card" style={{ padding: 14, textAlign: "left" }}>
                  <span style={{ fontSize: "1.4rem" }}>{d.icon}</span>
                  <div className="st-display" style={{ fontWeight: 700, fontSize: "0.8rem", marginTop: 6 }}>{d.name}</div>
                  <div className="st-progress" style={{ height: 5, marginTop: 8 }}><span style={{ width: `${30 + (d.name.length * 7) % 60}%`, background: d.color }} /></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="st-section">
          <h2 className="st-display" style={{ fontSize: "1.6rem", fontWeight: 800, textAlign: "center", marginBottom: 32 }}>Por que SkillTree?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {BENEFITS.map((b, i) => (
              <div key={b.title} className="st-card st-hover st-feature-card st-stagger-in" style={{ ["--st-stagger" as string]: `${i * 0.07}s` }}>
                <span style={{ fontSize: "1.8rem" }}>{b.icon}</span>
                <div className="st-display" style={{ fontWeight: 700 }}>{b.title}</div>
                <p className="st-muted" style={{ fontSize: "0.85rem", lineHeight: 1.55, margin: 0 }}>{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recursos */}
        <section className="st-section" style={{ paddingTop: 0 }}>
          <h2 className="st-display" style={{ fontSize: "1.6rem", fontWeight: 800, textAlign: "center", marginBottom: 32 }}>Recursos da plataforma</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="st-card st-hover st-feature-card st-stagger-in" style={{ ["--st-stagger" as string]: `${i * 0.06}s` }}>
                <span style={{ fontSize: "1.7rem" }}>{f.icon}</span>
                <div className="st-display" style={{ fontWeight: 700 }}>{f.title}</div>
                <p className="st-muted" style={{ fontSize: "0.83rem", lineHeight: 1.55, margin: 0 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="st-section" style={{ paddingTop: 0 }}>
          <div className="st-card" style={{ padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <h2 className="st-display" style={{ fontSize: "1.5rem", fontWeight: 800 }}>Pronto para começar sua jornada?</h2>
            <p className="st-muted" style={{ maxWidth: 460, fontSize: "0.9rem" }}>Crie sua conta local em segundos e desbloqueie sua primeira habilidade hoje.</p>
            <Link href="/skilltree/login?mode=signup" className="st-btn st-btn-primary" style={{ padding: "0 30px", minHeight: 52, fontSize: "1rem" }}>
              🚀 Criar Conta grátis
            </Link>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--st-border)", padding: "24px 20px", textAlign: "center" }}>
        <div className="st-muted" style={{ fontSize: "0.78rem" }}>
          SkillTree é um projeto local-first, sem backend — dados salvos só no seu navegador.{" "}
          <Link href="/" className="st-cyan" style={{ textDecoration: "none" }}>← Voltar ao NEXUS</Link>
        </div>
      </footer>
    </div>
  );
}
