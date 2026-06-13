import type { Metadata } from "next";
import { Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { defaultWhatsAppMessage } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a Monte Horebe pelo WhatsApp, formulário, e-mail ou Instagram."
};

export default function ContactPage() {
  return (
    <section className="min-h-screen bg-horebe-radial px-4 pb-24 pt-36">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-horebe-gold">
            Contato
          </p>
          <h1 className="mt-5 font-display text-5xl leading-tight text-horebe-soft md:text-7xl">
            Vamos falar sobre cafés especiais?
          </h1>
          <p className="mt-6 text-lg leading-8 text-horebe-gray">
            Entre em contato para conhecer produtos, tirar dúvidas sobre revenda ou
            iniciar uma parceria com a Monte Horebe.
          </p>

          <div className="mt-8 grid gap-4">
            <ContactItem icon={MessageCircle} label="WhatsApp" value="Atendimento direto" />
            <ContactItem
              icon={Instagram}
              label="Instagram"
              value="@montehorebecoffee"
              href="https://www.instagram.com/montehorebecoffee"
              external
            />
            <ContactItem icon={Mail} label="E-mail" value="montehorebecafesdaespeciais@gmail.com" href="mailto:montehorebecafesdaespeciais@gmail.com" />
            <ContactItem icon={MapPin} label="Localização" value="Atendimento nacional" />
          </div>

          <div className="mt-8">
            <WhatsAppButton message={defaultWhatsAppMessage}>Chamar no WhatsApp</WhatsAppButton>
          </div>
        </div>

        <form className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div className="grid gap-5">
            <Field label="Nome" name="name" placeholder="Seu nome" />
            <Field label="E-mail" name="email" placeholder="seu@email.com" type="email" />
            <Field label="Telefone" name="phone" placeholder="(00) 00000-0000" />
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-horebe-soft">Mensagem</span>
              <textarea
                name="message"
                placeholder="Conte como podemos ajudar"
                rows={6}
                className="focus-ring rounded-3xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-horebe-soft placeholder:text-horebe-gray"
              />
            </label>
            <button
              type="button"
              className="focus-ring rounded-full bg-horebe-gold px-6 py-3 text-sm font-semibold text-horebe-black transition hover:bg-[#d2ab5c]"
            >
              Simular envio
            </button>
          </div>
          <p className="mt-4 text-xs leading-6 text-horebe-gray">
            O formulário está preparado para integração futura; por enquanto, o contato
            principal acontece pelo WhatsApp.
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text"
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-horebe-soft">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="focus-ring h-12 rounded-full border border-white/10 bg-black/30 px-4 text-sm text-horebe-soft placeholder:text-horebe-gray"
      />
    </label>
  );
}

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
  external = false
}: {
  icon: typeof MessageCircle;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-horebe-gold/10 text-horebe-gold">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold text-horebe-soft">{label}</p>
        {href ? (
          <Link
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="focus-ring rounded-lg text-sm text-horebe-gray hover:text-horebe-gold"
          >
            {value}
          </Link>
        ) : (
          <p className="text-sm text-horebe-gray">{value}</p>
        )}
      </div>
    </div>
  );
}
