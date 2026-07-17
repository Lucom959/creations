"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { leagueFromXp, levelFromXp, useStore } from "@/codelingo/store";
import { getMuted, setMuted, sfx, resumeAudio } from "@/codelingo/sound";
import CipherBot from "./CipherBot";

function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}
function IconCourses() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function IconStats() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" /><rect x="12.5" y="8" width="3" height="10" /><rect x="18" y="5" width="3" height="13" />
    </svg>
  );
}
function IconProfile() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
    </svg>
  );
}
function IconExternal() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" />
    </svg>
  );
}
function IconMute({ off }: { off: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      {off ? <path d="M17 8l5 8M22 8l-5 8" /> : <path d="M16 9a5 5 0 0 1 0 6" />}
    </svg>
  );
}
function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
    </svg>
  );
}

const nav = [
  { href: "/codelingo", label: "Início", Icon: IconHome, exact: true },
  { href: "/codelingo/courses", label: "Cursos", Icon: IconCourses, exact: false },
  { href: "/codelingo/stats", label: "Estatísticas", Icon: IconStats, exact: false },
  { href: "/codelingo/profile", label: "Perfil", Icon: IconProfile, exact: false },
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
              <IconMute off={muted} />
            </button>
            <button
              type="button"
              aria-label="Alternar tema"
              onClick={() => setTheme(p.theme === "dark" ? "light" : "dark")}
              className="cl-btn cl-btn-ghost"
              style={{ width: 38, height: 38, padding: 0 }}
            >
              {p.theme === "dark" ? <IconSun /> : <IconMoon />}
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
            const Icon = item.Icon;
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
                  gap: 3,
                  padding: "6px 0",
                  borderRadius: 12,
                  fontWeight: active ? 700 : 500,
                  fontSize: "0.7rem",
                  transition: "color 0.2s ease, transform 0.2s ease",
                  transform: active ? "translateY(-1px)" : "none",
                }}
              >
                <Icon />
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
              gap: 3,
              padding: "6px 0",
              fontSize: "0.7rem",
              transition: "color 0.2s ease",
            }}
          >
            <IconExternal />
            NEXUS
          </Link>
        </div>
      </nav>

      <CipherBot />
    </div>
  );
}
