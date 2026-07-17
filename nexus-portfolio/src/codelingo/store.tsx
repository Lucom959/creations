"use client";

/**
 * Estado global do CodeLingo (React Context) com persistência em localStorage.
 * Cada CÓDIGO é um curso independente: progresso, XP e lições próprios.
 * O XP global (perfil/ligas) soma o de todos os cursos, mas o progresso de um
 * curso nunca afeta o de outro.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ACHIEVEMENTS, AchievementInput } from "./achievements";
import { COURSE_STEPS } from "./curriculum";

const STORAGE_KEY = "codelingo.progress.v3";

export interface LessonState {
  completed: boolean;
  bestScore: number; // 0..1
}

export interface CourseProgress {
  /** Chaveado pelo CourseStep.id (ex.: "u1-learn"). */
  lessons: Partial<Record<string, LessonState>>;
  xp: number;
  mastered: boolean;
  attempts: number;
  bestScore: number;
}

export interface LessonRecord {
  date: string;
  codeId: string;
  stepId: string;
  correct: number;
  total: number;
  xp: number;
}

export interface Progress {
  name: string;
  avatar: string;
  xp: number;
  totalCorrect: number;
  streak: number;
  lastActiveDate: string | null;
  freezes: number;
  dailyGoal: number;
  dailyXp: number;
  dailyDate: string;
  courses: Record<string, CourseProgress>;
  achievements: string[];
  perfectLessons: number;
  fastestLessonSec: number | null;
  bestAccuracy: number;
  studyDays: string[];
  minutesStudied: number;
  history: LessonRecord[];
  favorites: string[];
  lastCourse: string | null;
  theme: "dark" | "light";
}

const today = () => new Date().toISOString().slice(0, 10);

function daysBetween(a: string, b: string): number {
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}

const initial: Progress = {
  name: "Agente",
  avatar: "🕵️",
  xp: 0,
  totalCorrect: 0,
  streak: 0,
  lastActiveDate: null,
  freezes: 2,
  dailyGoal: 50,
  dailyXp: 0,
  dailyDate: today(),
  courses: {},
  achievements: [],
  perfectLessons: 0,
  fastestLessonSec: null,
  bestAccuracy: 0,
  studyDays: [],
  minutesStudied: 0,
  history: [],
  favorites: [],
  lastCourse: null,
  theme: "dark",
};

// ---- Níveis e ligas --------------------------------------------------------

export function levelStartXp(level: number): number {
  return 50 * level * (level - 1); // L1=0, L2=100, L3=300, L4=600...
}
export function levelFromXp(xp: number): number {
  let l = 1;
  while (levelStartXp(l + 1) <= xp) l++;
  return l;
}
export function levelProgress(xp: number): { level: number; into: number; span: number; pct: number } {
  const level = levelFromXp(xp);
  const start = levelStartXp(level);
  const next = levelStartXp(level + 1);
  const span = next - start;
  const into = xp - start;
  return { level, into, span, pct: Math.max(0, Math.min(1, into / span)) };
}

/** Ligas — tudo em tons de âmbar/dourado, sem outras cores. */
export const LEAGUES = [
  { id: "bronze", name: "Bronze", icon: "🥉", min: 0, color: "#8a6a3a" },
  { id: "prata", name: "Prata", icon: "🥈", min: 250, color: "#b89a5e" },
  { id: "ouro", name: "Ouro", icon: "🥇", min: 750, color: "var(--cl-amber)" },
  { id: "platina", name: "Platina", icon: "🏅", min: 1500, color: "#FFC107" },
  { id: "esmeralda", name: "Esmeralda", icon: "🎖️", min: 3000, color: "#FFB300" },
  { id: "diamante", name: "Diamante", icon: "🏆", min: 5000, color: "#FFCA5A" },
  { id: "mestre", name: "Mestre", icon: "👑", min: 8000, color: "#E69500" },
  { id: "lendario", name: "Lendário", icon: "🔱", min: 12000, color: "var(--cl-amber)" },
];
export function leagueFromXp(xp: number) {
  let current = LEAGUES[0];
  for (const l of LEAGUES) if (xp >= l.min) current = l;
  return current;
}

// ---- Helpers de curso ------------------------------------------------------

export function isCourseComplete(cp?: CourseProgress): boolean {
  if (!cp) return false;
  return COURSE_STEPS.every((s) => cp.lessons[s.id]?.completed);
}
export function courseLessonsDone(cp?: CourseProgress): number {
  if (!cp) return 0;
  return COURSE_STEPS.filter((s) => cp.lessons[s.id]?.completed).length;
}

// ---- Contexto --------------------------------------------------------------

interface CompleteResult {
  xpGained: number;
  newLevel: number | null;
  newAchievements: string[];
  mastered: boolean;
  courseCompleted: boolean;
}

interface StoreValue {
  p: Progress;
  ready: boolean;
  completeLesson: (codeId: string, stepId: string, correct: number, total: number, timeSec: number) => CompleteResult;
  isLessonUnlocked: (codeId: string, stepId: string) => boolean;
  courseProgress: (codeId: string) => CourseProgress | undefined;
  toggleFavorite: (codeId: string) => void;
  setProfile: (name: string, avatar: string) => void;
  setDailyGoal: (goal: number) => void;
  setTheme: (t: "dark" | "light") => void;
  useFreeze: () => void;
  reset: () => void;
  achievementInput: AchievementInput;
}

const StoreCtx = createContext<StoreValue | null>(null);

export function CodeLingoProvider({ children }: { children: React.ReactNode }) {
  const [p, setP] = useState<Progress>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Progress>;
        setP({ ...initial, ...parsed, courses: { ...parsed.courses } });
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  }, [p, ready]);

  const achievementInput: AchievementInput = useMemo(() => {
    const mastered = Object.entries(p.courses)
      .filter(([, c]) => c.mastered)
      .map(([id]) => id);
    return {
      xp: p.xp,
      level: levelFromXp(p.xp),
      streak: p.streak,
      lessonsCompleted: p.history.length,
      coursesCompleted: Object.values(p.courses).filter((c) => isCourseComplete(c)).length,
      perfectLessons: p.perfectLessons,
      masteredCodes: mastered,
      totalCorrect: p.totalCorrect,
      bestAccuracy: p.bestAccuracy,
      fastestLessonSec: p.fastestLessonSec,
    };
  }, [p]);

  const courseProgress = useCallback((codeId: string) => p.courses[codeId], [p.courses]);

  /** Lição desbloqueada se for a 1ª do curso ou se a anterior foi concluída. */
  const isLessonUnlocked = useCallback(
    (codeId: string, stepId: string) => {
      const idx = COURSE_STEPS.findIndex((s) => s.id === stepId);
      if (idx <= 0) return true;
      const prev = COURSE_STEPS[idx - 1];
      return !!p.courses[codeId]?.lessons[prev.id]?.completed;
    },
    [p.courses],
  );

  const completeLesson = useCallback(
    (codeId: string, stepId: string, correct: number, total: number, timeSec: number): CompleteResult => {
      const step = COURSE_STEPS.find((s) => s.id === stepId);
      const accuracy = total > 0 ? correct / total : 1;
      const graded = step?.kind !== "learn";
      const perfect = graded && total > 0 && correct === total;
      let result: CompleteResult = { xpGained: 0, newLevel: null, newAchievements: [], mastered: false, courseCompleted: false };

      setP((prev) => {
        const t = today();
        // streak
        let streak = prev.streak;
        let freezes = prev.freezes;
        if (prev.lastActiveDate !== t) {
          if (prev.lastActiveDate === null) streak = 1;
          else {
            const gap = daysBetween(prev.lastActiveDate, t);
            if (gap === 1) streak = prev.streak + 1;
            else if (gap > 1) {
              if (freezes > 0 && gap === 2) {
                freezes -= 1;
                streak = prev.streak + 1;
              } else streak = 1;
            }
          }
        }

        const dailyXp = prev.dailyDate === t ? prev.dailyXp : 0;
        const streakBonus = streak >= 3 ? 5 : 0;
        const xpGained = graded ? correct * 10 + (perfect ? 20 : 0) + streakBonus : 15;

        const cp: CourseProgress = prev.courses[codeId] ?? { lessons: {}, xp: 0, mastered: false, attempts: 0, bestScore: 0 };
        const prevLesson = cp.lessons[stepId];
        const lessons = { ...cp.lessons, [stepId]: { completed: true, bestScore: Math.max(prevLesson?.bestScore ?? 0, accuracy) } };
        const mastered = cp.mastered || (step?.kind === "final" && accuracy >= 0.8);
        const course: CourseProgress = {
          lessons,
          xp: cp.xp + xpGained,
          mastered,
          attempts: cp.attempts + 1,
          bestScore: Math.max(cp.bestScore, graded ? accuracy : cp.bestScore),
        };
        const wasComplete = isCourseComplete(cp);
        const courseCompleted = COURSE_STEPS.every((s) => lessons[s.id]?.completed) && !wasComplete;

        const oldLevel = levelFromXp(prev.xp);
        const newXp = prev.xp + xpGained;
        const newLevel = levelFromXp(newXp);

        const rec: LessonRecord = { date: t, codeId, stepId, correct, total, xp: xpGained };
        const studyDays = prev.studyDays.includes(t) ? prev.studyDays : [...prev.studyDays, t];

        const next: Progress = {
          ...prev,
          xp: newXp,
          totalCorrect: prev.totalCorrect + (graded ? correct : 0),
          streak,
          freezes,
          lastActiveDate: t,
          dailyDate: t,
          dailyXp: dailyXp + xpGained,
          courses: { ...prev.courses, [codeId]: course },
          perfectLessons: prev.perfectLessons + (perfect ? 1 : 0),
          fastestLessonSec:
            graded && timeSec > 0
              ? prev.fastestLessonSec === null
                ? timeSec
                : Math.min(prev.fastestLessonSec, timeSec)
              : prev.fastestLessonSec,
          bestAccuracy: graded ? Math.max(prev.bestAccuracy, accuracy) : prev.bestAccuracy,
          studyDays,
          minutesStudied: prev.minutesStudied + Math.max(1, Math.round(timeSec / 60)),
          history: [...prev.history, rec].slice(-400),
          lastCourse: codeId,
        };

        const ai: AchievementInput = {
          xp: newXp,
          level: newLevel,
          streak,
          lessonsCompleted: next.history.length,
          coursesCompleted: Object.values(next.courses).filter((c) => isCourseComplete(c)).length,
          perfectLessons: next.perfectLessons,
          masteredCodes: Object.entries(next.courses).filter(([, c]) => c.mastered).map(([id]) => id),
          totalCorrect: next.totalCorrect,
          bestAccuracy: next.bestAccuracy,
          fastestLessonSec: next.fastestLessonSec,
        };
        const unlocked = ACHIEVEMENTS.filter((a) => a.check(ai) && !prev.achievements.includes(a.id)).map((a) => a.id);
        next.achievements = [...prev.achievements, ...unlocked];

        result = {
          xpGained,
          newLevel: newLevel > oldLevel ? newLevel : null,
          newAchievements: unlocked,
          mastered: mastered && !cp.mastered,
          courseCompleted,
        };
        return next;
      });

      return result;
    },
    [],
  );

  const toggleFavorite = useCallback((codeId: string) => {
    setP((prev) => ({
      ...prev,
      favorites: prev.favorites.includes(codeId) ? prev.favorites.filter((f) => f !== codeId) : [...prev.favorites, codeId],
    }));
  }, []);
  const setProfile = useCallback((name: string, avatar: string) => {
    setP((prev) => ({ ...prev, name: name || prev.name, avatar: avatar || prev.avatar }));
  }, []);
  const setDailyGoal = useCallback((goal: number) => setP((prev) => ({ ...prev, dailyGoal: goal })), []);
  const setTheme = useCallback((t: "dark" | "light") => setP((prev) => ({ ...prev, theme: t })), []);
  const useFreeze = useCallback(() => setP((prev) => (prev.freezes > 0 ? { ...prev, freezes: prev.freezes - 1 } : prev)), []);
  const reset = useCallback(() => setP({ ...initial, dailyDate: today() }), []);

  const value: StoreValue = {
    p,
    ready,
    completeLesson,
    isLessonUnlocked,
    courseProgress,
    toggleFavorite,
    setProfile,
    setDailyGoal,
    setTheme,
    useFreeze,
    reset,
    achievementInput,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore precisa estar dentro de CodeLingoProvider");
  return ctx;
}
