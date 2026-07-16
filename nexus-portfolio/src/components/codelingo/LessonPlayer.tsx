"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CODES, getCode } from "@/codelingo/codes";
import { buildSession, checkAnswer, Exercise } from "@/codelingo/exercises";
import { ACHIEVEMENTS } from "@/codelingo/achievements";
import { useStore } from "@/codelingo/store";
import { sfx, playMorse, resumeAudio } from "@/codelingo/sound";
import Confetti from "./Confetti";

type Phase = "playing" | "done";

export default function LessonPlayer({ id }: { id: string }) {
  const router = useRouter();
  const { completeLesson } = useStore();
  const code = getCode(id);

  const [seed] = useState(() => Math.floor(Math.random() * 1e6) + 1);
  const session = useMemo(() => buildSession(id, seed), [id, seed]);

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<null | "correct" | "wrong">(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [result, setResult] = useState<ReturnType<typeof completeLesson> | null>(null);
  const startRef = useRef<number>(Date.now());
  const finishedRef = useRef(false);

  const ex = session[index];
  const total = session.filter((e) => e.kind !== "theory").length;

  useEffect(() => {
    setSelected(null);
    setText("");
    setFeedback(null);
  }, [index]);

  if (!code || session.length === 0) {
    return (
      <div className="cl-card" style={{ padding: 24, textAlign: "center" }}>
        <p>Curso não encontrado.</p>
        <Link href="/codelingo" className="cl-btn cl-btn-amber" style={{ marginTop: 12, padding: "10px 18px" }}>
          Voltar
        </Link>
      </div>
    );
  }

  const progress = index / session.length;

  const finish = (finalCorrect: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const timeSec = Math.round((Date.now() - startRef.current) / 1000);
    const res = completeLesson(id, finalCorrect, total, timeSec);
    setResult(res);
    setPhase("done");
    resumeAudio();
    sfx.complete();
    if (res.newLevel) setTimeout(() => sfx.levelUp(), 600);
    if (res.newAchievements.length) setTimeout(() => sfx.achievement(), 1000);
  };

  const advance = (wasCorrect: boolean) => {
    const nextCorrect = correctCount + (wasCorrect ? 1 : 0);
    if (index + 1 >= session.length) finish(nextCorrect);
    else setIndex((i) => i + 1);
  };

  const submit = () => {
    resumeAudio();
    if (ex.kind === "theory") {
      advance(false); // teoria não conta
      return;
    }
    const given = ex.kind === "multiple" ? selected ?? "" : text;
    if (ex.kind === "multiple" && selected === null) return;
    const ok = checkAnswer(ex, given);
    setFeedback(ok ? "correct" : "wrong");
    if (ok) {
      setCorrectCount((c) => c + 1);
      sfx.correct();
    } else {
      sfx.wrong();
    }
  };

  const next = () => {
    const wasCorrect = feedback === "correct";
    advance(wasCorrect);
  };

  // ---- Tela de conclusão ----
  if (phase === "done" && result) {
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 100;
    const nextCode = CODES[CODES.findIndex((c) => c.id === id) + 1];
    return (
      <>
        <Confetti show />
        <div className="cl-card cl-pop" style={{ padding: 28, textAlign: "center", maxWidth: 460, margin: "20px auto" }}>
          <div style={{ fontSize: "3.4rem" }}>{accuracy === 100 ? "🏆" : accuracy >= 60 ? "🎉" : "💪"}</div>
          <h1 className="cl-display" style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: 8 }}>
            Lição concluída!
          </h1>
          <p className="cl-muted" style={{ marginTop: 4 }}>{code.name}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 20 }}>
            <Stat label="XP ganho" value={`+${result.xpGained}`} />
            <Stat label="Acertos" value={`${correctCount}/${total}`} />
            <Stat label="Precisão" value={`${accuracy}%`} />
          </div>

          {result.newLevel && (
            <div className="cl-chip cl-glow" style={{ marginTop: 16, padding: "8px 14px", fontSize: "0.9rem" }}>
              🎊 Você subiu para o nível {result.newLevel}!
            </div>
          )}
          {result.mastered && (
            <div className="cl-chip" style={{ marginTop: 10, padding: "8px 14px" }}>
              ⭐ Código dominado!
            </div>
          )}
          {result.newAchievements.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="cl-muted" style={{ fontSize: "0.78rem", marginBottom: 8 }}>Novas conquistas</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {result.newAchievements.map((aid) => {
                  const a = ACHIEVEMENTS.find((x) => x.id === aid)!;
                  return (
                    <span key={aid} className="cl-chip cl-pop" style={{ padding: "8px 12px" }}>
                      {a.icon} {a.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
            {nextCode && (
              <button
                type="button"
                className="cl-btn cl-btn-amber"
                style={{ padding: "12px" }}
                onClick={() => router.push(`/codelingo/lesson/${nextCode.id}`)}
              >
                Próximo: {nextCode.icon} {nextCode.name} →
              </button>
            )}
            <button
              type="button"
              className="cl-btn cl-btn-ghost"
              style={{ padding: "12px" }}
              onClick={() => {
                finishedRef.current = false;
                setIndex(0);
                setCorrectCount(0);
                setPhase("playing");
                setResult(null);
                startRef.current = Date.now();
              }}
            >
              ↻ Refazer
            </button>
            <Link href="/codelingo" className="cl-btn cl-btn-ghost" style={{ padding: "12px" }}>
              🧠 Voltar à trilha
            </Link>
          </div>
        </div>
      </>
    );
  }

  // ---- Cabeçalho de progresso ----
  const header = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <Link href="/codelingo" aria-label="Sair" className="cl-btn cl-btn-ghost" style={{ width: 40, height: 40, padding: 0, flexShrink: 0 }}>
        ✕
      </Link>
      <div className="cl-progress" style={{ flex: 1 }}>
        <span style={{ width: `${progress * 100}%` }} />
      </div>
      <span className="cl-chip">{code.icon} {index + 1}/{session.length}</span>
    </div>
  );

  return (
    <div className="cl-fade-up" style={{ maxWidth: 620, margin: "0 auto" }}>
      {header}

      {/* Card do exercício */}
      <div key={ex.id} className="cl-fade-up">
        {ex.kind === "theory" ? (
          <TheoryCard code={code} />
        ) : (
          <div>
            <h2 className="cl-display" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 6 }}>
              {ex.prompt}
            </h2>
            {ex.hint && feedback === null && (
              <p className="cl-muted" style={{ fontSize: "0.78rem", marginBottom: 14 }}>💡 {ex.hint}</p>
            )}

            {/* Sujeito (o que codificar/decodificar) */}
            {ex.subject && (
              <div className="cl-surface" style={{ borderRadius: 14, padding: "16px 18px", marginBottom: 18, fontFamily: "var(--font-grotesk)", fontSize: "1.3rem", fontWeight: 700, wordBreak: "break-word", textAlign: "center", letterSpacing: "0.02em" }}>
                {ex.subject}
              </div>
            )}

            {/* Áudio (Morse) */}
            {ex.kind === "audio" && ex.audio && (
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <button
                  type="button"
                  className="cl-btn cl-btn-amber"
                  style={{ padding: "12px 22px" }}
                  onClick={() => {
                    resumeAudio();
                    playMorse(ex.audio!);
                  }}
                >
                  🔊 Tocar Morse
                </button>
              </div>
            )}

            {/* Múltipla escolha */}
            {ex.kind === "multiple" && ex.options && (
              <div style={{ display: "grid", gap: 10 }}>
                {ex.options.map((opt) => {
                  const isSel = selected === opt;
                  const reveal = feedback !== null;
                  const isCorrect = opt === ex.answer;
                  let border = "var(--cl-border)";
                  let bg = "var(--cl-surface)";
                  if (reveal && isCorrect) { border = "#50C878"; bg = "rgba(80,200,120,0.12)"; }
                  else if (reveal && isSel && !isCorrect) { border = "#e05555"; bg = "rgba(224,85,85,0.12)"; }
                  else if (isSel) { border = "var(--cl-amber)"; bg = "rgba(255,213,79,0.1)"; }
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={reveal}
                      onClick={() => { setSelected(opt); sfx.click(); resumeAudio(); }}
                      style={{
                        textAlign: "left",
                        padding: "14px 16px",
                        borderRadius: 14,
                        border: `2px solid ${border}`,
                        background: bg,
                        color: "var(--cl-text)",
                        cursor: reveal ? "default" : "pointer",
                        transition: "all 0.2s ease",
                        fontWeight: 600,
                        wordBreak: "break-word",
                        fontFamily: "var(--font-grotesk)",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Entrada de texto (encode/decode/audio) */}
            {(ex.kind === "encode" || ex.kind === "decode" || ex.kind === "audio") && (
              <input
                className={`cl-input ${feedback === "wrong" ? "cl-shake" : ""}`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && feedback === null && text.trim()) submit(); }}
                placeholder={ex.kind === "decode" ? "Digite o texto decodificado..." : "Digite a resposta..."}
                disabled={feedback !== null}
                autoFocus
                style={{ fontFamily: "var(--font-grotesk)", fontSize: "1.1rem", textAlign: "center" }}
              />
            )}

            {/* Feedback */}
            {feedback && (
              <div
                className="cl-fade-up"
                style={{
                  marginTop: 16,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: feedback === "correct" ? "rgba(80,200,120,0.12)" : "rgba(224,85,85,0.12)",
                  border: `1px solid ${feedback === "correct" ? "#50C878" : "#e05555"}`,
                }}
              >
                <strong>{feedback === "correct" ? "✅ Correto!" : "❌ Quase!"}</strong>
                {ex.explain && <div className="cl-muted" style={{ fontSize: "0.82rem", marginTop: 4, wordBreak: "break-word" }}>{ex.explain}</div>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ações */}
      <div style={{ marginTop: 24 }}>
        {ex.kind === "theory" ? (
          <button type="button" className="cl-btn cl-btn-amber" style={{ width: "100%", padding: "14px" }} onClick={submit}>
            Entendi, vamos praticar →
          </button>
        ) : feedback === null ? (
          <button
            type="button"
            className="cl-btn cl-btn-amber"
            style={{ width: "100%", padding: "14px" }}
            disabled={ex.kind === "multiple" ? selected === null : text.trim() === ""}
            onClick={submit}
          >
            Verificar
          </button>
        ) : (
          <button type="button" className="cl-btn cl-btn-amber" style={{ width: "100%", padding: "14px" }} onClick={next}>
            Continuar →
          </button>
        )}
      </div>
    </div>
  );
}

function TheoryCard({ code }: { code: NonNullable<ReturnType<typeof getCode>> }) {
  const c = code.content;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span style={{ fontSize: "2.6rem" }}>{code.icon}</span>
        <div>
          <h1 className="cl-display" style={{ fontSize: "1.6rem", fontWeight: 800 }}>{code.name}</h1>
          <p className="cl-muted" style={{ fontSize: "0.85rem" }}>{code.tagline}</p>
        </div>
      </div>

      <div className="cl-surface" style={{ borderRadius: 14, padding: 16, marginBottom: 12 }}>
        <p style={{ lineHeight: 1.6 }}>{c.summary}</p>
        {code.alphabetHint && (
          <pre style={{ marginTop: 10, color: "var(--cl-amber)", fontFamily: "var(--font-grotesk)", whiteSpace: "pre-wrap" }}>{code.alphabetHint}</pre>
        )}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <Info title="🕰️ Origem & Inventor" text={`${c.origin} — ${c.inventor}`} />
        <Info title="📜 História" text={c.history} />
        <Info title="⚙️ Como funciona" text={c.howItWorks} />
        <Info title="🌍 Aplicações" text={c.applications} />
        <div className="cl-surface" style={{ borderRadius: 14, padding: 16 }}>
          <div className="cl-display" style={{ fontWeight: 700, marginBottom: 8 }}>✨ Curiosidades</div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
            {c.curiosities.map((cu, i) => (
              <li key={i} className="cl-muted" style={{ fontSize: "0.86rem", lineHeight: 1.5 }}>{cu}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="cl-surface" style={{ borderRadius: 14, padding: 16 }}>
      <div className="cl-display" style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>
      <p className="cl-muted" style={{ fontSize: "0.86rem", lineHeight: 1.55 }}>{text}</p>
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
