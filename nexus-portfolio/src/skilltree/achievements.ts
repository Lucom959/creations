/**
 * SkillTree — conquistas (100+), geradas sistematicamente a partir dos
 * domínios/habilidades reais em skills.ts — nada de entradas fictícias
 * soltas, cada conquista mapeia para um marco real e verificável.
 */

import { DOMAINS, SKILLS, skillsForDomain } from "./skills";

export interface AchievementInput {
  xp: number;
  level: number;
  streak: number;
  skillsUnlocked: string[];
  projectsCompleted: string[];
  quizzesCorrect: number;
  studyDaysCount: number;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  check: (s: AchievementInput) => boolean;
  progress?: (s: AchievementInput) => number;
}

const pct = (v: number, target: number) => Math.max(0, Math.min(1, v / target));
const has = (input: AchievementInput, id: string) => input.skillsUnlocked.includes(id);
const domainMastered = (input: AchievementInput, domainId: string) => {
  const ids = skillsForDomain(domainId).map((s) => s.id);
  return ids.length > 0 && ids.every((id) => input.skillsUnlocked.includes(id));
};
const domainStarted = (input: AchievementInput, domainId: string) => {
  return skillsForDomain(domainId).some((s) => input.skillsUnlocked.includes(s.id));
};

const domainAchievements: Achievement[] = DOMAINS.flatMap((d) => [
  {
    id: `first-${d.id}`,
    name: `Primeiro passo: ${d.name}`,
    desc: `Desbloqueie sua primeira habilidade em ${d.name}.`,
    icon: d.icon,
    check: (s) => domainStarted(s, d.id),
  },
  {
    id: `master-${d.id}`,
    name: `Mestre em ${d.name}`,
    desc: `Domine todas as habilidades de ${d.name}.`,
    icon: "🏆",
    check: (s) => domainMastered(s, d.id),
    progress: (s) => {
      const ids = skillsForDomain(d.id).map((x) => x.id);
      const done = ids.filter((id) => s.skillsUnlocked.includes(id)).length;
      return pct(done, ids.length);
    },
  },
]);

const xpMilestones = [100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000, 15000];
const xpAchievements: Achievement[] = xpMilestones.map((m) => ({
  id: `xp-${m}`,
  name: `${m.toLocaleString("pt-BR")} XP`,
  desc: `Acumule ${m.toLocaleString("pt-BR")} pontos de experiência.`,
  icon: "⚡",
  check: (s) => s.xp >= m,
  progress: (s) => pct(s.xp, m),
}));

const streakMilestones = [3, 7, 14, 30, 50, 100, 200, 365];
const streakAchievements: Achievement[] = streakMilestones.map((m) => ({
  id: `streak-${m}`,
  name: m === 365 ? "Um ano de dedicação" : `${m} dias seguidos`,
  desc: `Mantenha uma sequência de estudo de ${m} dias.`,
  icon: "🔥",
  check: (s) => s.streak >= m,
  progress: (s) => pct(s.streak, m),
}));

const skillCountMilestones = [1, 5, 10, 20, 30, SKILLS.length];
const skillCountAchievements: Achievement[] = skillCountMilestones.map((m, i) => ({
  id: `skills-${m}`,
  name: i === skillCountMilestones.length - 1 ? "Onisciente" : `${m} habilidades desbloqueadas`,
  desc: i === skillCountMilestones.length - 1 ? "Desbloqueie todas as habilidades da árvore." : `Desbloqueie ${m} habilidades diferentes.`,
  icon: "🌳",
  check: (s) => s.skillsUnlocked.length >= m,
  progress: (s) => pct(s.skillsUnlocked.length, m),
}));

const TOTAL_PROJECTS = SKILLS.filter((s) => s.project).length;
const projectCountMilestones = [1, 3, 5, 8, TOTAL_PROJECTS];
const projectCountAchievements: Achievement[] = projectCountMilestones.map((m, i) => ({
  id: `projects-${m}`,
  name: i === 0 ? "Primeiro Projeto" : i === projectCountMilestones.length - 1 ? "Construtor Completo" : `${m} projetos concluídos`,
  desc: i === projectCountMilestones.length - 1 ? "Conclua todos os projetos práticos disponíveis." : `Conclua ${m} projeto(s) prático(s).`,
  icon: "🛠️",
  check: (s) => s.projectsCompleted.length >= m,
  progress: (s) => pct(s.projectsCompleted.length, m),
}));

const quizMilestones = [1, 10, 25, 50, 100];
const quizAchievements: Achievement[] = quizMilestones.map((m, i) => ({
  id: `quiz-${m}`,
  name: i === 0 ? "Primeiro Quiz" : `${m} quizzes respondidos corretamente`,
  desc: `Acerte ${m} pergunta(s) de quiz.`,
  icon: "🎯",
  check: (s) => s.quizzesCorrect >= m,
  progress: (s) => pct(s.quizzesCorrect, m),
}));

const levelMilestones = [5, 10, 15, 20, 30, 40];
const levelAchievements: Achievement[] = levelMilestones.map((m) => ({
  id: `level-${m}`,
  name: `Nível ${m}`,
  desc: `Alcance o nível ${m}.`,
  icon: "📈",
  check: (s) => s.level >= m,
  progress: (s) => pct(s.level, m),
}));

const studyDaysMilestones = [10, 30];
const studyDaysAchievements: Achievement[] = studyDaysMilestones.map((m) => ({
  id: `studydays-${m}`,
  name: m === 10 ? "Estudante Dedicado" : "Veterano do SkillTree",
  desc: `Estude em ${m} dias diferentes (não precisam ser seguidos).`,
  icon: "📚",
  check: (s) => s.studyDaysCount >= m,
  progress: (s) => pct(s.studyDaysCount, m),
}));

/** Conquistas nomeadas por habilidade específica (as mais notáveis/raízes). */
const NAMED_SKILL_UNLOCKS: { id: string; name: string; icon: string }[] = [
  { id: "html", name: "Primeiro Site", icon: "📄" },
  { id: "css", name: "Estilista Nato", icon: "🎨" },
  { id: "javascript", name: "Programador Web", icon: "⚡" },
  { id: "python", name: "Pythonista", icon: "🐍" },
  { id: "cpp", name: "Domador de C++", icon: "🔵" },
  { id: "react", name: "Reagente", icon: "⚛️" },
  { id: "node", name: "Back-end Ativado", icon: "🟢" },
  { id: "arduino", name: "Primeiro Robô", icon: "🔋" },
  { id: "robotica", name: "Roboticista", icon: "🦾" },
  { id: "inteligencia-artificial", name: "Primeira IA", icon: "🤖" },
  { id: "machine-learning", name: "Cientista de Dados", icon: "📊" },
  { id: "cyberseg-fundamentos", name: "Guardião Digital", icon: "🛡️" },
  { id: "criptografia", name: "Mestre das Cifras", icon: "🔐" },
  { id: "design-grafico", name: "Olho de Designer", icon: "🖌️" },
  { id: "ui-ux", name: "Arquiteto de Experiências", icon: "🧭" },
  { id: "modelagem-3d", name: "Escultor Digital", icon: "🧊" },
  { id: "impressao-3d", name: "Fabricante", icon: "🖨️" },
  { id: "unity", name: "Game Dev Unity", icon: "🎮" },
  { id: "unreal", name: "Game Dev Unreal", icon: "🕹️" },
  { id: "mobile-dev", name: "Desenvolvedor Mobile", icon: "📱" },
  { id: "banco-dados", name: "Guardião de Dados", icon: "🗄️" },
  { id: "linux", name: "Pinguim Domado", icon: "🐧" },
  { id: "git", name: "Controlador de Versões", icon: "🌿" },
  { id: "cloud", name: "Cabeça nas Nuvens", icon: "☁️" },
  { id: "flexbox", name: "Mestre do Flexbox", icon: "↔️" },
  { id: "grid", name: "Mestre do Grid", icon: "▦" },
  { id: "async", name: "Assíncrono Dominado", icon: "⏳" },
  { id: "apis", name: "Conector de APIs", icon: "🔌" },
  { id: "ponteiros", name: "Ponteiros Domados", icon: "👉" },
  { id: "iot", name: "Conectado ao Mundo", icon: "📡" },
];
const namedSkillAchievements: Achievement[] = NAMED_SKILL_UNLOCKS.map((n) => ({
  id: `skill-${n.id}`,
  name: n.name,
  desc: `Desbloqueie a habilidade "${SKILLS.find((s) => s.id === n.id)?.name ?? n.id}".`,
  icon: n.icon,
  check: (s) => has(s, n.id),
}));

/** Conquistas especiais que combinam múltiplas habilidades. */
const specialAchievements: Achievement[] = [
  {
    id: "front-end-master",
    name: "Mestre Front-end",
    desc: "Domine HTML, CSS, JavaScript e React.",
    icon: "🖥️",
    check: (s) => ["html", "css", "javascript", "react"].every((id) => has(s, id)),
    progress: (s) => pct(["html", "css", "javascript", "react"].filter((id) => has(s, id)).length, 4),
  },
  {
    id: "python-specialist",
    name: "Especialista em Python",
    desc: "Domine Python, Variáveis, Loops e Funções.",
    icon: "🐍",
    check: (s) => ["python", "variaveis", "loops", "funcoes"].every((id) => has(s, id)),
    progress: (s) => pct(["python", "variaveis", "loops", "funcoes"].filter((id) => has(s, id)).length, 4),
  },
  {
    id: "full-stack",
    name: "Full Stack",
    desc: "Domine JavaScript, Node.js, React e Banco de Dados.",
    icon: "🧱",
    check: (s) => ["javascript", "node", "react", "banco-dados"].every((id) => has(s, id)),
    progress: (s) => pct(["javascript", "node", "react", "banco-dados"].filter((id) => has(s, id)).length, 4),
  },
  {
    id: "polyglot",
    name: "Poliglota de Código",
    desc: "Domine HTML, JavaScript, Python e C++ — quatro linguagens/tecnologias diferentes.",
    icon: "🗣️",
    check: (s) => ["html", "javascript", "python", "cpp"].every((id) => has(s, id)),
    progress: (s) => pct(["html", "javascript", "python", "cpp"].filter((id) => has(s, id)).length, 4),
  },
  {
    id: "cyber-guardian",
    name: "Cyber Guardião",
    desc: "Domine todo o domínio de Cibersegurança.",
    icon: "🛡️",
    check: (s) => domainMastered(s, "cybersecurity"),
  },
  {
    id: "game-dev-master",
    name: "Mestre dos Jogos",
    desc: "Domine tanto Unity quanto Unreal Engine.",
    icon: "🎮",
    check: (s) => ["unity", "unreal"].every((id) => has(s, id)),
    progress: (s) => pct(["unity", "unreal"].filter((id) => has(s, id)).length, 2),
  },
  {
    id: "infra-guardian",
    name: "Guardião da Infraestrutura",
    desc: "Domine Banco de Dados, Redes, Linux, Git e Cloud.",
    icon: "🗄️",
    check: (s) => domainMastered(s, "dados-infra"),
  },
  {
    id: "omnivorous",
    name: "Onívoro do Conhecimento",
    desc: "Desbloqueie ao menos uma habilidade em todos os domínios do SkillTree.",
    icon: "🌍",
    check: (s) => DOMAINS.every((d) => domainStarted(s, d.id)),
    progress: (s) => pct(DOMAINS.filter((d) => domainStarted(s, d.id)).length, DOMAINS.length),
  },
  {
    id: "explorer-5",
    name: "Explorador",
    desc: "Desbloqueie habilidades em pelo menos 5 domínios diferentes.",
    icon: "🧭",
    check: (s) => DOMAINS.filter((d) => domainStarted(s, d.id)).length >= 5,
    progress: (s) => pct(DOMAINS.filter((d) => domainStarted(s, d.id)).length, 5),
  },
  {
    id: "welcome",
    name: "Bem-vindo ao SkillTree",
    desc: "Crie seu perfil e comece sua jornada.",
    icon: "🚀",
    check: () => true,
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  ...specialAchievements,
  ...domainAchievements,
  ...xpAchievements,
  ...streakAchievements,
  ...skillCountAchievements,
  ...projectCountAchievements,
  ...quizAchievements,
  ...levelAchievements,
  ...studyDaysAchievements,
  ...namedSkillAchievements,
];
