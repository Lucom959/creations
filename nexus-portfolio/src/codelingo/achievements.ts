/** Definições de conquistas do CodeLingo. */

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  /** Avalia se está desbloqueada a partir do estado de progresso. */
  check: (s: AchievementInput) => boolean;
  /** Progresso 0..1 opcional para exibir barra. */
  progress?: (s: AchievementInput) => number;
}

export interface AchievementInput {
  xp: number;
  level: number;
  streak: number;
  lessonsCompleted: number;
  coursesCompleted: number;
  perfectLessons: number;
  masteredCodes: string[];
  totalCorrect: number;
  bestAccuracy: number;
  fastestLessonSec: number | null;
}

const pct = (v: number, target: number) => Math.max(0, Math.min(1, v / target));

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-code", name: "Primeiro Código", desc: "Complete sua primeira lição.", icon: "🎯", check: (s) => s.lessonsCompleted >= 1, progress: (s) => pct(s.lessonsCompleted, 1) },
  { id: "xp-100", name: "100 XP", desc: "Acumule 100 pontos de XP.", icon: "⚡", check: (s) => s.xp >= 100, progress: (s) => pct(s.xp, 100) },
  { id: "xp-500", name: "500 XP", desc: "Acumule 500 pontos de XP.", icon: "🔋", check: (s) => s.xp >= 500, progress: (s) => pct(s.xp, 500) },
  { id: "xp-1000", name: "Mil e Um", desc: "Acumule 1000 XP.", icon: "🌟", check: (s) => s.xp >= 1000, progress: (s) => pct(s.xp, 1000) },
  { id: "week", name: "Primeira Semana", desc: "Mantenha 7 dias de sequência.", icon: "🔥", check: (s) => s.streak >= 7, progress: (s) => pct(s.streak, 7) },
  { id: "streak-30", name: "Mês de Fogo", desc: "Alcance 30 dias de sequência.", icon: "🌋", check: (s) => s.streak >= 30, progress: (s) => pct(s.streak, 30) },
  { id: "morse-master", name: "Especialista em Morse", desc: "Domine o Código Morse.", icon: "📡", check: (s) => s.masteredCodes.includes("morse") },
  { id: "binary-master", name: "Especialista em Binário", desc: "Domine o Código Binário.", icon: "🔢", check: (s) => s.masteredCodes.includes("binary") },
  { id: "cipher-master", name: "Mestre das Cifras", desc: "Domine César, Vigenère e Atbash.", icon: "🗝️", check: (s) => ["caesar", "vigenere", "atbash"].every((c) => s.masteredCodes.includes(c)) },
  { id: "collector", name: "Colecionador", desc: "Domine 10 códigos diferentes.", icon: "🏆", check: (s) => s.masteredCodes.length >= 10, progress: (s) => pct(s.masteredCodes.length, 10) },
  { id: "all-codes", name: "Poliglota de Códigos", desc: "Domine todos os 20 códigos.", icon: "👑", check: (s) => s.masteredCodes.length >= 20, progress: (s) => pct(s.masteredCodes.length, 20) },
  { id: "perfectionist", name: "Perfeccionista", desc: "Termine 5 lições sem errar.", icon: "💎", check: (s) => s.perfectLessons >= 5, progress: (s) => pct(s.perfectLessons, 5) },
  { id: "speedster", name: "Velocista", desc: "Termine uma lição em menos de 60s.", icon: "🚀", check: (s) => s.fastestLessonSec !== null && s.fastestLessonSec <= 60 },
  { id: "sharp", name: "Precisão Cirúrgica", desc: "Alcance 95% de precisão numa lição.", icon: "🎓", check: (s) => s.bestAccuracy >= 0.95 },
  { id: "level-5", name: "Ascensão", desc: "Chegue ao nível 5.", icon: "📈", check: (s) => s.level >= 5, progress: (s) => pct(s.level, 5) },
  { id: "level-10", name: "Veterano", desc: "Chegue ao nível 10.", icon: "🎖️", check: (s) => s.level >= 10, progress: (s) => pct(s.level, 10) },
  { id: "courses-5", name: "Explorador", desc: "Conclua 5 cursos completos.", icon: "🧭", check: (s) => s.coursesCompleted >= 5, progress: (s) => pct(s.coursesCompleted, 5) },
  { id: "hundred-correct", name: "Centenário", desc: "Acerte 100 exercícios no total.", icon: "💯", check: (s) => s.totalCorrect >= 100, progress: (s) => pct(s.totalCorrect, 100) },
];
