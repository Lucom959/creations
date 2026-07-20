"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MapCanvas from "@/components/skilltree/MapCanvas";

function MapInner() {
  const search = useSearchParams();
  const domain = search.get("domain");
  return (
    <div className="st-fade-up">
      <h1 className="st-display" style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>🗺️ Mapa de Habilidades</h1>
      <p className="st-muted" style={{ fontSize: "0.85rem", marginBottom: 14 }}>
        Arraste para navegar, use a roda do mouse (ou os botões) para dar zoom. Nós acesos em azul estão disponíveis; dourados/ciano já foram dominados.
      </p>
      <MapCanvas initialDomain={domain} />
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={null}>
      <MapInner />
    </Suspense>
  );
}
