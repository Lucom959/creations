"use client";

import { useMemo, useState } from "react";
import { Project, statuses } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import ProjectFilter from "./ProjectFilter";

type Tab = "All" | (typeof statuses)[number];
const tabs: Tab[] = ["All", ...statuses];

const tabLabels: Record<Tab, string> = {
  All: "All",
  Published: "Published",
  "In Development": "In Development",
  Planned: "Planned",
};

export default function ProjectGallery({ projects }: { projects: Project[] }) {
  const [tab, setTab] = useState<Tab>("All");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (tab !== "All" && p.status !== tab) return false;
      if (category !== "Todas" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [projects, tab, category, query]);

  const countFor = (t: Tab) =>
    t === "All" ? projects.length : projects.filter((p) => p.status === t).length;

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] p-1">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
              tab === t
                ? "bg-terracota text-cream shadow-sm"
                : "text-[var(--text)] hover:text-terracota"
            }`}
          >
            {tabLabels[t]}
            <span
              className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                tab === t ? "bg-cream/20" : "bg-[var(--bg)]"
              }`}
            >
              {countFor(t)}
            </span>
          </button>
        ))}
      </div>

      {/* Search + category filter */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, descrição ou tag..."
            aria-label="Buscar projetos"
            className="w-full rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] py-2.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-terracota"
          />
        </div>
        <ProjectFilter active={category} onChange={setCategory} />
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, i) => (
            <div
              key={project.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] py-20 text-center">
          <div className="font-serif text-5xl text-amber">◇</div>
          <p className="mt-4 text-lg font-medium">Nenhum projeto encontrado</p>
          <p className="mt-1 text-sm text-muted">
            Tente ajustar a busca, a aba ou o filtro de categoria.
          </p>
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
