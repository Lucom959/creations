"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { leagueFromXp, levelFromXp, useStore } from "@/codelingo/store";
import { getMuted, setMuted, sfx, resumeAudio } from "@/codelingo/sound";
import CipherBot from "./CipherBot";

const nav = [
  { href: "/codelingo", label: "Início", icon: "🏠", exact: true },
  { href: "/codelingo/courses", label: "Cursos", icon: "🗂️", exact: false },
  { href: "/codelingo/stats", label: "Estatísticas", icon: "📊", exact: false },
  { href: "/codelingo/profile", label: "Perfil", icon: "👤", exact: false },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { p, ready, setTheme } = useStore();
  const pathname = usePathname();
  const [muted, setMutedState] = useState(true);

  useEffect(() => setMutedState(getMuted()), []);

  const league = leagueFromXp(p.xp);
  const level = levelFromXp(p.xp);

  return (
    <div className={`cl-root ${p.theme === "light" ? "cl-light" : ""}`}>
      {/* Top bar */}
      <header
        className="cl-glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          borderLeft: "none",
          borderRight: "none",
          borderTop: "none",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
          <Link href="/codelingo" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
            <span style={{ fontSize: "1.5rem" }}>🔐</span>
            <span className="cl-display" style={{ fontWeight: 800, fontSize: "1.15rem" }}>
              Code<span className="cl-amber">Lingo</span>
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="cl-chip" title="Sequência diária">🔥 {ready ? p.streak : 0}</span>
            <span className="cl-chip" title="XP total">⚡ {ready ? p.xp : 0}</span>
            <span className="cl-chip" title={`Liga ${league.name} · Nível ${level}`}>
              {league.icon} <span className="cl-amber">Nv {level}</span>
            </span>
            <button
              type="button"
              aria-label="Alternar som"
              onClick={() => {
                const nm = !muted;
                setMuted(nm);
                setMutedState(nm);
                if (!nm) {
                  resumeAudio();
                  sfx.click();
                }
              }}
              className="cl-btn cl-btn-ghost"
              style={{ width: 38, height: 38, padding: 0 }}
            >
              {muted ? "🔇" : "🔊"}
            </button>
            <button
              type="button"
              aria-label="Alternar tema"
              onClick={() => setTheme(p.theme === "dark" ? "light" : "dark")}
              className="cl-btn cl-btn-ghost"
              style={{ width: 38, height: 38, padding: 0 }}
            >
              {p.theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px 120px" }}>{children}</main>

      {/* Bottom nav */}
      <nav
        className="cl-glass"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          borderBottom: "none",
          borderLeft: "none",
          borderRight: "none",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-around", padding: "8px 8px calc(8px + env(safe-area-inset-bottom))" }}>
          {nav.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => resumeAudio()}
                style={{
                  flex: 1,
                  maxWidth: 120,
                  textDecoration: "none",
                  color: active ? "var(--cl-amber)" : "var(--cl-muted)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  padding: "6px 0",
                  borderRadius: 12,
                  fontWeight: active ? 700 : 500,
                  fontSize: "0.72rem",
                  transition: "color 0.2s ease",
                }}
              >
                <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            style={{
              flex: 1,
              maxWidth: 120,
              textDecoration: "none",
              color: "var(--cl-muted)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "6px 0",
              fontSize: "0.72rem",
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>🏠</span>
            NEXUS
          </Link>
        </div>
      </nav>

      <CipherBot />
    </div>
  );
}
