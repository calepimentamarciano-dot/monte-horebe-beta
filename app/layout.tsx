import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { siteUrl } from "@/lib/utils";

const inter = localFont({
  src: "./fonts/inter.woff2",
  variable: "--font-inter",
  display: "swap"
});

const playfair = localFont({
  src: "./fonts/playfair-display.woff2",
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Monte Horebe | Cafés Especiais",
    template: "%s | Monte Horebe"
  },
  description:
    "Catálogo digital da Monte Horebe, marca de cafés especiais com produtos selecionados para experiências premium.",
  openGraph: {
    title: "Monte Horebe | Cafés Especiais",
    description:
      "Catálogo digital da Monte Horebe, marca de cafés especiais com produtos selecionados para experiências premium.",
    url: siteUrl(),
    siteName: "Monte Horebe",
    locale: "pt_BR",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
