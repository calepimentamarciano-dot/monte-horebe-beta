import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { cn, defaultWhatsAppMessage, getWhatsAppUrl } from "@/lib/utils";

type WhatsAppButtonProps = {
  message?: string;
  children?: React.ReactNode;
  className?: string;
  floating?: boolean;
};

export function WhatsAppButton({
  message = defaultWhatsAppMessage,
  children = "Falar no WhatsApp",
  className,
  floating = false
}: WhatsAppButtonProps) {
  return (
    <Link
      href={getWhatsAppUrl(message)}
      target="_blank"
      rel="noreferrer"
      aria-label="Abrir conversa no WhatsApp"
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-horebe-gold px-5 py-3 text-sm font-semibold text-horebe-black shadow-glow transition hover:bg-[#d2ab5c]",
        floating &&
          "fixed bottom-5 right-5 z-50 h-14 w-14 px-0 text-horebe-black md:h-auto md:w-auto md:px-5",
        className
      )}
    >
      <MessageCircle className="h-4 w-4" aria-hidden />
      <span className={cn(floating && "hidden md:inline")}>{children}</span>
    </Link>
  );
}
