"use client";

import { useEffect, useRef, useState } from "react";
import { askCipherBot, BotReply } from "@/codelingo/cipherbot";
import { sfx, resumeAudio } from "@/codelingo/sound";

interface Msg {
  from: "bot" | "user";
  text: string;
  code?: string;
}

const SUGGESTIONS = [
  "Codifique 'NEXUS' em morse",
  "Explique a cifra de César",
  "Decodifique 01001111 01001001 do binário",
  "Me dê um desafio de vigenère",
];

/** Tutor flutuante CipherBot (por regras). */
export default function CipherBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: "Oi! Sou o CipherBot 🤖. Posso codificar, decodificar, explicar códigos ou te desafiar. O que vamos decifrar hoje?" },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    resumeAudio();
    sfx.click();
    const reply: BotReply = askCipherBot(q);
    setMsgs((m) => [...m, { from: "user", text: q }, { from: "bot", text: reply.text, code: reply.code }]);
    setInput("");
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          resumeAudio();
        }}
        aria-label="Abrir CipherBot"
        className="cl-glow"
        style={{
          position: "fixed",
          bottom: 88,
          right: 20,
          zIndex: 55,
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(180deg,#FFD54F,#FFB300)",
          color: "#1a1400",
          fontSize: "1.6rem",
          boxShadow: "0 8px 24px rgba(255,179,0,0.35)",
        }}
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Painel */}
      {open && (
        <div
          className="cl-glass cl-fade-up"
          style={{
            position: "fixed",
            bottom: 156,
            right: 20,
            zIndex: 55,
            width: "min(360px, calc(100vw - 40px))",
            height: "min(520px, calc(100vh - 200px))",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--cl-card)",
          }}
        >
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--cl-border)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.4rem" }}>🤖</span>
            <div>
              <div className="cl-display" style={{ fontWeight: 700 }}>CipherBot</div>
              <div className="cl-muted" style={{ fontSize: "0.72rem" }}>Tutor de códigos</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.map((m, i) => (
              <div
                key={i}
                className="cl-fade-up"
                style={{
                  alignSelf: m.from === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: m.from === "user" ? "linear-gradient(180deg,#FFD54F,#FFC107)" : "var(--cl-surface)",
                  color: m.from === "user" ? "#1a1400" : "var(--cl-text)",
                  border: m.from === "user" ? "none" : "1px solid var(--cl-border)",
                  borderRadius: 14,
                  padding: "9px 12px",
                  fontSize: "0.85rem",
                  lineHeight: 1.45,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.text}
                {m.code && (
                  <pre
                    style={{
                      marginTop: 8,
                      padding: 8,
                      background: "rgba(0,0,0,0.35)",
                      borderRadius: 8,
                      overflowX: "auto",
                      fontSize: "0.8rem",
                      color: "#FFD54F",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {m.code}
                  </pre>
                )}
              </div>
            ))}
            {msgs.length <= 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} className="cl-chip" style={{ cursor: "pointer" }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            style={{ padding: 12, borderTop: "1px solid var(--cl-border)", display: "flex", gap: 8 }}
          >
            <input
              className="cl-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte algo..."
              style={{ padding: "0.6rem 0.8rem" }}
            />
            <button type="submit" className="cl-btn cl-btn-amber" style={{ padding: "0 14px" }}>
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
