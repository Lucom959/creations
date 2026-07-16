import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectCard from "@/components/ProjectCard";
import ShareButtons from "@/components/ShareButtons";
import {
  getProjectById,
  getRelatedProjects,
  projects,
  statusStyles,
} from "@/data/projects";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) return { title: "Projeto não encontrado" };

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: `${project.title} · NEXUS`,
      description: project.description,
      images: [{ url: project.image }],
    },
  };
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) notFound();

  const status = statusStyles[project.status];
  const related = getRelatedProjects(project);
  const formattedDate = dateFormatter.format(new Date(project.date));

  return (
    <div className="container-nexus py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/" className="transition-colors hover:text-terracota">Home</Link>
        <span>/</span>
        <Link href="/projects" className="transition-colors hover:text-terracota">Projetos</Link>
        <span>/</span>
        <span className="text-[var(--text)]">{project.title}</span>
      </nav>

      {/* Hero image */}
      <div className="relative mt-6 aspect-[16/7] w-full overflow-hidden rounded-3xl border border-[var(--border)]">
        <Image
          src={project.image}
          alt={project.title}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover"
        />
        <span
          className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <article>
          <span className="text-sm font-semibold uppercase tracking-wider text-terracota">
            {project.category}
          </span>
          <h1 className="mt-2 font-serif text-5xl font-bold leading-tight">
            {project.title}
          </h1>
          <p className="mt-3 text-lg text-muted">{project.description}</p>

          <div className="mt-8 max-w-none">
            <h2 className="font-serif text-2xl font-semibold">Sobre o projeto</h2>
            <p className="mt-3 leading-relaxed text-muted">
              {project.longDescription}
            </p>
          </div>

          {/* Technologies */}
          <div className="mt-10">
            <h2 className="font-serif text-2xl font-semibold">Tecnologias</h2>
            {project.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-1.5 text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">
                As tecnologias serão listadas em breve.
              </p>
            )}
          </div>

          <div className="mt-10 border-t border-[var(--border)] pt-6">
            <ShareButtons title={project.title} />
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
            <h2 className="font-serif text-xl font-semibold">Detalhes</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Status</dt>
                <dd>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Categoria</dt>
                <dd className="font-medium">{project.category}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Data</dt>
                <dd className="font-medium">{formattedDate}</dd>
              </div>
            </dl>

            {project.status === "In Development" &&
              typeof project.progress === "number" && (
                <div className="mt-6">
                  <div className="mb-1 flex justify-between text-xs text-muted">
                    <span>Progresso</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber to-terracota"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              )}
          </div>

          {/* CTA buttons */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
            <h2 className="font-serif text-xl font-semibold">Links</h2>
            <div className="mt-4 flex flex-col gap-2">
              <CtaLink href={project.links.live} label="Ver Projeto" primary />
              <CtaLink href={project.links.repo} label="Repositório" />
              <CtaLink href={project.links.demo} label="Demo" />
            </div>
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-serif text-3xl font-semibold">
            Projetos relacionados
          </h2>
          <p className="mt-1 text-muted">
            Outros projetos da categoria {project.category}.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CtaLink({
  href,
  label,
  primary,
}: {
  href?: string;
  label: string;
  primary?: boolean;
}) {
  if (!href) {
    return (
      <span className="inline-flex cursor-not-allowed items-center justify-between rounded-full border border-dashed border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-muted">
        {label}
        <span className="text-xs">em breve</span>
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={
        primary
          ? "inline-flex items-center justify-between rounded-full bg-terracota px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-terracota-dark"
          : "inline-flex items-center justify-between rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold transition-colors hover:border-terracota hover:text-terracota"
      }
    >
      {label}
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17 17 7M7 7h10v10" />
      </svg>
    </a>
  );
}
