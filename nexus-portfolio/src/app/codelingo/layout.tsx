import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "@/codelingo/codelingo.css";
import { CodeLingoProvider } from "@/codelingo/store";
import Shell from "@/components/codelingo/Shell";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CodeLingo — Aprenda códigos e cifras jogando",
  description:
    "App gamificado para aprender Morse, binário, criptografia e sistemas de comunicação — do básico ao avançado. Um projeto NEXUS.",
  openGraph: {
    title: "CodeLingo — Aprenda códigos e cifras jogando",
    description:
      "Do Código Morse à cifra de Vigenère: aprenda 20 códigos com XP, streaks, ligas e o tutor CipherBot.",
  },
};

export default function CodeLingoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={grotesk.variable}>
      <CodeLingoProvider>
        <Shell>{children}</Shell>
      </CodeLingoProvider>
    </div>
  );
}
