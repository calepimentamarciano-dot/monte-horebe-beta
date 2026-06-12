import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Coffee, Mountain, Sprout, Star } from "lucide-react";
import { ProductVisual } from "@/components/product-visual";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getProductBySlug, getProducts } from "@/lib/products";
import { formatCurrency, siteUrl } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produto não encontrado"
    };
  }

  return {
    title: product.name,
    description: product.short_description ?? product.description ?? undefined,
    openGraph: {
      title: `${product.name} | Monte Horebe`,
      description: product.short_description ?? undefined,
      url: `${siteUrl()}/produto/${product.slug}`,
      type: "website"
    }
  };
}

export async function generateStaticParams() {
  const products = await getProducts();

  return products.map((product) => ({
    slug: product.slug
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const price = formatCurrency(product.price);
  const whatsappMessage = `Olá! Tenho interesse no café ${product.name} da Monte Horebe.`;

  return (
    <section className="min-h-screen bg-horebe-radial px-4 pb-24 pt-36">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-10 text-sm text-horebe-gray">
          <Link href="/" className="focus-ring rounded-lg hover:text-horebe-gold">
            Início
          </Link>
          <span className="px-2">/</span>
          <Link href="/catalogo" className="focus-ring rounded-lg hover:text-horebe-gold">
            Catálogo
          </Link>
          <span className="px-2">/</span>
          <span className="text-horebe-soft">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <ProductVisual
              name={product.name}
              notes={product.sensory_notes}
              imageUrl={product.image_url}
              size="large"
              className="shadow-glow"
            />
            <div className="mt-4 grid grid-cols-3 gap-3">
              {(product.gallery?.length ? product.gallery : [product.name, product.origin, product.roast_level]).map(
                (item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="h-24 rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-xs text-horebe-gray"
                  >
                    Galeria {index + 1}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-horebe-gold">
              {product.category?.name ?? "Café especial"}
            </p>
            <h1 className="mt-4 font-display text-5xl leading-tight text-horebe-soft md:text-7xl">
              {product.name}
            </h1>
            <p className="mt-6 text-lg leading-8 text-horebe-gray">{product.description}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-horebe-soft">
                {price ?? "Preço sob consulta"}
              </span>
              {product.score_sca ? (
                <span className="flex items-center gap-2 rounded-full border border-horebe-gold/30 bg-horebe-gold/10 px-4 py-2 text-sm text-horebe-soft">
                  <Star className="h-4 w-4 fill-horebe-gold text-horebe-gold" aria-hidden />
                  {product.score_sca} pontos SCA
                </span>
              ) : null}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Spec icon={Coffee} label="Torra" value={product.roast_level} />
              <Spec icon={Sprout} label="Origem" value={product.origin} />
              <Spec icon={Mountain} label="Altitude" value={product.altitude} />
              <Spec icon={Coffee} label="Variedade" value={product.variety} />
            </div>

            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-horebe-gold">
                Notas sensoriais
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.sensory_notes?.map((note) => (
                  <span key={note} className="rounded-full bg-white/5 px-4 py-2 text-sm text-horebe-gray">
                    {note}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-horebe-gold">
                Métodos recomendados
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.recommended_methods?.map((method) => (
                  <span key={method} className="rounded-full border border-white/10 px-4 py-2 text-sm text-horebe-soft">
                    {method}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-9">
              <WhatsAppButton message={whatsappMessage} className="w-full md:w-auto">
                Tenho interesse neste café
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Spec({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Coffee;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
      <Icon className="mb-3 h-5 w-5 text-horebe-gold" aria-hidden />
      <p className="text-xs uppercase tracking-[0.16em] text-horebe-gray">{label}</p>
      <p className="mt-1 font-semibold text-horebe-soft">{value ?? "Sob consulta"}</p>
    </div>
  );
}
