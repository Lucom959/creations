import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NEXUS — Condomínio de Projetos",
    template: "%s · NEXUS",
  },
  description:
    "NEXUS é um condomínio de projetos — um portfólio vivo de apps, jogos, ferramentas e conteúdo em constante evolução.",
  keywords: ["portfólio", "projetos", "apps", "jogos", "ferramentas", "NEXUS"],
  authors: [{ name: "NEXUS" }],
  openGraph: {
    type: "website",
    title: "NEXUS — Condomínio de Projetos",
    description:
      "Um portfólio vivo de apps, jogos, ferramentas e conteúdo em constante evolução.",
    siteName: "NEXUS",
    url: siteUrl,
    images: [{ url: "/images/placeholder.svg", width: 800, height: 600 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXUS — Condomínio de Projetos",
    description:
      "Um portfólio vivo de apps, jogos, ferramentas e conteúdo em constante evolução.",
    images: ["/images/placeholder.svg"],
  },
};

// Set the theme before paint to avoid a flash of the wrong color scheme.
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("nexus-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored || (prefersDark ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${cormorant.variable} ${inter.variable} font-sans min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
