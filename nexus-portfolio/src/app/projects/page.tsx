import type { Metadata } from "next";
import ProjectGallery from "@/components/ProjectGallery";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projetos",
  description:
    "Explore a galeria completa de projetos do NEXUS — filtre por status, categoria e busque em tempo real.",
  openGraph: {
    title: "Projetos · NEXUS",
    description:
      "Explore a galeria completa de projetos do NEXUS — filtre por status, categoria e busque em tempo real.",
  },
};

export default function ProjectsPage() {
  return (
    <div className="container-nexus py-16">
      <header className="max-w-2xl">
        <span className="text-sm font-semibold uppercase tracking-wider text-terracota">
          Galeria
        </span>
        <h1 className="mt-2 font-serif text-5xl font-bold">Projetos</h1>
        <p className="mt-3 text-muted">
          Todos os projetos do condomínio NEXUS reunidos. Use as abas, a busca e
          os filtros para encontrar o que procura.
        </p>
      </header>

      <div className="mt-10">
        <ProjectGallery projects={projects} />
      </div>
    </div>
  );
}
