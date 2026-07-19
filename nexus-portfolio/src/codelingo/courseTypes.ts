/** Tipos compartilhados entre curriculum.ts e progression.ts. */

import { CodeModule } from "./codes";
import { Exercise } from "./exercises";

export type StepKind = "learn" | "guided" | "free" | "review" | "final";

export interface CourseStep {
  id: string; // único dentro do curso, ex.: "u1-learn"
  unitIndex: number;
  unitTitle: string;
  unitIcon: string;
  kind: StepKind;
  title: string;
  icon: string;
  desc: string;
}

export interface TeachCard {
  title: string;
  icon: string;
  body: string;
  example?: { plain: string; encoded: string };
  morse?: string;
  hint?: string;
  visual?: { kind: "semaphore" | "pigpen"; letter: string };
  list?: string[];
}

export interface Lesson {
  step: CourseStep;
  code: CodeModule;
  teach?: TeachCard[];
  exercises?: Exercise[];
}
