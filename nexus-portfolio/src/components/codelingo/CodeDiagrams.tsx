"use client";

/**
 * Diagramas visuais para códigos sem encode/decode automático (semáforo, pigpen).
 * Ajudam a "mostrar" o conceito com um exemplo visual e animado, como pedido
 * no currículo — mesmo sem uma engine de codificação por trás.
 */

const AMBER = "var(--cl-amber)";

// ---------------------------------------------------------------------------
// Semáforo — diagrama ilustrativo (ângulos consistentes por letra, mas
// simplificados; não substitui a tabela oficial completa).
// ---------------------------------------------------------------------------

function angleForLetter(letter: string, offset: number): number {
  const code = letter.toUpperCase().charCodeAt(0) - 65;
  return ((code * 41 + offset * 97) % 8) * 45; // 8 direções possíveis, 45° cada
}

function armEnd(cx: number, cy: number, len: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + len * Math.cos(rad), y: cy + len * Math.sin(rad) };
}

export function SemaphoreDiagram({ letter }: { letter: string }) {
  const cx = 100;
  const cy = 100;
  const a1 = angleForLetter(letter, 1);
  const a2 = angleForLetter(letter, 2);
  const p1 = armEnd(cx, cy, 70, a1);
  const p2 = armEnd(cx, cy, 70, a2);

  return (
    <div className="cl-surface" style={{ borderRadius: 14, padding: 16, marginTop: 14, textAlign: "center" }}>
      <svg viewBox="0 0 200 200" width="180" height="180" style={{ margin: "0 auto" }}>
        {/* corpo */}
        <circle cx={cx} cy={cy - 45} r="12" fill="none" stroke="var(--cl-muted)" strokeWidth="2" />
        <line x1={cx} y1={cy - 33} x2={cx} y2={cy + 40} stroke="var(--cl-muted)" strokeWidth="2" />
        {/* braço 1 */}
        <line x1={cx} y1={cy - 10} x2={p1.x} y2={p1.y} stroke={AMBER} strokeWidth="4" strokeLinecap="round" className="cl-fade-up" />
        <circle cx={p1.x} cy={p1.y} r="6" fill={AMBER} />
        {/* braço 2 */}
        <line x1={cx} y1={cy - 10} x2={p2.x} y2={p2.y} stroke="var(--cl-amber-700)" strokeWidth="4" strokeLinecap="round" className="cl-fade-up" />
        <circle cx={p2.x} cy={p2.y} r="6" fill="var(--cl-amber-700)" />
      </svg>
      <div className="cl-display" style={{ fontWeight: 800, fontSize: "1.6rem", marginTop: 4 }}>{letter.toUpperCase()}</div>
      <p className="cl-muted" style={{ fontSize: "0.7rem", marginTop: 6, lineHeight: 1.4 }}>
        Ilustração do conceito: dois braços, ângulos diferentes por letra. Os ângulos exatos seguem a tabela oficial do semáforo naval.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pigpen — grade correta (3×3 para A-I/J-R, cruz de 4 para S-V/W-Z),
// destacando a célula da letra e mostrando o ponto quando aplicável.
// ---------------------------------------------------------------------------

const GRID1 = "ABCDEFGHI".split(""); // sem ponto
const GRID2 = "JKLMNOPQR".split(""); // com ponto
const GRIDX1 = ["S", "T", "U", "V"]; // cruz, sem ponto (topo, direita, baixo, esquerda)
const GRIDX2 = ["W", "X", "Y", "Z"]; // cruz, com ponto

export function PigpenDiagram({ letter }: { letter: string }) {
  const L = letter.toUpperCase();
  const dotted = GRID2.includes(L) || GRIDX2.includes(L);

  if (GRID1.includes(L) || GRID2.includes(L)) {
    const idx = (GRID1.includes(L) ? GRID1 : GRID2).indexOf(L);
    return (
      <div className="cl-surface" style={{ borderRadius: 14, padding: 16, marginTop: 14, textAlign: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 44px)", gridTemplateRows: "repeat(3, 44px)", gap: 3, margin: "0 auto", width: "fit-content" }}>
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              style={{
                border: "2px solid var(--cl-muted)",
                borderRadius: 4,
                background: i === idx ? "rgba(255,193,7,0.18)" : "transparent",
                borderColor: i === idx ? AMBER : "var(--cl-border)",
                display: "grid",
                placeItems: "center",
                position: "relative",
              }}
            >
              {i === idx && dotted && <span style={{ width: 6, height: 6, borderRadius: "50%", background: AMBER }} />}
            </div>
          ))}
        </div>
        <div className="cl-display" style={{ fontWeight: 800, fontSize: "1.6rem", marginTop: 10 }}>{L}</div>
        <p className="cl-muted" style={{ fontSize: "0.7rem", marginTop: 4 }}>
          Célula destacada = símbolo da letra {dotted ? "(com ponto, segunda grade)" : "(sem ponto, primeira grade)"}.
        </p>
      </div>
    );
  }

  // cruz (S-V, W-Z)
  const isX1 = GRIDX1.includes(L);
  const idx = (isX1 ? GRIDX1 : GRIDX2).indexOf(L);
  const positions = [
    { gridColumn: 2, gridRow: 1 }, // topo
    { gridColumn: 3, gridRow: 2 }, // direita
    { gridColumn: 2, gridRow: 3 }, // baixo
    { gridColumn: 1, gridRow: 2 }, // esquerda
  ];
  return (
    <div className="cl-surface" style={{ borderRadius: 14, padding: 16, marginTop: 14, textAlign: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 44px)", gridTemplateRows: "repeat(3, 44px)", gap: 3, margin: "0 auto", width: "fit-content" }}>
        {positions.map((pos, i) => (
          <div
            key={i}
            style={{
              gridColumn: pos.gridColumn,
              gridRow: pos.gridRow,
              border: "2px solid var(--cl-muted)",
              borderRadius: 4,
              background: i === idx ? "rgba(255,193,7,0.18)" : "transparent",
              borderColor: i === idx ? AMBER : "var(--cl-border)",
              display: "grid",
              placeItems: "center",
            }}
          >
            {i === idx && dotted && <span style={{ width: 6, height: 6, borderRadius: "50%", background: AMBER }} />}
          </div>
        ))}
      </div>
      <div className="cl-display" style={{ fontWeight: 800, fontSize: "1.6rem", marginTop: 10 }}>{L}</div>
      <p className="cl-muted" style={{ fontSize: "0.7rem", marginTop: 4 }}>
        Grade em X {dotted ? "com ponto" : "sem ponto"} — usada para as últimas letras do alfabeto.
      </p>
    </div>
  );
}
