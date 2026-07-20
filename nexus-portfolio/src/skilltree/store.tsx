"use client";

/**
 * Estado global do SkillTree — independente do CodeLingo, sua própria chave
 * de localStorage. Local-first: não há backend real (ver nota no login).
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SKILLS, getSkill } from "./skills";
import { ACHIEVEMENTS, AchievementInput } from "./achievements";

const STORAGE_KEY = "skilltree.progress.v1";

export interface SkillState {
  unlockedAt: string; // data ISO
  quizBest: number; // 0..1
  quizAttempts: number;
  projectDone: boolean;
}

export interface Profile {
  name: string;
  avatar: string;
  provider: "google" | "github" | "discord" | "email" | null;
  createdAt: string | null;
}

export interface XpEvent {
  date: string;
  amount: number;
  reason: string;
}

export interface Progress {
  profile: Profile;
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  freezes: number;
  dailyGoalMinutes: number;
  minutesToday: number;
  minutesTodayDate: string;
  totalMinutes: number;
  skills: Record<string, SkillState>;
  achievements: string[];
  quizzesCorrect: number;
  studyDays: string[];
  xpHistory: XpEvent[];
  lastSkill: string | null;
  mentorQuestionsAsked: number;
}

const today = () => new Date().toISOString().slice(0, 10);
function daysBetween(a: string, b: string): number {
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}

const initial: Progress = {
  profile: { name: "Explorador", avatar: "🧑‍🚀", provider: null, createdAt: null },
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  freezes: 2,
  dailyGoalMinutes: 20,
  minutesToday: 0,
  minutesTodayDate: today(),
  totalMinutes: 0,
  skills: {},
  achievements: [],
  quizzesCorrect: 0,
  studyDays: [],
  xpHistory: [],
  lastSkill: null,
  mentorQuestionsAsked: 0,
};

// ---- Nível ------------------------------------------------------------

export function levelStartXp(level: number): number {
  return 60 * level * (level - 1);
}
export function levelFromXp(xp: number): number {
  let l = 1;
  while (levelStartXp(l + 1) <= xp) l++;
  return l;
}
export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const start = levelStartXp(level);
  const next = levelStartXp(level + 1);
  const span = next - start;
  const into = xp - start;
  return { level, into, span, pct: span > 0 ? Math.max(0, Math.min(1, into / span)) : 1 };
}

// ---- Helpers de habilidade ---------------------------------------------

export function isUnlocked(p: Progress, skillId: string): boolean {
  return !!p.skills[skillId];
}
export function isAvailable(p: Progress, skillId: string): boolean {
  const skill = getSkill(skillId);
  if (!skill) return false;
  if (isUnlocked(p, skillId)) return true;
  return skill.prerequisites.every((id) => isUnlocked(p, id));
}

// ---- Contexto -----------------------------------------------------------

interface UnlockResult {
  xpGained: number;
  newLevel: number | null;
  newAchievements: string[];
}

interface StoreValue {
  p: Progress;
  ready: boolean;
  setProfile: (name: string, avatar: string, provider: Profile["provider"]) => void;
  logout: () => void;
  unlockSkill: (skillId: string) => UnlockResult;
  addXp: (amount: number, reason: string) => { newLevel: number | null; newAchievements: string[] };
  addStudyMinutes: (minutes: number) => void;
  recordQuiz: (skillId: string, correct: boolean, scorePct: number) => void;
  completeProject: (skillId: string) => UnlockResult;
  askMentor: () => void;
  setDailyGoal: (minutes: number) => void;
  useFreeze: () => void;
  reset: () => void;
  achievementInput: AchievementInput;
}

const StoreCtx = createContext<StoreValue | null>(null);

function touchStreak(prev: Progress): { streak: number; freezes: number; lastActiveDate: string; studyDays: string[] } {
  const t = today();
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
  const studyDays = prev.studyDays.includes(t) ? prev.studyDays : [...prev.studyDays, t];
  return { streak, freezes, lastActiveDate: t, studyDays };
}

export function SkillTreeProvider({ children }: { children: React.ReactNode }) {
  const [p, setP] = useState<Progress>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Progress>;
        setP({ ...initial, ...parsed, profile: { ...initial.profile, ...parsed.profile }, skills: { ...parsed.skills } });
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

  const achievementInput: AchievementInput = useMemo(
    () => ({
      xp: p.xp,
      level: levelFromXp(p.xp),
      streak: p.streak,
      skillsUnlocked: Object.keys(p.skills),
      projectsCompleted: Object.entries(p.skills).filter(([, s]) => s.projectDone).map(([id]) => id),
      quizzesCorrect: p.quizzesCorrect,
      studyDaysCount: p.studyDays.length,
    }),
    [p],
  );

  const applyUnlockedAchievements = useCallback((next: Progress): string[] => {
    const ai: AchievementInput = {
      xp: next.xp,
      level: levelFromXp(next.xp),
      streak: next.streak,
      skillsUnlocked: Object.keys(next.skills),
      projectsCompleted: Object.entries(next.skills).filter(([, s]) => s.projectDone).map(([id]) => id),
      quizzesCorrect: next.quizzesCorrect,
      studyDaysCount: next.studyDays.length,
    };
    const unlocked = ACHIEVEMENTS.filter((a) => a.check(ai) && !next.achievements.includes(a.id)).map((a) => a.id);
    if (unlocked.length) next.achievements = [...next.achievements, ...unlocked];
    return unlocked;
  }, []);

  const setProfile = useCallback((name: string, avatar: string, provider: Profile["provider"]) => {
    setP((prev) => {
      const next: Progress = { ...prev, profile: { name: name || prev.profile.name, avatar: avatar || prev.profile.avatar, provider, createdAt: prev.profile.createdAt ?? new Date().toISOString() } };
      applyUnlockedAchievements(next);
      return next;
    });
  }, [applyUnlockedAchievements]);

  const logout = useCallback(() => {
    setP((prev) => ({ ...prev, profile: { ...initial.profile } }));
  }, []);

  const addXp = useCallback(
    (amount: number, reason: string) => {
      let result = { newLevel: null as number | null, newAchievements: [] as string[] };
      setP((prev) => {
        const streakInfo = touchStreak(prev);
        const oldLevel = levelFromXp(prev.xp);
        const newXp = prev.xp + amount;
        const newLevel = levelFromXp(newXp);
        const next: Progress = {
          ...prev,
          xp: newXp,
          ...streakInfo,
          xpHistory: [...prev.xpHistory, { date: today(), amount, reason }].slice(-500),
        };
        const newAchievements = applyUnlockedAchievements(next);
        result = { newLevel: newLevel > oldLevel ? newLevel : null, newAchievements };
        return next;
      });
      return result;
    },
    [applyUnlockedAchievements],
  );

  const unlockSkill = useCallback(
    (skillId: string): UnlockResult => {
      const skill = getSkill(skillId);
      let result: UnlockResult = { xpGained: 0, newLevel: null, newAchievements: [] };
      if (!skill) return result;
      setP((prev) => {
        if (prev.skills[skillId]) return prev;
        const streakInfo = touchStreak(prev);
        const oldLevel = levelFromXp(prev.xp);
        const newXp = prev.xp + skill.xp;
        const newLevel = levelFromXp(newXp);
        const next: Progress = {
          ...prev,
          xp: newXp,
          ...streakInfo,
          skills: { ...prev.skills, [skillId]: { unlockedAt: new Date().toISOString(), quizBest: 0, quizAttempts: 0, projectDone: false } },
          lastSkill: skillId,
          xpHistory: [...prev.xpHistory, { date: today(), amount: skill.xp, reason: `Desbloqueou ${skill.name}` }].slice(-500),
        };
        const newAchievements = applyUnlockedAchievements(next);
        result = { xpGained: skill.xp, newLevel: newLevel > oldLevel ? newLevel : null, newAchievements };
        return next;
      });
      return result;
    },
    [applyUnlockedAchievements],
  );

  const addStudyMinutes = useCallback((minutes: number) => {
    setP((prev) => {
      const t = today();
      const streakInfo = touchStreak(prev);
      const minutesToday = prev.minutesTodayDate === t ? prev.minutesToday + minutes : minutes;
      const next: Progress = { ...prev, ...streakInfo, minutesToday, minutesTodayDate: t, totalMinutes: prev.totalMinutes + minutes };
      applyUnlockedAchievements(next);
      return next;
    });
  }, [applyUnlockedAchievements]);

  const recordQuiz = useCallback(
    (skillId: string, correct: boolean, scorePct: number) => {
      setP((prev) => {
        const s = prev.skills[skillId];
        if (!s) return prev;
        const streakInfo = touchStreak(prev);
        const next: Progress = {
          ...prev,
          ...streakInfo,
          quizzesCorrect: prev.quizzesCorrect + (correct ? 1 : 0),
          skills: { ...prev.skills, [skillId]: { ...s, quizBest: Math.max(s.quizBest, scorePct), quizAttempts: s.quizAttempts + 1 } },
        };
        applyUnlockedAchievements(next);
        return next;
      });
    },
    [applyUnlockedAchievements],
  );

  const completeProject = useCallback(
    (skillId: string): UnlockResult => {
      let result: UnlockResult = { xpGained: 0, newLevel: null, newAchievements: [] };
      setP((prev) => {
        const s = prev.skills[skillId];
        if (!s || s.projectDone) return prev;
        const streakInfo = touchStreak(prev);
        const oldLevel = levelFromXp(prev.xp);
        const bonus = 60;
        const newXp = prev.xp + bonus;
        const newLevel = levelFromXp(newXp);
        const next: Progress = {
          ...prev,
          xp: newXp,
          ...streakInfo,
          skills: { ...prev.skills, [skillId]: { ...s, projectDone: true } },
          xpHistory: [...prev.xpHistory, { date: today(), amount: bonus, reason: "Projeto concluído" }].slice(-500),
        };
        const newAchievements = applyUnlockedAchievements(next);
        result = { xpGained: bonus, newLevel: newLevel > oldLevel ? newLevel : null, newAchievements };
        return next;
      });
      return result;
    },
    [applyUnlockedAchievements],
  );

  const askMentor = useCallback(() => {
    setP((prev) => ({ ...prev, mentorQuestionsAsked: prev.mentorQuestionsAsked + 1 }));
  }, []);

  const setDailyGoal = useCallback((minutes: number) => setP((prev) => ({ ...prev, dailyGoalMinutes: minutes })), []);
  const useFreeze = useCallback(() => setP((prev) => (prev.freezes > 0 ? { ...prev, freezes: prev.freezes - 1 } : prev)), []);
  const reset = useCallback(() => setP({ ...initial, minutesTodayDate: today() }), []);

  const value: StoreValue = {
    p,
    ready,
    setProfile,
    logout,
    unlockSkill,
    addXp,
    addStudyMinutes,
    recordQuiz,
    completeProject,
    askMentor,
    setDailyGoal,
    useFreeze,
    reset,
    achievementInput,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useSkillTree(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useSkillTree precisa estar dentro de SkillTreeProvider");
  return ctx;
}

export { SKILLS };
