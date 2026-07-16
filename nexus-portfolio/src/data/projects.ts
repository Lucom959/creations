export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: "Apps" | "Jogos" | "Ferramentas" | "Conteúdo" | "Outros";
  status: "Published" | "In Development" | "Planned";
  image: string;
  tags: string[];
  links: {
    live?: string;
    repo?: string;
    demo?: string;
  };
  featured: boolean;
  date: string;
  progress?: number;
}

export const projects: Project[] = [
  {
    id: "codelingo",
    title: "CodeLingo",
    description: "O Duolingo dos códigos: aprenda Morse, binário e criptografia jogando.",
    longDescription:
      "CodeLingo é um app gamificado para aprender códigos, cifras e sistemas de comunicação — do Código Morse à cifra de Vigenère. Traz uma árvore de aprendizado estilo Duolingo com 20 cursos, exercícios auto-gerados de dificuldade crescente, engine real de codificação/decodificação, sistema de XP, níveis, ligas (Bronze a Lendário), streaks, dezenas de conquistas, estatísticas com gráficos e o tutor CipherBot. Visual premium em preto e âmbar, modo claro/escuro, sons via Web Audio e animações. Tudo roda no navegador, sem backend.",
    category: "Apps",
    status: "Published",
    image: "/images/placeholder.svg",
    tags: ["Next.js", "TypeScript", "Gamificação", "Criptografia", "Educação"],
    links: { live: "/codelingo", demo: "/codelingo" },
    featured: true,
    date: "2026-07-16",
  },
  {
    id: "projeto-2",
    title: "Projeto 2",
    description: "Em desenvolvimento",
    longDescription: "Descrição será adicionada em breve...",
    category: "Apps",
    status: "Planned",
    image: "/images/placeholder.svg",
    tags: ["tag"],
    links: {},
    featured: false,
    date: "2026-01-02",
  },
  {
    id: "projeto-3",
    title: "Projeto 3",
    description: "Em desenvolvimento",
    longDescription: "Descrição será adicionada em breve...",
    category: "Jogos",
    status: "Planned",
    image: "/images/placeholder.svg",
    tags: ["tag"],
    links: {},
    featured: false,
    date: "2026-01-03",
  },
  {
    id: "projeto-4",
    title: "Projeto 4",
    description: "Em desenvolvimento",
    longDescription: "Descrição será adicionada em breve...",
    category: "Ferramentas",
    status: "Planned",
    image: "/images/placeholder.svg",
    tags: ["tag"],
    links: {},
    featured: false,
    date: "2026-01-04",
  },
  {
    id: "projeto-5",
    title: "Projeto 5",
    description: "Em desenvolvimento",
    longDescription: "Descrição será adicionada em breve...",
    category: "Conteúdo",
    status: "Planned",
    image: "/images/placeholder.svg",
    tags: ["tag"],
    links: {},
    featured: false,
    date: "2026-01-05",
  },
  {
    id: "projeto-6",
    title: "Projeto 6",
    description: "Em desenvolvimento",
    longDescription: "Descrição será adicionada em breve...",
    category: "Outros",
    status: "Planned",
    image: "/images/placeholder.svg",
    tags: ["tag"],
    links: {},
    featured: false,
    date: "2026-01-06",
  },
  {
    id: "projeto-7",
    title: "Projeto 7",
    description: "Em desenvolvimento",
    longDescription: "Descrição será adicionada em breve...",
    category: "Apps",
    status: "Planned",
    image: "/images/placeholder.svg",
    tags: ["tag"],
    links: {},
    featured: false,
    date: "2026-01-07",
  },
];

// ---- Derived helpers -------------------------------------------------------

export const categories = [
  "Apps",
  "Jogos",
  "Ferramentas",
  "Conteúdo",
  "Outros",
] as const;

export const statuses = ["Published", "In Development", "Planned"] as const;

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getRelatedProjects(project: Project, limit = 3): Project[] {
  return projects
    .filter((p) => p.id !== project.id && p.category === project.category)
    .slice(0, limit);
}

export const statusStyles: Record<
  Project["status"],
  { label: string; badge: string; dot: string }
> = {
  Published: {
    label: "Published",
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  "In Development": {
    label: "In Development",
    badge:
      "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  Planned: {
    label: "Planned",
    badge:
      "bg-neutral-200 text-neutral-700 dark:bg-neutral-700/40 dark:text-neutral-300",
    dot: "bg-neutral-400",
  },
};
