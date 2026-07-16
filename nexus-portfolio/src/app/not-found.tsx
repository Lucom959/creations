import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-nexus flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-serif text-8xl font-bold text-amber">404</p>
      <h1 className="mt-4 font-serif text-3xl font-semibold">
        Página não encontrada
      </h1>
      <p className="mt-2 max-w-sm text-muted">
        O endereço que você procura não existe neste condomínio de projetos.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Voltar para a Home
      </Link>
    </div>
  );
}
