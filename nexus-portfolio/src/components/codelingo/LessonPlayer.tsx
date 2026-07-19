"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, useEffect } from "react";
import { getCode } from "@/codelingo/codes";
import { Exercise } from "@/codelingo/exercises";
import { buildLesson, checkExercise, getCourseSteps, TeachCard } from "@/codelingo/curriculum";
import { ACHIEVEMENTS } from "@/codelingo/achievements";
import { useStore } from "@/codelingo/store";
import { sfx, playMorse, resumeAudio } from "@/codelingo/sound";
import Confetti from "./Confetti";
import { SemaphoreDiagram, PigpenDiagram } from "./CodeDiagrams";
import MatchExercise from "./MatchExercise";
import DragExercise from "./DragExercise";

export default function LessonPlayer({ id }: { id: string }) {
  const router = useRouter();
  const search = useSearchParams();
  const { completeLesson, weakLettersFor, recordMiss } = useStore();
  const code = getCode(id);
  const steps = useMemo(() => getCourseSteps(id), [id]);
  const stepId = search.get("type") || steps[0]?.id;
  const stepIndex = steps.findIndex((s) => s.id === stepId);
  const totalUnits = useMemo(() => new Set(steps.map((s) => s.unitIndex)).size, [steps]);

  const [seed] = useState(() => Math.floor(Math.random() * 1e6) + 1);
  const weakLetters = useMemo(() => weakLettersFor(id), [id, weakLettersFor]);
  const lesson = useMemo(() => buildLesson(id, stepId ?? "", seed, weakLetters), [id, stepId, seed, weakLetters]);
  const step = lesson?.step;

  const [cardIdx, setCardIdx] = useState(0);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<null | "correct" | "wrong">(null);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof completeLesson> | null>(null);
  const startRef = useRef<number>(Date.now());
  const finishedRef = useRef(false);

  useEffect(() => {
    setSelected(null);
    setText("");
    setFeedback(null);
  }, [index]);

  if (!code || !lesson || !step) {
    return (
      <div className="cl-card" style={{ padding: 24, textAlign: "center" }}>
        <p>Lição não encontrada.</p>
        <Link href="/codelingo/courses" className="cl-btn cl-btn-amber" style={{ marginTop: 12, padding: "10px 18px", display: "inline-flex" }}>
          Escolher um código
        </Link>
      </div>
    );
  }

  const teach = lesson.teach ?? [];
  const exercises = lesson.exercises ?? [];
  const isLearn = step.kind === "learn";
  const stepCount = isLearn ? teach.length : exercises.length;
  const stepNow = isLearn ? cardIdx : index;
  const progress = stepCount > 0 ? stepNow / stepCount : 0;

  const finish = (finalCorrect: number, total: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const timeSec = Math.round((Date.now() - startRef.current) / 1000);
    const res = completeLesson(id, step.id, finalCorrect, total, timeSec);
    setResult(res);
    setDone(true);
    resumeAudio();
    sfx.complete();
    if (res.newLevel) setTimeout(() => sfx.levelUp(), 600);
    if (res.newAchievements.length) setTimeout(() => sfx.achievement(), 1000);
  };

  const nextCard = () => {
    resumeAudio();
    sfx.click();
    if (cardIdx + 1 >= teach.length) finish(teach.length, teach.length);
    else setCardIdx((c) => c + 1);
  };

  const ex: Exercise | undefined = exercises[index];
  const submit = () => {
    resumeAudio();
    if (!ex) return;
    const given = ex.kind === "multiple" ? selected ?? "" : text;
    if (ex.kind === "multiple" && selected === null) return;
    const ok = checkExercise(ex, given);
    setFeedback(ok ? "correct" : "wrong");
    if (ok) {
      setCorrectCount((c) => c + 1);
      sfx.correct();
    } else {
      sfx.wrong();
      if (ex.targetLetter) recordMiss(id, ex.targetLetter);
    }
  };
  const next = () => {
    const wasCorrect = feedback === "correct";
    const nextCorrect = correctCount + (wasCorrect ? 1 : 0);
    if (index + 1 >= exercises.length) finish(nextCorrect, exercises.length);
    else setIndex((i) => i + 1);
  };

  // ---- Tela de conclusão ----
  if (done && result) {
    const total = isLearn ? 0 : exercises.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 100;
    const nextStep = steps[stepIndex + 1];
    return (
      <>
        <Confetti show />
        <div className="cl-card cl-pop" style={{ padding: 28, textAlign: "center", maxWidth: 460, margin: "20px auto" }}>
          <div style={{ fontSize: "3.4rem" }}>{isLearn ? "📖" : accuracy === 100 ? "🏆" : accuracy >= 60 ? "🎉" : "💪"}</div>
          <h1 className="cl-display" style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: 8 }}>
            {isLearn ? "Aula concluída!" : "Lição concluída!"}
          </h1>
          <p className="cl-muted" style={{ marginTop: 4 }}>{code.icon} {code.name} · {step.unitTitle} · {step.title}</p>

          <div style={{ display: "grid", gridTemplateColumns: isLearn ? "1fr" : "repeat(3,1fr)", gap: 10, marginTop: 20 }}>
            <Stat label="XP ganho" value={`+${result.xpGained}`} />
            {!isLearn && <Stat label="Acertos" value={`${correctCount}/${total}`} />}
            {!isLearn && <Stat label="Precisão" value={`${accuracy}%`} />}
          </div>

          {result.newLevel && (
            <div className="cl-chip cl-glow" style={{ marginTop: 16, padding: "8px 14px", fontSize: "0.9rem" }}>🎊 Você subiu para o nível {result.newLevel}!</div>
          )}
          {result.courseCompleted && (
            <div className="cl-chip" style={{ marginTop: 10, padding: "8px 14px" }}>✅ Curso {code.name} concluído!</div>
          )}
          {result.mastered && (
            <div className="cl-chip" style={{ marginTop: 10, padding: "8px 14px" }}>⭐ Código dominado!</div>
          )}
          {result.newAchievements.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="cl-muted" style={{ fontSize: "0.78rem", marginBottom: 8 }}>Novas conquistas</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {result.newAchievements.map((aid) => {
                  const a = ACHIEVEMENTS.find((x) => x.id === aid)!;
                  return <span key={aid} className="cl-chip cl-pop" style={{ padding: "8px 12px" }}>{a.icon} {a.name}</span>;
                })}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
            {nextStep ? (
              <button
                type="button"
                className="cl-btn cl-btn-amber"
                style={{ padding: "12px" }}
                onClick={() => {
                  finishedRef.current = false;
                  router.push(`/codelingo/lesson/${id}?type=${nextStep.id}`);
                }}
              >
                {nextStep.unitIndex !== step.unitIndex ? `Próxima unidade: ${nextStep.unitIcon} ${nextStep.unitTitle} →` : `Próxima: ${nextStep.icon} ${nextStep.title} →`}
              </button>
            ) : (
              <Link href={`/codelingo/course/${id}`} className="cl-btn cl-btn-amber" style={{ padding: "12px" }}>
                🎓 Curso concluído — ver progresso
              </Link>
            )}
            <button
              type="button"
              className="cl-btn cl-btn-ghost"
              style={{ padding: "12px" }}
              onClick={() => {
                finishedRef.current = false;
                setDone(false);
                setResult(null);
                setCardIdx(0);
                setIndex(0);
                setCorrectCount(0);
                startRef.current = Date.now();
              }}
            >
              ↻ Refazer
            </button>
            <Link href={`/codelingo/course/${id}`} className="cl-btn cl-btn-ghost" style={{ padding: "12px" }}>
              ← Voltar ao curso
            </Link>
          </div>
        </div>
      </>
    );
  }

  const header = (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Link href={`/codelingo/course/${id}`} aria-label="Sair" className="cl-btn cl-btn-ghost" style={{ width: 40, height: 40, padding: 0, flexShrink: 0 }}>✕</Link>
        <div className="cl-progress" style={{ flex: 1 }}>
          <span style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="cl-chip">{code.icon} {stepNow + 1}/{stepCount}</span>
      </div>
      <div className="cl-muted" style={{ fontSize: "0.72rem", textAlign: "center" }}>
        Unidade {step.unitIndex + 1} de {totalUnits} · {step.unitTitle} — Passo {stepIndex + 1} de {steps.length} do curso
      </div>
    </div>
  );

  // ---- Render: AULA (learn) ----
  if (isLearn) {
    const card = teach[cardIdx];
    return (
      <div className="cl-fade-up" style={{ maxWidth: 640, margin: "0 auto" }}>
        {header}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: "1.6rem" }}>🤖</span>
          <div>
            <div className="cl-display" style={{ fontWeight: 700 }}>CipherBot explica</div>
            <div className="cl-muted" style={{ fontSize: "0.72rem" }}>{code.name} · {step.unitTitle}</div>
          </div>
        </div>
        {card && <TeachCardView key={card.title} card={card} />}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          {cardIdx > 0 && (
            <button type="button" className="cl-btn cl-btn-ghost" style={{ padding: "14px 18px" }} onClick={() => setCardIdx((c) => c - 1)}>←</button>
          )}
          <button type="button" className="cl-btn cl-btn-amber" style={{ flex: 1, padding: "14px" }} onClick={nextCard}>
            Continuar →
          </button>
        </div>
      </div>
    );
  }

  const isInteractiveKind = ex?.kind === "match" || ex?.kind === "drag";

  // ---- Render: EXERCÍCIOS ----
  return (
    <div className="cl-fade-up" style={{ maxWidth: 640, margin: "0 auto" }}>
      {header}
      {ex && (
        <div key={ex.id} className="cl-fade-up">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span className="cl-chip">{step.icon} {step.title}</span>
            {ex.guided && <span className="cl-chip cl-amber">guiado</span>}
          </div>
          <h2 className="cl-display" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 6 }}>{ex.prompt}</h2>
          {ex.hint && feedback === null && <p className="cl-muted" style={{ fontSize: "0.78rem", marginBottom: 14 }}>💡 {ex.hint}</p>}

          {ex.subject && (
            <div className="cl-surface" style={{ borderRadius: 14, padding: "16px 18px", marginBottom: 18, fontFamily: "var(--font-grotesk)", fontSize: "1.3rem", fontWeight: 700, wordBreak: "break-word", textAlign: "center", letterSpacing: "0.02em" }}>
              {ex.subject}
            </div>
          )}

          {ex.kind === "audio" && ex.audio && (
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <button type="button" className="cl-btn cl-btn-amber" style={{ padding: "12px 22px" }} onClick={() => { resumeAudio(); playMorse(ex.audio!); }}>🔊 Tocar Morse</button>
            </div>
          )}

          {ex.kind === "match" && ex.pairs && (
            <MatchExercise
              pairs={ex.pairs}
              onDone={(mistakes) => {
                const ok = mistakes === 0;
                setFeedback(ok ? "correct" : "wrong");
                if (ok) setCorrectCount((c) => c + 1);
              }}
            />
          )}

          {ex.kind === "drag" && ex.dragLabel && ex.options && (
            <DragExercise
              dragLabel={ex.dragLabel}
              options={ex.options}
              answer={ex.answer}
              onDone={(correct) => {
                setFeedback(correct ? "correct" : "wrong");
                if (correct) setCorrectCount((c) => c + 1);
                else if (ex.targetLetter) recordMiss(id, ex.targetLetter);
              }}
            />
          )}

          {ex.kind === "multiple" && ex.options && (
            <div style={{ display: "grid", gap: 10 }}>
              {ex.options.map((opt) => {
                const isSel = selected === opt;
                const reveal = feedback !== null;
                const isCorrect = opt === ex.answer;
                let border = "var(--cl-border)";
                let bg = "var(--cl-surface)";
                if (reveal && isCorrect) { border = "var(--cl-amber)"; bg = "rgba(255,193,7,0.14)"; }
                else if (reveal && isSel && !isCorrect) { border = "var(--cl-err)"; bg = "rgba(217,101,78,0.12)"; }
                else if (isSel) { border = "var(--cl-amber)"; bg = "rgba(255,193,7,0.08)"; }
                return (
                  <button key={opt} type="button" disabled={reveal} onClick={() => { setSelected(opt); sfx.click(); resumeAudio(); }}
                    className="cl-option"
                    style={{ textAlign: "left", padding: "14px 16px", borderRadius: 14, border: `2px solid ${border}`, background: bg, color: "var(--cl-text)", cursor: reveal ? "default" : "pointer", fontWeight: 600, wordBreak: "break-word", fontFamily: "var(--font-grotesk)" }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {(ex.kind === "encode" || ex.kind === "decode" || ex.kind === "audio") && (
            <input className={`cl-input ${feedback === "wrong" ? "cl-shake" : ""}`} value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && feedback === null && text.trim()) submit(); }}
              placeholder={ex.kind === "decode" ? "Digite o texto decodificado..." : "Digite a resposta..."} disabled={feedback !== null} autoFocus
              style={{ fontFamily: "var(--font-grotesk)", fontSize: "1.1rem", textAlign: "center" }} />
          )}

          {feedback && (
            <div className="cl-fade-up" style={{ marginTop: 16, padding: "12px 14px", borderRadius: 12, background: feedback === "correct" ? "rgba(255,193,7,0.1)" : "rgba(217,101,78,0.12)", border: `1px solid ${feedback === "correct" ? "var(--cl-amber)" : "var(--cl-err)"}` }}>
              <strong className={feedback === "correct" ? "cl-amber" : ""}>{feedback === "correct" ? "✅ Correto!" : "❌ Quase!"}</strong>
              {feedback === "wrong" && !isInteractiveKind && <div style={{ fontSize: "0.85rem", marginTop: 4 }}>A resposta certa é <strong className="cl-amber">{ex.answer}</strong>.</div>}
              {ex.explain && <div className="cl-muted" style={{ fontSize: "0.82rem", marginTop: 4, wordBreak: "break-word" }}>{ex.explain}</div>}
              {ex.guided && ex.breakdown && (
                <div style={{ marginTop: 8, padding: 8, background: "rgba(0,0,0,0.25)", borderRadius: 8, fontFamily: "var(--font-grotesk)", fontSize: "0.8rem", color: "var(--cl-amber)", wordBreak: "break-word" }}>
                  🤖 Letra a letra: {ex.breakdown}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!isInteractiveKind && (
        <div style={{ marginTop: 24 }}>
          {feedback === null ? (
            <button type="button" className="cl-btn cl-btn-amber" style={{ width: "100%", padding: "14px" }} disabled={ex?.kind === "multiple" ? selected === null : text.trim() === ""} onClick={submit}>Verificar</button>
          ) : (
            <button type="button" className="cl-btn cl-btn-amber" style={{ width: "100%", padding: "14px" }} onClick={next}>Continuar →</button>
          )}
        </div>
      )}
      {isInteractiveKind && feedback && (
        <div style={{ marginTop: 24 }}>
          <button type="button" className="cl-btn cl-btn-amber" style={{ width: "100%", padding: "14px" }} onClick={next}>Continuar →</button>
        </div>
      )}
    </div>
  );
}

function TeachCardView({ card }: { card: TeachCard }) {
  return (
    <div className="cl-card cl-fade-up" style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: "1.8rem" }}>{card.icon}</span>
        <h2 className="cl-display" style={{ fontSize: "1.4rem", fontWeight: 800 }}>{card.title}</h2>
      </div>
      <p style={{ lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{card.body}</p>

      {card.list && (
        <ul style={{ margin: "12px 0 0", paddingLeft: 20, display: "grid", gap: 8 }}>
          {card.list.map((item, i) => (
            <li key={i} className="cl-muted" style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>{item}</li>
          ))}
        </ul>
      )}

      {card.example && <ExampleView plain={card.example.plain} encoded={card.example.encoded} morse={card.morse} />}

      {card.visual?.kind === "semaphore" && <SemaphoreDiagram letter={card.visual.letter} />}
      {card.visual?.kind === "pigpen" && <PigpenDiagram letter={card.visual.letter} />}

      {card.hint && !card.example && (
        <pre style={{ marginTop: 14, padding: 12, background: "var(--cl-surface)", borderRadius: 10, color: "var(--cl-amber)", fontFamily: "var(--font-grotesk)", whiteSpace: "pre-wrap", fontSize: "0.85rem" }}>{card.hint}</pre>
      )}
    </div>
  );
}

/** Exemplo animado: mostra letra a letra virando código, com opção de tocar (Morse). */
function ExampleView({ plain, encoded, morse }: { plain: string; encoded: string; morse?: string }) {
  const letters = plain.toUpperCase().split("");
  return (
    <div className="cl-surface" style={{ borderRadius: 14, padding: 16, marginTop: 14 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", alignItems: "center" }}>
        {letters.map((l, i) => (
          <span key={i} className="cl-example-letter" style={{ animationDelay: `${i * 0.12}s` }}>{l}</span>
        ))}
      </div>
      <div style={{ textAlign: "center", margin: "10px 0", color: "var(--cl-amber)", fontSize: "1.2rem" }}>↓</div>
      <div className="cl-example-code cl-display" style={{ textAlign: "center", color: "var(--cl-amber)", fontWeight: 700, fontSize: "1.15rem", wordBreak: "break-word", lineHeight: 1.5 }}>
        {encoded}
      </div>
      {morse && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button type="button" className="cl-btn cl-btn-ghost" style={{ padding: "8px 16px" }} onClick={() => { resumeAudio(); playMorse(morse); }}>🔊 Ouvir</button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="cl-surface" style={{ borderRadius: 12, padding: "12px 8px" }}>
      <div className="cl-display cl-amber" style={{ fontWeight: 800, fontSize: "1.2rem" }}>{value}</div>
      <div className="cl-muted" style={{ fontSize: "0.7rem" }}>{label}</div>
    </div>
  );
}
