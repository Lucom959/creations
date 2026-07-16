"use client";

import { useState } from "react";

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = (network: "twitter" | "linkedin" | "copy") => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `${title} · NEXUS`;

    if (network === "copy") {
      navigator.clipboard?.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
      return;
    }

    const targets = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`,
    };
    window.open(targets[network], "_blank", "noopener,noreferrer,width=600,height=600");
  };

  const base =
    "grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] text-[var(--text)] transition-all duration-300 hover:-translate-y-0.5 hover:border-terracota hover:text-terracota";

  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-sm text-muted">Compartilhar:</span>
      <button type="button" aria-label="Compartilhar no X" className={base} onClick={() => share("twitter")}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.9 1.1h3.7l-8.1 9.2L24 22.9h-7.4l-5.8-7.6-6.6 7.6H.4l8.6-9.9L0 1.1h7.6l5.2 6.9zM17.6 20.7h2L6.5 3.2h-2.2z" />
        </svg>
      </button>
      <button type="button" aria-label="Compartilhar no LinkedIn" className={base} onClick={() => share("linkedin")}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45z" />
        </svg>
      </button>
      <button type="button" aria-label="Copiar link" className={`${base} relative`} onClick={() => share("copy")}>
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
            <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
          </svg>
        )}
      </button>
    </div>
  );
}
