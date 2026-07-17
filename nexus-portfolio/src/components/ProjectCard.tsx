import Image from "next/image";
import Link from "next/link";
import { Project, statusStyles } from "@/data/projects";

export default function ProjectCard({ project }: { project: Project }) {
  const status = statusStyles[project.status];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border card-surface shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-terracota/40 hover:shadow-2xl">
      <Link
        href={`/projects/${project.id}`}
        className="relative block aspect-[16/10] overflow-hidden"
        aria-label={`Abrir ${project.title}`}
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${status.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-medium uppercase tracking-wider text-terracota">
          {project.category}
        </span>
        <h3 className="mt-1.5 font-serif text-xl font-semibold leading-snug">
          <Link
            href={`/projects/${project.id}`}
            className="transition-colors hover:text-terracota"
          >
            {project.title}
          </Link>
        </h3>
        <p className="mt-2.5 line-clamp-3 flex-1 text-[0.925rem] leading-relaxed text-[var(--text)]/80">
          {project.description}
        </p>

        {project.status === "In Development" &&
          typeof project.progress === "number" && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>Progresso</span>
                <span>{project.progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber to-terracota"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          )}

        {/* Ação principal — sempre visível, sem lista de tecnologias */}
        <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-terracota transition-all duration-300 group-hover:gap-2.5"
          >
            Ver detalhes
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
          {project.links.repo && (
            <a
              href={project.links.repo}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold transition-colors hover:border-terracota hover:text-terracota"
            >
              Repo
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
