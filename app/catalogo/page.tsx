import type { Metadata } from "next";
import { CatalogClient } from "@/app/catalogo/catalog-client";
import { SectionHeading } from "@/components/section-heading";
import { getCategories } from "@/lib/categories";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Explore o catálogo de cafés especiais Monte Horebe por torra, notas sensoriais e categoria."
};

export default async function CatalogPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <section className="min-h-screen bg-horebe-radial px-4 pb-24 pt-36">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Catálogo completo"
          title="Cafés especiais para cada perfil de xícara."
          description="Busque por categoria, torra e notas sensoriais para encontrar o lote ideal para consumo, presente, revenda ou operação."
        />
        <div className="mt-14">
          <CatalogClient products={products} categories={categories} />
        </div>
      </div>
    </section>
  );
}
