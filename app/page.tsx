import { Award, Coffee, Handshake, Leaf, Sparkles } from "lucide-react";
import Link from "next/link";
import { FeatureCard } from "@/components/feature-card";
import { Hero } from "@/components/hero";
import { fadeUp, MotionWrapper, staggerContainer } from "@/components/motion-wrapper";
import { ProductCarousel } from "@/components/product-carousel";
import { ProductMockup } from "@/components/product-mockup";
import { ProductVisual } from "@/components/product-visual";
import { SectionHeading } from "@/components/section-heading";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getFeaturedProducts } from "@/lib/products";

const features = [
  {
    icon: Leaf,
    title: "Seleção criteriosa",
    text: "Cafés escolhidos com atenção à qualidade, origem e perfil sensorial."
  },
  {
    icon: Coffee,
    title: "Torra pensada para sabor",
    text: "Torra desenvolvida para valorizar aroma, doçura e equilíbrio."
  },
  {
    icon: Sparkles,
    title: "Experiência premium",
    text: "Produtos criados para quem busca mais do que apenas café."
  },
  {
    icon: Handshake,
    title: "Atendimento próximo",
    text: "Contato direto para clientes, parceiros e revendedores."
  }
];

const audiences = ["Cafeterias", "Mercados", "Escritórios", "Revendedores", "Restaurantes", "Eventos"];

export default async function Home() {
  const featuredProducts = await getFeaturedProducts(6);

  return (
    <>
      <Hero />

      <section id="produtos" className="relative bg-horebe-black px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Catálogo premium"
            title="Lotes selecionados, apresentados com presença visual."
            description="Conheça cafés especiais da Monte Horebe em cards pensados para destacar aroma, torra, notas e pontuação."
          />
          <div className="mt-14">
            <ProductCarousel products={featuredProducts} />
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#050505,#0b1511,#050505)] px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading title="O que torna a Monte Horebe especial" />
          <MotionWrapper
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </MotionWrapper>
        </div>
      </section>

      <section className="bg-horebe-black px-4 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <MotionWrapper
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-horebe-gold">
              Sobre a marca
            </p>
            <h2 className="font-display text-4xl leading-tight text-horebe-soft md:text-6xl">
              Tradição, origem e excelência em cada xícara.
            </h2>
            <p className="mt-6 text-lg leading-8 text-horebe-gray">
              A Monte Horebe nasceu com o propósito de levar cafés especiais para pessoas
              e negócios que valorizam qualidade, cuidado e uma experiência sensorial
              marcante.
            </p>
            <Link
              href="/sobre"
              className="focus-ring mt-8 inline-flex rounded-full border border-horebe-gold/40 px-6 py-3 text-sm font-semibold text-horebe-gold transition hover:bg-horebe-gold hover:text-horebe-black"
            >
              Conheça nossa história
            </Link>
          </MotionWrapper>

          <MotionWrapper
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="glass-panel relative overflow-hidden rounded-[2rem] p-4"
          >
            <ProductVisual name="Origem Monte Horebe" notes={["natureza", "qualidade"]} size="large" />
            <div className="absolute left-8 top-8 grid gap-3">
              {["Café Especial", "Origem Selecionada", "Qualidade Premium"].map((seal) => (
                <span
                  key={seal}
                  className="rounded-full border border-horebe-gold/25 bg-black/35 px-4 py-2 text-sm font-semibold text-horebe-soft backdrop-blur-xl"
                >
                  {seal}
                </span>
              ))}
            </div>
          </MotionWrapper>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#050505,#122620,#050505)] px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Monte Horebe para clientes, empresas e revendedores"
            title="Cafés especiais para diferentes momentos de consumo."
          />
          <MotionWrapper
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 overflow-hidden rounded-full border border-white/10 bg-white/[0.045] py-5"
          >
            <div className="flex min-w-max animate-[marquee_22s_linear_infinite] gap-10 px-8 text-sm font-semibold uppercase tracking-[0.2em] text-horebe-gray">
              {[...audiences, ...audiences].map((audience, index) => (
                <span key={`${audience}-${index}`} className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-horebe-gold" aria-hidden />
                  {audience}
                </span>
              ))}
            </div>
          </MotionWrapper>
        </div>
      </section>

      <section className="bg-horebe-black px-4 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              align="left"
              title="Um catálogo digital feito para apresentar cafés com sofisticação."
              description="Cada produto tem uma página própria com notas sensoriais, origem, torra, descrição e chamada direta para atendimento."
            />
          </div>
          <ProductMockup />
        </div>
      </section>

      <section className="relative overflow-hidden bg-horebe-green px-4 py-24">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-horebe-gold/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="font-display text-4xl leading-tight text-horebe-soft md:text-6xl">
            Leve a experiência Monte Horebe para o seu negócio.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-horebe-gray">
            Fale conosco e conheça nossos cafés especiais para consumo, revenda ou parceria.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <WhatsAppButton>Chamar no WhatsApp</WhatsAppButton>
            <Link
              href="/catalogo"
              className="focus-ring inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-horebe-soft transition hover:border-horebe-gold hover:text-horebe-gold"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
