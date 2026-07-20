"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const socials = [
  { label: "GitHub", href: "#", icon: GitHubIcon },
  { label: "X", href: "#", icon: XIcon },
  { label: "LinkedIn", href: "#", icon: LinkedInIcon },
  { label: "E-mail", href: "mailto:ola@nexus.dev", icon: MailIcon },
];

export default function Footer() {
  const pathname = usePathname();
  const year = 2026;
  if (pathname.startsWith("/codelingo") || pathname.startsWith("/skilltree")) return null;
  return (
    <footer
      id="contact"
      className="mt-24 border-t border-[var(--border)] bg-[var(--bg-elevated)]"
    >
      <div className="container-nexus grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link
            href="/"
            className="font-serif text-2xl font-bold tracking-[0.2em] text-terracota"
          >
            NEXUS
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Um condomínio de projetos — apps, jogos, ferramentas e conteúdo
            reunidos em um só lugar, sempre em evolução.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Navegação
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/" className="transition-colors hover:text-terracota">Home</Link></li>
            <li><Link href="/projects" className="transition-colors hover:text-terracota">Projetos</Link></li>
            <li><Link href="/#about" className="transition-colors hover:text-terracota">Sobre</Link></li>
            <li><Link href="/#contact" className="transition-colors hover:text-terracota">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Redes
          </h3>
          <div className="mt-4 flex gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] text-[var(--text)] transition-all duration-300 hover:-translate-y-0.5 hover:border-terracota hover:text-terracota"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)]">
        <div className="container-nexus flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted sm:flex-row">
          <p>© {year} NEXUS. Todos os direitos reservados.</p>
          <p>
            Construído com <span className="text-terracota">Next.js</span> +
            <span className="text-terracota"> Tailwind</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 1.1h3.7l-8.1 9.2L24 22.9h-7.4l-5.8-7.6-6.6 7.6H.4l8.6-9.9L0 1.1h7.6l5.2 6.9zM17.6 20.7h2L6.5 3.2h-2.2z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}
