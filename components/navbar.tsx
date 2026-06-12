"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Início" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/sobre", label: "Sobre" },
  { href: "/catalogo#produtos", label: "Produtos" },
  { href: "/contato", label: "Contato" }
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4">
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-horebe-black/72 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-2xl md:px-5"
      >
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-full">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-horebe-gold/40 bg-horebe-green text-sm font-bold text-horebe-gold">
            MH
          </span>
          <span className="font-display text-lg text-horebe-soft">Monte Horebe</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "focus-ring rounded-full px-4 py-2 text-sm text-horebe-gray transition hover:text-horebe-gold",
                  active && "bg-white/5 text-horebe-soft"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:block">
          <WhatsAppButton className="px-4 py-2.5" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-horebe-soft md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mx-auto mt-3 max-w-7xl rounded-3xl border border-white/10 bg-horebe-black/94 p-4 shadow-card backdrop-blur-xl md:hidden"
          >
            <div className="grid gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="focus-ring rounded-2xl px-4 py-3 text-horebe-soft transition hover:bg-white/5 hover:text-horebe-gold"
                >
                  {link.label}
                </Link>
              ))}
              <WhatsAppButton className="mt-2 w-full" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
