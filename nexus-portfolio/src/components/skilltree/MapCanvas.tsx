"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DOMAINS, SKILLS, Skill, childrenOf, rootsOf } from "@/skilltree/skills";
import { useSkillTree, isUnlocked, isAvailable } from "@/skilltree/store";
import { sfx, resumeAudio } from "@/skilltree/sound";

interface NodePos { x: number; y: number }

const LEAF_SPACING = 118;
const LEVEL_HEIGHT = 150;
const DOMAIN_GAP = 90;
const DOMAIN_HEADER_H = 70;
const CANVAS_PAD = 80;

function layoutSubtree(nodeId: string, depth: number, xLeft: number, positions: Record<string, NodePos>): number {
  const kids = childrenOf(nodeId);
  const y = depth * LEVEL_HEIGHT;
  if (kids.length === 0) {
    positions[nodeId] = { x: xLeft + LEAF_SPACING / 2, y };
    return LEAF_SPACING;
  }
  let cursor = xLeft;
  for (const kid of kids) {
    const w = layoutSubtree(kid.id, depth + 1, cursor, positions);
    cursor += w;
  }
  const first = positions[kids[0].id].x;
  const last = positions[kids[kids.length - 1].id].x;
  positions[nodeId] = { x: (first + last) / 2, y };
  return Math.max(cursor - xLeft, LEAF_SPACING);
}

interface DomainLayout {
  domainId: string;
  positions: Record<string, NodePos>;
  width: number;
  height: number;
  offsetY: number;
}

function buildLayout(): { domains: DomainLayout[]; totalWidth: number; totalHeight: number } {
  let offsetY = 0;
  const domains: DomainLayout[] = [];
  let maxWidth = 0;
  for (const d of DOMAINS) {
    const roots = rootsOf(d.id);
    const positions: Record<string, NodePos> = {};
    let cursor = 0;
    let maxDepth = 0;
    for (const root of roots) {
      const w = layoutSubtree(root.id, 0, cursor, positions);
      cursor += w;
    }
    for (const s of SKILLS.filter((sk) => sk.domainId === d.id)) {
      maxDepth = Math.max(maxDepth, positions[s.id]?.y ?? 0);
    }
    const width = Math.max(cursor, 260);
    const height = maxDepth + LEVEL_HEIGHT;
    domains.push({ domainId: d.id, positions, width, height, offsetY: offsetY + DOMAIN_HEADER_H });
    maxWidth = Math.max(maxWidth, width);
    offsetY += DOMAIN_HEADER_H + height + DOMAIN_GAP;
  }
  return { domains, totalWidth: maxWidth + CANVAS_PAD * 2, totalHeight: offsetY };
}

export default function MapCanvas({ initialDomain }: { initialDomain?: string | null }) {
  const router = useRouter();
  const { p, ready } = useSkillTree();
  const layout = useMemo(() => buildLayout(), []);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(0.75);
  const [tx, setTx] = useState(40);
  const [ty, setTy] = useState(40);
  const [query, setQuery] = useState("");
  const [activeDomain, setActiveDomain] = useState<string | null>(initialDomain ?? null);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, tx, ty };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setTx(dragRef.current.tx + dx);
    setTy(dragRef.current.ty + dy);
  };
  const onPointerUp = () => { dragRef.current = null; };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setScale((s) => Math.max(0.3, Math.min(2, s + delta)));
  };

  const zoomBy = (amt: number) => setScale((s) => Math.max(0.3, Math.min(2, s + amt)));

  const focusSkill = useCallback(
    (skillId: string) => {
      const skill = SKILLS.find((s) => s.id === skillId);
      if (!skill) return;
      const dl = layout.domains.find((d) => d.domainId === skill.domainId);
      if (!dl) return;
      const pos = dl.positions[skillId];
      const vp = viewportRef.current;
      if (!vp || !pos) return;
      const rect = vp.getBoundingClientRect();
      const targetScale = 1;
      setScale(targetScale);
      setTx(rect.width / 2 - (CANVAS_PAD + pos.x) * targetScale);
      setTy(rect.height / 2 - (dl.offsetY + pos.y) * targetScale);
    },
    [layout],
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SKILLS.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const goToSkill = (id: string) => {
    resumeAudio();
    sfx.click();
    router.push(`/skilltree/skill/${id}`);
  };

  return (
    <div style={{ position: "relative", height: "calc(100vh - 130px)", minHeight: 480, borderRadius: 20, overflow: "hidden", border: "1px solid var(--st-border)", background: "radial-gradient(ellipse at 50% 0%, rgba(91,140,255,0.08), transparent 60%), var(--st-bg)" }}>
      {/* Controles */}
      <div style={{ position: "absolute", top: 14, left: 14, right: 14, zIndex: 5, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 320 }}>
          <input className="st-input" placeholder="🔎 Pesquisar habilidade..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ fontSize: "0.85rem", padding: "0.6rem 0.9rem" }} />
          {searchResults.length > 0 && (
            <div className="st-card" style={{ position: "absolute", top: "110%", left: 0, right: 0, padding: 6, zIndex: 10 }}>
              {searchResults.map((s) => (
                <button key={s.id} type="button" onClick={() => { focusSkill(s.id); setQuery(""); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", background: "transparent", border: "none", color: "var(--st-text)", cursor: "pointer", borderRadius: 8, textAlign: "left" }}>
                  <span>{s.icon}</span> <span style={{ fontSize: "0.85rem" }}>{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setActiveDomain(null)} className="st-chip" style={{ cursor: "pointer", borderColor: !activeDomain ? "var(--st-blue)" : "var(--st-border)", color: !activeDomain ? "var(--st-blue)" : "var(--st-text)" }}>Todas</button>
          {DOMAINS.map((d) => (
            <button key={d.id} type="button" onClick={() => setActiveDomain(d.id === activeDomain ? null : d.id)} className="st-chip" style={{ cursor: "pointer", borderColor: activeDomain === d.id ? d.color : "var(--st-border)", color: activeDomain === d.id ? d.color : "var(--st-text)" }}>
              {d.icon} {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom controls */}
      <div style={{ position: "absolute", bottom: 14, right: 14, zIndex: 5, display: "flex", flexDirection: "column", gap: 6 }}>
        <button type="button" onClick={() => zoomBy(0.15)} className="st-btn st-btn-ghost" style={{ width: 38, height: 38, padding: 0 }}>+</button>
        <button type="button" onClick={() => zoomBy(-0.15)} className="st-btn st-btn-ghost" style={{ width: 38, height: 38, padding: 0 }}>−</button>
        <button type="button" onClick={() => { setScale(0.75); setTx(40); setTy(40); }} className="st-btn st-btn-ghost" style={{ width: 38, height: 38, padding: 0, fontSize: "0.7rem" }}>⤢</button>
      </div>

      {/* Viewport pannable/zoomable */}
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        style={{ width: "100%", height: "100%", cursor: dragRef.current ? "grabbing" : "grab", touchAction: "none" }}
      >
        <div style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: "0 0", transition: dragRef.current ? "none" : "transform 0.35s cubic-bezier(0.22,1,0.36,1)", position: "relative" }}>
          <svg width={layout.totalWidth} height={layout.totalHeight} style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}>
            <defs>
              <filter id="st-node-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {layout.domains.map((dl) => {
              const domain = DOMAINS.find((d) => d.id === dl.domainId)!;
              const dimmed = activeDomain && activeDomain !== dl.domainId;
              return (
                <g key={dl.domainId} opacity={dimmed ? 0.15 : 1}>
                  {/* Linhas de conexão (pai → filho) */}
                  {SKILLS.filter((s) => s.domainId === dl.domainId && s.parentId).map((s) => {
                    const from = dl.positions[s.parentId!];
                    const to = dl.positions[s.id];
                    if (!from || !to) return null;
                    const unlocked = ready && isUnlocked(p, s.id);
                    const midY = (from.y + to.y) / 2 + dl.offsetY;
                    const path = `M ${CANVAS_PAD + from.x} ${dl.offsetY + from.y} C ${CANVAS_PAD + from.x} ${midY}, ${CANVAS_PAD + to.x} ${midY}, ${CANVAS_PAD + to.x} ${dl.offsetY + to.y}`;
                    return (
                      <path
                        key={s.id}
                        d={path}
                        fill="none"
                        stroke={unlocked ? domain.color : "var(--st-border)"}
                        strokeWidth={unlocked ? 2.5 : 1.5}
                        strokeDasharray={unlocked ? "0" : "5 5"}
                        opacity={unlocked ? 0.8 : 0.5}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {layout.domains.map((dl) => {
            const domain = DOMAINS.find((d) => d.id === dl.domainId)!;
            const dimmed = activeDomain && activeDomain !== dl.domainId;
            return (
              <div key={dl.domainId} style={{ opacity: dimmed ? 0.15 : 1, transition: "opacity 0.3s ease" }}>
                <div
                  className="st-display"
                  style={{ position: "absolute", left: CANVAS_PAD, top: dl.offsetY - DOMAIN_HEADER_H + 14, fontWeight: 800, fontSize: "1.15rem", color: domain.color, display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span style={{ fontSize: "1.4rem" }}>{domain.icon}</span> {domain.name}
                </div>
                {SKILLS.filter((s) => s.domainId === dl.domainId).map((s) => {
                  const pos = dl.positions[s.id];
                  if (!pos) return null;
                  const unlocked = ready && isUnlocked(p, s.id);
                  const available = ready && isAvailable(p, s.id);
                  const state = unlocked ? "st-node-unlocked" : available ? "st-node-available" : "st-node-locked";
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => goToSkill(s.id)}
                      className={`st-node ${state} ${unlocked ? "st-glow-pulse" : ""}`}
                      style={{ position: "absolute", left: CANVAS_PAD + pos.x - 36, top: dl.offsetY + pos.y - 36 }}
                      title={s.name}
                    >
                      {available || unlocked ? s.icon : "🔒"}
                      {unlocked && <span style={{ position: "absolute", bottom: -4, right: -4, width: 22, height: 22, borderRadius: "50%", background: "var(--st-cyan)", display: "grid", placeItems: "center", fontSize: "0.65rem", border: "2px solid var(--st-bg)" }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
