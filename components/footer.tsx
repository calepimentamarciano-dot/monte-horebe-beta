import { Instagram, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getWhatsAppUrl } from "@/lib/utils";

const footerLinks = [
  { href: "/", label: "Início" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
  { href: "/login", label: "Admin" }
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div>
          <div className="mb-4">
            <Logo size="md" textClassName="text-2xl" />
          </div>
          <p className="max-w-md leading-7 text-horebe-gray">
            Cafés especiais selecionados para experiências premium, negócios, revenda e
            momentos que pedem mais presença na xícara.
          </p>
          <div className="mt-6">
            <WhatsAppButton className="px-4 py-2.5" />
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-horebe-gold">
            Links
          </h3>
          <div className="grid gap-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="focus-ring rounded-lg text-sm text-horebe-gray transition hover:text-horebe-gold"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-horebe-gold">
            Contato
          </h3>
          <div className="grid gap-4 text-sm text-horebe-gray">
            <Link href={getWhatsAppUrl("Olá! Quero falar com a Monte Horebe.")} className="focus-ring flex items-center gap-3 rounded-lg hover:text-horebe-gold">
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp
            </Link>
            <Link href="mailto:montehorebecafesdaespeciais@gmail.com" className="focus-ring flex items-center gap-3 rounded-lg hover:text-horebe-gold">
              <Mail className="h-4 w-4" aria-hidden />
              montehorebecafesdaespeciais@gmail.com
            </Link>
            <Link href="https://www.instagram.com/montehorebecoffee" target="_blank" rel="noopener noreferrer" className="focus-ring flex items-center gap-3 rounded-lg hover:text-horebe-gold">
              <Instagram className="h-4 w-4" aria-hidden />
              Instagram
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl px-4 text-sm text-horebe-gray">
        © {new Date().getFullYear()} Monte Horebe. Todos os direitos reservados.
      </div>
    </footer>
  );
}
