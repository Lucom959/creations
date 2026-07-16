import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import { getFeaturedProjects, projects } from "@/data/projects";

export default function HomePage() {
  const featured = getFeaturedProjects();
  const totalCount = projects.length;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-amber/30 blur-3xl" />
          <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-lavanda/25 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-terracota/20 blur-3xl" />
        </div>

        <div className="container-nexus flex flex-col items-center py-28 text-center sm:py-36">
          <span className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-muted">
            <span className="h-2 w-2 rounded-full bg-terracota" />
            Portfólio vivo
          </span>

          <h1 className="animate-fade-up font-serif text-7xl font-bold leading-none tracking-tight sm:text-8xl md:text-9xl">
            NEXUS
          </h1>
          <p className="animate-fade-up mt-4 font-serif text-2xl italic text-terracota sm:text-3xl" style={{ animationDelay: "80ms" }}>
            Condomínio de Projetos
          </p>
          <p className="animate-fade-up mt-6 max-w-xl text-balance text-base text-muted sm:text-lg" style={{ animationDelay: "160ms" }}>
            Um espaço onde apps, jogos, ferramentas e conteúdo convivem e
            evoluem lado a lado. Explore o que está sendo construído.
          </p>

          <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "240ms" }}>
            <Link href="/projects" className="btn-primary">
              Explorar Projetos
              <ArrowIcon />
            </Link>
            <Link href="/#about" className="btn-ghost">
              Sobre o NEXUS
            </Link>
          </div>

          <dl className="animate-fade-up mt-16 grid grid-cols-3 gap-8 border-t border-[var(--border)] pt-8" style={{ animationDelay: "320ms" }}>
            <Stat value={String(totalCount)} label="Projetos" />
            <Stat value="5" label="Categorias" />
            <Stat value="∞" label="Em evolução" />
          </dl>
        </div>
      </section>

      {/* Featured */}
      <section className="container-nexus py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-4xl font-semibold">Em destaque</h2>
            <p className="mt-2 text-muted">
              Os projetos que merecem um olhar mais de perto.
            </p>
          </div>
          <Link href="/projects" className="hidden shrink-0 text-sm font-semibold text-terracota transition-colors hover:text-terracota-dark sm:inline-flex sm:items-center sm:gap-1">
            Ver todos <ArrowIcon />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] p-8 text-center"
              >
                <span className="font-serif text-4xl text-amber">◇</span>
                <p className="mt-3 text-sm font-medium">Vaga em destaque</p>
                <p className="mt-1 text-xs text-muted">
                  Marque um projeto como <code>featured</code> para exibi-lo aqui.
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About */}
      <section id="about" className="container-nexus scroll-mt-20 py-16">
        <div className="grid gap-10 rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-terracota">
              Sobre
            </span>
            <h2 className="mt-2 font-serif text-4xl font-semibold">
              Um lugar para as ideias morarem
            </h2>
            <p className="mt-4 text-muted">
              O NEXUS é um condomínio de projetos: um portfólio pensado para
              abrigar experimentos, produtos e criações de diferentes formatos.
              Cada projeto tem seu próprio espaço, status e história — e este é
              apenas o começo.
            </p>
            <p className="mt-4 text-muted">
              Este texto é um placeholder pronto para ser substituído pela sua
              própria narrativa. Conte quem você é e o que está construindo.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: "Apps", desc: "Aplicações e produtos digitais." },
              { title: "Jogos", desc: "Experiências interativas e lúdicas." },
              { title: "Ferramentas", desc: "Utilitários que resolvem problemas." },
              { title: "Conteúdo", desc: "Ideias, textos e materiais." },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <h3 className="font-serif text-xl font-semibold text-terracota">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-nexus py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-terracota to-amber-dark px-8 py-16 text-center text-cream">
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-lavanda blur-2xl" />
          </div>
          <h2 className="font-serif text-4xl font-semibold sm:text-5xl">
            Pronto para explorar?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-cream/90">
            Navegue pela galeria completa e acompanhe cada projeto do NEXUS.
          </p>
          <Link
            href="/projects"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-semibold text-terracota transition-transform duration-300 hover:-translate-y-0.5"
          >
            Ver todos os projetos <ArrowIcon />
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <dt className="font-serif text-4xl font-bold text-terracota">{value}</dt>
      <dd className="mt-1 text-xs uppercase tracking-wider text-muted">{label}</dd>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
