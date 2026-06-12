import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-screen bg-horebe-radial px-4 pb-24 pt-36">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-horebe-gold">404</p>
        <h1 className="mt-5 font-display text-5xl text-horebe-soft md:text-7xl">
          Página não encontrada
        </h1>
        <p className="mx-auto mt-6 max-w-xl leading-8 text-horebe-gray">
          O conteúdo solicitado não está disponível. Volte ao catálogo para encontrar os
          cafés especiais da Monte Horebe.
        </p>
        <Link
          href="/catalogo"
          className="focus-ring mt-8 inline-flex rounded-full bg-horebe-gold px-6 py-3 text-sm font-semibold text-horebe-black"
        >
          Ver catálogo
        </Link>
      </div>
    </section>
  );
}
