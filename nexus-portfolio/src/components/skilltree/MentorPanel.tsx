"use client";

import { useEffect, useRef, useState } from "react";
import { askMentorChat, studyPlan, MentorMessage } from "@/skilltree/mentor";
import { getSkill } from "@/skilltree/skills";
import { useSkillTree } from "@/skilltree/store";
import { sfx, resumeAudio } from "@/skilltree/sound";
import { subscribeMentor } from "@/skilltree/mentorBus";

interface Msg {
  from: "mentor" | "user";
  text: string;
  actions?: { label: string; action: string }[];
}

/** Renderiza **negrito** simples sem depender de biblioteca de markdown. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="st-cyan">{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

const SUGGESTIONS = ["Explique React", "Quanto tempo leva Python?", "Me dê um desafio de HTML", "Simule uma entrevista"];

export default function MentorPanel() {
  const { askMentor } = useSkillTree();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "mentor", text: "Olá! Sou seu **Mentor SkillTree** 🤖. Posso explicar qualquer habilidade, montar planos de estudo, simular entrevistas e sugerir projetos. Pergunte à vontade — ou espere eu aparecer sozinho quando você desbloquear algo novo." },
  ]);
  const [pulse, setPulse] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeMentor((msg, opts) => {
      setMsgs((m) => [...m, { from: "mentor", text: msg.text, actions: msg.actions }]);
      if (opts?.open !== false) setOpen(true);
      resumeAudio();
      sfx.open();
      if (!open) setPulse(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);
  useEffect(() => { if (open) setPulse(false); }, [open]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    resumeAudio();
    sfx.click();
    askMentor();
    const reply = askMentorChat(q);
    setMsgs((m) => [...m, { from: "user", text: q }, { from: "mentor", text: reply.text, actions: reply.actions }]);
    setInput("");
  };

  const handleAction = (action: string) => {
    resumeAudio();
    sfx.click();
    if (action === "dismiss") {
      setMsgs((m) => [...m, { from: "mentor", text: "Sem problema! Quando quiser um plano, é só pedir: \"monte meu plano de estudos de X\"." }]);
      return;
    }
    if (action.startsWith("plan:")) {
      const skill = getSkill(action.slice(5));
      if (skill) {
        const plan = studyPlan(skill);
        setMsgs((m) => [...m, { from: "user", text: "Sim, monte meu plano" }, { from: "mentor", text: plan.text }]);
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); resumeAudio(); sfx.click(); }}
        aria-label="Abrir Mentor SkillTree"
        className={`st-mentor-fab ${pulse ? "st-glow-pulse" : ""}`}
      >
        {open ? "✕" : "🤖"}
      </button>

      {open && (
        <div className="st-glass st-fade-up" style={{ position: "fixed", bottom: 156, right: 20, zIndex: 55, width: "min(380px, calc(100vw - 40px))", height: "min(560px, calc(100vh - 200px))", borderRadius: 20, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--st-card)" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--st-border)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.4rem" }}>🤖</span>
            <div>
              <div className="st-display" style={{ fontWeight: 700 }}>Mentor SkillTree</div>
              <div className="st-muted" style={{ fontSize: "0.7rem" }}>IA por regras — respostas locais, sem servidor externo</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} className="st-fade-up" style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
                <div style={{ background: m.from === "user" ? "linear-gradient(135deg, var(--st-blue), var(--st-purple))" : "var(--st-surface)", color: m.from === "user" ? "#fff" : "var(--st-text)", border: m.from === "user" ? "none" : "1px solid var(--st-border)", borderRadius: 14, padding: "10px 13px", fontSize: "0.85rem", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                  <RichText text={m.text} />
                </div>
                {m.actions && (
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {m.actions.map((a) => (
                      <button key={a.action} type="button" onClick={() => handleAction(a.action)} className="st-btn st-btn-ghost" style={{ padding: "6px 12px", fontSize: "0.76rem" }}>{a.label}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {msgs.length <= 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} className="st-chip" style={{ cursor: "pointer" }}>{s}</button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} style={{ padding: 12, borderTop: "1px solid var(--st-border)", display: "flex", gap: 8 }}>
            <input className="st-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pergunte ao mentor..." style={{ padding: "0.6rem 0.8rem" }} />
            <button type="submit" className="st-btn st-btn-primary" style={{ padding: "0 14px" }}>➤</button>
          </form>
        </div>
      )}
    </>
  );
}
