"use client";

import { useMemo } from "react";

/** Confete puramente CSS — sem dependências. Renderize quando `show` for true. */
export default function Confetti({ show }: { show: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: (i % 12) * 0.12,
        dur: 2.4 + ((i * 13) % 18) / 10,
        color: ["#FFD54F", "#FFC107", "#FFB300", "#E69500", "#ffffff"][i % 5],
        size: 6 + ((i * 7) % 8),
        rot: (i * 47) % 360,
      })),
    [],
  );
  if (!show) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 60, overflow: "hidden" }} aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: "-5vh",
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rot}deg)`,
            animation: `cl-confetti-fall ${p.dur}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
