import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "@/skilltree/skilltree.css";
import { SkillTreeProvider } from "@/skilltree/store";
import Shell from "@/components/skilltree/Shell";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-orbitron",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkillTree — Sua jornada de habilidades",
  description: "Uma árvore de habilidades gamificada onde cada projeto ensina uma competência real, com um mentor de IA guiando cada passo. Um projeto NEXUS.",
  openGraph: {
    title: "SkillTree — Sua jornada de habilidades",
    description: "Desbloqueie habilidades reais em programação, IA, robótica, cibersegurança e mais — como em um RPG, mas de verdade.",
  },
};

export default function SkillTreeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={orbitron.variable}>
      <SkillTreeProvider>
        <Shell>{children}</Shell>
      </SkillTreeProvider>
    </div>
  );
}
