"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSkillTree, levelFromXp } from "@/skilltree/store";
import { getMuted, setMuted, sfx, resumeAudio } from "@/skilltree/sound";
import MentorPanel from "./MentorPanel";

function IconHome() { return (<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" /></svg>); }
function IconMap() { return (<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3 3 5.5v15L9 18l6 2.5 6-2.5v-15L15 5.5 9 3z" /><path d="M9 3v15M15 5.5v15" /></svg>); }
function IconTrophy() { return (<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z" /><path d="M7 5H4a3 3 0 0 0 3 3M17 5h3a3 3 0 0 1-3 3" /></svg>); }
function IconStats() { return (<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" /><rect x="12.5" y="8" width="3" height="10" /><rect x="18" y="5" width="3" height="13" /></svg>); }
function IconTools() { return (<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L2 19l3 3 7.3-7.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2z" /></svg>); }
function IconRanking() { return (<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8M12 17v4" /><path d="M6 4h12l-1 8a5 5 0 0 1-10 0L6 4z" /></svg>); }
function IconUser() { return (<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" /></svg>); }
function IconExternal() { return (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></svg>); }
function IconMute({ off }: { off: boolean }) { return (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" />{off ? <path d="M17 8l5 8M22 8l-5 8" /> : <path d="M16 9a5 5 0 0 1 0 6" />}</svg>); }

const bottomNav = [
  { href: "/skilltree/dashboard", label: "Início", Icon: IconHome, exact: true },
  { href: "/skilltree/map", label: "Mapa", Icon: IconMap, exact: false },
  { href: "/skilltree/achievements", label: "Conquistas", Icon: IconTrophy, exact: false },
  { href: "/skilltree/stats", label: "Stats", Icon: IconStats, exact: false },
];

const sidebarNav = [
  { href: "/skilltree/dashboard", label: "Início", Icon: IconHome, exact: true },
  { href: "/skilltree/map", label: "Mapa de Habilidades", Icon: IconMap, exact: false },
  { href: "/skilltree/projects", label: "Projetos", Icon: IconTools, exact: false },
  { href: "/skilltree/achievements", label: "Conquistas", Icon: IconTrophy, exact: false },
  { href: "/skilltree/ranking", label: "Ranking", Icon: IconRanking, exact: false },
  { href: "/skilltree/stats", label: "Estatísticas", Icon: IconStats, exact: false },
  { href: "/skilltree/profile", label: "Perfil", Icon: IconUser, exact: false },
];

const PUBLIC_ROUTES = ["/skilltree", "/skilltree/login"];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { p, ready } = useSkillTree();
  const pathname = usePathname();
  const router = useRouter();
  const [muted, setMutedState] = useState(true);
  useEffect(() => setMutedState(getMuted()), []);

  const level = levelFromXp(p.xp);
  const loggedIn = !!p.profile.provider;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!ready) return;
    if (!loggedIn && !isPublicRoute) {
      router.replace("/skilltree");
    } else if (loggedIn && pathname === "/skilltree") {
      router.replace("/skilltree/dashboard");
    }
  }, [ready, loggedIn, pathname, isPublicRoute, router]);

  if (isPublicRoute) {
    return <div className="st-root">{children}</div>;
  }

  return (
    <div className="st-root" style={{ display: "flex" }}>
      <aside className="st-sidebar">
        <Link href="/skilltree/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit", padding: "8px 10px 20px" }}>
          <span style={{ fontSize: "1.5rem" }}>🌌</span>
          <span className="st-display" style={{ fontWeight: 800, fontSize: "1.02rem" }}>Skill<span className="st-gradient-text">Tree</span></span>
        </Link>
        {sidebarNav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.Icon;
          return (
            <Link key={item.href} href={item.href} onClick={() => resumeAudio()} className={`st-sidebar-link ${active ? "active" : ""}`}>
              <Icon /> {item.label}
            </Link>
          );
        })}
        <div style={{ flex: 1 }} />
        <Link href="/" className="st-sidebar-link">
          <IconExternal /> Voltar ao NEXUS
        </Link>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <header className="st-glass" style={{ position: "sticky", top: 0, zIndex: 40, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
            <Link href="/skilltree/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
              <span style={{ fontSize: "1.4rem" }}>🌌</span>
              <span className="st-display" style={{ fontWeight: 800, fontSize: "1.05rem" }}>Skill<span className="st-gradient-text">Tree</span></span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="st-chip" title="Sequência diária">🔥 {ready ? p.streak : 0}</span>
              <span className="st-chip" title="XP total">⚡ {ready ? p.xp : 0}</span>
              <span className="st-chip" title={`Nível ${level}`}><span className="st-cyan">Nv {level}</span></span>
              <Link href="/skilltree/profile" className="st-btn st-btn-ghost" style={{ padding: "3px 10px 3px 3px", minHeight: 0, borderRadius: 9999, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--st-surface)", fontSize: "0.95rem" }}>{ready ? p.profile.avatar : "🧑‍🚀"}</span>
                <span className="st-username-desktop" style={{ fontSize: "0.78rem", fontWeight: 700 }}>{ready ? p.profile.name : ""}</span>
              </Link>
              <button type="button" aria-label="Som" onClick={() => { const nm = !muted; setMuted(nm); setMutedState(nm); if (!nm) { resumeAudio(); sfx.click(); } }} className="st-btn st-btn-ghost" style={{ width: 36, height: 36, minHeight: 0, padding: 0 }}>
                <IconMute off={muted} />
              </button>
            </div>
          </div>
        </header>

        <main className="st-shell-main" style={{ maxWidth: 1080, margin: "0 auto", padding: "22px 16px 110px" }}>{children}</main>
      </div>

      <nav className="st-glass st-bottomnav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, borderBottom: "none", borderLeft: "none", borderRight: "none" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", justifyContent: "space-around", padding: "8px 8px calc(8px + env(safe-area-inset-bottom))" }}>
          {bottomNav.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.Icon;
            return (
              <Link key={item.href} href={item.href} onClick={() => resumeAudio()} style={{ flex: 1, maxWidth: 110, textDecoration: "none", color: active ? "var(--st-cyan)" : "var(--st-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0", fontWeight: active ? 700 : 500, fontSize: "0.68rem", transition: "color 0.2s ease" }}>
                <Icon /> {item.label}
              </Link>
            );
          })}
          <Link href="/skilltree/profile" style={{ flex: 1, maxWidth: 110, textDecoration: "none", color: pathname.startsWith("/skilltree/profile") ? "var(--st-cyan)" : "var(--st-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0", fontSize: "0.68rem" }}>
            <IconUser /> Perfil
          </Link>
        </div>
      </nav>

      <MentorPanel />
    </div>
  );
}
