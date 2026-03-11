import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Cormorant_Garamond } from "next/font/google";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-emphasis",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Olcan Compass — Mobilidade Global Inteligente",
    template: "%s | Olcan Compass",
  },
  description:
    "Plataforma de inteligência para mobilidade internacional. Planeje, execute e conquiste sua jornada global com confiança.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://compass.olcan.com.br"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Olcan Compass",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${plusJakarta.variable} ${inter.variable} ${cormorant.variable}`}
    >
      <body className="font-body antialiased bg-surface-bg text-text-primary">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
