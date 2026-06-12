import type { Metadata } from "next";
import { ArrowRight, Bean, HeartHandshake, Leaf, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { FeatureCard } from "@/components/feature-card";
import { fadeUp, MotionWrapper, staggerContainer } from "@/components/motion-wrapper";
import { ProductVisual } from "@/components/product-visual";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça a história, propósito, valores e processo dos cafés especiais Monte Horebe."
};

const values = [
  {
    icon: ShieldCheck,
    title: "Qualidade sem atalho",
    text: "Cada café é apresentado com cuidado, consistência e respeito ao perfil sensorial."
  },
  {
    icon: Leaf,
    title: "Origem valorizada",
    text: "A origem do lote participa da narrativa da marca e da experiência final."
  },
  {
    icon: HeartHandshake,
    title: "Relação próxima",
    text: "Atendimento direto para clientes, empresas, revendedores e parceiros."
  }
];

const process = ["Seleção", "Torra", "Prova", "Apresentação", "Atendimento"];

export default function AboutPage() {
  return (
    <section className="bg-horebe-radial px-4 pb-24 pt-36">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <MotionWrapper variants={fadeUp} initial="hidden" animate="visible">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-horebe-gold">
              Sobre a Monte Horebe
            </p>
            <h1 className="mt-5 font-display text-5xl leading-tight text-horebe-soft md:text-7xl">
              Uma marca criada para transformar café em experiência.
            </h1>
            <p className="mt-6 text-lg leading-8 text-horebe-gray">
              A Monte Horebe une tradição, seleção de origem e apresentação premium para
              levar cafés especiais a pessoas e negócios que valorizam sabor, cuidado e
              presença em cada detalhe.
            </p>
            <Link
              href="/catalogo"
              className="focus-ring mt-8 inline-flex items-center gap-2 rounded-full bg-horebe-gold px-6 py-3 text-sm font-semibold text-horebe-black"
            >
              Ver catálogo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </MotionWrapper>
          <ProductVisual name="Monte Horebe" notes={["origem", "excelência"]} size="large" />
        </div>

        <div className="my-24 h-px gold-line" />

        <SectionHeading
          eyebrow="Propósito"
          title="Apresentar cafés especiais com sofisticação, verdade e proximidade."
          description="A marca foi pensada para crescer como catálogo, vitrine institucional, canal de relacionamento e futura operação digital de vendas ou revenda."
        />

        <MotionWrapper
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14 grid gap-5 md:grid-cols-3"
        >
          {values.map((value) => (
            <FeatureCard key={value.title} {...value} />
          ))}
        </MotionWrapper>

        <div className="mt-24 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            align="left"
            title="Do lote ao atendimento, o processo precisa preservar valor."
            description="A jornada da Monte Horebe foi desenhada para comunicar origem, torra, notas sensoriais e recomendações de preparo de forma clara e elegante."
          />
          <div className="grid gap-4">
            {process.map((step, index) => (
              <div key={step} className="glass-panel flex items-center gap-5 rounded-3xl p-5">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-horebe-gold text-sm font-bold text-horebe-black">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-2xl text-horebe-soft">{step}</h3>
                  <p className="mt-1 text-sm text-horebe-gray">
                    Etapa pensada para preservar identidade, aroma e confiança.
                  </p>
                </div>
                <Bean className="ml-auto hidden h-5 w-5 text-horebe-gold sm:block" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
