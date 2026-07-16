import Image from "next/image";
import Link from "next/link";
import { Project, statusStyles } from "@/data/projects";

export default function ProjectCard({ project }: { project: Project }) {
  const status = statusStyles[project.status];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border card-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/projects/${project.id}`}
        className="relative block aspect-[4/3] overflow-hidden"
        aria-label={`Abrir ${project.title}`}
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-medium uppercase tracking-wider text-terracota">
          {project.category}
        </span>
        <h3 className="mt-1 font-serif text-xl font-semibold leading-snug">
          <Link
            href={`/projects/${project.id}`}
            className="transition-colors hover:text-terracota"
          >
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">
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

        {project.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--bg)] px-2.5 py-0.5 text-xs text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions revealed on hover */}
        <div className="mt-4 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-sm:opacity-100">
          <Link
            href={`/projects/${project.id}`}
            className="flex-1 rounded-full bg-terracota px-4 py-2 text-center text-xs font-semibold text-cream transition-colors hover:bg-terracota-dark"
          >
            Ver detalhes
          </Link>
          {project.links.repo && (
            <a
              href={project.links.repo}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold transition-colors hover:border-terracota hover:text-terracota"
            >
              Repo
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
