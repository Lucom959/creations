# NEXUS — Condomínio de Projetos

Portfólio em **Next.js 15 + TypeScript + Tailwind CSS**, pronto para deploy na **Railway**.

## Stack

- Next.js 15 (App Router, SSG)
- TypeScript (strict)
- Tailwind CSS 3
- Fontes: Cormorant Garamond (títulos) + Inter (corpo) via `next/font`
- Dark/Light mode com persistência em `localStorage`

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:3000
```

Outros scripts:

```bash
npm run build    # build de produção
npm run start    # serve o build
npm run lint     # ESLint
```

## Estrutura

```
src/
  app/
    layout.tsx              # fontes, tema, SEO/OG, Header + Footer
    page.tsx                # Home (hero, destaque, sobre, CTA)
    not-found.tsx           # 404
    projects/
      page.tsx              # galeria (abas, busca, filtro)
      [id]/page.tsx         # detalhe (SSG via generateStaticParams)
  components/
    Header.tsx  Footer.tsx
    ProjectCard.tsx  ProjectGallery.tsx  ProjectFilter.tsx  ShareButtons.tsx
  data/
    projects.ts             # fonte única dos 7 projetos + helpers
  styles/
    globals.css
public/
  images/placeholder.svg
```

## Preenchendo os projetos

Edite `src/data/projects.ts`. Para exibir um projeto na seção **Em destaque** da
Home, defina `featured: true`. A barra de progresso aparece quando
`status: "In Development"` e `progress` é um número (0–100).

## Deploy na Railway

O projeto já inclui `railway.json`. Basta:

```bash
railway up
```

A Railway detecta o Next.js (Nixpacks), roda `npm run build` e sobe com
`npm run start`. A porta é lida automaticamente da variável `PORT`, e o HTTPS é
provisionado pela plataforma.

### Variáveis de ambiente

Opcional — veja `.env.example`:

- `NEXT_PUBLIC_SITE_URL`: usada para URLs absolutas de Open Graph.
